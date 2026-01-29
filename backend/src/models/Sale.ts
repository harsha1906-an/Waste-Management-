import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Product from './Product';

export interface SaleAttributes {
  id: string;
  vendorId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  soldAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SaleCreationAttributes extends Optional<SaleAttributes, 'id' | 'total' | 'soldAt' | 'createdAt' | 'updatedAt'> {}

class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: string;
  public vendorId!: string;
  public productId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public total!: number;
  public soldAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sale.init(
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
      field: 'product_id',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    soldAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'sold_at',
    },
  },
  {
    sequelize,
    tableName: 'sales',
    timestamps: true,
    underscored: true,
  }
);

Sale.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });
Sale.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Sale, { foreignKey: 'product_id', as: 'sales' });
User.hasMany(Sale, { foreignKey: 'vendor_id', as: 'sales' });

export default Sale;