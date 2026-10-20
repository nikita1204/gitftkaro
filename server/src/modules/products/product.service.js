import mongoose from 'mongoose';
import { Product } from './product.model.js';
import { Category } from './category.model.js';
import { AppError } from '../../utils/appError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

/**
 * Converts a string into a clean URL-friendly slug
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Retrieves paginated, filtered, and sorted products with category metadata
 */
export const getProducts = async (queryParams = {}, isAdmin = false) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    minPrice,
    maxPrice,
    size,
    color,
    isExpressEligible,
    isFeatured,
    sort = 'newest',
    includeInactive = false,
  } = queryParams;

  const filter = {
    isArchived: false,
  };

  // Customers only see active products; Admins can view all if requested
  if (!isAdmin || !includeInactive) {
    filter.isActive = true;
  }

  // 1. Category filter (supports either Category slug or ObjectId)
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const cleanSlug = category.toLowerCase().trim();
      const slugVariants = [
        cleanSlug,
        cleanSlug.replace(/tshirts/g, 't-shirts'),
        cleanSlug.replace(/t-shirts/g, 'tshirts'),
      ];
      const foundCategory = await Category.findOne({
        $or: [
          { slug: { $in: slugVariants } },
          { name: new RegExp(cleanSlug.replace(/-/g, ' '), 'i') },
        ],
      });
      if (foundCategory) {
        filter.category = foundCategory._id;
      } else {
        // Category slug doesn't exist, return empty result gracefully
        return {
          products: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
    }
  }

  // 2. Price Range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
  }

  // 3. Size filter
  if (size) {
    filter.availableSizes = size.toUpperCase();
  }

  // 4. Color filter
  if (color) {
    filter['availableColors.name'] = { $regex: color, $options: 'i' };
  }

  // 5. Express Delivery eligibility filter
  if (isExpressEligible !== undefined) {
    filter.isExpressEligible = isExpressEligible;
  }

  // 6. Featured filter
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured;
  }

  // 7. Search text or regex
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { tags: { $in: [searchRegex] } },
    ];
  }

  // 8. Sorting strategy
  let sortStrategy = { createdAt: -1 };
  if (sort === 'price_asc') {
    sortStrategy = { basePrice: 1 };
  } else if (sort === 'price_desc') {
    sortStrategy = { basePrice: -1 };
  } else if (sort === 'popular') {
    sortStrategy = { isFeatured: -1, createdAt: -1 };
  } else if (sort === 'name_asc') {
    sortStrategy = { name: 1 };
  }

  const skip = (page - 1) * limit;

  // Execute query and count concurrently
  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .populate('category', 'name slug badge turnaroundHours minOrderQuantity')
      .sort(sortStrategy)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Common slug aliases to maintain backwards compatibility with UI placeholders and shortlinks
const SLUG_ALIASES = {
  'classic-crew-neck-tshirt': 'raipur-24h-express-bio-washed-crew-neck-t-shirt',
  'classic-crew-neck-t-shirt': 'raipur-24h-express-bio-washed-crew-neck-t-shirt',
  'crew-neck-tshirt': 'raipur-24h-express-bio-washed-crew-neck-t-shirt',
  'oversized-streetwear-tee': 'premium-heavyweight-oversized-streetwear-t-shirt',
  'performance-active-tee': 'startups-and-promotional-economy-poly-cotton-tee',
  'college-fest-marathon-tee': 'college-fest-and-cultural-summit-express-event-t-shirt',
  'sports-league-jersey-tee': 'raipur-marathon-moisture-wicking-dry-fit-sports-tee',
  'festival-commemorative-tee': 'college-fest-and-cultural-summit-express-event-t-shirt',
  'family-trip-group-tee': 'squad-and-reunion-matching-group-t-shirt',
  'custom-nickname-batch-tee': 'squad-and-reunion-matching-group-t-shirt',
  'executive-matty-collar-polo': 'corporate-embroidered-cotton-polo-t-shirt',
  'tech-startup-crew-tee': 'corporate-embroidered-cotton-polo-t-shirt',
};

/**
 * Retrieves a single product by either slug or ObjectId with intelligent alias and fallback matching
 */
export const getProductBySlugOrId = async (slugOrId, isAdmin = false) => {
  const query = {};
  const normalizedInput = slugOrId ? slugOrId.toLowerCase().trim() : '';

  if (mongoose.Types.ObjectId.isValid(slugOrId)) {
    query._id = slugOrId;
  } else {
    const resolvedSlug = SLUG_ALIASES[normalizedInput] || normalizedInput;
    query.slug = resolvedSlug;
  }

  if (!isAdmin) {
    query.isActive = true;
    query.isArchived = false;
  }

  let product = await Product.findOne(query)
    .populate('category', 'name slug badge turnaroundHours minOrderQuantity')
    .lean();

  // If not found by exact slug or alias, search with regex for keyword match
  if (!product && !mongoose.Types.ObjectId.isValid(slugOrId)) {
    const keywordRegex = new RegExp(normalizedInput.replace(/[-_]/g, '.*'), 'i');
    const fallbackFilter = {
      $or: [{ slug: keywordRegex }, { name: keywordRegex }],
    };
    if (!isAdmin) {
      fallbackFilter.isActive = true;
      fallbackFilter.isArchived = false;
    }
    product = await Product.findOne(fallbackFilter)
      .populate('category', 'name slug badge turnaroundHours minOrderQuantity')
      .lean();
  }

  // Graceful fallback to flagship product if not found
  if (!product && !isAdmin) {
    product = await Product.findOne({ isActive: true, isArchived: false })
      .populate('category', 'name slug badge turnaroundHours minOrderQuantity')
      .lean();
  }

  if (!product) {
    throw new AppError('Product not found or unavailable', HTTP_STATUS.NOT_FOUND);
  }

  // Fetch up to 4 related products in the same category
  const relatedProducts = await Product.find({
    category: product.category?._id || product.category,
    _id: { $ne: product._id },
    isActive: true,
    isArchived: false,
  })
    .populate('category', 'name slug badge')
    .limit(4)
    .lean();

  return {
    product,
    relatedProducts,
  };
};

/**
 * Retrieves featured products for home page showcase
 */
export const getFeaturedProducts = async (limit = 6) => {
  return Product.find({
    isActive: true,
    isArchived: false,
    isFeatured: true,
  })
    .populate('category', 'name slug badge turnaroundHours')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Creates a new product (Administrator only)
 */
export const createProduct = async (productData) => {
  let slug = productData.slug ? slugify(productData.slug) : slugify(productData.name);

  // Ensure slug uniqueness
  const existingWithSlug = await Product.findOne({ slug });
  if (existingWithSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  // Verify category exists
  const categoryExists = await Category.findById(productData.category);
  if (!categoryExists) {
    throw new AppError('Invalid category referenced', HTTP_STATUS.BAD_REQUEST);
  }

  const newProduct = await Product.create({
    ...productData,
    slug,
  });

  return Product.findById(newProduct._id)
    .populate('category', 'name slug badge turnaroundHours')
    .lean();
};

/**
 * Updates an existing product (Administrator only)
 */
export const updateProduct = async (productId, updateData) => {
  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new AppError('Invalid category referenced', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  }

  const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name slug badge turnaroundHours')
    .lean();

  if (!updatedProduct) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  return updatedProduct;
};

/**
 * Toggles product active status (Administrator only)
 */
export const toggleProductStatus = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  product.isActive = !product.isActive;
  await product.save();

  return product.toJSON();
};

/**
 * Soft-archives a product (Administrator only)
 */
export const archiveProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  product.isArchived = true;
  product.isActive = false;
  await product.save();

  return { message: 'Product archived successfully' };
};

/**
 * Categories Service Methods
 */
export const getAllCategories = async () => {
  // Aggregate product counts per category
  const categories = await Category.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  const productCounts = await Product.aggregate([
    { $match: { isActive: true, isArchived: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  productCounts.forEach((item) => {
    countMap[item._id.toString()] = item.count;
  });

  return categories.map((cat) => ({
    ...cat,
    productCount: countMap[cat._id.toString()] || 0,
  }));
};

export const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug: slug.toLowerCase().trim(), isActive: true }).lean();
  if (!category) {
    throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
  }
  return category;
};

export const createCategory = async (categoryData) => {
  const slug = categoryData.slug ? slugify(categoryData.slug) : slugify(categoryData.name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new AppError('Category with this name or slug already exists', HTTP_STATUS.CONFLICT);
  }

  return Category.create({
    ...categoryData,
    slug,
  });
};
