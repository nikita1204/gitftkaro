import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { DeliveryService } from './delivery.service.js';
import { AuditLogService } from '../audit/auditLog.service.js';

export class DeliveryController {
  /**
   * Check delivery eligibility and estimated delivery window for a PIN code and quantity.
   * POST /api/v1/delivery/check-eligibility
   */
  static checkEligibility = asyncHandler(async (req, res) => {
    const result = await DeliveryService.checkEligibility(req.body);
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Delivery eligibility calculated successfully',
      data: result,
    });
  });

  /**
   * Retrieve list of all active serviceable Raipur PIN codes and localities.
   * GET /api/v1/delivery/pincodes
   */
  static getPincodes = asyncHandler(async (req, res) => {
    const pincodes = await DeliveryService.getServiceablePincodes();
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Serviceable PIN codes retrieved successfully',
      data: pincodes,
    });
  });

  /**
   * Retrieve global delivery configuration rules.
   * GET /api/v1/delivery/config
   */
  static getConfig = asyncHandler(async (req, res) => {
    const config = await DeliveryService.getDeliveryConfig();
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Delivery configuration retrieved successfully',
      data: config,
    });
  });

  /**
   * Update global delivery configuration rules (Admin).
   * PUT /api/v1/delivery/config
   */
  static updateConfig = asyncHandler(async (req, res) => {
    const updated = await DeliveryService.updateDeliveryConfig(req.body, req.user?._id);

    await AuditLogService.logAction({
      action: 'DELIVERY_CONFIG_UPDATE',
      admin: req.user,
      targetEntity: 'DeliveryConfig',
      targetId: 'global_delivery_config',
      details: req.body,
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Delivery configuration updated successfully',
      data: updated,
    });
  });

  /**
   * List all zones for administration.
   * GET /api/v1/delivery/zones
   */
  static getAllZones = asyncHandler(async (req, res) => {
    const zones = await DeliveryService.getAllZones();
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'All delivery zones retrieved successfully',
      data: zones,
    });
  });

  /**
   * Create a new delivery zone / PIN code (Admin).
   * POST /api/v1/delivery/zones
   */
  static createZone = asyncHandler(async (req, res) => {
    const zone = await DeliveryService.createZone(req.body);

    await AuditLogService.logAction({
      action: 'ZONE_CREATE',
      admin: req.user,
      targetEntity: 'DeliveryZone',
      targetId: zone._id,
      details: { pincode: zone.pincode, areaName: zone.areaName },
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Delivery zone created successfully',
      data: zone,
    });
  });

  /**
   * Update a delivery zone (Admin).
   * PUT /api/v1/delivery/zones/:id
   */
  static updateZone = asyncHandler(async (req, res) => {
    const zone = await DeliveryService.updateZone(req.params.id, req.body);

    await AuditLogService.logAction({
      action: 'ZONE_UPDATE',
      admin: req.user,
      targetEntity: 'DeliveryZone',
      targetId: zone._id,
      details: req.body,
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Delivery zone updated successfully',
      data: zone,
    });
  });

  /**
   * Toggle delivery zone active status (Admin).
   * PATCH /api/v1/delivery/zones/:id/status
   */
  static toggleZone = asyncHandler(async (req, res) => {
    const zone = await DeliveryService.toggleZoneStatus(req.params.id);

    await AuditLogService.logAction({
      action: 'ZONE_STATUS_TOGGLE',
      admin: req.user,
      targetEntity: 'DeliveryZone',
      targetId: zone._id,
      details: { pincode: zone.pincode, isActive: zone.isActive },
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: `Zone ${zone.pincode} status updated to ${zone.isActive ? 'Active' : 'Inactive'}`,
      data: zone,
    });
  });

  /**
   * Delete a delivery zone (Admin).
   * DELETE /api/v1/delivery/zones/:id
   */
  static deleteZone = asyncHandler(async (req, res) => {
    await DeliveryService.deleteZone(req.params.id);

    await AuditLogService.logAction({
      action: 'ZONE_DELETE',
      admin: req.user,
      targetEntity: 'DeliveryZone',
      targetId: req.params.id,
      details: { deletedAt: new Date() },
      req,
    });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Delivery zone deleted successfully',
      data: null,
    });
  });
}
