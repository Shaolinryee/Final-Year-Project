const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");
const auth = require("../middleware/auth");

router.use(auth);

// Global routes
router.get("/me", invitationController.getMyInvitations);
router.post("/:id/accept", invitationController.acceptInvitation);
router.post("/:id/decline", invitationController.declineInvitation);

// Project specific routes
router.get("/project/:projectId", invitationController.getProjectInvitations);
router.post("/project/:projectId", invitationController.createInvitation);
router.post("/project/:projectId/:id/revoke", invitationController.revokeInvitation);

module.exports = router;
