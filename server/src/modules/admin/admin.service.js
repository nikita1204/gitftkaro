import { Order } from '../orders/order.model.js';
import { Product } from '../products/product.model.js';
import { Category } from '../products/category.model.js';
import { User } from '../auth/user.model.js';
import { DeliveryZone } from '../delivery/deliveryZone.model.js';
import { DeliveryConfig } from '../delivery/deliveryConfig.model.js';
import { AuditLog } from '../audit/auditLog.model.js';

export class AdminService {
  /**
   * Compute comprehensive dashboard metrics directly from MongoDB.
   * Strictly no fabricated mock numbers.
   */
  static async getSummaryMetrics() {
    // 1. Order Aggregations
    const orderStatsPromise = Order.aggregate([
      {
        $facet: {
          // Total confirmed / captured revenue
          revenueStats: [
            {
              $match: {
                $or: [
                  { 'payment.status': 'captured' },
                  { orderStatus: { $in: ['confirmed', 'in_production', 'quality_check', 'dispatched', 'delivered'] } },
                ],
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$pricingSummary.finalTotal' },
                totalGarments: { $sum: '$pricingSummary.totalQuantity' },
                paidOrdersCount: { $sum: 1 },
              },
            },
          ],
          // Counts grouped by order status
          statusBreakdown: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
              },
            },
          ],
          // Express 24h orders count
          expressStats: [
            {
              $match: {
                'deliveryEstimate.is24hEligible': true,
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          // Orders with pending artwork approvals
          pendingArtworkStats: [
            {
              $match: {
                'items.artworks.approvalStatus': 'pending',
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // 2. Parallel queries across collections
    const [
      [orderAgg],
      totalOrders,
      totalCustomers,
      totalAdmins,
      activeProducts,
      totalProducts,
      activeCategories,
      activeZones,
      recentOrders,
      recentAuditLogs,
      deliveryConfig,
    ] = await Promise.all([
      orderStatsPromise,
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments({ isActive: true, isArchived: false }),
      Product.countDocuments({ isArchived: false }),
      Category.countDocuments({ isActive: true }),
      DeliveryZone.countDocuments({ isActive: true }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber contact pricingSummary orderStatus payment deliveryEstimate createdAt')
        .lean(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      DeliveryConfig.findOne({ key: 'global_delivery_config' }).lean(),
    ]);

    const revenueData = orderAgg.revenueStats[0] || { totalRevenue: 0, totalGarments: 0, paidOrdersCount: 0 };
    const expressCount = orderAgg.expressStats[0]?.count || 0;
    const pendingArtworks = orderAgg.pendingArtworkStats[0]?.count || 0;

    // Map status breakdown into an easy-to-read dictionary
    const statusMap = {
      pending_payment: 0,
      payment_failed: 0,
      confirmed: 0,
      in_production: 0,
      quality_check: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    };

    if (orderAgg.statusBreakdown) {
      orderAgg.statusBreakdown.forEach((item) => {
        if (item._id) {
          statusMap[item._id] = item.count;
        }
      });
    }

    return {
      financial: {
        totalRevenue: revenueData.totalRevenue,
        avgOrderValue: revenueData.paidOrdersCount > 0 ? Math.round(revenueData.totalRevenue / revenueData.paidOrdersCount) : 0,
        paidOrdersCount: revenueData.paidOrdersCount,
        currency: 'INR',
      },
      orders: {
        totalOrders,
        statusBreakdown: statusMap,
        express24hCount: expressCount,
        totalGarmentsProduced: revenueData.totalGarments,
        pendingArtworkCount: pendingArtworks,
      },
      catalogue: {
        activeProducts,
        totalProducts,
        activeCategories,
      },
      users: {
        totalCustomers,
        totalAdmins,
      },
      operations: {
        hubName: deliveryConfig?.hubName || 'Raipur Express Printing Facility, Chhattisgarh',
        turnaroundHours: deliveryConfig?.expressPromiseHours || 24,
        maxExpressQuantity: deliveryConfig?.maxExpressQuantity || 100,
        minOrderQuantity: deliveryConfig?.minExpressQuantity || 10,
        isCutOffActive: Boolean(deliveryConfig?.isCutOffActive),
        cutOffTime: deliveryConfig?.cutOffTime || '14:00',
        activeDeliveryZones: activeZones,
      },
      recentOrders,
      recentAuditLogs,
    };
  }
}
