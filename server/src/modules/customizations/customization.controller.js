import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { CustomizationService } from './customization.service.js';
import { PRICING_CONFIG } from './pricing.config.js';

export class CustomizationController {
  /**
   * Get active pricing rules and configuration.
   * GET /api/v1/customizations/pricing-rules
   */
  static getPricingRules = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, {
      message: 'Pricing rules retrieved successfully',
      data: PRICING_CONFIG,
    });
  });

  /**
   * Calculate verified customization price quote.
   * POST /api/v1/customizations/calculate-quote
   */
  static calculateQuote = asyncHandler(async (req, res) => {
    const quote = await CustomizationService.calculateQuote(req.body);
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Customization quote calculated successfully',
      data: quote,
    });
  });

  /**
   * Upload customer artwork or reference design file.
   * POST /api/v1/customizations/upload-artwork
   */
  static uploadArtwork = asyncHandler(async (req, res) => {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: 'No artwork or design file uploaded',
      });
    }

    const uploadedArtworks = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/artworks/${file.filename}`,
      uploadedAt: new Date(),
    }));

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Artwork uploaded and validated successfully',
      data: {
        artworks: uploadedArtworks,
      },
    });
  });

  /**
   * Create and persist a full customization specification.
   * POST /api/v1/customizations
   */
  static createCustomization = asyncHandler(async (req, res) => {
    const userId = req.user ? req.user._id : null;
    const customization = await CustomizationService.createCustomization(req.body, userId);

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Customization specification saved successfully. 24-hour express production initialized.',
      data: customization,
    });
  });

  /**
   * Retrieve a saved customization by reference code or ID.
   * GET /api/v1/customizations/:codeOrId
   */
  static getCustomization = asyncHandler(async (req, res) => {
    const customization = await CustomizationService.getByCodeOrId(req.params.codeOrId);
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Customization details retrieved successfully',
      data: customization,
    });
  });

  /**
   * List customizations (admin or user).
   * GET /api/v1/customizations
   */
  static listCustomizations = asyncHandler(async (req, res) => {
    const result = await CustomizationService.listCustomizations(req.query, req.user);
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Customizations retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  });

  /**
   * Update customization status (admin).
   * PATCH /api/v1/customizations/:id/status
   */
  static updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: 'Status is required',
      });
    }

    const updated = await CustomizationService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, {
      statusCode: 200,
      message: `Customization status updated to ${status}`,
      data: updated,
    });
  });
}
