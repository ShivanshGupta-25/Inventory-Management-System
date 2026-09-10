const mongoose = require("mongoose");

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

// Helper function to get start and end dates
// for a given period.

const getPeriodDates = (period = "30d") => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;

    case "6m":
      startDate.setMonth(startDate.getMonth() - 6);
      break;

    case "1y":
      startDate.setFullYear(
        startDate.getFullYear() - 1
      );
      break;

    default:
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

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
| GET DEMAND HISTORY
|-------------------------------------------------------------------------- 
*/

const getDemandHistory = async (req, res) => {
  try {
    const {
      period = "30d",
      productId,
    } = req.query;

    const { startDate, endDate } =
      getPeriodDates(period);

    // Validate product ID
    if (
      productId &&
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const matchStage = {
      status: "Completed",
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const pipeline = [
      {
        $match: matchStage,
      },

      {
        $unwind: "$items",
      },
    ];

    // Optional product filter
    if (productId) {
      pipeline.push({
        $match: {
          "items.inventory":
            new mongoose.Types.ObjectId(
              productId
            ),
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            productId: "$items.inventory",
            sku: "$items.sku",
            productName: "$items.productName",

            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },

          unitsSold: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: "$items.totalPrice",
          },
        },
      },

      {
        $sort: {
          "_id.date": 1,
        },
      }
    );

    const rawData = await Sale.aggregate(
      pipeline
    );

    /*
     * Group records by product.
     */
    const productMap = new Map();

    rawData.forEach((item) => {
      const productKey =
        item._id.productId?.toString() ||
        item._id.sku ||
        item._id.productName;

      if (!productMap.has(productKey)) {
        productMap.set(productKey, {
          productId:
            item._id.productId,
          sku: item._id.sku,
          productName:
            item._id.productName,
          history: [],
        });
      }

      productMap
        .get(productKey)
        .history.push({
          date: item._id.date,
          unitsSold: item.unitsSold,
          revenue: item.revenue,
        });
    });

    /*
     * If a specific product was requested
     * but had no sales, still return it.
     */
    if (
      productId &&
      productMap.size === 0
    ) {
      const inventory =
        await Inventory.findById(
          productId
        ).lean();

      if (inventory) {
        productMap.set(productId, {
          productId: inventory._id,
          sku: inventory.sku,
          productName:
            inventory.productName,
          history: [],
        });
      }
    }

    /*
     * Generate dates using local calendar dates.
     */
    const dates = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    const current = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    const last = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

    while (current <= last) {
      const year =
        current.getFullYear();

      const month = String(
        current.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        current.getDate()
      ).padStart(2, "0");

      dates.push(
        `${year}-${month}-${day}`
      );

      current.setDate(
        current.getDate() + 1
      );
    }

    /*
     * Fill missing dates with zero demand.
     */
    const data = [];

    productMap.forEach((product) => {
      const existing = new Map(
        product.history.map((item) => [
          item.date,
          item,
        ])
      );

      dates.forEach((date) => {
        const record =
          existing.get(date);

        data.push({
          productId:
            product.productId?.toString() ||
            null,

          sku: product.sku,

          productName:
            product.productName,

          date,

          unitsSold:
            record?.unitsSold || 0,

          revenue:
            record?.revenue || 0,
        });
      });
    });

    return res.status(200).json({
      success: true,

      period: {
        type: period,
        startDate,
        endDate,
      },

      filters: {
        productId:
          productId || null,
      },

      count: data.length,

      data,
    });
  } catch (error) {
    console.error(
      "Get demand history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch demand history",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET DEMAND FEATURES
|-------------------------------------------------------------------------- 
*/
const getDemandFeatures = async (req, res) => {
  try {
    const {
      period = "90d",
      productId,
    } = req.query;

    const { startDate, endDate } =
      getPeriodDates(period);

    // Validate product ID
    if (
      productId &&
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    /*
     * We need additional history before the
     * requested period because lag/rolling
     * features require previous observations.
     *
     * Example:
     * rolling_30 for the first requested day
     * requires approximately 30 previous days.
     */
    const featureStartDate = new Date(
      startDate
    );

    featureStartDate.setDate(
      featureStartDate.getDate() - 30
    );

    const matchStage = {
      status: "Completed",
      createdAt: {
        $gte: featureStartDate,
        $lte: endDate,
      },
    };

    const pipeline = [
      {
        $match: matchStage,
      },

      {
        $unwind: "$items",
      },
    ];

    if (productId) {
      pipeline.push({
        $match: {
          "items.inventory":
            new mongoose.Types.ObjectId(
              productId
            ),
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            productId:
              "$items.inventory",

            sku: "$items.sku",

            productName:
              "$items.productName",

            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },

          unitsSold: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: "$items.totalPrice",
          },
        },
      },

      {
        $sort: {
          "_id.productId": 1,
          "_id.date": 1,
        },
      }
    );

    const rawData = await Sale.aggregate(
      pipeline
    );

    /*
     * Group raw sales by product.
     */
    const productMap = new Map();

    rawData.forEach((item) => {
      const key =
        item._id.productId?.toString();

      if (!key) return;

      if (!productMap.has(key)) {
        productMap.set(key, {
          productId:
            item._id.productId,
          sku: item._id.sku,
          productName:
            item._id.productName,
          records: [],
        });
      }

      productMap.get(key).records.push({
        date: item._id.date,
        unitsSold:
          item.unitsSold || 0,
        revenue:
          item.revenue || 0,
      });
    });

    /*
     * If a specific product has no sales,
     * still retrieve its inventory information.
     */
    if (
      productId &&
      productMap.size === 0
    ) {
      const inventory =
        await Inventory.findById(
          productId
        ).lean();

      if (inventory) {
        productMap.set(productId, {
          productId: inventory._id,
          sku: inventory.sku,
          productName:
            inventory.productName,
          records: [],
        });
      }
    }

    /*
     * Generate calendar dates.
     */
    const dates = [];

    const current = new Date(
      featureStartDate.getFullYear(),
      featureStartDate.getMonth(),
      featureStartDate.getDate()
    );

    const last = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    while (current <= last) {
      const year =
        current.getFullYear();

      const month = String(
        current.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        current.getDate()
      ).padStart(2, "0");

      dates.push(
        `${year}-${month}-${day}`
      );

      current.setDate(
        current.getDate() + 1
      );
    }

    const dataset = [];

    /*
     * Create features for each product.
     */
    for (const product of productMap.values()) {
      const salesByDate = new Map(
        product.records.map((record) => [
          record.date,
          record,
        ])
      );

      const history = dates.map((date) => {
        const record =
          salesByDate.get(date);

        return {
          date,
          unitsSold:
            record?.unitsSold || 0,
          revenue:
            record?.revenue || 0,
        };
      });

      for (
        let i = 0;
        i < history.length;
        i++
      ) {
        const currentRecord =
          history[i];

        /*
         * Only include dates belonging to
         * the requested period.
         */
        const currentDate = new Date(
          `${currentRecord.date}T00:00:00`
        );

        if (currentDate < startDate) {
          continue;
        }

        /*
         * Previous-value helper.
         */
        const getLag = (days) => {
          const index = i - days;

          if (index < 0) {
            return 0;
          }

          return (
            history[index]
              ?.unitsSold || 0
          );
        };

        /*
         * Rolling average using previous
         * observations only.
         */
        const getRollingAverage = (
          window
        ) => {
          const values = [];

          for (
            let j = i - window;
            j < i;
            j++
          ) {
            if (j >= 0) {
              values.push(
                history[j]
                  ?.unitsSold || 0
              );
            }
          }

          if (values.length === 0) {
            return 0;
          }

          return (
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length
          );
        };

        /*
         * Calendar features.
         */
        const dateObject = new Date(
          `${currentRecord.date}T00:00:00`
        );

        const dayOfWeek =
          dateObject.getDay();

        const dayOfMonth =
          dateObject.getDate();

        const month =
          dateObject.getMonth() + 1;

        /*
         * ISO week number.
         */
        const tempDate = new Date(
          dateObject
        );

        tempDate.setHours(0, 0, 0, 0);

        tempDate.setDate(
          tempDate.getDate() + 4 -
            (tempDate.getDay() || 7)
        );

        const yearStart =
          new Date(
            tempDate.getFullYear(),
            0,
            1
          );

        const weekOfYear = Math.ceil(
          (((tempDate -
            yearStart) /
            86400000) +
            1) /
            7
        );

        const zeroDemand =
          currentRecord.unitsSold === 0
            ? 1
            : 0;

        dataset.push({
          productId:
            product.productId?.toString() ||
            null,

          sku: product.sku,

          productName:
            product.productName,

          date: currentRecord.date,

          /*
           * Target
           */
          unitsSold:
            currentRecord.unitsSold,

          revenue:
            currentRecord.revenue,

          /*
           * Lag features
           */
          lag_1: getLag(1),
          lag_2: getLag(2),
          lag_3: getLag(3),
          lag_7: getLag(7),
          lag_14: getLag(14),

          /*
           * Rolling demand
           */
          rolling_7:
            Number(
              getRollingAverage(7).toFixed(
                2
              )
            ),

          rolling_14:
            Number(
              getRollingAverage(14).toFixed(
                2
              )
            ),

          rolling_30:
            Number(
              getRollingAverage(30).toFixed(
                2
              )
            ),

          /*
           * Calendar features
           */
          day_of_week: dayOfWeek,

          day_of_month: dayOfMonth,

          week_of_year: weekOfYear,

          month,

          is_weekend:
            dayOfWeek === 0 ||
            dayOfWeek === 6
              ? 1
              : 0,

          /*
           * Demand indicator
           */
          zero_demand: zeroDemand,
        });
      }
    }

    return res.status(200).json({
      success: true,

      period: {
        type: period,
        startDate,
        endDate,
      },

      filters: {
        productId:
          productId || null,
      },

      count: dataset.length,

      features: [
        "lag_1",
        "lag_2",
        "lag_3",
        "lag_7",
        "lag_14",
        "rolling_7",
        "rolling_14",
        "rolling_30",
        "day_of_week",
        "day_of_month",
        "week_of_year",
        "month",
        "is_weekend",
        "zero_demand",
      ],

      data: dataset,
    });
  } catch (error) {
    console.error(
      "Get demand features error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate demand features",
      error: error.message,
    });
  }
};


/* GET DEMAND FORCAST
|--------------------------------------------------------------------------
| GET /api/analytics/demand-forecast
|--------------------------------------------------------------------------
*/

const getDemandForecast = async (req, res) => {
  try {
    const {
      productId,
      historyPeriod = "30d",
      forecastDays = 7,
    } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const parsedForecastDays = Number(
      forecastDays
    );

    if (
      !Number.isInteger(
        parsedForecastDays
      ) ||
      parsedForecastDays < 1 ||
      parsedForecastDays > 30
    ) {
      return res.status(400).json({
        success: false,
        message:
          "forecastDays must be an integer between 1 and 30",
      });
    }

    /*
     * Fetch demand history.
     */
    const {
      startDate,
      endDate,
    } = getPeriodDates(historyPeriod);

    const rawData = await Sale.aggregate([
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
        $match: {
          "items.inventory":
            new mongoose.Types.ObjectId(
              productId
            ),
        },
      },

      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },

          unitsSold: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: "$items.totalPrice",
          },
        },
      },

      {
        $sort: {
          "_id.date": 1,
        },
      },
    ]);

    /*
     * Fetch product information.
     */
    const inventory =
      await Inventory.findById(
        productId
      ).lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
     * Convert sales into a map.
     */
    const salesMap = new Map();

    rawData.forEach((item) => {
      salesMap.set(
        item._id.date,
        item.unitsSold || 0
      );
    });

    /*
     * Generate complete daily history.
     */
    const history = [];

    const current = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    const last = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    while (current <= last) {
      const year =
        current.getFullYear();

      const month = String(
        current.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        current.getDate()
      ).padStart(2, "0");

      const date =
        `${year}-${month}-${day}`;

      history.push({
        date,
        unitsSold:
          salesMap.get(date) || 0,
      });

      current.setDate(
        current.getDate() + 1
      );
    }

    /*
     * Use the last 7 days as the baseline.
     */
    const last7Days =
      history.slice(-7);

    const totalDemand =
      last7Days.reduce(
        (sum, item) =>
          sum + item.unitsSold,
        0
      );

    const averageDailyDemand =
      last7Days.length > 0
        ? totalDemand /
          last7Days.length
        : 0;

    /*
     * Simple baseline forecast.
     *
     * Round to two decimals but don't force
     * the prediction to an integer because
     * the average represents expected demand.
     */
    const forecast = [];

    const forecastStart = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    forecastStart.setDate(
      forecastStart.getDate() + 1
    );

    for (
      let i = 0;
      i < parsedForecastDays;
      i++
    ) {
      const forecastDate =
        new Date(forecastStart);

      forecastDate.setDate(
        forecastDate.getDate() + i
      );

      const year =
        forecastDate.getFullYear();

      const month = String(
        forecastDate.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        forecastDate.getDate()
      ).padStart(2, "0");

      forecast.push({
        date:
          `${year}-${month}-${day}`,

        predictedDemand:
          Number(
            averageDailyDemand.toFixed(2)
          ),
      });
    }

    /*
     * Total forecasted demand.
     */
    const totalForecast =
      forecast.reduce(
        (sum, item) =>
          sum +
          item.predictedDemand,
        0
      );

    /*
     * Basic demand classification.
     *
     * This is NOT ML.
     * It is only a baseline indicator.
     */
    let demandLevel = "Low";

    if (averageDailyDemand >= 10) {
      demandLevel = "High";
    } else if (
      averageDailyDemand >= 3
    ) {
      demandLevel = "Medium";
    }

    return res.status(200).json({
      success: true,

      product: {
        productId:
          inventory._id.toString(),

        productName:
          inventory.productName,

        sku: inventory.sku,

        currentStock:
          inventory.currentStock,

        minStock:
          inventory.minStock,

        maxStock:
          inventory.maxStock,

        purchasePrice:
          inventory.purchasePrice,

        sellingPrice:
          inventory.sellingPrice,
      },

      history: {
        period: historyPeriod,

        startDate,

        endDate,

        days:
          history.length,

        totalUnitsSold:
          history.reduce(
            (sum, item) =>
              sum + item.unitsSold,
            0
          ),
      },

      baseline: {
        method:
          "7-day-moving-average",

        averageDailyDemand:
          Number(
            averageDailyDemand.toFixed(2)
          ),

        demandLevel,

        forecastDays:
          parsedForecastDays,

        totalForecast:
          Number(
            totalForecast.toFixed(2)
          ),
      },

      forecast,
    });
  } catch (error) {
    console.error(
      "Get demand forecast error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate demand forecast",
      error: error.message,
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


// --------------------------------------------------
// STOCKOUT RISK
// --------------------------------------------------
const getStockoutRisk = async (req, res) => {
  try {
    const { productId, forecastDays = 30 } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const days = Math.min(
      Math.max(parseInt(forecastDays, 10) || 30, 7),
      90
    );

    const inventory = await Inventory.findById(productId).lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // --------------------------------------------------
    // Get last 30 days of completed sales
    // --------------------------------------------------

    const endDate = new Date();
    const startDate = new Date(endDate);

    startDate.setDate(startDate.getDate() - 30);

    const salesData = await Sale.aggregate([
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
        $match: {
          "items.inventory": new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: null,
          unitsSold: {
            $sum: "$items.quantity",
          },
        },
      },
    ]);

    const unitsSold = salesData[0]?.unitsSold || 0;

    // --------------------------------------------------
    // Average daily demand
    // --------------------------------------------------

    const averageDailyDemand = unitsSold / 30;

    // --------------------------------------------------
    // Available stock
    // --------------------------------------------------

    const currentStock = inventory.currentStock || 0;
    const reservedStock = inventory.reservedStock || 0;

    const availableStock = Math.max(
      currentStock - reservedStock,
      0
    );

    // --------------------------------------------------
    // Days until stockout
    // --------------------------------------------------

    let daysUntilStockout = null;

    if (averageDailyDemand > 0) {
      daysUntilStockout =
        availableStock / averageDailyDemand;
    }

    // --------------------------------------------------
    // Risk classification
    // --------------------------------------------------

    let riskLevel = "Safe";

    if (availableStock <= 0) {
      riskLevel = "Critical";
    } else if (
      daysUntilStockout !== null &&
      daysUntilStockout <= 7
    ) {
      riskLevel = "Critical";
    } else if (
      daysUntilStockout !== null &&
      daysUntilStockout <= 14
    ) {
      riskLevel = "Warning";
    }

    // Current inventory status can increase risk
    if (inventory.currentStock <= 0) {
      riskLevel = "Critical";
    } else if (
      inventory.currentStock <= inventory.minStock &&
      riskLevel === "Safe"
    ) {
      riskLevel = "Warning";
    }

    // --------------------------------------------------
    // Projected stock
    // --------------------------------------------------

    const projectedStock = Math.max(
      availableStock -
        averageDailyDemand * days,
      0
    );

    res.json({
      success: true,

      data: {
        product: {
          productId: inventory._id,
          productName: inventory.productName,
          sku: inventory.sku,
          category: inventory.category,
          unit: inventory.unit,
        },

        stock: {
          currentStock,
          reservedStock,
          availableStock,
          minStock: inventory.minStock,
          maxStock: inventory.maxStock,
        },

        demand: {
          periodDays: 30,
          unitsSold,
          averageDailyDemand,
        },

        risk: {
          level: riskLevel,
          daysUntilStockout:
            daysUntilStockout === null
              ? null
              : Number(daysUntilStockout.toFixed(2)),
          projectedStock: Number(
            projectedStock.toFixed(2)
          ),
          projectionDays: days,
        },
      },
    });
  } catch (error) {
    console.error("Stockout risk error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate stockout risk",
      error: error.message,
    });
  }
};

module.exports = {
  // keep your existing exports here
  getStockoutRisk,
};


// --------------------------------------------------
// Smart Alerts
// --------------------------------------------------

const getSmartAlerts = async (req, res) => {
  try {
    const alerts = [];

    const inventories = await Inventory.find({
      status: "Active",
    }).lean();

    if (!inventories.length) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const productIds = inventories.map((item) => item._id);

    // --------------------------------------------------
    // Last 30 days sales
    // --------------------------------------------------

    const endDate = new Date();
    const startDate = new Date(endDate);

    startDate.setDate(startDate.getDate() - 30);

    const salesData = await Sale.aggregate([
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
        $match: {
          "items.inventory": {
            $in: productIds,
          },
        },
      },
      {
        $group: {
          _id: "$items.inventory",
          unitsSold: {
            $sum: "$items.quantity",
          },
        },
      },
    ]);

    const salesMap = new Map(
      salesData.map((item) => [
        item._id.toString(),
        item.unitsSold,
      ])
    );

    // --------------------------------------------------
    // Generate alerts
    // --------------------------------------------------

    inventories.forEach((inventory) => {
      const productId = inventory._id.toString();

      const unitsSold =
        salesMap.get(productId) || 0;

      const averageDailyDemand =
        unitsSold / 30;

      const currentStock =
        inventory.currentStock || 0;

      const reservedStock =
        inventory.reservedStock || 0;

      const availableStock = Math.max(
        currentStock - reservedStock,
        0
      );

      // ----------------------------------------------
      // 1. OUT OF STOCK
      // ----------------------------------------------

      if (currentStock <= 0) {
        alerts.push({
          id: `out-${productId}`,
          type: "OUT_OF_STOCK",
          severity: "critical",
          title: "Product out of stock",
          message: `${inventory.productName} has no available stock.`,
          productId: inventory._id,
          productName: inventory.productName,
          sku: inventory.sku,
          currentStock,
          recommendedAction: "Reorder immediately",
        });

        return;
      }

      // ----------------------------------------------
      // 2. LOW STOCK
      // ----------------------------------------------

      if (currentStock <= inventory.minStock) {
        alerts.push({
          id: `low-${productId}`,
          type: "LOW_STOCK",
          severity: "warning",
          title: "Low stock",
          message: `${inventory.productName} is below its minimum stock level.`,
          productId: inventory._id,
          productName: inventory.productName,
          sku: inventory.sku,
          currentStock,
          minStock: inventory.minStock,
          recommendedAction: "Review reorder requirement",
        });
      }

      // ----------------------------------------------
      // 3. OVERSTOCK
      // ----------------------------------------------

      if (
        inventory.maxStock &&
        currentStock >= inventory.maxStock
      ) {
        alerts.push({
          id: `over-${productId}`,
          type: "OVERSTOCK",
          severity: "info",
          title: "Overstock detected",
          message: `${inventory.productName} is above the maximum stock level.`,
          productId: inventory._id,
          productName: inventory.productName,
          sku: inventory.sku,
          currentStock,
          maxStock: inventory.maxStock,
          recommendedAction: "Review inventory movement",
        });
      }

      // ----------------------------------------------
      // 4. HIGH DEMAND
      // ----------------------------------------------

      if (
        averageDailyDemand >= 1 &&
        currentStock > 0
      ) {
        const daysRemaining =
          availableStock / averageDailyDemand;

        if (daysRemaining <= 14) {
          alerts.push({
            id: `demand-${productId}`,
            type: "STOCKOUT_RISK",
            severity:
              daysRemaining <= 7
                ? "critical"
                : "warning",
            title: "Stockout risk",
            message: `${inventory.productName} may run out in approximately ${Math.round(
              daysRemaining
            )} days based on recent demand.`,
            productId: inventory._id,
            productName: inventory.productName,
            sku: inventory.sku,
            currentStock,
            availableStock,
            averageDailyDemand,
            daysRemaining: Number(
              daysRemaining.toFixed(2)
            ),
            recommendedAction:
              "Create a purchase order",
          });
        }
      }

      // ----------------------------------------------
      // 5. HIGH DEMAND TREND
      // ----------------------------------------------

      if (averageDailyDemand >= 2) {
        alerts.push({
          id: `high-demand-${productId}`,
          type: "HIGH_DEMAND",
          severity: "info",
          title: "High demand product",
          message: `${inventory.productName} is selling at an average of ${averageDailyDemand.toFixed(
            1
          )} units per day.`,
          productId: inventory._id,
          productName: inventory.productName,
          sku: inventory.sku,
          averageDailyDemand: Number(
            averageDailyDemand.toFixed(2)
          ),
          unitsSold,
          recommendedAction:
            "Monitor stock and forecast demand",
        });
      }
    });

    // --------------------------------------------------
    // Priority ordering
    // --------------------------------------------------

    const severityOrder = {
      critical: 1,
      warning: 2,
      info: 3,
    };

    alerts.sort(
      (a, b) =>
        severityOrder[a.severity] -
        severityOrder[b.severity]
    );

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Smart alerts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate smart alerts",
      error: error.message,
    });
  }
};


module.exports = {
  getAnalyticsOverview,
  getSalesTrend,
  getProductPerformance,
  getCategoryPerformance,
  getInventoryAnalytics,
  getDemandHistory,
  getDemandFeatures,
  getDemandForecast,
  getStockoutRisk,
  getSmartAlerts,
};