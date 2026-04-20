const { Invitation, Project, ProjectMember, User } = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const { sendInvitationEmail, sendInvitationRevokedEmail } = require("../utils/email");
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
      include: [
        { model: Project, as: "project", attributes: ["id", "name", "description"] },
        { model: User, as: "inviter", attributes: ["name", "avatar"] },
        { model: User, as: "invitedUser", attributes: ["name", "email", "avatar"] },
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
 * Get invitations for current user
 */
exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      where: {
        [Op.or]: [
          { email: req.user.email },
          { userId: req.user.id }
        ],
        status: "pending",
      },
      include: [
        { model: Project, as: "project", attributes: ["id", "name", "description"] },
        { model: User, as: "inviter", attributes: ["name", "avatar"] },
        { model: User, as: "invitedUser", attributes: ["name", "email", "avatar"] },
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
    const { email, userId, role = "member" } = req.body;
    const { projectId } = req.params;

    // Validate that either email or userId is provided
    if (!email && !userId) {
      return res.status(400).json({ success: false, message: 'Either email or userId must be provided' });
    }

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

    // Get invited user info
    let invitedUser = null;
    let invitationEmail = email;

    if (userId) {
      // User-based invitation
      invitedUser = await User.findByPk(userId);
      if (!invitedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      invitationEmail = invitedUser.email;

      // Check if user is already a member
      const existingTargetMember = await ProjectMember.findOne({
        where: { projectId, userId: userId },
      });
      if (existingTargetMember) {
        return res.status(400).json({ success: false, message: 'User is already a member of this project' });
      }
    } else {
      // Email-based invitation (legacy)
      invitedUser = await User.findOne({ where: { email } });
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      where: {
        projectId,
        status: 'pending',
        [userId ? 'userId' : 'email']: userId || email,
      },
    });

    if (existingInvitation) {
      return res.status(400).json({ 
        success: false, 
        message: `Invitation already sent to ${userId ? 'this user' : email}` 
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitationData = {
      projectId,
      inviterId: req.user.id,
      role,
      token,
      expiresAt,
    };

    // Add either email or userId
    if (userId) {
      invitationData.userId = userId;
    } else {
      invitationData.email = email;
    }

    const invitation = await Invitation.create(invitationData);

    // Send email if we have an email address
    if (invitationEmail) {
      await sendInvitationEmail(invitationEmail, { 
        projectName: project.name, 
        inviterName: req.user.name,
        projectKey: project.key || project.id?.slice(0, 8) || "PROJECT",
        token 
      });
    }

    // Notify in-app if user exists
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
      message: `Invitation sent to ${userId ? invitedUser.name : invitationEmail}`
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
      where: {
        id: req.params.id,
        [Op.or]: [
          { email: req.user.email },
          { userId: req.user.id }
        ],
        status: "pending",
      },
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
      where: {
        id: req.params.id,
        [Op.or]: [
          { email: req.user.email },
          { userId: req.user.id }
        ],
        status: "pending",
      },
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

    // Get project for authorization check
    const project = await Project.findByPk(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is authorized to revoke (owner or admin)
    const member = await ProjectMember.findOne({
      where: { projectId: req.params.projectId, userId: req.user.id }
    });

    const isOwner = project.ownerId === req.user.id;
    const isAdmin = member && member.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only project owners or admins can revoke invitations",
      });
    }

    invitation.status = "revoked";
    await invitation.save();

    // Send email notification to invited user if they exist
    if (invitation.userId) {
      const invitedUser = await User.findByPk(invitation.userId);
      if (invitedUser) {
        await sendInvitationRevokedEmail(invitedUser.email, {
          projectName: project.name,
          inviterName: req.user.name,
        });
      }
    } else if (invitation.email) {
      // For email-based invitations, we don't have the user info, but we can still send the email
      await sendInvitationRevokedEmail(invitation.email, {
        projectName: project.name,
        inviterName: req.user.name,
      });
    }

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
