import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import WasteLog from '../models/WasteLog';
import Product from '../models/Product';
import { Op } from 'sequelize';

/**
 * Log waste
 * POST /api/v1/waste
 */
export const logWaste = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity, reason, wasteDate, notes } = req.body;
    const vendorId = req.user?.userId;

    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!productId || !quantity || !reason || !wasteDate) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Product ID, quantity, reason, and waste date are required',
      });
      return;
    }

    // Verify product belongs to vendor
    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (product.vendorId !== vendorId) {
      res.status(403).json({ error: 'Forbidden: Product does not belong to you' });
      return;
    }

    // Calculate cost impact
    const costImpact = quantity * (product.costPrice || 0);

    // Create waste log
    const wasteLog = await WasteLog.create({
      productId,
      vendorId,
      quantity,
      reason,
      wasteDate,
      notes,
      costImpact,
    });

    res.status(201).json({
      success: true,
      data: wasteLog,
    });
  } catch (error) {
    console.error('[Waste] Log waste error:', error);
    next(error);
  }
};

/**
 * Get waste logs
 * GET /api/v1/waste
 */
export const getWasteLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendorId = req.user?.userId;
    const { startDate, endDate, productId, reason, limit = 50, offset = 0 } = req.query;

    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const whereClause: any = { vendorId };

    // Date range filter
    if (startDate || endDate) {
      whereClause.wasteDate = {};
      if (startDate) whereClause.wasteDate[Op.gte] = startDate;
      if (endDate) whereClause.wasteDate[Op.lte] = endDate;
    }

    // Product filter
    if (productId) {
      whereClause.productId = productId;
    }

    // Reason filter
    if (reason) {
      whereClause.reason = reason;
    }

    const wasteLogs = await WasteLog.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'unit'],
        },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [['wasteDate', 'DESC']],
    });

    const total = await WasteLog.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        wasteLogs,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    console.error('[Waste] Get waste logs error:', error);
    next(error);
  }
};

/**
 * Get waste statistics
 * GET /api/v1/waste/stats
 */
export const getWasteStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendorId = req.user?.userId;
    const { startDate, endDate } = req.query;

    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const whereClause: any = { vendorId };

    // Date range filter
    if (startDate || endDate) {
      whereClause.wasteDate = {};
      if (startDate) whereClause.wasteDate[Op.gte] = startDate;
      if (endDate) whereClause.wasteDate[Op.lte] = endDate;
    }

    // Get all waste logs for stats
    const wasteLogs = await WasteLog.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'category'],
        },
      ],
    });

    // Calculate statistics
    const totalWaste = wasteLogs.length;
    const totalCostImpact = wasteLogs.reduce((sum, log) => sum + log.costImpact, 0);
    const totalQuantity = wasteLogs.reduce((sum, log) => sum + log.quantity, 0);

    // Waste by reason
    const wasteByReason = wasteLogs.reduce((acc: any, log) => {
      acc[log.reason] = (acc[log.reason] || 0) + 1;
      return acc;
    }, {});

    // Waste by category
    const wasteByCategory = wasteLogs.reduce((acc: any, log) => {
      const category = log.product?.category || 'Unknown';
      acc[category] = (acc[category] || 0) + log.quantity;
      return acc;
    }, {});

    // Top wasted products
    const productWaste = wasteLogs.reduce((acc: any, log) => {
      const productId = log.productId;
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName: log.product?.name || 'Unknown',
          quantity: 0,
          costImpact: 0,
          count: 0,
        };
      }
      acc[productId].quantity += log.quantity;
      acc[productId].costImpact += log.costImpact;
      acc[productId].count += 1;
      return acc;
    }, {});

    const topWastedProducts = Object.values(productWaste)
      .sort((a: any, b: any) => b.costImpact - a.costImpact)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          totalWaste,
          totalCostImpact,
          totalQuantity,
        },
        wasteByReason,
        wasteByCategory,
        topWastedProducts,
      },
    });
  } catch (error) {
    console.error('[Waste] Get waste stats error:', error);
    next(error);
  }
};

/**
 * Get waste by product
 * GET /api/v1/waste/product/:productId
 */
export const getWasteByProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const vendorId = req.user?.userId;

    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify product belongs to vendor
    const product = await Product.findByPk(productId);
    if (!product || product.vendorId !== vendorId) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const wasteLogs = await WasteLog.findAll({
      where: { productId, vendorId },
      order: [['wasteDate', 'DESC']],
    });

    const totalWaste = wasteLogs.reduce((sum, log) => sum + log.quantity, 0);
    const totalCostImpact = wasteLogs.reduce((sum, log) => sum + log.costImpact, 0);

    res.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
        },
        wasteLogs,
        summary: {
          totalWaste,
          totalCostImpact,
          count: wasteLogs.length,
        },
      },
    });
  } catch (error) {
    console.error('[Waste] Get waste by product error:', error);
    next(error);
  }
};

/**
 * Delete waste log
 * DELETE /api/v1/waste/:id
 */
export const deleteWasteLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.userId;

    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const wasteLog = await WasteLog.findByPk(id);
    if (!wasteLog) {
      res.status(404).json({ error: 'Waste log not found' });
      return;
    }

    if (wasteLog.vendorId !== vendorId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await wasteLog.destroy();

    res.json({
      success: true,
      message: 'Waste log deleted successfully',
    });
  } catch (error) {
    console.error('[Waste] Delete waste log error:', error);
    next(error);
  }
};
