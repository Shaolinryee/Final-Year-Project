const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/me", notificationController.getMyNotifications);
router.get("/unread/count", notificationController.getUnreadCount);
router.get("/paginated", notificationController.getNotificationsPaginated);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
