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
    lastOrder.orderNumber.replace("PO-", "")
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
 *
 * Supports:
 *
 * search
 * status
 * requestType
 * mine
 *
 * Staff can request:
 *
 * requestType=Purchase Request
 * mine=true
 *
 * This ensures Staff only sees
 * their own purchase requests.
 */
const getPurchaseOrders = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      requestType = "",
      mine = "",
    } = req.query;

    const query = {};

    /*
     * Search
     */
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

    /*
     * Status filter
     */
    if (status && status !== "All") {
      query.status = status;
    }

    /*
     * Request type filter
     */
    if (
      requestType &&
      requestType !== "All"
    ) {
      query.requestType = requestType;
    }

    /*
     * Staff "my requests" filter
     *
     * Only Staff users can use this
     * ownership filter.
     */
    if (
      mine === "true" &&
      req.user?.role === "staff"
    ) {
      query.createdBy = req.user.userId;
    }

    const orders =
      await PurchaseOrder.find(query)
        .populate(
          "items.inventory",
          "productName sku category currentStock unit purchasePrice"
        )
        .populate(
          "createdBy",
          "name email role"
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
      )
        .populate(
          "items.inventory",
          "productName sku category currentStock unit purchasePrice"
        )
        .populate(
          "createdBy",
          "name email role"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase order not found",
      });
    }

    /*
     * Staff can only view their own
     * Purchase Requests.
     */
    if (
      req.user.role === "staff" &&
      order.requestType ===
        "Purchase Request"
    ) {
      if (
        order.createdBy?._id?.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to view this purchase request",
        });
      }
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
 * Admin / Manager:
 *     Creates Purchase Order
 *
 * Staff:
 *     Creates Purchase Request
 *
 * IMPORTANT:
 * Creating a Purchase Order or
 * Purchase Request DOES NOT modify
 * inventory.
 *
 * Inventory changes only when
 * stock is received.
 */
const createPurchaseOrder = async (req, res) => {
  try {
    const {
      supplier = {},
      items = [],
      tax = 0,
      expectedDate = null,
      priority = "Medium",
      notes = "",
    } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const isStaff = req.user.role === "staff";

    const requestType = isStaff
      ? "Purchase Request"
      : "Purchase Order";

    /*
     * --------------------------------------------------
     * STAFF PURCHASE REQUEST
     * --------------------------------------------------
     */

    if (isStaff) {
      if (!items.length) {
        return res.status(400).json({
          success: false,
          message:
            "At least one product is required.",
        });
      }

      const orderItems = [];

      for (const item of items) {
        if (!item.inventory) {
          return res.status(400).json({
            success: false,
            message:
              "Each requested item must have an inventory product.",
          });
        }

        const quantity = Number(item.quantity);

        if (!quantity || quantity <= 0) {
          return res.status(400).json({
            success: false,
            message:
              "Requested quantity must be greater than zero.",
          });
        }

        const inventory = await Inventory.findById(
          item.inventory
        );

        if (!inventory) {
          return res.status(404).json({
            success: false,
            message:
              "One of the selected inventory products was not found.",
          });
        }

        if (inventory.status !== "Active") {
          return res.status(400).json({
            success: false,
            message: `${inventory.productName} is inactive.`,
          });
        }

        orderItems.push({
          inventory: inventory._id,
          productName: inventory.productName,
          sku: inventory.sku,
          quantity,
          receivedQuantity: 0,
          unitPrice: 0,
          totalPrice: 0,
        });
      }

      const orderNumber =
        await generateOrderNumber();

      const purchaseRequest =
        await PurchaseOrder.create({
          orderNumber,
          createdBy: req.user.userId,
          requestType: "Purchase Request",

          supplier: {
            name: "",
            email: "",
            phone: "",
          },

          items: orderItems,

          subtotal: 0,
          tax: 0,
          totalAmount: 0,

          expectedDate:
            expectedDate || null,

          priority,

          notes: notes.trim(),

          status: "Draft",
        });

      await purchaseRequest.populate(
        "createdBy",
        "name email role"
      );

      await purchaseRequest.populate(
        "items.inventory",
        "productName sku category currentStock unit purchasePrice"
      );

      return res.status(201).json({
        success: true,
        message:
          "Purchase request created successfully.",
        data: purchaseRequest,
      });
    }

    /*
     * --------------------------------------------------
     * MANAGER / ADMIN PURCHASE ORDER
     * --------------------------------------------------
     */

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product is required.",
      });
    }

    if (!supplier?.name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required.",
      });
    }

    const numericTax = Number(tax || 0);

    if (numericTax < 0) {
      return res.status(400).json({
        success: false,
        message: "Tax cannot be negative.",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.inventory) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have an inventory product.",
        });
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be greater than zero.",
        });
      }

      if (
        item.unitPrice === undefined ||
        item.unitPrice === null ||
        item.unitPrice === "" ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have a valid unit price.",
        });
      }

      const inventory = await Inventory.findById(
        item.inventory
      );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message:
            "One of the selected inventory products was not found.",
        });
      }

      if (inventory.status !== "Active") {
        return res.status(400).json({
          success: false,
          message: `${inventory.productName} is inactive.`,
        });
      }

      const totalPrice =
        quantity * unitPrice;

      subtotal += totalPrice;

      orderItems.push({
        inventory: inventory._id,
        productName: inventory.productName,
        sku: inventory.sku,
        quantity,
        receivedQuantity: 0,
        unitPrice,
        totalPrice,
      });
    }

    const taxAmount =
      (subtotal * numericTax) / 100;

    const totalAmount =
      subtotal + taxAmount;

    const orderNumber =
      await generateOrderNumber();

    const purchaseOrder =
      await PurchaseOrder.create({
        orderNumber,

        createdBy: req.user.userId,

        requestType: "Purchase Order",

        supplier: {
          name: supplier.name.trim(),
          email: supplier.email?.trim() || "",
          phone: supplier.phone?.trim() || "",
        },

        items: orderItems,

        subtotal,
        tax: numericTax,
        totalAmount,

        expectedDate:
          expectedDate || null,

        priority,

        notes: notes.trim(),

        status: "Draft",
      });

    await purchaseOrder.populate(
      "createdBy",
      "name email role"
    );

    await purchaseOrder.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    return res.status(201).json({
      success: true,
      message:
        "Purchase order created successfully.",
      data: purchaseOrder,
    });
  } catch (error) {
    console.error(
      "Create purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create purchase order.",
      error: error.message,
    });
  }
};

/*
 * PUT /api/purchase-orders/:id
 *
 * Only Draft orders can be edited.
 *
 * Staff can edit only their own
 * Purchase Requests.
 */
const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      supplier = {},
      items,
      tax = 0,
      expectedDate = null,
      priority = "Medium",
      notes = "",
    } = req.body;

    const order = await PurchaseOrder.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    /*
     * Only Draft orders can be modified.
     */
    if (order.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft purchase orders can be edited",
      });
    }

    const isStaff = req.user.role === "staff";
    const isPurchaseRequest =
      order.requestType === "Purchase Request";

    /*
     * Staff ownership and request type check.
     */
    if (isStaff) {
      if (!isPurchaseRequest) {
        return res.status(403).json({
          success: false,
          message: "Staff can only edit purchase requests",
        });
      }

      if (
        order.createdBy.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only edit your own purchase requests",
        });
      }
    }

    /*
     * Items validation.
     */
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase order must contain at least one item",
      });
    }

    /*
     * Supplier validation only for
     * normal Purchase Orders.
     */
    if (!isPurchaseRequest && !supplier?.name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
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

      const inventory = await Inventory.findById(
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
          message: `${inventory.productName} is inactive`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${inventory.productName}`,
        });
      }

      /*
       * Staff requests do not require pricing.
       * Manager/Admin purchase orders do.
       */
      let unitPrice = 0;

      if (!isPurchaseRequest) {
        unitPrice = Number(item.unitPrice);

        if (
          item.unitPrice === undefined ||
          item.unitPrice === null ||
          item.unitPrice === "" ||
          Number.isNaN(unitPrice) ||
          unitPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid unit price for ${inventory.productName}`,
          });
        }
      }

      const totalPrice = quantity * unitPrice;

      subtotal += totalPrice;

      updatedItems.push({
        inventory: inventory._id,
        productName: inventory.productName,
        sku: inventory.sku,
        quantity,
        receivedQuantity: 0,
        unitPrice,
        totalPrice,
      });
    }

    /*
     * Tax handling.
     *
     * Staff purchase requests always
     * have zero tax and total.
     */
    let numericTax = 0;
    let totalAmount = 0;

    if (!isPurchaseRequest) {
      numericTax = Number(tax);

      if (
        Number.isNaN(numericTax) ||
        numericTax < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid tax amount",
        });
      }

      totalAmount =
        subtotal + (subtotal * numericTax) / 100;
    }

    /*
     * Update supplier details.
     *
     * Staff requests keep supplier
     * information empty.
     */
    if (isPurchaseRequest) {
      order.supplier = {
        name: "",
        email: "",
        phone: "",
      };
    } else {
      order.supplier = {
        name: supplier.name.trim(),
        email: supplier.email?.trim() || "",
        phone: supplier.phone?.trim() || "",
      };
    }

    /*
     * Update order data.
     */
    order.items = updatedItems;

    order.subtotal = subtotal;
    order.tax = numericTax;
    order.totalAmount = totalAmount;

    order.expectedDate = expectedDate || null;

    order.priority = priority;

    order.notes =
      typeof notes === "string"
        ? notes.trim()
        : "";

    const updatedOrder = await order.save();

    await updatedOrder.populate(
      "createdBy",
      "name email role"
    );

    await updatedOrder.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    return res.status(200).json({
      success: true,
      message: isPurchaseRequest
        ? "Purchase request updated successfully"
        : "Purchase order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update purchase order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update purchase order",
      error: error.message,
    });
  }
};

/*
 * POST /api/purchase-orders/:id/confirm
 *
 * Manager/Admin:
 *     Confirm a normal Purchase Order
 *
 * Staff:
 *     Submit their own Purchase Request
 *
 * Both transition:
 *
 * Draft → Pending
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

    /*
     * Only Draft orders can
     * be submitted/confirmed.
     */
    if (order.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message:
          "Only draft orders can be submitted",
      });
    }

    /*
     * STAFF
     *
     * Staff can only submit their
     * own Purchase Request.
     */
    if (
      req.user.role === "staff"
    ) {
      if (
        order.requestType !==
        "Purchase Request"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Staff can only submit purchase requests",
        });
      }

      if (
        order.createdBy.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only submit your own purchase requests",
        });
      }
    }

    /*
     * Manager/Admin can confirm
     * normal Purchase Orders.
     *
     * They can also process a
     * Purchase Request because
     * that request is now entering
     * the management workflow.
     */
    order.status = "Pending";

    await order.save();

    await order.populate(
      "createdBy",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message:
        order.requestType ===
        "Purchase Request"
          ? "Purchase request submitted successfully"
          : "Purchase order confirmed",
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
        "Failed to submit purchase request",
    });
  }
};

/*
 * POST /api/purchase-orders/:id/receive
 *
 * This is the important Inventory
 * connection.
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
    /*
     * Authentication check
     */
    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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
     * Staff can receive stock,
     * but if this is a Purchase Request,
     * only the request owner can receive it.
     *
     * This prevents one staff member
     * from processing another staff
     * member's request.
     */
    if (
      req.user.role === "staff" &&
      order.requestType ===
        "Purchase Request"
    ) {
      if (
        order.createdBy.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only receive stock for your own purchase requests",
        });
      }
    }

    /*
     * Only these statuses can receive.
     */
    if (
      order.status !== "Pending" &&
      order.status !==
        "Partially Received"
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

    if (
      receivedItems.length === 0
    ) {
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

      if (
        inventory.status !== "Active"
      ) {
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
        Number(
          inventory.currentStock
        ) || 0;

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
        inventory:
          inventory._id,

        type: "IN",

        quantity,

        previousStock,

        newStock,

        reason:
          `Purchase Order ${order.orderNumber}`,

        referenceType:
          "PURCHASE",

        referenceId:
          order._id.toString(),

        performedBy:
          req.user.userId,
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
      order.status =
        "Received";
    } else if (
      partiallyReceived
    ) {
      order.status =
        "Partially Received";
    }

    await order.save();

    /*
     * Populate references
     */
    await order.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    await order.populate(
      "createdBy",
      "name email role"
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
 *
 * Admin/Manager:
 *     Can cancel orders.
 *
 * Staff:
 *     Can cancel only their own
 *     Draft Purchase Requests.
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
     * Staff ownership check
     */
    if (
      req.user.role === "staff"
    ) {
      if (
        order.requestType !==
        "Purchase Request"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Staff can only cancel purchase requests",
        });
      }

      if (
        order.createdBy.toString() !==
        req.user.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only cancel your own purchase requests",
        });
      }

      /*
       * Staff can only cancel
       * Draft requests.
       */
      if (order.status !== "Draft") {
        return res.status(400).json({
          success: false,
          message:
            "Only draft purchase requests can be cancelled by staff",
        });
      }
    }

    /*
     * Received orders cannot be
     * cancelled.
     */
    if (
      order.status === "Received"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received orders cannot be cancelled",
      });
    }

    /*
     * Partially received orders
     * cannot be cancelled.
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

    /*
     * Already cancelled
     */
    if (
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase order is already cancelled",
      });
    }

    order.status =
      "Cancelled";

    await order.save();

    await order.populate(
      "createdBy",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message:
        order.requestType ===
        "Purchase Request"
          ? "Purchase request cancelled successfully"
          : "Purchase order cancelled",
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


/*
 * GET /api/purchase-orders/manager/requests
 *
 * Manager/Admin:
 * Fetch all staff purchase requests.
 *
 * Supports:
 * search
 * status
 * priority
 */
const getManagerPurchaseRequests = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      priority = "",
    } = req.query;

    const query = {
      requestType: "Purchase Request",
    };

    /*
     * Status filter
     */
    if (status && status !== "All") {
      query.status = status;
    }

    /*
     * Priority filter
     */
    if (priority && priority !== "All") {
      query.priority = priority;
    }

    /*
     * Search by order number,
     * supplier name, or notes.
     */
    if (search.trim()) {
      query.$or = [
        {
          orderNumber: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          notes: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const requests = await PurchaseOrder.find(query)
      .populate(
        "items.inventory",
        "productName sku category currentStock unit purchasePrice"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    /*
     * Statistics for manager panel
     */
    const statistics = {
      total: requests.length,

      pending: requests.filter(
        (request) => request.status === "Pending"
      ).length,

      approved: requests.filter(
        (request) => request.status === "Approved"
      ).length,

      rejected: requests.filter(
        (request) => request.status === "Rejected"
      ).length,

      highPriority: requests.filter(
        (request) =>
          request.priority === "High" ||
          request.priority === "Urgent"
      ).length,
    };

    return res.status(200).json({
      success: true,
      count: requests.length,
      statistics,
      data: requests,
    });
  } catch (error) {
    console.error(
      "Get manager purchase requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch manager purchase requests",
    });
  }
};


const approvePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerNote = "" } = req.body;

    const request = await PurchaseOrder.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    if (request.requestType !== "Purchase Request") {
      return res.status(400).json({
        success: false,
        message: "This is not a purchase request",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending purchase requests can be approved",
      });
    }

    request.status = "Approved";
    request.managerNote =
      typeof managerNote === "string"
        ? managerNote.trim()
        : "";

    const updatedRequest = await request.save();

    await updatedRequest.populate(
      "createdBy",
      "name email role"
    );

    await updatedRequest.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    return res.status(200).json({
      success: true,
      message: "Purchase request approved successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Approve purchase request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to approve purchase request",
    });
  }
};


const rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerNote = "" } = req.body;

    const request = await PurchaseOrder.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    if (request.requestType !== "Purchase Request") {
      return res.status(400).json({
        success: false,
        message: "This is not a purchase request",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending purchase requests can be rejected",
      });
    }

    if (
      typeof managerNote !== "string" ||
      !managerNote.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required",
      });
    }

    request.status = "Rejected";
    request.managerNote = managerNote.trim();

    const updatedRequest = await request.save();

    await updatedRequest.populate(
      "createdBy",
      "name email role"
    );

    await updatedRequest.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    return res.status(200).json({
      success: true,
      message: "Purchase request rejected successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Reject purchase request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject purchase request",
    });
  }
};


const createPurchaseOrderFromRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      supplier = {},
      items,
      tax = 0,
      expectedDate = null,
      priority,
      notes = "",
    } = req.body;

    /*
     * Find the existing purchase request.
     * We will update this same document instead
     * of creating a second PurchaseOrder.
     */
    const request = await PurchaseOrder.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
    }

    /*
     * Prevent duplicate conversion.
     */
    if (request.requestType !== "Purchase Request") {
      return res.status(409).json({
        success: false,
        message:
          "This request has already been converted into a purchase order. Duplicate orders are not allowed.",
      });
    }

    /*
     * Only approved requests can be converted.
     */
    if (request.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message:
          "Only approved purchase requests can be converted",
      });
    }

    /*
     * Validate supplier.
     */
    if (!supplier?.name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
      });
    }

    /*
     * Validate items.
     */
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    const updatedItems = [];
    let subtotal = 0;

    /*
     * Validate inventory items and calculate subtotal.
     */
    for (const item of items) {
      if (!item.inventory) {
        return res.status(400).json({
          success: false,
          message: "Inventory reference is required",
        });
      }

      const inventory = await Inventory.findById(
        item.inventory
      );

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory product not found",
        });
      }

      if (inventory.status !== "Active") {
        return res.status(400).json({
          success: false,
          message: `${inventory.productName} is inactive`,
        });
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${inventory.productName}`,
        });
      }

      if (
        item.unitPrice === undefined ||
        item.unitPrice === null ||
        item.unitPrice === "" ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid unit price for ${inventory.productName}`,
        });
      }

      const totalPrice = quantity * unitPrice;

      subtotal += totalPrice;

      updatedItems.push({
        inventory: inventory._id,
        productName: inventory.productName,
        sku: inventory.sku,
        quantity,
        receivedQuantity: 0,
        unitPrice,
        totalPrice,
      });
    }

    /*
     * Validate tax percentage.
     */
    const numericTax = Number(tax);

    if (
      !Number.isFinite(numericTax) ||
      numericTax < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax percentage",
      });
    }

    const totalAmount =
      subtotal + (subtotal * numericTax) / 100;

    /*
     * Convert the existing request into a PO.
     *
     * No new PurchaseOrder document is created.
     */
    request.orderNumber = `PO-${Date.now()}`;

    request.requestType = "Purchase Order";

    request.supplier = {
      name: supplier.name.trim(),
      email: supplier.email?.trim() || "",
      phone: supplier.phone?.trim() || "",
    };

    request.items = updatedItems;

    request.subtotal = subtotal;
    request.tax = numericTax;
    request.totalAmount = totalAmount;

    request.expectedDate = expectedDate || null;

    request.priority =
      priority || request.priority || "Medium";

    /*
     * Keep the converted order as Draft.
     * The user can confirm it once.
     */
    request.status = "Draft";

    request.notes =
      typeof notes === "string"
        ? notes.trim()
        : "";

    const purchaseOrder = await request.save();

    /*
     * Populate response data.
     */
    await purchaseOrder.populate(
      "createdBy",
      "name email role"
    );

    await purchaseOrder.populate(
      "items.inventory",
      "productName sku category currentStock unit purchasePrice"
    );

    return res.status(200).json({
      success: true,
      message:
        "Purchase request converted into purchase order successfully",
      data: purchaseOrder,
    });
  } catch (error) {
    console.error(
      "Create purchase order from request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create purchase order from request",
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
  getManagerPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  createPurchaseOrderFromRequest,
};