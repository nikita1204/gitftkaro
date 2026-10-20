import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import * as productService from './product.service.js';
import { AuditLogService } from '../audit/auditLog.service.js';

/**
 * Public: Get paginated, filtered product list
 */
export const listProducts = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const { products, pagination } = await productService.getProducts(req.query, isAdmin);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Products retrieved successfully',
    data: products,
    meta: pagination,
  });
});

/**
 * Public: Get single product details by slug or ID
 */
export const getProductDetails = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const data = await productService.getProductBySlugOrId(req.params.slugOrId, isAdmin);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Product details retrieved successfully',
    data,
  });
});

/**
 * Public: Get featured products for homepage
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts(6);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Featured products retrieved successfully',
    data: products,
  });
});

/**
 * Admin: Create a new product
 */
export const createNewProduct = asyncHandler(async (req, res) => {
  const newProduct = await productService.createProduct(req.body);

  await AuditLogService.logAction({
    action: 'PRODUCT_CREATE',
    admin: req.user,
    targetEntity: 'Product',
    targetId: newProduct._id,
    details: { name: newProduct.name, slug: newProduct.slug, basePrice: newProduct.basePrice },
    req,
  });

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Product created successfully',
    data: newProduct,
  });
});

/**
 * Admin: Update existing product
 */
export const editProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await productService.updateProduct(req.params.id, req.body);

  await AuditLogService.logAction({
    action: 'PRODUCT_UPDATE',
    admin: req.user,
    targetEntity: 'Product',
    targetId: req.params.id,
    details: { name: updatedProduct.name, updates: req.body },
    req,
  });

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
});

/**
 * Admin: Toggle product active state
 */
export const toggleStatus = asyncHandler(async (req, res) => {
  const product = await productService.toggleProductStatus(req.params.id);

  await AuditLogService.logAction({
    action: 'PRODUCT_STATUS_TOGGLE',
    admin: req.user,
    targetEntity: 'Product',
    targetId: product._id,
    details: { name: product.name, isActive: product.isActive },
    req,
  });

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: `Product is now ${product.isActive ? 'active' : 'inactive'}`,
    data: product,
  });
});

/**
 * Admin: Archive product
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.archiveProduct(req.params.id);

  await AuditLogService.logAction({
    action: 'PRODUCT_ARCHIVE',
    admin: req.user,
    targetEntity: 'Product',
    targetId: req.params.id,
    details: { archivedAt: new Date() },
    req,
  });

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Product archived successfully',
  });
});

/**
 * Public: List all product categories
 */
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getAllCategories();

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Categories retrieved successfully',
    data: categories,
  });
});

/**
 * Public: Get single category details
 */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await productService.getCategoryBySlug(req.params.slug);

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Category retrieved successfully',
    data: category,
  });
});

/**
 * Admin: Create a new category
 */
export const createNewCategory = asyncHandler(async (req, res) => {
  const category = await productService.createCategory(req.body);

  await AuditLogService.logAction({
    action: 'CATEGORY_CREATE',
    admin: req.user,
    targetEntity: 'Category',
    targetId: category._id,
    details: { name: category.name, slug: category.slug },
    req,
  });

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Category created successfully',
    data: category,
  });
});
