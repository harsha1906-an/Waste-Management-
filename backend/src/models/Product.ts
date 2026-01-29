import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// Product attributes interface
export interface ProductAttributes {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string; // kg, liters, pieces, etc.
  expiryDate?: Date;
  sku?: string;
  image?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

// Product model class
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: string;
  public vendorId!: string;
  public name!: string;
  public category!: string;
  public description?: string;
  public costPrice!: number;
  public sellingPrice!: number;
  public quantity!: number;
  public unit!: string;
  public expiryDate?: Date;
  public sku?: string;
  public image?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Calculate margin
  public getMargin(): number {
    return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  }

  // Check if expiring soon (7 days)
  public isExpiringsoon(): boolean {
    if (!this.expiryDate) return false;
    const days = (this.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days > 0;
  }
}

// Initialize Product model
Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'cost_price',
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'selling_price',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expiry_date',
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
);

// Associations
Product.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });

export default Product;
