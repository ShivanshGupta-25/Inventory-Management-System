const Inventory = require("../models/Inventory");
const PurchaseOrder = require("../models/PurchaseOrder");
const Sale = require("../models/Sale");
const StockMovement = require("../models/StockMovement");

const getDashboard = async (req, res) => {
  try {
    // --------------------------------------------------
    // DATE RANGES
    // --------------------------------------------------

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // --------------------------------------------------
    // INVENTORY
    // --------------------------------------------------

    const inventory = await Inventory.find({
      status: "Active",
    }).lean();

    const totalProducts = inventory.length;

    const totalStock = inventory.reduce(
      (sum, item) => sum + (item.currentStock || 0),
      0
    );

    const inventoryValue = inventory.reduce(
      (sum, item) =>
        sum +
        (item.currentStock || 0) *
          (item.purchasePrice || 0),
      0
    );

    const sellingValue = inventory.reduce(
      (sum, item) =>
        sum +
        (item.currentStock || 0) *
          (item.sellingPrice || 0),
      0
    );

    const lowStockProducts = inventory.filter(
      (item) =>
        item.currentStock > 0 &&
        item.currentStock <= item.minStock
    );

    const outOfStockProducts = inventory.filter(
      (item) => item.currentStock <= 0
    );

    const inStockProducts = inventory.filter(
      (item) =>
        item.currentStock > item.minStock
    );

    // --------------------------------------------------
    // INVENTORY STOCK DISTRIBUTION
    // --------------------------------------------------

    const inventoryOverview = {
      inStock: inStockProducts.length,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
    };

    // --------------------------------------------------
    // PURCHASE ORDERS
    // --------------------------------------------------

    const purchaseOrders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .lean();

    const totalPurchaseOrders =
      purchaseOrders.length;

    const pendingPurchaseOrders =
      purchaseOrders.filter(
        (order) => order.status === "Pending"
      ).length;

    const receivedPurchaseOrders =
      purchaseOrders.filter(
        (order) => order.status === "Received"
      ).length;

    const partiallyReceivedPurchaseOrders =
      purchaseOrders.filter(
        (order) =>
          order.status === "Partially Received"
      ).length;

    const purchaseOrderValue =
      purchaseOrders
        .filter(
          (order) => order.status !== "Cancelled"
        )
        .reduce(
          (sum, order) =>
            sum + (order.totalAmount || 0),
          0
        );

    // --------------------------------------------------
    // SALES
    // --------------------------------------------------

    const validSales = await Sale.find({
      status: "Completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalSales = validSales.length;

    const totalSalesRevenue = validSales.reduce(
      (sum, sale) =>
        sum + (sale.totalAmount || 0),
      0
    );

    const todaySales = validSales.filter(
      (sale) =>
        new Date(sale.createdAt) >= startOfToday
    );

    const todaySalesRevenue =
      todaySales.reduce(
        (sum, sale) =>
          sum + (sale.totalAmount || 0),
        0
      );

    const monthSales = validSales.filter(
      (sale) =>
        new Date(sale.createdAt) >= startOfMonth
    );

    const monthSalesRevenue =
      monthSales.reduce(
        (sum, sale) =>
          sum + (sale.totalAmount || 0),
        0
      );

    // --------------------------------------------------
    // SALES TREND - LAST 7 DAYS
    // --------------------------------------------------

    const salesTrend = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = validSales.filter(
        (sale) => {
          const saleDate = new Date(
            sale.createdAt
          );

          return (
            saleDate >= dayStart &&
            saleDate <= dayEnd
          );
        }
      );

      const revenue = daySales.reduce(
        (sum, sale) =>
          sum + (sale.totalAmount || 0),
        0
      );

      salesTrend.push({
        date: dayStart.toISOString().split("T")[0],
        revenue,
        orders: daySales.length,
      });
    }

    // --------------------------------------------------
    // LOW STOCK PRODUCTS
    // --------------------------------------------------

    const lowStockList = lowStockProducts
      .sort(
        (a, b) =>
          a.currentStock - b.currentStock
      )
      .slice(0, 8)
      .map((item) => ({
        _id: item._id,
        productName: item.productName,
        sku: item.sku,
        category: item.category,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        unit: item.unit,
        status:
          item.currentStock <= 0
            ? "Out of Stock"
            : "Low Stock",
      }));

    // --------------------------------------------------
    // STOCK MOVEMENTS
    // --------------------------------------------------

    const todayTransactions =
      await StockMovement.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lte: now,
        },
      });


    const stockMovements =
      await StockMovement.find()
        .populate(
          "inventory",
          "productName sku unit"
        )
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    // --------------------------------------------------
    // STOCK LEVEL TREND - LAST 7 DAYS
    // --------------------------------------------------

    const stockMovementHistory =
        await StockMovement.find({
            createdAt: {
            $gte: new Date(
                startOfToday.getTime() -
                6 * 24 * 60 * 60 * 1000
            ),
            $lte: now,
            },
        })
            .sort({ createdAt: 1 })
            .lean();

        // Calculate total stock movement for each day
        const dailyMovements = {};

        stockMovementHistory.forEach((movement) => {
        const date = new Date(
            movement.createdAt
        );

        const dateKey = date
            .toISOString()
            .split("T")[0];

        if (!dailyMovements[dateKey]) {
            dailyMovements[dateKey] = 0;
        }

        // Movement types that increase stock
        if (
            movement.type === "IN" ||
            movement.type === "RETURN"
        ) {
            dailyMovements[dateKey] +=
            movement.quantity;
        }

        // Movement types that decrease stock
        if (
            movement.type === "OUT" ||
            movement.type === "DAMAGE"
        ) {
            dailyMovements[dateKey] -=
            movement.quantity;
        }

        // ADJUSTMENT is based on the actual
        // before/after stock difference.
        if (movement.type === "ADJUSTMENT") {
            dailyMovements[dateKey] +=
            movement.newStock -
            movement.previousStock;
        }
        });

        // Start from current stock and work backwards
        // to determine historical totals.
        const stockTrend = [];

        let runningStock = totalStock;

        for (let i = 0; i < 7; i++) {
        const date = new Date(startOfToday);

        date.setDate(
            startOfToday.getDate() - i
        );

        const dateKey = date
            .toISOString()
            .split("T")[0];

        const movement =
            dailyMovements[dateKey] || 0;

        // For today, current stock is already known.
        if (i === 0) {
            runningStock = totalStock;
        } else {
            // Move backwards through history.
            runningStock -= movement;
        }

        stockTrend.unshift({
            date: dateKey,
            stock: runningStock,
        });
    }

    const recentTransactions =
      stockMovements.map((movement) => ({
        _id: movement._id,
        type: movement.type,
        quantity: movement.quantity,
        previousStock:
          movement.previousStock,
        newStock: movement.newStock,
        reason: movement.reason,
        referenceType:
          movement.referenceType,
        referenceId:
          movement.referenceId,
        createdAt: movement.createdAt,

        product: movement.inventory
          ? {
              _id: movement.inventory._id,
              productName:
                movement.inventory.productName,
              sku: movement.inventory.sku,
              unit: movement.inventory.unit,
            }
          : null,
      }));

    // --------------------------------------------------
    // ALERTS
    // --------------------------------------------------

    const alerts = [];

    // Out of stock alerts
    outOfStockProducts
      .slice(0, 5)
      .forEach((item) => {
        alerts.push({
          type: "OUT_OF_STOCK",
          severity: "critical",
          title: "Out of Stock",
          message: `${item.productName} is out of stock.`,
          productId: item._id,
          createdAt: item.updatedAt,
        });
      });

    // Low stock alerts
    lowStockProducts
      .filter((item) => item.currentStock > 0)
      .slice(0, 5)
      .forEach((item) => {
        alerts.push({
          type: "LOW_STOCK",
          severity: "warning",
          title: "Low Stock",
          message: `${item.productName} has only ${item.currentStock} ${item.unit || "units"} remaining.`,
          productId: item._id,
          createdAt: item.updatedAt,
        });
      });

    // Pending purchase order alerts
    purchaseOrders
      .filter(
        (order) => order.status === "Pending"
      )
      .slice(0, 5)
      .forEach((order) => {
        alerts.push({
          type: "PENDING_PURCHASE",
          severity: "info",
          title: "Pending Purchase Order",
          message: `${order.orderNumber} from ${order.supplier?.name || "Unknown Supplier"} is pending.`,
          orderId: order._id,
          createdAt: order.createdAt,
        });
      });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        stats: {
          totalProducts,
          totalStock,

          inventoryValue,
          sellingValue,

          lowStockProducts:
            lowStockProducts.length,

          outOfStockProducts:
            outOfStockProducts.length,

          todayTransactions,

          totalSales,

          totalSalesRevenue,

          todaySales: todaySales.length,
          todaySalesRevenue,

          monthSales: monthSales.length,
          monthSalesRevenue,

          totalPurchaseOrders,
          pendingPurchaseOrders,
          receivedPurchaseOrders,
          partiallyReceivedPurchaseOrders,

          purchaseOrderValue,
        },

        inventory: {
            overview: inventoryOverview,

            totalProducts,
            totalStock,

            inventoryValue,
            sellingValue,

            lowStockProducts:
                lowStockProducts.length,

            outOfStockProducts:
                outOfStockProducts.length,

            stockTrend,
        },

        sales: {
          totalSales,
          totalRevenue: totalSalesRevenue,

          todaySales: todaySales.length,
          todayRevenue: todaySalesRevenue,

          monthSales: monthSales.length,
          monthRevenue: monthSalesRevenue,

          trend: salesTrend,
        },

        purchases: {
          totalOrders: totalPurchaseOrders,
          pendingOrders:
            pendingPurchaseOrders,
          receivedOrders:
            receivedPurchaseOrders,
          partiallyReceivedOrders:
            partiallyReceivedPurchaseOrders,

          totalValue: purchaseOrderValue,
        },

        lowStockProducts: lowStockList,

        recentTransactions,

        alerts,

        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

const getStaffAlerts = async (req, res) => {
  try {
    const inventory = await Inventory.find({
      status: "Active",
    }).lean();

    const alerts = [];

    // Out of stock
    inventory
      .filter((item) => item.currentStock <= 0)
      .forEach((item) => {
        alerts.push({
          type: "OUT_OF_STOCK",
          severity: "critical",
          title: "Out of Stock",
          message: `${item.productName} is out of stock.`,
          productId: item._id,
          productName: item.productName,
          sku: item.sku,
          currentStock: item.currentStock,
          minStock: item.minStock,
          createdAt: item.updatedAt,
        });
      });

    // Low stock
    inventory
      .filter(
        (item) =>
          item.currentStock > 0 &&
          item.currentStock <= item.minStock
      )
      .forEach((item) => {
        alerts.push({
          type: "LOW_STOCK",
          severity: "warning",
          title: "Low Stock",
          message: `${item.productName} has only ${
            item.currentStock
          } ${item.unit || "units"} remaining.`,
          productId: item._id,
          productName: item.productName,
          sku: item.sku,
          currentStock: item.currentStock,
          minStock: item.minStock,
          createdAt: item.updatedAt,
        });
      });

    // Newest first
    alerts.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error(
      "Staff alerts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory alerts",
    });
  }
};

const getStockHistory = async (req, res) => {
  try {
    const {
      type = "",
      search = "",
      limit = 50,
    } = req.query;

    const query = {};

    if (type) {
      query.type = type.toUpperCase();
    }

    let movements = await StockMovement.find(query)
      .populate(
        "inventory",
        "productName sku unit"
      )
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 100))
      .lean();

    if (search) {
      const searchLower =
        search.toLowerCase();

      movements = movements.filter(
        (movement) =>
          movement.inventory?.productName
            ?.toLowerCase()
            .includes(searchLower) ||
          movement.inventory?.sku
            ?.toLowerCase()
            .includes(searchLower) ||
          movement.reason
            ?.toLowerCase()
            .includes(searchLower)
      );
    }

    const data = movements.map(
      (movement) => ({
        _id: movement._id,
        type: movement.type,
        quantity: movement.quantity,
        previousStock:
          movement.previousStock,
        newStock: movement.newStock,
        reason: movement.reason,
        referenceType:
          movement.referenceType,
        referenceId:
          movement.referenceId,
        createdAt:
          movement.createdAt,

        product: movement.inventory
          ? {
              _id:
                movement.inventory._id,
              productName:
                movement.inventory.productName,
              sku:
                movement.inventory.sku,
              unit:
                movement.inventory.unit,
            }
          : null,
      })
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "Stock history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch stock history",
    });
  }
};

module.exports = {
  getDashboard,
  getStaffAlerts,
  getStockHistory,
};