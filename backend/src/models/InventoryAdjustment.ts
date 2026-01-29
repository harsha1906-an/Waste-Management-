import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Product from './Product';

export interface InventoryAdjustmentAttributes {
  id: string;
  productId: string;
  vendorId: string;
  type: 'add' | 'remove' | 'correction';
  quantity: number;
  reason: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InventoryAdjustmentCreationAttributes extends Optional<InventoryAdjustmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class InventoryAdjustment extends Model<InventoryAdjustmentAttributes, InventoryAdjustmentCreationAttributes> implements InventoryAdjustmentAttributes {
  public id!: string;
  public productId!: string;
  public vendorId!: string;
  public type!: 'add' | 'remove' | 'correction';
  public quantity!: number;
  public reason!: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InventoryAdjustment.init(
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
        model: Product,
        key: 'id',
      },
      field: 'product_id',
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      field: 'vendor_id',
    },
    type: {
      type: DataTypes.ENUM('add', 'remove', 'correction'),
      allowNull: false,
      defaultValue: 'correction',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'inventory_adjustments',
    timestamps: true,
    underscored: true,
  }
);

InventoryAdjustment.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
InventoryAdjustment.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });
Product.hasMany(InventoryAdjustment, { foreignKey: 'product_id', as: 'adjustments' });
User.hasMany(InventoryAdjustment, { foreignKey: 'vendor_id', as: 'adjustments' });

export default InventoryAdjustment;
