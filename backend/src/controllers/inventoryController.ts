import { Request, Response } from 'express';
import sequelize from '../config/database';
import Product from '../models/Product';
import InventoryAdjustment from '../models/InventoryAdjustment';

export const adjustInventory = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const vendorId = req.user?.userId;
    const { productId, type, quantity, reason, notes } = req.body;

    if (!vendorId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      await transaction.rollback();
      return;
    }

    if (!productId || !type || quantity === undefined || !reason) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'productId, type, quantity, and reason are required',
      });
      await transaction.rollback();
      return;
    }

    if (!['add', 'remove', 'correction'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'type must be add, remove, or correction',
      });
      await transaction.rollback();
      return;
    }

    const qtyNum = parseFloat(String(quantity));
    if (isNaN(qtyNum) || qtyNum <= 0) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Quantity must be > 0',
      });
      await transaction.rollback();
      return;
    }

    const product = await Product.findOne({
      where: { id: productId, vendorId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!product) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Product not found' });
      await transaction.rollback();
      return;
    }

    // Calculate new quantity
    const currentQty = parseFloat(String(product.quantity));
    let newQty = currentQty;

    if (type === 'add') {
      newQty = currentQty + qtyNum;
    } else if (type === 'remove') {
      if (qtyNum > currentQty) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Cannot remove more quantity than available',
        });
        await transaction.rollback();
        return;
      }
      newQty = currentQty - qtyNum;
    } else if (type === 'correction') {
      // For correction, quantity is the new absolute amount
      if (qtyNum < 0) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Correction quantity must be >= 0',
        });
        await transaction.rollback();
        return;
      }
      newQty = qtyNum;
    }

    // Update product quantity
    await product.update({ quantity: newQty }, { transaction });

    // Log adjustment
    const adjustment = await InventoryAdjustment.create(
      {
        productId,
        vendorId,
        type,
        quantity: type === 'correction' ? qtyNum : qtyNum, // For correction, store new amount; for add/remove, store delta
        reason,
        notes,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Inventory adjusted',
      data: { adjustment, product },
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error adjusting inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to adjust inventory',
    });
  }
};

export const getAdjustments = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { productId } = req.query;
    const where: any = { vendorId };

    if (productId) {
      where.productId = productId;
    }

    const adjustments = await InventoryAdjustment.findAll({
      where,
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit'] }],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: adjustments.length,
      adjustments,
    });
  } catch (error: any) {
    console.error('Error fetching adjustments:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to fetch adjustments',
    });
  }
};

export const getLowStockSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { threshold = 10 } = req.query;
    const { Op } = require('sequelize');

    const lowStockProducts = await Product.findAll({
      where: {
        vendorId,
        quantity: { [Op.lte]: parseFloat(String(threshold)) },
      },
      attributes: ['id', 'name', 'quantity', 'unit', 'expiryDate'],
      order: [['quantity', 'ASC']],
    });

    const expiringProducts = await Product.findAll({
      where: {
        vendorId,
        expiryDate: { [Op.and]: [{ [Op.not]: null }, { [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }] },
      },
      attributes: ['id', 'name', 'quantity', 'unit', 'expiryDate'],
      order: [['expiryDate', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        expiringCount: expiringProducts.length,
        expiringProducts,
      },
    });
  } catch (error: any) {
    console.error('Error fetching low stock summary:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Failed to fetch summary',
    });
  }
};
