import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Prediction attributes interface
export interface PredictionAttributes {
  id: string;
  productId: string;
  vendorId: string;
  forecastDate: string;
  predictedQuantity: number;
  confidenceLevel: number;
  modelUsed: string;
  recommendations?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface PredictionCreationAttributes extends Optional<PredictionAttributes, "id" | "createdAt" | "updatedAt"> {}

// Prediction model class
class Prediction extends Model<PredictionAttributes, PredictionCreationAttributes> implements PredictionAttributes {
  public id!: string;
  public productId!: string;
  public vendorId!: string;
  public forecastDate!: string;
  public predictedQuantity!: number;
  public confidenceLevel!: number;
  public modelUsed!: string;
  public recommendations?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): Partial<PredictionAttributes> {
    return {
      id: this.id,
      productId: this.productId,
      vendorId: this.vendorId,
      forecastDate: this.forecastDate,
      predictedQuantity: this.predictedQuantity,
      confidenceLevel: this.confidenceLevel,
      modelUsed: this.modelUsed,
      recommendations: this.recommendations,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Initialize Prediction model
Prediction.init(
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
        model: "products",
        key: "id",
      },
      field: "product_id",
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      field: "vendor_id",
    },
    forecastDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "forecast_date",
    },
    predictedQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: "predicted_quantity",
    },
    confidenceLevel: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      field: "confidence_level",
    },
    modelUsed: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "LinearRegression",
      field: "model_used",
    },
    recommendations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "predictions",
    timestamps: true,
    underscored: true,
  }
);

// Set up associations after model initialization to avoid circular dependencies
// This will be called after all models are loaded
export const setupPredictionAssociations = () => {
  const Product = require("./Product").default;
  const User = require("./User").default;
  
  Prediction.belongsTo(Product, { as: "product", foreignKey: "productId" });
  Prediction.belongsTo(User, { as: "vendor", foreignKey: "vendorId" });
};

export default Prediction;
