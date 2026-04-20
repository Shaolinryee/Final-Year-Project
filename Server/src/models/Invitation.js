const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Invitation = sequelize.define(
  "Invitation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Made optional for userId-based invitations
      validate: {
        isEmail: true,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // New field for user-based invitations
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    inviterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("owner", "admin", "member", "viewer"),
      defaultValue: "member",
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "declined", "revoked"),
      defaultValue: "pending",
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "invitations",
    timestamps: true,
    // Add validation to ensure either email or userId is provided
    validate: {
      atLeastOneIdentifier() {
        if (!this.email && !this.userId) {
          throw new Error('Either email or userId must be provided');
        }
      }
    }
  }
);

module.exports = Invitation;
