const express = require("express");

const {
  getSales,
  getSaleById,
  getSalesStats,
  getSaleMovements,
  createSale,
  updateSale,
  updateSalePayment,
  cancelSale,
  returnSale,
} = require("../controllers/salesController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Sales Routes
|--------------------------------------------------------------------------
|
| All routes require authentication.
|
| Viewing:
|   Admin / Manager / Staff
|
| Sales operations:
|   Admin / Manager / Staff
|
|--------------------------------------------------------------------------
*/

/*
 * GET /api/sales
 */
router.get(
  "/",
  authMiddleware,
  getSales
);

/*
 * GET /api/sales/stats
 */
router.get(
  "/stats",
  authMiddleware,
  getSalesStats
);

/*
 * POST /api/sales
 *
 * Staff can create sales.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  createSale
);

/*
 * PUT /api/sales/:id
 *
 * Staff can edit unpaid completed sales
 * according to controller validation.
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  updateSale
);

/*
 * PATCH /api/sales/:id/payment
 */
router.patch(
  "/:id/payment",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  updateSalePayment
);

/*
 * PATCH /api/sales/:id/cancel
 */
router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  cancelSale
);

/*
 * PATCH /api/sales/:id/return
 */
router.patch(
  "/:id/return",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  returnSale
);

/*
 * GET /api/sales/:id/movements
 */
router.get(
  "/:id/movements",
  authMiddleware,
  getSaleMovements
);

/*
 * GET /api/sales/:id
 */
router.get(
  "/:id",
  authMiddleware,
  getSaleById
);

module.exports = router;