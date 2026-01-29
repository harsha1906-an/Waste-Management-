import { Request, Response } from 'express';
import sequelize from '../config/database';
import Sale from '../models/Sale';
import Product from '../models/Product';

export const createSale = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const vendorId = req.user?.userId;
    const { productId, quantity, unitPrice, soldAt } = req.body;

    if (!vendorId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      await transaction.rollback();
      return;
    }

    if (!productId || quantity === undefined || unitPrice === undefined) {
      res.status(400).json({ success: false, error: 'Validation Error', message: 'productId, quantity, unitPrice are required' });
      await transaction.rollback();
      return;
    }

    const qtyNum = parseFloat(String(quantity));
    const priceNum = parseFloat(String(unitPrice));

    if (isNaN(qtyNum) || qtyNum <= 0 || isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({ success: false, error: 'Validation Error', message: 'Quantity must be > 0 and price must be >= 0' });
      await transaction.rollback();
      return;
    }

    const product = await Product.findOne({ where: { id: productId, vendorId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!product) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Product not found' });
      await transaction.rollback();
      return;
    }

    const currentQty = parseFloat(String(product.quantity));
    if (qtyNum > currentQty) {
      res.status(400).json({ success: false, error: 'Validation Error', message: 'Insufficient stock' });
      await transaction.rollback();
      return;
    }

    const total = parseFloat((qtyNum * priceNum).toFixed(2));

    await product.update({ quantity: currentQty - qtyNum }, { transaction });

    const sale = await Sale.create(
      {
        vendorId,
        productId,
        quantity: qtyNum,
        unitPrice: priceNum,
        total,
        soldAt: soldAt ? new Date(soldAt) : new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({ success: true, message: 'Sale recorded', sale });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error creating sale:', error);
    res.status(500).json({ success: false, error: 'Server Error', message: error.message || 'Failed to record sale' });
  }
};

export const listSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.userId;
    const { startDate, endDate, productId } = req.query;

    if (!vendorId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const where: any = { vendorId };
    const { Op } = require('sequelize');

    if (productId) {
      where.productId = productId;
    }

    if (startDate || endDate) {
      where.soldAt = {};
      if (startDate) where.soldAt[Op.gte] = new Date(String(startDate));
      if (endDate) where.soldAt[Op.lte] = new Date(String(endDate));
    }

    const sales = await Sale.findAll({
      where,
      order: [['sold_at', 'DESC']],
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'category', 'unit'] }],
    });

    res.status(200).json({ success: true, count: sales.length, sales });
  } catch (error: any) {
    console.error('Error listing sales:', error);
    res.status(500).json({ success: false, error: 'Server Error', message: error.message || 'Failed to fetch sales' });
  }
};

export const salesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { startDate, endDate } = req.query;
    const { Op, fn, col } = require('sequelize');

    const where: any = { vendorId };
    if (startDate || endDate) {
      where.soldAt = {};
      if (startDate) where.soldAt[Op.gte] = new Date(String(startDate));
      if (endDate) where.soldAt[Op.lte] = new Date(String(endDate));
    }

    const summary = await Sale.findAll({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total')), 'totalRevenue'],
        [fn('SUM', col('quantity')), 'totalQuantity'],
      ],
    });

    res.status(200).json({ success: true, summary: summary[0] });
  } catch (error: any) {
    console.error('Error building summary:', error);
    res.status(500).json({ success: false, error: 'Server Error', message: error.message || 'Failed to fetch summary' });
  }
};