const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

/*
 * Generate next sale number.
 *
 * Follows the same approach used by
 * Purchase Orders in the existing system.
 */
const generateSaleNumber = async () => {
  const lastSale = await Sale.findOne()
    .sort({ createdAt: -1 })
    .select("saleNumber");

  if (!lastSale) {
    return "SALE-0001";
  }

  const match =
    lastSale.saleNumber.match(/SALE-(\d+)/);

  const nextNumber = match
    ? parseInt(match[1], 10) + 1
    : 1;

  return `SALE-${String(nextNumber).padStart(
    4,
    "0"
  )}`;
};


/*
 * Calculate payment status from
 * actual amount received.
 *
 * Do NOT accept paymentStatus
 * directly from frontend.
 */
const calculatePaymentStatus = (
  paidAmount,
  totalAmount
) => {
  if (paidAmount <= 0) {
    return "Pending";
  }

  if (paidAmount >= totalAmount) {
    return "Paid";
  }

  return "Partial";
};


/*
 * GET /api/sales
 *
 * Get all sales with optional:
 * - search
 * - status
 * - paymentStatus
 */
const getSales = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      paymentStatus = "",
    } = req.query;

    const query = {};

    /*
     * Search by sale number
     * or customer name.
     */
    if (search.trim()) {
      query.$or = [
        {
          saleNumber: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    /*
     * Status filter
     */
    if (status) {
      query.status = status;
    }

    /*
     * Payment status filter
     */
    if (paymentStatus) {
      query.paymentStatus =
        paymentStatus;
    }

    const sales = await Sale.find(query)
      .populate(
        "items.inventory",
        "productName sku category currentStock reservedStock unit sellingPrice"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error(
      "Get sales error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
    });
  }
};


/*
 * GET /api/sales/stats
 *
 * Statistics are calculated only
 * from completed sales.
 */
const getSalesStats = async (
  req,
  res
) => {
  try {
    const stats =
      await Sale.aggregate([
        {
          $match: {
            status: "Completed",
          },
        },

        {
          $facet: {
            revenue: [
              {
                $group: {
                  _id: null,

                  totalRevenue: {
                    $sum: "$totalAmount",
                  },
                },
              },
            ],

            orders: [
              {
                $count: "totalOrders",
              },
            ],

            items: [
              {
                $unwind: "$items",
              },

              {
                $group: {
                  _id: null,

                  itemsSold: {
                    $sum: "$items.quantity",
                  },
                },
              },
            ],
          },
        },
      ]);

    const result =
      stats[0] || {};

    res.status(200).json({
      success: true,

      data: {
        totalRevenue:
          result.revenue?.[0]
            ?.totalRevenue || 0,

        totalOrders:
          result.orders?.[0]
            ?.totalOrders || 0,

        itemsSold:
          result.items?.[0]
            ?.itemsSold || 0,
      },
    });
  } catch (error) {
    console.error(
      "Get sales stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch sales statistics",
    });
  }
};


/*
 * GET /api/sales/:id
 *
 * Get one sale.
 */
const getSaleById = async (
  req,
  res
) => {
  try {
    /*
     * Validate MongoDB ObjectId first.
     */
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    const sale =
      await Sale.findById(
        req.params.id
      ).populate(
        "items.inventory",
        "productName sku category currentStock reservedStock unit sellingPrice"
      );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error(
      "Get sale by ID error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
    });
  }
};


/*
 * POST /api/sales
 *
 * Create completed sale.
 *
 * Flow:
 *
 * 1. Validate request
 * 2. Merge duplicate products
 * 3. Validate inventory
 * 4. Calculate prices from Inventory
 * 5. Calculate payment status
 * 6. Create Sale
 * 7. Decrease Inventory
 * 8. Create StockMovement OUT
 * 9. Commit transaction
 */
const createSale = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      customerName,
      customerContact,
      discount = 0,
      tax = 0,
      paidAmount = 0,
      items,
    } = req.body;

    /*
     * Validate items
     */
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one sale item is required",
      });
    }

    /*
     * Parse financial values.
     */
    const parsedDiscount =
      Number(discount);

    const parsedTax =
      Number(tax);

    const parsedPaidAmount =
      Number(paidAmount);

    /*
     * Validate discount.
     */
    if (
      !Number.isFinite(
        parsedDiscount
      ) ||
      parsedDiscount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount",
      });
    }

    /*
     * Validate tax.
     */
    if (
      !Number.isFinite(parsedTax) ||
      parsedTax < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax",
      });
    }

    /*
     * Validate amount received.
     */
    if (
      !Number.isFinite(
        parsedPaidAmount
      ) ||
      parsedPaidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid paid amount",
      });
    }

    /*
     * Start transaction.
     */
    await session.startTransaction();

    /*
     * Merge duplicate inventory items.
     *
     * Example:
     *
     * Product A - 2
     * Product A - 3
     *
     * becomes:
     *
     * Product A - 5
     */
    const quantityMap =
      new Map();

    for (const item of items) {
      if (!item.inventory) {
        throw new Error(
          "Inventory is required for every sale item"
        );
      }

      /*
       * Validate ObjectId.
       */
      if (
        !mongoose.Types.ObjectId.isValid(
          item.inventory
        )
      ) {
        throw new Error(
          "Invalid inventory ID"
        );
      }

      const quantity =
        Number(item.quantity);

      /*
       * Quantity must be
       * positive integer.
       */
      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        throw new Error(
          "Sale quantity must be a positive integer"
        );
      }

      const inventoryId =
        item.inventory.toString();

      quantityMap.set(
        inventoryId,
        (quantityMap.get(
          inventoryId
        ) || 0) + quantity
      );
    }

    const saleItems = [];

    const inventoryUpdates = [];

    let subtotal = 0;

    /*
     * Validate every product
     * before changing inventory.
     */
    for (const [
      inventoryId,
      quantity,
    ] of quantityMap.entries()) {
      const inventory =
        await Inventory.findById(
          inventoryId
        ).session(session);

      /*
       * Inventory doesn't exist.
       */
      if (!inventory) {
        throw new Error(
          `Inventory ${inventoryId} not found`
        );
      }

      /*
       * Product must be active.
       */
      if (
        inventory.status !==
        "Active"
      ) {
        throw new Error(
          `${inventory.productName} is inactive`
        );
      }

      /*
       * Available stock:
       *
       * Current Stock - Reserved Stock
       */
      const availableStock =
        inventory.currentStock -
        inventory.reservedStock;

      /*
       * Prevent overselling.
       */
      if (
        quantity >
        availableStock
      ) {
        throw new Error(
          `Insufficient stock for ${inventory.productName}. Available stock: ${availableStock}`
        );
      }

      /*
       * IMPORTANT:
       *
       * Selling price comes from
       * Inventory.
       *
       * Never trust frontend price.
       */
      const sellingPrice =
        inventory.sellingPrice;

      const totalPrice =
        sellingPrice * quantity;

      subtotal += totalPrice;

      /*
       * Save product snapshot
       * inside sale.
       */
      saleItems.push({
        inventory:
          inventory._id,

        productName:
          inventory.productName,

        sku: inventory.sku,

        quantity,

        sellingPrice,

        totalPrice,
      });

      /*
       * Keep reference for
       * inventory update.
       */
      inventoryUpdates.push({
        inventory,
        quantity,
      });
    }

    /*
     * Discount cannot exceed subtotal.
     */
    if (
      parsedDiscount >
      subtotal
    ) {
      throw new Error(
        "Discount cannot be greater than subtotal"
      );
    }

    /*
     * Calculate final amount.
     */
    const totalAmount =
      subtotal -
      parsedDiscount +
      parsedTax;

    /*
     * Paid amount cannot exceed
     * sale total.
     */
    if (
      parsedPaidAmount >
      totalAmount
    ) {
      throw new Error(
        "Paid amount cannot be greater than total amount"
      );
    }

    /*
     * Automatically calculate
     * payment status.
     */
    const paymentStatus =
      calculatePaymentStatus(
        parsedPaidAmount,
        totalAmount
      );

    /*
     * Generate sale number.
     */
    const saleNumber =
      await generateSaleNumber();

    /*
     * Create sale.
     */
    const sale = new Sale({
      saleNumber,

      customerName:
        customerName?.trim() ||
        "Walk-in Customer",

      customerContact:
        customerContact?.trim() ||
        "",

      items: saleItems,

      subtotal,

      discount:
        parsedDiscount,

      tax: parsedTax,

      totalAmount,

      paidAmount:
        parsedPaidAmount,

      refundedAmount: 0,

      paymentStatus,

      status: "Completed",
    });

    await sale.save({
      session,
    });

    /*
     * Update inventory and
     * create stock movement.
     */
    for (const {
      inventory,
      quantity,
    } of inventoryUpdates) {
      const previousStock =
        inventory.currentStock;

      const newStock =
        previousStock -
        quantity;

      /*
       * Decrease stock.
       */
      inventory.currentStock =
        newStock;

      await inventory.save({
        session,
      });

      /*
       * Record OUT movement.
       */
      await StockMovement.create(
        [
          {
            inventory:
              inventory._id,

            type: "OUT",

            quantity,

            previousStock,

            newStock,

            reason:
              `Sale ${sale.saleNumber}`,

            referenceType:
              "SALE",

            referenceId:
              sale._id.toString(),
          },
        ],
        {
          session,
        }
      );
    }

    /*
     * Commit everything.
     */
    await session.commitTransaction();

    /*
     * Fetch populated sale
     * after transaction.
     */
    const populatedSale =
      await Sale.findById(
        sale._id
      ).populate(
        "items.inventory",
        "productName sku category currentStock reservedStock unit sellingPrice"
      );

    res.status(201).json({
      success: true,
      message:
        "Sale created successfully",
      data: populatedSale,
    });
  } catch (error) {
    /*
     * Rollback everything if
     * anything fails.
     */
    await session.abortTransaction();

    console.error(
      "Create sale error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create sale",
    });
  } finally {
    await session.endSession();
  }
};


/*
 * PATCH /api/sales/:id/payment
 *
 * Update total amount received.
 *
 * Payment status is recalculated
 * automatically.
 */
const updateSalePayment = async (
  req,
  res
) => {
  try {
    /*
     * Validate ID.
     */
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    const {
      paidAmount,
    } = req.body;

    const parsedPaidAmount =
      Number(paidAmount);

    /*
     * Validate amount.
     */
    if (
      !Number.isFinite(
        parsedPaidAmount
      ) ||
      parsedPaidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid paid amount",
      });
    }

    const sale =
      await Sale.findById(
        req.params.id
      );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    /*
     * Payment can only be changed
     * for completed sales.
     */
    if (
      sale.status !==
      "Completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment can only be updated for completed sales",
      });
    }

    /*
     * Refunded sales are closed.
     */
    if (
      sale.paymentStatus ===
      "Refunded"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment cannot be updated after refund",
      });
    }

    /*
     * Do not allow reducing the
     * amount already received.
     *
     * Payment updates should add
     * to the received amount.
     */
    if (
      parsedPaidAmount <
      sale.paidAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be less than the amount already received",
      });
    }

    /*
     * Cannot receive more than
     * sale total.
     */
    if (
      parsedPaidAmount >
      sale.totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot exceed sale total",
      });
    }

    /*
     * Update payment.
     */
    sale.paidAmount =
      parsedPaidAmount;

    /*
     * Recalculate status.
     */
    sale.paymentStatus =
      calculatePaymentStatus(
        parsedPaidAmount,
        sale.totalAmount
      );

    await sale.save();

    res.status(200).json({
      success: true,
      message:
        "Payment updated successfully",
      data: sale,
    });
  } catch (error) {
    console.error(
      "Update sale payment error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update payment",
    });
  }
};


/*
 * PATCH /api/sales/:id/cancel
 *
 * Cancel an unpaid sale.
 *
 * Since the original sale already
 * reduced inventory, cancellation
 * restores the sold quantity.
 */
const cancelSale = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    /*
     * Validate ID.
     */
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    await session.startTransaction();

    const sale =
      await Sale.findById(
        req.params.id
      ).session(session);

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    /*
     * Only completed sales
     * can be cancelled.
     */
    if (
      sale.status !==
      "Completed"
    ) {
      throw new Error(
        "Only completed sales can be cancelled"
      );
    }

    /*
     * If customer has already
     * paid, cancellation is not
     * appropriate.
     *
     * Use Return Sale instead.
     */
    if (
      sale.paidAmount > 0
    ) {
      throw new Error(
        "Paid or partially paid sales cannot be cancelled. Use Return Sale instead."
      );
    }

    /*
     * Restore inventory.
     */
    for (const item of sale.items) {
      const inventory =
        await Inventory.findById(
          item.inventory
        ).session(session);

      if (!inventory) {
        throw new Error(
          `Inventory for ${item.productName} not found`
        );
      }

      const previousStock =
        inventory.currentStock;

      const newStock =
        previousStock +
        item.quantity;

      inventory.currentStock =
        newStock;

      await inventory.save({
        session,
      });

      /*
       * Record stock restoration.
       */
      await StockMovement.create(
        [
          {
            inventory:
              inventory._id,

            type: "RETURN",

            quantity:
              item.quantity,

            previousStock,

            newStock,

            reason:
              `Cancelled Sale ${sale.saleNumber}`,

            referenceType:
              "RETURN",

            referenceId:
              sale._id.toString(),
          },
        ],
        {
          session,
        }
      );
    }

    /*
     * Mark sale cancelled.
     */
    sale.status =
      "Cancelled";

    /*
     * No money was received.
     */
    sale.paymentStatus =
      "Pending";

    await sale.save({
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message:
        "Sale cancelled successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Cancel sale error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to cancel sale",
    });
  } finally {
    await session.endSession();
  }
};


/*
 * PATCH /api/sales/:id/return
 *
 * Return a paid or partially paid sale.
 *
 * Inventory is restored and the
 * received amount is marked as
 * refunded.
 */
const returnSale = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    /*
     * Validate ID.
     */
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale ID",
      });
    }

    await session.startTransaction();

    const sale =
      await Sale.findById(
        req.params.id
      ).session(session);

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    /*
     * Only completed sales
     * can be returned.
     */
    if (
      sale.status !==
      "Completed"
    ) {
      throw new Error(
        "Only completed sales can be returned"
      );
    }

    /*
     * An unpaid sale should be
     * cancelled instead.
     */
    if (
      sale.paidAmount <= 0
    ) {
      throw new Error(
        "An unpaid sale should be cancelled instead of returned"
      );
    }

    /*
     * Prevent duplicate returns.
     */
    if (
      sale.paymentStatus ===
      "Refunded"
    ) {
      throw new Error(
        "Sale has already been refunded"
      );
    }

    /*
     * Restore every sold item.
     */
    for (const item of sale.items) {
      const inventory =
        await Inventory.findById(
          item.inventory
        ).session(session);

      if (!inventory) {
        throw new Error(
          `Inventory for ${item.productName} not found`
        );
      }

      const previousStock =
        inventory.currentStock;

      const newStock =
        previousStock +
        item.quantity;

      inventory.currentStock =
        newStock;

      await inventory.save({
        session,
      });

      /*
       * Record return movement.
       */
      await StockMovement.create(
        [
          {
            inventory:
              inventory._id,

            type: "RETURN",

            quantity:
              item.quantity,

            previousStock,

            newStock,

            reason:
              `Return Sale ${sale.saleNumber}`,

            referenceType:
              "RETURN",

            referenceId:
              sale._id.toString(),
          },
        ],
        {
          session,
        }
      );
    }

    /*
     * Mark sale returned.
     */
    sale.status =
      "Returned";

    /*
     * Refund the amount that
     * was actually received.
     */
    sale.refundedAmount =
      sale.paidAmount;

    sale.paymentStatus =
      "Refunded";

    await sale.save({
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message:
        "Sale returned and payment refunded successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Return sale error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to return sale",
    });
  } finally {
    await session.endSession();
  }
};


/*
 * Export controllers
 */
module.exports = {
  getSales,
  getSaleById,
  getSalesStats,
  createSale,
  updateSalePayment,
  cancelSale,
  returnSale,
};