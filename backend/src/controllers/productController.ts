import { Request, Response } from 'express';
import Product from '../models/Product';

/**
 * Create new product
 * POST /api/v1/products
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, category, description, costPrice, sellingPrice, quantity, unit, expiryDate, sku } = req.body;

    // Validate required fields
    if (!name || !category || costPrice === undefined || sellingPrice === undefined || quantity === undefined || !unit) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Missing required fields: name, category, costPrice, sellingPrice, quantity, unit',
      });
      return;
    }

    // Validate prices
    if (costPrice < 0 || sellingPrice < 0) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Prices cannot be negative',
      });
      return;
    }

    if (sellingPrice < costPrice) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Selling price must be greater than cost price',
      });
      return;
    }

    // Create product
    const product = await Product.create({
      vendorId: userId,
      name,
      category,
      description,
      costPrice,
      sellingPrice,
      quantity,
      unit,
      expiryDate,
      sku,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to create product',
    });
  }
};

/**
 * Get all products for vendor
 * GET /api/v1/products
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const where: any = { vendorId: userId };

    if (category) {
      where.category = category;
    }

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      order: [[String(sortBy), String(sortOrder)]],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to fetch products',
    });
  }
};

/**
 * Get product by ID
 * GET /api/v1/products/:id
 */
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, vendorId: userId },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to fetch product',
    });
  }
};

/**
 * Update product
 * PUT /api/v1/products/:id
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, category, description, costPrice, sellingPrice, quantity, unit, expiryDate, sku } = req.body;

    const product = await Product.findOne({
      where: { id, vendorId: userId },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Product not found',
      });
      return;
    }

    // Validate prices if provided
    if (costPrice !== undefined && sellingPrice !== undefined && sellingPrice < costPrice) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Selling price must be greater than cost price',
      });
      return;
    }

    // Update product
    await product.update({
      name: name || product.name,
      category: category || product.category,
      description: description !== undefined ? description : product.description,
      costPrice: costPrice || product.costPrice,
      sellingPrice: sellingPrice || product.sellingPrice,
      quantity: quantity !== undefined ? quantity : product.quantity,
      unit: unit || product.unit,
      expiryDate: expiryDate || product.expiryDate,
      sku: sku || product.sku,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to update product',
    });
  }
};

/**
 * Delete product
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, vendorId: userId },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Product not found',
      });
      return;
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to delete product',
    });
  }
};

/**
 * Get low stock products
 * GET /api/v1/products/low-stock
 */
export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { threshold = 10 } = req.query;

    const { Op } = require('sequelize');
    const products = await Product.findAll({
      where: {
        vendorId: userId,
        quantity: { [Op.lte]: parseFloat(String(threshold)) },
      },
      order: [['quantity', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to fetch low stock products',
    });
  }
};
