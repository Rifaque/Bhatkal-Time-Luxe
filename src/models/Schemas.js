import mongoose from 'mongoose';

// 1. Schemas Definition

const brandSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  logo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

brandSchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    next(new Error('Brand name already exists'));
  } else {
    next(error);
  }
});

brandSchema.pre('findOneAndDelete', async function (next) {
  const brandId = this.getQuery()._id;
  await Product.deleteMany({ brand: brandId });
  next();
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  MRP: { type: Number, required: true },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  color: { type: String },
  about: { type: String },
  images: [{ type: String }],
  orderCount: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now },
});
productSchema.index({ brand: 1 });

const cartSchema = new mongoose.Schema({
  cartId: { type: String, unique: true, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

const statsSchema = new mongoose.Schema({
  globalOrderCount: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
  cartId: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const featuredWatchSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const bestSellingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const topBrandSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
});

// 2. Compile Models (with Next.js cache check)
export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export const FeaturedWatch = mongoose.models.FeaturedWatch || mongoose.model('FeaturedWatch', featuredWatchSchema);
export const BestSelling = mongoose.models.BestSelling || mongoose.model('BestSelling', bestSellingSchema);
export const TopBrand = mongoose.models.TopBrand || mongoose.model('TopBrand', topBrandSchema);
