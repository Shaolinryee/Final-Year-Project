const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationDeliveryLog = sequelize.define(
  'NotificationDeliveryLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notificationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Delivery details
    deliveryMethod: {
      type: DataTypes.ENUM('in_app', 'email', 'sms'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'opened', 'clicked'),
      allowNull: false,
      defaultValue: 'pending',
    },
    // Timestamps
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    clickedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Error handling
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Provider details
    provider: {
      type: DataTypes.STRING, // email provider, SMS provider, etc.
      allowNull: true,
    },
    providerMessageId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'notification_delivery_logs',
    timestamps: true,
    indexes: [
      {
        fields: ['notificationId'],
      },
      {
        fields: ['adminId'],
      },
      {
        fields: ['deliveryMethod', 'status'],
      },
      {
        fields: ['sentAt'],
      },
    ],
  }
);

module.exports = NotificationDeliveryLog;
