const { Invitation, Project, ProjectMember, User } = require("../models");
const crypto = require("crypto");
const { sendInvitationEmail } = require("../utils/email");
const { sendNotification } = require("../utils/notification");

/**
 * Get invitations for a project
 */
exports.getProjectInvitations = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user is a member of the project
    const member = await ProjectMember.findOne({
      where: { projectId, userId: req.user.id }
    });

    if (!member) {
      return res.status(403).json({ success: false, message: "Not authorized to view invitations for this project" });
    }

    const invitations = await Invitation.findAll({
      where: {
        projectId,
        status: req.query.status || "pending",
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get invitations for current user
 */
exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      where: {
        email: req.user.email,
        status: "pending",
      },
      include: [
        { model: Project, as: "project", attributes: ["id", "name", "description"] },
        { model: User, as: "inviter", attributes: ["name", "avatar"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create and send invitation
 */
exports.createInvitation = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;
    const { projectId } = req.params;

    // Fetch project
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      where: { projectId, userId: req.user.id },
    });
    
    // Authorization check
    if (!existingMember || (existingMember.role !== 'admin' && existingMember.role !== 'owner' && project.ownerId !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Only project admins or owners can invite members' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      email,
      projectId,
      inviterId: req.user.id,
      role,
      token,
      expiresAt,
    });

    // Send email
    await sendInvitationEmail(email, { 
      projectName: project.name, 
      inviterName: req.user.name,
      projectKey: project.key || project.id?.slice(0, 8) || "PROJECT",
      token 
    });

    // Notify in-app if user exists
    const invitedUser = await User.findOne({ where: { email } });
    if (invitedUser) {
        await sendNotification({
            userId: invitedUser.id,
            type: 'project_invite',
            title: 'New Project Invitation',
            message: `${req.user.name} invited you to join the project: ${project.name}`,
            projectId: project.id,
            link: '/invitations'
        });
    }

    res.status(201).json({
      success: true,
      data: invitation,
      message: `Invitation sent to ${email}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Accept invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      where: { id: req.params.id, email: req.user.email, status: "pending" },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or no longer pending",
      });
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = "revoked";
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: "Invitation expired",
      });
    }

    // Add to project members
    await ProjectMember.create({
      projectId: invitation.projectId,
      userId: req.user.id,
      role: invitation.role,
    });

    invitation.status = "accepted";
    await invitation.save();

    // Notify inviter
    const project = await Project.findByPk(invitation.projectId);
    await sendNotification({
        userId: invitation.inviterId,
        type: 'invite_accepted',
        title: 'Invitation Accepted',
        message: `${req.user.name} has joined the project: ${project?.name || 'your project'}`,
        projectId: invitation.projectId,
        link: `/projects/${invitation.projectId}/members`
    });

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Decline invitation
 */
exports.declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      where: { id: req.params.id, email: req.user.email, status: "pending" },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    invitation.status = "declined";
    await invitation.save();

    res.status(200).json({
      success: true,
      message: "Invitation declined",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Revoke invitation
 */
exports.revokeInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      where: { id: req.params.id, projectId: req.params.projectId },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    invitation.status = "revoked";
    await invitation.save();

    res.status(200).json({
      success: true,
      message: "Invitation revoked",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
