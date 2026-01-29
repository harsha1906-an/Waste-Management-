import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Product from './Product';

export interface WasteLogAttributes {
  id: string;
  productId: string;
  vendorId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'excess' | 'other';
  wasteDate: Date;
  notes?: string;
  costImpact: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class WasteLog extends Model<WasteLogAttributes> implements WasteLogAttributes {
  public id!: string;
  public productId!: string;
  public vendorId!: string;
  public quantity!: number;
  public reason!: 'expired' | 'damaged' | 'excess' | 'other';
  public wasteDate!: Date;
  public notes?: string;
  public costImpact!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly product?: any;
  public readonly vendor?: any;

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

WasteLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      field: 'product_id',
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'vendor_id',
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    reason: {
      type: DataTypes.ENUM('expired', 'damaged', 'excess', 'other'),
      allowNull: false,
    },
    wasteDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'waste_date',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    costImpact: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'cost_impact',
      validate: {
        min: 0,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'WasteLog',
    tableName: 'waste_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['vendor_id'] },
      { fields: ['waste_date'] },
      { fields: ['reason'] },
    ],
  }
);

// Setup associations
export const setupWasteLogAssociations = () => {
  const Product = require('./Product').default;
  const User = require('./User').default;
  
  WasteLog.belongsTo(Product, {
    as: 'product',
    foreignKey: 'productId',
  });
  
  WasteLog.belongsTo(User, {
    as: 'vendor',
    foreignKey: 'vendorId',
  });
};

export default WasteLog;
