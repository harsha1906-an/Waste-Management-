import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Product from '../models/Product';
import sequelize from '../config/database';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Get comprehensive sales analytics
export const getSalesAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no dates provided
    const start = startDate 
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate 
      ? new Date(endDate as string)
      : new Date();

    // Set time to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get all sales for the vendor in date range
    const sales = await Sale.findAll({
      where: {
        vendorId,
        saleDate: {
          [Op.between]: [start, end]
        }
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'category', 'costPrice', 'sellingPrice']
      }],
      order: [['saleDate', 'DESC']]
    });

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter((sale: any) => 
      new Date(sale.saleDate) >= today
    );
    const todaysRevenue = todaySales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    // Calculate total revenue
    const totalRevenue = sales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    // Calculate total profit
    const totalProfit = sales.reduce((sum: number, sale: any) => {
      const costPrice = sale.product?.costPrice || 0;
      const profit = sale.totalAmount - (costPrice * sale.quantity);
      return sum + profit;
    }, 0);

    // Sales by category
    const salesByCategory: { [key: string]: { count: number; revenue: number } } = {};
    sales.forEach((sale: any) => {
      const category = sale.product?.category || 'Uncategorized';
      if (!salesByCategory[category]) {
        salesByCategory[category] = { count: 0, revenue: 0 };
      }
      salesByCategory[category].count += 1;
      salesByCategory[category].revenue += sale.totalAmount || 0;
    });

    // Top selling products
    const productSales: { [key: string]: any } = {};
    sales.forEach((sale: any) => {
      const productId = sale.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          productId,
          productName: sale.product?.name || 'Unknown',
          category: sale.product?.category || 'Uncategorized',
          totalQuantity: 0,
          totalRevenue: 0,
          salesCount: 0
        };
      }
      productSales[productId].totalQuantity += sale.quantity;
      productSales[productId].totalRevenue += sale.totalAmount || 0;
      productSales[productId].salesCount += 1;
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Daily sales trend
    const dailySales: { [key: string]: { revenue: number; count: number } } = {};
    sales.forEach((sale: any) => {
      const date = new Date(sale.saleDate).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, count: 0 };
      }
      dailySales[date].revenue += sale.totalAmount || 0;
      dailySales[date].count += 1;
    });

    const salesTrend = Object.entries(dailySales)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        salesCount: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get total product count
    const totalProducts = await Product.count({
      where: { vendorId }
    });

    // Calculate yesterday's revenue for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaySales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= yesterday && saleDate < today;
    });
    const yesterdaysRevenue = yesterdaySales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    const revenueChange = yesterdaysRevenue > 0
      ? ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100
      : 0;

    // Calculate average order value
    const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    res.json({
      success: true,
      data: {
        summary: {
          todaysRevenue,
          totalRevenue,
          totalProfit,
          totalSales: sales.length,
          totalProducts,
          avgOrderValue,
          revenueChange: Math.round(revenueChange * 10) / 10
        },
        salesByCategory,
        topProducts,
        salesTrend
      }
    });
  } catch (error: any) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics'
    });
  }
};

// Get dashboard stats (quick summary)
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.findAll({
      where: {
        vendorId,
        saleDate: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    const todaysRevenue = todaySales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    // Get yesterday's sales for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdaySales = await Sale.findAll({
      where: {
        vendorId,
        saleDate: {
          [Op.between]: [yesterday, today]
        }
      }
    });

    const yesterdaysRevenue = yesterdaySales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    const revenueChange = yesterdaysRevenue > 0
      ? ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100
      : 0;

    // Get total products
    const totalProducts = await Product.count({
      where: { vendorId }
    });

    // Get total revenue (all time)
    const allSales = await Sale.findAll({
      where: { vendorId },
      attributes: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'total']]
    });

    const totalRevenue = (allSales[0] as any).dataValues.total || 0;

    res.json({
      success: true,
      data: {
        todaysRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        totalProducts,
        totalRevenue
      }
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// Get monthly comparison
export const getMonthlyComparison = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user!.userId;

    // Get current month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month sales
    const currentMonthSales = await Sale.findAll({
      where: {
        vendorId,
        saleDate: {
          [Op.between]: [currentMonthStart, currentMonthEnd]
        }
      }
    });

    const currentMonthRevenue = currentMonthSales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    // Last month sales
    const lastMonthSales = await Sale.findAll({
      where: {
        vendorId,
        saleDate: {
          [Op.between]: [lastMonthStart, lastMonthEnd]
        }
      }
    });

    const lastMonthRevenue = lastMonthSales.reduce((sum: number, sale: any) => 
      sum + (sale.totalAmount || 0), 0
    );

    const monthlyChange = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    res.json({
      success: true,
      data: {
        currentMonth: {
          revenue: currentMonthRevenue,
          salesCount: currentMonthSales.length
        },
        lastMonth: {
          revenue: lastMonthRevenue,
          salesCount: lastMonthSales.length
        },
        change: Math.round(monthlyChange * 10) / 10
      }
    });
  } catch (error: any) {
    console.error('Get monthly comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly comparison'
    });
  }
};
