import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// User attributes interface
export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  role: 'vendor' | 'customer' | 'admin';
  businessName?: string;
  location?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'emailVerified' | 'createdAt' | 'updatedAt'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: 'vendor' | 'customer' | 'admin';
  public businessName?: string;
  public location?: string;
  public phone?: string;
  public isActive!: boolean;
  public emailVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to get user without sensitive data
  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() };
    delete (values as any).passwordHash;
    return values;
  }
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'vendor',
      validate: {
        isIn: [['vendor', 'customer', 'admin']],
      },
    },
    businessName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'business_name',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verified',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User;
