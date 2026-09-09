const PurchaseOrder = require("../models/PurchaseOrder");
const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

/*
 * Generate PO number
 */
const generateOrderNumber = async () => {
  const lastOrder =
    await PurchaseOrder.findOne()
      .sort({ createdAt: -1 })
      .select("orderNumber");

  if (!lastOrder) {
    return "PO-0001";
  }

  const lastNumber = Number(
    lastOrder.orderNumber.replace(
      "PO-",
      ""
    )
  );

  if (Number.isNaN(lastNumber)) {
    return "PO-0001";
  }

  return `PO-${String(
    lastNumber + 1
  ).padStart(4, "0")}`;
};

/*
 * GET /api/purchase-orders
 */
const getPurchaseOrders = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      status = "",
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          orderNumber: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          "supplier.name": {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      query.status = status;
    }

    const orders =
      await PurchaseOrder.find(query)
        .populate(
          "items.inventory",
          "productName sku category currentStock unit purchasePrice"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(
      "Get purchase orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchase orders",
    });
  }
};

/*
 * GET /api/purchase-orders/:id
 */
const getPurchaseOrderById = async (
  req,
  res
) => {
  try {
    const order =
      await PurchaseOrder.findById(
        req.params.id
      ).populate(
        "items.inventory",
        "productName sku category currentStock unit purchasePrice"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Get purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchase order",
    });
  }
};

/*
 * POST /api/purchase-orders
 *
 * IMPORTANT:
 * Creating a purchase order DOES NOT
 * modify inventory.
 *
 * Inventory changes only when items
 * are received.
 */
const createPurchaseOrder = async (
  req,
  res
) => {
  try {
    const {
      supplier,
      items,
      tax = 0,
      expectedDate,
      notes = "",
    } = req.body;

    /*
     * Supplier validation
     */
    if (
      !supplier?.name ||
      !supplier.name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier name is required",
      });
    }

    /*
     * Items validation
     */
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product is required",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    /*
     * Validate every product and
     * create snapshot information.
     */
    for (const item of items) {
      if (!item.inventory) {
        return res.status(400).json({
          success: false,
          message:
            "Inventory reference is required",
        });
      }

      const inventory =
        await Inventory.findById(
          item.inventory
        );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "One of the selected products was not found in inventory",
        });
      }

      if (inventory.status !== "Active") {
        return res.status(400).json({
          success: false,
          message:
            `${inventory.productName} is inactive and cannot be added`,
        });
      }

      const quantity = Number(
        item.quantity
      );

      const unitPrice = Number(
        item.unitPrice
      );

      /*
       * Quantity
       */
      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${inventory.productName}`,
        });
      }

      /*
       * Price
       */
      if (
        Number.isNaN(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid unit price for ${inventory.productName}`,
        });
      }

      const totalPrice =
        quantity * unitPrice;

      subtotal += totalPrice;

      orderItems.push({
        inventory: inventory._id,

        /*
         * Snapshot values
         */
        productName:
          inventory.productName,

        sku: inventory.sku,

        quantity,

        receivedQuantity: 0,

        unitPrice,

        totalPrice,
      });
    }

    /*
     * Tax validation
     *
     * Tax is currently stored as a
     * fixed monetary amount.
     */
    const numericTax = Number(tax);

    if (
      Number.isNaN(numericTax) ||
      numericTax < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid tax amount",
      });
    }

    const totalAmount =
      subtotal + numericTax;

    /*
     * Generate order number
     */
    const orderNumber =
      await generateOrderNumber();

    /*
     * Always create as Draft.
     *
     * The client should not be allowed
     * to create a Pending/Received order
     * directly.
     */
    const order =
      await PurchaseOrder.create({
        orderNumber,

        supplier: {
          name: supplier.name.trim(),
          email:
            supplier.email?.trim() || "",
          phone:
            supplier.phone?.trim() || "",
        },

        items: orderItems,

        subtotal,

        tax: numericTax,

        totalAmount,

        expectedDate:
          expectedDate || null,

        notes:
          typeof notes === "string"
            ? notes.trim()
            : "",

        status: "Draft",
      });

    return res.status(201).json({
      success: true,
      message:
        "Purchase order created successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Create purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create purchase order",
    });
  }
};

/*
 * PUT /api/purchase-orders/:id
 *
 * Only Draft orders can be edited.
 */
const updatePurchaseOrder = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      supplier,
      items,
      tax = 0,
      expectedDate,
      notes = "",
    } = req.body;

    const order =
      await PurchaseOrder.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase order not found",
      });
    }

    /*
     * Only Draft can be modified.
     */
    if (order.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft purchase orders can be edited",
      });
    }

    /*
     * Supplier
     */
    if (
      !supplier?.name ||
      !supplier.name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier name is required",
      });
    }

    /*
     * Items
     */
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase order must contain at least one item",
      });
    }

    const updatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.inventory) {
        return res.status(400).json({
          success: false,
          message:
            "Inventory reference is required for every item",
        });
      }

      const inventory =
        await Inventory.findById(
          item.inventory
        );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "One or more inventory products were not found",
        });
      }

      if (inventory.status !== "Active") {
        return res.status(400).json({
          success: false,
          message:
            `${inventory.productName} is inactive`,
        });
      }

      const quantity = Number(
        item.quantity
      );

      const unitPrice = Number(
        item.unitPrice
      );

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${inventory.productName}`,
        });
      }

      if (
        Number.isNaN(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid unit price for ${inventory.productName}`,
        });
      }

      const totalPrice =
        quantity * unitPrice;

      subtotal += totalPrice;

      updatedItems.push({
        inventory: inventory._id,
        productName:
          inventory.productName,
        sku: inventory.sku,
        quantity,
        receivedQuantity: 0,
        unitPrice,
        totalPrice,
      });
    }

    /*
     * Tax
     */
    const numericTax = Number(tax);

    if (
      Number.isNaN(numericTax) ||
      numericTax < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid tax amount",
      });
    }

    const totalAmount =
      subtotal + numericTax;

    /*
     * Update order
     */
    order.supplier = {
      name: supplier.name.trim(),
      email:
        supplier.email?.trim() || "",
      phone:
        supplier.phone?.trim() || "",
    };

    order.items = updatedItems;

    order.subtotal = subtotal;

    order.tax = numericTax;

    order.totalAmount = totalAmount;

    order.expectedDate =
      expectedDate || null;

    order.notes =
      typeof notes === "string"
        ? notes.trim()
        : "";

    const updatedOrder =
      await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update purchase order",
    });
  }
};

/*
 * POST /api/purchase-orders/:id/confirm
 */
const confirmPurchaseOrder = async (
  req,
  res
) => {
  try {
    const order =
      await PurchaseOrder.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase order not found",
      });
    }

    if (order.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft orders can be confirmed",
      });
    }

    order.status = "Pending";

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase order confirmed",
      data: order,
    });
  } catch (error) {
    console.error(
      "Confirm purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to confirm purchase order",
    });
  }
};

/*
 * POST /api/purchase-orders/:id/receive
 *
 * This is the important Inventory connection.
 *
 * Pending PO
 *      ↓
 * Receive quantity
 *      ↓
 * Inventory.currentStock += quantity
 *      ↓
 * StockMovement type = IN
 *      ↓
 * PO receivedQuantity += quantity
 */
const receivePurchaseOrder = async (
  req,
  res
) => {
  try {
    const order =
      await PurchaseOrder.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase order not found",
      });
    }

    /*
     * Only these statuses can receive.
     */
    if (
      order.status !== "Pending" &&
      order.status !== "Partially Received"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending or partially received orders can receive items",
      });
    }

    const receivedItems =
      Array.isArray(req.body.items)
        ? req.body.items
        : [];

    if (receivedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No received items provided",
      });
    }

    /*
     * ------------------------------------------------
     * STEP 1: Validate EVERYTHING first.
     * ------------------------------------------------
     *
     * We don't modify inventory until all
     * requested quantities are known to be valid.
     */
    const validatedItems = [];

    for (const receivedItem of receivedItems) {
      if (!receivedItem.itemId) {
        return res.status(400).json({
          success: false,
          message:
            "Purchase order item ID is required",
        });
      }

      const orderItem =
        order.items.id(
          receivedItem.itemId
        );

      if (!orderItem) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase order item not found",
        });
      }

      const quantity = Number(
        receivedItem.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid received quantity for ${orderItem.productName}`,
        });
      }

      const remaining =
        orderItem.quantity -
        orderItem.receivedQuantity;

      if (quantity > remaining) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot receive more than ${remaining} remaining units for ${orderItem.productName}`,
        });
      }

      const inventory =
        await Inventory.findById(
          orderItem.inventory
        );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            `Inventory not found for ${orderItem.productName}`,
        });
      }

      if (inventory.status !== "Active") {
        return res.status(400).json({
          success: false,
          message:
            `${inventory.productName} is inactive`,
        });
      }

      validatedItems.push({
        orderItem,
        inventory,
        quantity,
      });
    }

    /*
     * ------------------------------------------------
     * STEP 2: Update Inventory + Stock Movement
     * ------------------------------------------------
     */
    for (const item of validatedItems) {
      const {
        orderItem,
        inventory,
        quantity,
      } = item;

      const previousStock =
        Number(inventory.currentStock) || 0;

      const newStock =
        previousStock + quantity;

      /*
       * Update inventory
       */
      inventory.currentStock =
        newStock;

      await inventory.save();

      /*
       * Update PO received quantity
       */
      orderItem.receivedQuantity +=
        quantity;

      /*
       * Create audit movement
       */
      await StockMovement.create({
        inventory: inventory._id,

        type: "IN",

        quantity,

        previousStock,

        newStock,

        reason:
          `Purchase Order ${order.orderNumber}`,

        referenceType: "PURCHASE",

        referenceId:
          order._id.toString(),
      });
    }

    /*
     * ------------------------------------------------
     * STEP 3: Update PO status
     * ------------------------------------------------
     */

    const fullyReceived =
      order.items.every(
        (item) =>
          item.receivedQuantity >=
          item.quantity
      );

    const partiallyReceived =
      order.items.some(
        (item) =>
          item.receivedQuantity > 0
      );

    if (fullyReceived) {
      order.status = "Received";
    } else if (partiallyReceived) {
      order.status =
        "Partially Received";
    }

    await order.save();

    /*
     * Populate inventory references in response.
     */
    await order.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    return res.status(200).json({
      success: true,
      message:
        "Purchase order received successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Receive purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to receive purchase order",
      error: error.message,
    });
  }
};

/*
 * POST /api/purchase-orders/:id/cancel
 */
const cancelPurchaseOrder = async (
  req,
  res
) => {
  try {
    const order =
      await PurchaseOrder.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase order not found",
      });
    }

    /*
     * Received orders cannot be cancelled.
     */
    if (order.status === "Received") {
      return res.status(400).json({
        success: false,
        message:
          "Received orders cannot be cancelled",
      });
    }

    /*
     * Partially received orders should
     * also not be cancelled because some
     * stock has already entered inventory.
     */
    if (
      order.status ===
      "Partially Received"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Partially received orders cannot be cancelled",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Purchase order is already cancelled",
      });
    }

    order.status = "Cancelled";

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase order cancelled",
      data: order,
    });
  } catch (error) {
    console.error(
      "Cancel purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel purchase order",
    });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
};