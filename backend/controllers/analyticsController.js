const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const PurchaseOrder = require("../models/PurchaseOrder");
const StockMovement = require("../models/StockMovement");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getDateRange = (period = "30d") => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case "7d":
      startDate.setDate(
        startDate.getDate() - 6
      );
      break;

    case "30d":
      startDate.setDate(
        startDate.getDate() - 29
      );
      break;

    case "90d":
      startDate.setDate(
        startDate.getDate() - 89
      );
      break;

    case "6m":
      startDate.setMonth(
        startDate.getMonth() - 6
      );
      break;

    case "1y":
      startDate.setFullYear(
        startDate.getFullYear() - 1
      );
      break;

    default:
      startDate.setDate(
        startDate.getDate() - 29
      );
  }

  startDate.setHours(0, 0, 0, 0);

  return {
    startDate,
    endDate,
  };
};

/*
|--------------------------------------------------------------------------
| GET ANALYTICS OVERVIEW
|--------------------------------------------------------------------------
|
| GET /api/analytics/overview?period=30d
|
*/

const getAnalyticsOverview = async (
  req,
  res
) => {
  try {
    const {
      period = "30d",
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(period);

    /*
     * ------------------------------------------------
     * SALES
     * ------------------------------------------------
     */

    const salesResult =
      await Sale.aggregate([
        {
          $match: {
            status: "Completed",
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },

        {
          $project: {
            totalAmount: {
              $ifNull: [
                "$totalAmount",
                0,
              ],
            },

            items: {
              $ifNull: [
                "$items",
                [],
              ],
            },
          },
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: "$totalAmount",
            },

            orders: {
              $sum: 1,
            },

            itemsSold: {
              $sum: {
                $reduce: {
                  input: "$items",

                  initialValue: 0,

                  in: {
                    $add: [
                      "$$value",
                      "$$this.quantity",
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

    /*
     * ------------------------------------------------
     * INVENTORY
     * ------------------------------------------------
     */

    const inventoryResult =
      await Inventory.aggregate([
        {
          $match: {
            status: "Active",
          },
        },

        {
          $group: {
            _id: null,

            totalProducts: {
              $sum: 1,
            },

            totalStock: {
              $sum: "$currentStock",
            },

            inventoryValue: {
              $sum: {
                $multiply: [
                  "$currentStock",
                  "$purchasePrice",
                ],
              },
            },

            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$currentStock",
                          0,
                        ],
                      },
                      {
                        $lte: [
                          "$currentStock",
                          "$minStock",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            outOfStock: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      "$currentStock",
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            overstock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$maxStock",
                          0,
                        ],
                      },
                      {
                        $gte: [
                          "$currentStock",
                          "$maxStock",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            reservedStock: {
              $sum: "$reservedStock",
            },
          },
        },
      ]);

    /*
     * ------------------------------------------------
     * PURCHASE ORDERS
     * ------------------------------------------------
     */

    const purchaseResult =
      await PurchaseOrder.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },

            status: {
              $ne: "Cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            totalOrders: {
              $sum: 1,
            },

            totalOrderedValue: {
              $sum: "$totalAmount",
            },

            pendingOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Pending",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            partiallyReceivedOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Partially Received",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            receivedOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Received",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const sales =
      salesResult[0] || {
        revenue: 0,
        orders: 0,
        itemsSold: 0,
      };

    const inventory =
      inventoryResult[0] || {
        totalProducts: 0,
        totalStock: 0,
        inventoryValue: 0,
        lowStock: 0,
        outOfStock: 0,
        overstock: 0,
        reservedStock: 0,
      };

    const purchases =
      purchaseResult[0] || {
        totalOrders: 0,
        totalOrderedValue: 0,
        pendingOrders: 0,
        partiallyReceivedOrders: 0,
        receivedOrders: 0,
      };

    /*
     * Average order value
     */

    const averageOrderValue =
      sales.orders > 0
        ? sales.revenue /
          sales.orders
        : 0;

    return res.status(200).json({
      success: true,

      period: {
        type: period,
        startDate,
        endDate,
      },

      data: {
        sales: {
          revenue: sales.revenue,
          orders: sales.orders,
          itemsSold: sales.itemsSold,
          averageOrderValue,
        },

        inventory: {
          totalProducts:
            inventory.totalProducts,

          totalStock:
            inventory.totalStock,

          reservedStock:
            inventory.reservedStock,

          inventoryValue:
            inventory.inventoryValue,

          lowStock:
            inventory.lowStock,

          outOfStock:
            inventory.outOfStock,

          overstock:
            inventory.overstock,
        },

        purchases: {
          totalOrders:
            purchases.totalOrders,

          totalOrderedValue:
            purchases.totalOrderedValue,

          pendingOrders:
            purchases.pendingOrders,

          partiallyReceivedOrders:
            purchases.partiallyReceivedOrders,

          receivedOrders:
            purchases.receivedOrders,
        },
      },
    });
  } catch (error) {
    console.error(
      "Analytics overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate analytics overview",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SALES TREND
|--------------------------------------------------------------------------
|
| GET /api/analytics/sales-trend?period=30d
|
*/

const getSalesTrend = async (
  req,
  res
) => {
  try {
    const {
      period = "30d",
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(period);

    const trend =
      await Sale.aggregate([
        {
          $match: {
            status: "Completed",

            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },

        /*
         * First group sales by day.
         *
         * This prevents a multi-item sale
         * from being counted multiple times.
         */
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            revenue: {
              $sum: "$totalAmount",
            },

            orders: {
              $sum: 1,
            },

            itemsSold: {
              $sum: {
                $reduce: {
                  input: {
                    $ifNull: [
                      "$items",
                      [],
                    ],
                  },

                  initialValue: 0,

                  in: {
                    $add: [
                      "$$value",
                      "$$this.quantity",
                    ],
                  },
                },
              },
            },
          },
        },

        {
          $project: {
            _id: 0,

            date: "$_id",

            revenue: 1,

            orders: 1,

            itemsSold: 1,
          },
        },

        {
          $sort: {
            date: 1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,

      period: {
        type: period,
        startDate,
        endDate,
      },

      data: trend,
    });
  } catch (error) {
    console.error(
      "Sales trend error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate sales trend",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PRODUCT PERFORMANCE
|--------------------------------------------------------------------------
|
| GET /api/analytics/products?period=30d
|
*/

const getProductPerformance = async (
  req,
  res
) => {
  try {
    const {
      period = "30d",
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(period);

    const products =
      await Sale.aggregate([
        {
          $match: {
            status: "Completed",

            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },

        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: "$items.inventory",

            productName: {
              $first:
                "$items.productName",
            },

            sku: {
              $first:
                "$items.sku",
            },

            unitsSold: {
              $sum:
                "$items.quantity",
            },

            revenue: {
              $sum:
                "$items.totalPrice",
            },
          },
        },

        /*
         * Get current inventory information.
         */

        {
          $lookup: {
            from: "inventories",

            localField: "_id",

            foreignField: "_id",

            as: "inventory",
          },
        },

        {
          $unwind: {
            path: "$inventory",

            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            productId: "$_id",

            productName: 1,

            sku: 1,

            category:
              "$inventory.category",

            currentStock:
              "$inventory.currentStock",

            minStock:
              "$inventory.minStock",

            maxStock:
              "$inventory.maxStock",

            purchasePrice:
              "$inventory.purchasePrice",

            sellingPrice:
              "$inventory.sellingPrice",

            unitsSold: 1,

            revenue: 1,
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,

      period: {
        type: period,
        startDate,
        endDate,
      },

      data: products,
    });
  } catch (error) {
    console.error(
      "Product performance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate product analytics",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CATEGORY PERFORMANCE
|--------------------------------------------------------------------------
|
| GET /api/analytics/categories?period=30d
|
*/

const getCategoryPerformance = async (
  req,
  res
) => {
  try {
    const {
      period = "30d",
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(period);

    const categories =
      await Sale.aggregate([
        {
          $match: {
            status: "Completed",

            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },

        {
          $unwind: "$items",
        },

        {
          $lookup: {
            from: "inventories",

            localField:
              "items.inventory",

            foreignField: "_id",

            as: "inventory",
          },
        },

        {
          $unwind: {
            path: "$inventory",

            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: {
              $ifNull: [
                "$inventory.category",
                "Uncategorized",
              ],
            },

            unitsSold: {
              $sum:
                "$items.quantity",
            },

            revenue: {
              $sum:
                "$items.totalPrice",
            },

            products: {
              $addToSet:
                "$items.inventory",
            },
          },
        },

        {
          $project: {
            _id: 0,

            category: "$_id",

            unitsSold: 1,

            revenue: 1,

            productCount: {
              $size: "$products",
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,

      period: {
        type: period,
        startDate,
        endDate,
      },

      data: categories,
    });
  } catch (error) {
    console.error(
      "Category analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate category analytics",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET INVENTORY ANALYTICS
|--------------------------------------------------------------------------
|
| GET /api/analytics/inventory
|
*/

const getInventoryAnalytics = async (
  req,
  res
) => {
  try {
    /*
     * Overall inventory health
     */

    const health =
      await Inventory.aggregate([
        {
          $match: {
            status: "Active",
          },
        },

        {
          $group: {
            _id: null,

            totalProducts: {
              $sum: 1,
            },

            totalUnits: {
              $sum: "$currentStock",
            },

            inventoryValue: {
              $sum: {
                $multiply: [
                  "$currentStock",
                  "$purchasePrice",
                ],
              },
            },

            inStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$currentStock",
                          "$minStock",
                        ],
                      },
                      {
                        $lt: [
                          "$currentStock",
                          "$maxStock",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$currentStock",
                          0,
                        ],
                      },
                      {
                        $lte: [
                          "$currentStock",
                          "$minStock",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            outOfStock: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      "$currentStock",
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            overstock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$maxStock",
                          0,
                        ],
                      },
                      {
                        $gte: [
                          "$currentStock",
                          "$maxStock",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    /*
     * Inventory by category
     */

    const byCategory =
      await Inventory.aggregate([
        {
          $match: {
            status: "Active",
          },
        },

        {
          $group: {
            _id: "$category",

            products: {
              $sum: 1,
            },

            units: {
              $sum: "$currentStock",
            },

            inventoryValue: {
              $sum: {
                $multiply: [
                  "$currentStock",
                  "$purchasePrice",
                ],
              },
            },
          },
        },

        {
          $project: {
            _id: 0,

            category: "$_id",

            products: 1,

            units: 1,

            inventoryValue: 1,
          },
        },

        {
          $sort: {
            inventoryValue: -1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,

      data: {
        health:
          health[0] || {
            totalProducts: 0,
            totalUnits: 0,
            inventoryValue: 0,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            overstock: 0,
          },

        byCategory,
      },
    });
  } catch (error) {
    console.error(
      "Inventory analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate inventory analytics",
    });
  }
};

module.exports = {
  getAnalyticsOverview,
  getSalesTrend,
  getProductPerformance,
  getCategoryPerformance,
  getInventoryAnalytics,
};