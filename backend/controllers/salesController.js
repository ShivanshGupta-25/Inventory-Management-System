const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

const PAYMENT_METHODS = [
  "Cash",
  "Card",
  "UPI",
  "Bank Transfer",
  "Other",
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
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

const generateSaleNumber = async () => {
  const lastSale = await Sale.findOne()
    .sort({ createdAt: -1 })
    .select("saleNumber");

  if (!lastSale) {
    return "SAL-000001";
  }

  const lastNumber = parseInt(
    lastSale.saleNumber.replace(/\D/g, ""),
    10
  );

  const nextNumber =
    Number.isNaN(lastNumber)
      ? 1
      : lastNumber + 1;

  return `SAL-${String(nextNumber).padStart(
    6,
    "0"
  )}`;
};

const mergeSaleItems = (items = []) => {
  const merged = new Map();

  for (const item of items) {
    if (!item.inventory) {
      continue;
    }

    const inventoryId =
      item.inventory.toString();

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    if (merged.has(inventoryId)) {
      merged.set(
        inventoryId,
        merged.get(inventoryId) + quantity
      );
    } else {
      merged.set(inventoryId, quantity);
    }
  }

  return Array.from(
    merged,
    ([inventory, quantity]) => ({
      inventory,
      quantity,
    })
  );
};

const validatePaymentMethod = (
  paymentMethod
) => {
  if (!paymentMethod) {
    return true;
  }

  return PAYMENT_METHODS.includes(
    paymentMethod
  );
};

/*
|--------------------------------------------------------------------------
| GET /api/sales
|--------------------------------------------------------------------------
*/

const getSales = async (req, res) => {
  try {
    const {
      search = "",
      status,
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    /*
     * Search
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
        {
          customerContact: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    /*
     * Sale status
     */
    if (status && status !== "All") {
      query.status = status;
    }

    /*
     * Payment status
     */
    if (
      paymentStatus &&
      paymentStatus !== "All"
    ) {
      query.paymentStatus = paymentStatus;
    }

    /*
     * Date filtering
     */
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(
          `${startDate}T00:00:00`
        );
      }

      if (endDate) {
        query.createdAt.$lte = new Date(
          `${endDate}T23:59:59.999`
        );
      }
    }

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const [sales, total] =
      await Promise.all([
        Sale.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber),

        Sale.countDocuments(query),
      ]);

    return res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page: pageNumber,
      pages: Math.ceil(
        total / limitNumber
      ),
      data: sales,
    });
  } catch (error) {
    console.error(
      "Get sales error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/sales/stats
|--------------------------------------------------------------------------
*/

const getSalesStats = async (req, res) => {
  try {
    const result =
      await Sale.aggregate([
        {
          $match: {
            status: "Completed",
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

            paidAmount: {
              $ifNull: [
                "$paidAmount",
                {
                  $cond: [
                    {
                      $eq: [
                        "$paymentStatus",
                        "Paid",
                      ],
                    },
                    "$totalAmount",
                    0,
                  ],
                },
              ],
            },

            items: 1,
          },
        },

        {
          $group: {
            _id: null,

            orders: {
              $sum: 1,
            },

            salesValue: {
              $sum: "$totalAmount",
            },

            amountCollected: {
              $sum: "$paidAmount",
            },

            outstanding: {
              $sum: {
                $max: [
                  {
                    $subtract: [
                      "$totalAmount",
                      "$paidAmount",
                    ],
                  },
                  0,
                ],
              },
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
      ]);

    const stats = result[0] || {
      orders: 0,
      salesValue: 0,
      amountCollected: 0,
      outstanding: 0,
      itemsSold: 0,
    };

    delete stats._id;

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(
      "Get sales stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales statistics",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/sales/:id
|--------------------------------------------------------------------------
*/

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(
      req.params.id
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error(
      "Get sale by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/sales/:id/movements
|--------------------------------------------------------------------------
*/

const getSaleMovements = async (
  req,
  res
) => {
  try {
    const sale =
      await Sale.findById(req.params.id)
        .select("_id saleNumber");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    const movements =
      await StockMovement.find({
        referenceId: sale._id.toString(),
        referenceType: {
          $in: ["SALE", "RETURN"],
        },
      })
        .populate(
          "inventory",
          "productName sku category unit"
        )
        .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(
      "Get sale movements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch sale inventory movements",
    });
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/sales
|--------------------------------------------------------------------------
*/

const createSale = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      customerName,
      customerContact,
      items,
      discount = 0,
      tax = 0,
      paidAmount = 0,
      paymentMethod = "Cash",
      notes = "",
    } = req.body;

    /*
     * Basic validation
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

    if (
      !validatePaymentMethod(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const numericDiscount =
      Number(discount);

    const numericTax = Number(tax);

    const numericPaidAmount =
      Number(paidAmount);

    if (
      !Number.isFinite(
        numericDiscount
      ) ||
      numericDiscount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount",
      });
    }

    if (
      !Number.isFinite(numericTax) ||
      numericTax < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax",
      });
    }

    if (
      !Number.isFinite(
        numericPaidAmount
      ) ||
      numericPaidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid paid amount",
      });
    }

    const normalizedItems =
      mergeSaleItems(items);

    if (!normalizedItems.length) {
      return res.status(400).json({
        success: false,
        message:
          "Sale must contain valid items",
      });
    }

    /*
     * Start transaction
     */
    session.startTransaction();

    const saleItems = [];
    let subtotal = 0;

    /*
     * Validate every product against
     * current inventory.
     */
    for (const item of normalizedItems) {
      const inventory =
        await Inventory.findById(
          item.inventory
        ).session(session);

      if (!inventory) {
        throw new Error(
          `Inventory item ${item.inventory} not found`
        );
      }

      if (
        inventory.status === "Inactive"
      ) {
        throw new Error(
          `${inventory.productName} is inactive`
        );
      }

      const availableStock =
        inventory.currentStock -
        inventory.reservedStock;

      if (
        item.quantity >
        availableStock
      ) {
        throw new Error(
          `Insufficient stock for ${inventory.productName}. Available: ${availableStock}`
        );
      }

      const lineTotal =
        inventory.sellingPrice *
        item.quantity;

      subtotal += lineTotal;

      saleItems.push({
        inventory:
          inventory._id,

        productName:
          inventory.productName,

        sku:
          inventory.sku,

        quantity:
          item.quantity,

        sellingPrice:
          inventory.sellingPrice,

        totalPrice:
          lineTotal,
      });
    }

    /*
     * Calculate totals
     */
    if (numericDiscount > subtotal) {
      throw new Error(
        "Discount cannot exceed subtotal"
      );
    }

    const totalAmount = Math.max(
      0,
      subtotal -
        numericDiscount +
        numericTax
    );

    if (
      numericPaidAmount >
      totalAmount
    ) {
      throw new Error(
        "Paid amount cannot exceed total amount"
      );
    }

    const paymentStatus =
      calculatePaymentStatus(
        numericPaidAmount,
        totalAmount
      );

    const saleNumber =
      await generateSaleNumber();

    /*
     * Create sale
     */
    const sale =
      new Sale({
        saleNumber,

        customerName:
          customerName?.trim() ||
          "Walk-in Customer",

        customerContact:
          customerContact?.trim() || "",

        items: saleItems,

        subtotal,

        discount:
          numericDiscount,

        tax:
          numericTax,

        totalAmount,

        paidAmount:
          numericPaidAmount,

        refundedAmount: 0,

        paymentMethod,

        paymentStatus,

        status: "Completed",

        notes:
          notes?.trim() || "",

        activityLog: [
          {
            action: "CREATED",

            message: `Sale ${saleNumber} created`,

            status: "Completed",

            paymentStatus,

            paidAmount:
              numericPaidAmount,
          },
        ],
      });

    await sale.save({
      session,
    });

    /*
     * Decrease inventory and
     * create stock movements.
     */
    for (const item of normalizedItems) {
      const inventory =
        await Inventory.findById(
          item.inventory
        ).session(session);

      const stockBefore =
        inventory.currentStock;

      const stockAfter =
        stockBefore -
        item.quantity;

      inventory.currentStock =
        stockAfter;

      await inventory.save({
        session,
      });

      await StockMovement.create(
        [
          {
            inventory:
              inventory._id,

            type: "OUT",

            quantity:
              item.quantity,

            previousStock:
              stockBefore,

            newStock:
              stockAfter,

            reason:
              `Sale ${sale.saleNumber}`,

            referenceType:
              "SALE",

            referenceId:
              sale._id.toString(),
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    const createdSale =
      await Sale.findById(
        sale._id
      );

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: createdSale,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Create sale error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create sale",
    });
  } finally {
    session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/sales/:id
|
| Edit an unpaid completed sale.
|--------------------------------------------------------------------------
*/

const updateSale = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const saleId = req.params.id;

    const {
      customerName,
      customerContact,
      items,
      discount = 0,
      tax = 0,
      paymentMethod,
      notes = "",
    } = req.body;

    session.startTransaction();

    const sale =
      await Sale.findById(
        saleId
      ).session(session);

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    /*
     * Only completed sales can be edited.
     */
    if (
      sale.status !== "Completed"
    ) {
      throw new Error(
        "Only completed sales can be edited"
      );
    }

    /*
     * Once money has been recorded,
     * editing the sale is locked.
     */
    if (
      Number(sale.paidAmount || 0) >
      0
    ) {
      throw new Error(
        "Paid sales cannot be edited"
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw new Error(
        "At least one sale item is required"
      );
    }

    if (
      paymentMethod &&
      !validatePaymentMethod(
        paymentMethod
      )
    ) {
      throw new Error(
        "Invalid payment method"
      );
    }

    const numericDiscount =
      Number(discount);

    const numericTax =
      Number(tax);

    if (
      !Number.isFinite(
        numericDiscount
      ) ||
      numericDiscount < 0
    ) {
      throw new Error(
        "Invalid discount"
      );
    }

    if (
      !Number.isFinite(numericTax) ||
      numericTax < 0
    ) {
      throw new Error(
        "Invalid tax"
      );
    }

    const normalizedItems =
      mergeSaleItems(items);

    if (!normalizedItems.length) {
      throw new Error(
        "Sale must contain valid items"
      );
    }

    /*
     * Store old quantities.
     */
    const oldQuantities =
      new Map();

    for (const item of sale.items) {
      oldQuantities.set(
        item.inventory.toString(),
        Number(item.quantity)
      );
    }

    /*
     * Store new quantities.
     */
    const newQuantities =
      new Map();

    for (const item of normalizedItems) {
      newQuantities.set(
        item.inventory.toString(),
        Number(item.quantity)
      );
    }

    /*
     * Build fresh sale item snapshots
     * using CURRENT inventory prices.
     */
    const updatedSaleItems = [];

    let subtotal = 0;

    for (const item of normalizedItems) {
      const inventory =
        await Inventory.findById(
          item.inventory
        ).session(session);

      if (!inventory) {
        throw new Error(
          `Inventory item ${item.inventory} not found`
        );
      }

      if (
        inventory.status === "Inactive"
      ) {
        throw new Error(
          `${inventory.productName} is inactive`
        );
      }

      const oldQuantity =
        oldQuantities.get(
          inventory._id.toString()
        ) || 0;

      const quantityDifference =
        item.quantity -
        oldQuantity;

      /*
       * Only additional quantity needs
       * available-stock validation.
       */
      if (
        quantityDifference > 0
      ) {
        const availableStock =
          inventory.currentStock -
          inventory.reservedStock;

        if (
          quantityDifference >
          availableStock
        ) {
          throw new Error(
            `Insufficient stock for ${inventory.productName}. Additional available: ${availableStock}`
          );
        }
      }

      const lineTotal =
        inventory.sellingPrice *
        item.quantity;

      subtotal += lineTotal;

      updatedSaleItems.push({
        inventory:
          inventory._id,

        productName:
          inventory.productName,

        sku:
          inventory.sku,

        quantity:
          item.quantity,

        sellingPrice:
          inventory.sellingPrice,

        totalPrice:
          lineTotal,
      });
    }

    /*
     * Ensure removed products are also
     * represented in the quantity comparison.
     */
    for (const [
      inventoryId,
      oldQuantity,
    ] of oldQuantities) {
      if (
        !newQuantities.has(
          inventoryId
        )
      ) {
        const inventory =
          await Inventory.findById(
            inventoryId
          ).session(session);

        if (!inventory) {
          throw new Error(
            `Previous inventory item ${inventoryId} not found`
          );
        }
      }
    }

    if (
      numericDiscount > subtotal
    ) {
      throw new Error(
        "Discount cannot exceed subtotal"
      );
    }

    const totalAmount = Math.max(
      0,
      subtotal -
        numericDiscount +
        numericTax
    );

    /*
     * Sale was unpaid before editing,
     * so paidAmount remains zero.
     */
    const paymentStatus =
      calculatePaymentStatus(
        0,
        totalAmount
      );

    /*
     * Apply inventory differences.
     */
    const affectedInventoryIds =
      new Set([
        ...oldQuantities.keys(),
        ...newQuantities.keys(),
      ]);

    for (const inventoryId of affectedInventoryIds) {
      const oldQuantity =
        oldQuantities.get(
          inventoryId
        ) || 0;

      const newQuantity =
        newQuantities.get(
          inventoryId
        ) || 0;

      const difference =
        newQuantity -
        oldQuantity;

      if (difference === 0) {
        continue;
      }

      const inventory =
        await Inventory.findById(
          inventoryId
        ).session(session);

      if (!inventory) {
        throw new Error(
          `Inventory item ${inventoryId} not found`
        );
      }

      const stockBefore =
        inventory.currentStock;

      let stockAfter;

      if (difference > 0) {
        /*
         * Additional quantity sold.
         */
        stockAfter =
          stockBefore -
          difference;

        if (
          stockAfter < 0
        ) {
          throw new Error(
            `Insufficient stock for ${inventory.productName}`
          );
        }

        inventory.currentStock =
          stockAfter;

        await inventory.save({
          session,
        });

        await StockMovement.create(
          [
            {
              inventory:
                inventory._id,

              type: "OUT",

              quantity:
                difference,

              previousStock:
                stockBefore,

              newStock:
                stockAfter,

              reason:
                `Sale ${sale.saleNumber} edited - additional quantity`,

              referenceType:
                "SALE",

              referenceId:
                sale._id.toString(),
            },
          ],
          { session }
        );
      } else {
        /*
         * Quantity reduced/removed.
         * Return difference to inventory.
         */
        const returnedQuantity =
          Math.abs(difference);

        stockAfter =
          stockBefore +
          returnedQuantity;

        inventory.currentStock =
          stockAfter;

        await inventory.save({
          session,
        });

        await StockMovement.create(
          [
            {
              inventory:
                inventory._id,

              type: "RETURN",

              quantity:
                returnedQuantity,

              previousStock:
                stockBefore,

              newStock:
                stockAfter,

              reason:
                `Sale ${sale.saleNumber} edited - quantity reduced`,

              referenceType:
                "SALE",

              referenceId:
                sale._id.toString(),
            },
          ],
          { session }
        );
      }
    }

    /*
     * Update sale.
     */
    sale.customerName =
      customerName?.trim() ||
      "Walk-in Customer";

    sale.customerContact =
      customerContact?.trim() || "";

    sale.items =
      updatedSaleItems;

    sale.subtotal =
      subtotal;

    sale.discount =
      numericDiscount;

    sale.tax =
      numericTax;

    sale.totalAmount =
      totalAmount;

    sale.paidAmount = 0;

    sale.paymentStatus =
      paymentStatus;

    if (paymentMethod) {
      sale.paymentMethod =
        paymentMethod;
    }

    sale.notes =
      notes?.trim() || "";

    sale.activityLog.push({
      action: "EDITED",

      message:
        `Sale ${sale.saleNumber} was edited`,

      status:
        sale.status,

      paymentStatus:
        sale.paymentStatus,

      paidAmount:
        sale.paidAmount,
    });

    await sale.save({
      session,
    });

    await session.commitTransaction();

    const updatedSale =
      await Sale.findById(
        sale._id
      );

    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Update sale error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update sale",
    });
  } finally {
    session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/sales/:id/payment
|--------------------------------------------------------------------------
*/

const updateSalePayment = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const saleId = req.params.id;

    const {
      paidAmount,
      paymentMethod,
    } = req.body;

    const newPaidAmount =
      Number(paidAmount);

    if (
      !Number.isFinite(
        newPaidAmount
      ) ||
      newPaidAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid paid amount",
      });
    }

    if (
      paymentMethod &&
      !validatePaymentMethod(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method",
      });
    }

    session.startTransaction();

    const sale =
      await Sale.findById(
        saleId
      ).session(session);

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    if (
      sale.status !== "Completed"
    ) {
      throw new Error(
        "Payment can only be updated for completed sales"
      );
    }

    if (
      sale.paymentStatus ===
      "Refunded"
    ) {
      throw new Error(
        "Payment cannot be updated for a refunded sale"
      );
    }

    const oldPaidAmount =
      Number(
        sale.paidAmount || 0
      );

    /*
     * Payments can only increase.
     */
    if (
      newPaidAmount <
      oldPaidAmount
    ) {
      throw new Error(
        "Paid amount cannot be reduced"
      );
    }

    if (
      newPaidAmount >
      Number(sale.totalAmount)
    ) {
      throw new Error(
        "Paid amount cannot exceed total amount"
      );
    }

    const paymentDifference =
      newPaidAmount -
      oldPaidAmount;

    /*
     * No-op update.
     */
    if (
      paymentDifference === 0 &&
      !paymentMethod
    ) {
      throw new Error(
        "No payment change was provided"
      );
    }

    sale.paidAmount =
      newPaidAmount;

    sale.paymentStatus =
      calculatePaymentStatus(
        newPaidAmount,
        sale.totalAmount
      );

    if (paymentMethod) {
      sale.paymentMethod =
        paymentMethod;
    }

    if (paymentDifference > 0) {
      sale.activityLog.push({
        action:
          "PAYMENT_UPDATED",

        message:
          `Payment of ₹${paymentDifference.toLocaleString(
            "en-IN"
          )} recorded via ${
            sale.paymentMethod
          }`,

        status:
          sale.status,

        paymentStatus:
          sale.paymentStatus,

        paidAmount:
          sale.paidAmount,
      });
    }

    await sale.save({
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Payment updated successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Update sale payment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update payment",
    });
  } finally {
    session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/sales/:id/cancel
|--------------------------------------------------------------------------
*/

const cancelSale = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      reason,
    } = req.body;

    if (
      !reason ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancellation reason is required",
      });
    }

    session.startTransaction();

    const sale =
      await Sale.findById(
        req.params.id
      ).session(session);

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    if (
      sale.status !== "Completed"
    ) {
      throw new Error(
        "Only completed sales can be cancelled"
      );
    }

    if (
      Number(sale.paidAmount || 0) >
      0
    ) {
      throw new Error(
        "A sale with recorded payment cannot be cancelled. Use Return Sale instead."
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
          `Inventory item ${item.productName} not found`
        );
      }

      const stockBefore =
        inventory.currentStock;

      const stockAfter =
        stockBefore +
        item.quantity;

      inventory.currentStock =
        stockAfter;

      await inventory.save({
        session,
      });

      await StockMovement.create(
        [
          {
            inventory:
              inventory._id,

            type: "RETURN",

            quantity:
              item.quantity,

            previousStock:
              stockBefore,

            newStock:
              stockAfter,

            reason:
              `Cancelled Sale ${sale.saleNumber}`,

            referenceType:
              "SALE",

            referenceId:
              sale._id.toString(),
          },
        ],
        { session }
      );
    }

    sale.status =
      "Cancelled";

    sale.paymentStatus =
      "Pending";

    sale.paidAmount = 0;

    sale.refundedAmount = 0;

    sale.cancellationReason =
      reason.trim();

    sale.cancelledAt =
      new Date();

    sale.activityLog.push({
      action:
        "CANCELLED",

      message:
        `Sale cancelled: ${reason.trim()}`,

      status:
        "Cancelled",

      paymentStatus:
        "Pending",

      paidAmount: 0,
    });

    await sale.save({
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
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

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to cancel sale",
    });
  } finally {
    session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/sales/:id/return
|--------------------------------------------------------------------------
*/

const returnSale = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      reason,
    } = req.body;

    if (
      !reason ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Return reason is required",
      });
    }

    session.startTransaction();

    const sale =
      await Sale.findById(
        req.params.id
      ).session(session);

    if (!sale) {
      throw new Error(
        "Sale not found"
      );
    }

    if (
      sale.status !== "Completed"
    ) {
      throw new Error(
        "Only completed sales can be returned"
      );
    }

    const paidAmount =
      Number(
        sale.paidAmount || 0
      );

    if (paidAmount <= 0) {
      throw new Error(
        "An unpaid sale cannot be returned. Cancel it instead."
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
          `Inventory item ${item.productName} not found`
        );
      }

      const stockBefore =
        inventory.currentStock;

      const stockAfter =
        stockBefore +
        item.quantity;

      inventory.currentStock =
        stockAfter;

      await inventory.save({
        session,
      });

      await StockMovement.create(
        [
          {
            inventory:
              inventory._id,

            type: "RETURN",

            quantity:
              item.quantity,

            previousStock:
              stockBefore,

            newStock:
              stockAfter,

            reason:
              `Returned Sale ${sale.saleNumber}`,

            referenceType:
              "RETURN",

            referenceId:
              sale._id.toString(),
          },
        ],
        { session }
      );
    }

    sale.status =
      "Returned";

    sale.returnReason =
      reason.trim();

    sale.returnedAt =
      new Date();

    sale.refundedAmount =
      paidAmount;

    sale.paymentStatus =
      "Refunded";

    sale.activityLog.push({
      action:
        "RETURNED",

      message:
        `Sale returned: ${reason.trim()}`,

      status:
        "Returned",

      paymentStatus:
        "Refunded",

      paidAmount:
        paidAmount,
    });

    await sale.save({
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Sale returned successfully",
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Return sale error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to return sale",
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getSales,
  getSaleById,
  getSalesStats,
  getSaleMovements,
  createSale,
  updateSale,
  updateSalePayment,
  cancelSale,
  returnSale,
};