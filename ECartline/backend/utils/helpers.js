// Small helpers shared by routes.

// Lets us write "async" route functions without try/catch in each one.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Turns a MySQL product row into the JSON the frontend expects.
function parseImages(value, fallbackImage) {
  let arr = value;
  if (typeof value === "string") { try { arr = JSON.parse(value); } catch { arr = null; } }
  return Array.isArray(arr) && arr.length ? arr : fallbackImage ? [fallbackImage] : [];
}

function toProduct(r) {
  const price = Number(r.price);
  return {
    id: r.id,
    name: r.name,
    description: r.description || "",
    price,
    oldPrice: r.old_price != null ? Number(r.old_price) : price,
    image: r.image,
    images: parseImages(r.images, r.image),
    category: r.category,
    stock: r.stock,
    rating: Number(r.rating) || 0,
    reviews: r.reviews_count || 0,
    createdAt: r.created_at,
  };
}

const MAX_QTY_PER_PRODUCT = 10; // same limit your frontend already uses

module.exports = { asyncHandler, toProduct, parseImages, MAX_QTY_PER_PRODUCT };
