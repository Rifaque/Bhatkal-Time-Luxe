const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const { verifyAdmin } = require("./middleware/authMiddleware.js");
const { getCartId } = require("./middleware/cartMiddleware.js");
const NodeCache = require("node-cache");
const logger = require("./logger.js");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const session = require('express-session');
const fs = require("fs");
const { exec } = require('child_process');


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev")); // Log HTTP requests
app.use(cookieParser()); // Handle cookies
app.use("/uploads", express.static("uploads")); // Serve static files
app.use(compression());
app.set('trust proxy', 1);


// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });

// MongoDB Models
const brandSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    logo: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
brandSchema.post("save", function (error, doc, next) {
    if (error.code === 11000) {
      next(new Error("Brand name already exists"));
    } else {
      next(error);
    }
});
brandSchema.pre("findOneAndDelete", async function (next) {
    const brandId = this.getQuery()._id;
    await Product.deleteMany({ brand: brandId });
    next();
});
const Brand = mongoose.model("Brand", brandSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
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
const Product = mongoose.model("Product", productSchema);

const cartSchema = new mongoose.Schema({
    cartId: { type: String, unique: true, required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, default: 1 }
    }],
    updatedAt: { type: Date, default: Date.now }
});
const Cart = mongoose.model("Cart", cartSchema);

const statsSchema = new mongoose.Schema({
    globalOrderCount: { type: Number, default: 0 }
});
const Stats = mongoose.model("Stats", statsSchema);

const orderSchema = new mongoose.Schema({
    cartId: { type: String, required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  
const Order = mongoose.model("Order", orderSchema);
  
  

// const brandSchemaValidation = Joi.object({
//     name: Joi.string().min(2).max(50).required(),
//     logo: Joi.string().required(),
// });
  
// const productSchemaValidation = Joi.object({
//     name: Joi.string().min(2).max(100).required(),
//     brand: Joi.string().required(),
//     price: Joi.number().min(0).required(),
//     description: Joi.string().optional(),
//     material: Joi.string().optional(),
//     size: Joi.string().optional(),
//     inStock: Joi.boolean().default(true),
//     images: Joi.array().items(Joi.string()).optional(),
// });

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model("Admin", adminSchema);

const featuredWatchSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  }
});
const FeaturedWatch = mongoose.model("FeaturedWatch", featuredWatchSchema);

const bestSellingSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  }
});
const BestSelling = mongoose.model("BestSelling", bestSellingSchema);

// New Top Brands Collection
const topBrandSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
});
const TopBrand = mongoose.model("TopBrand", topBrandSchema);

app.use(session({
  secret: 'btl-backendcarts', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // Session expires after 30 days
}));

// API Routes
const router = express.Router();
// Apply the middleware to cart routes
router.use(getCartId);

// Admin Authentication Routes
router.post("/admin/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      const saltRounds = 10;
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const admin = new Admin({ username, password: hashedPassword });
  
      await admin.save();
      res.status(201).json({ message: "Admin registered successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});
  

// Admin Login Route
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
  }

  try {
      const admin = await Admin.findOne({ username });
      if (!admin) {
          console.error("Admin not found");
          return res.status(400).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
          console.error("Password mismatch");
          return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, message: "Login successful" });
  } catch (error) {
      console.error("Login Error: ", error); // Log the actual error
      res.status(500).json({ error: "Something went wrong" });
  }
});


  
router.post("/admin/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});
  
const authenticateAdmin = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.adminId = decoded.id;
        next();
    });
};


router.get("/dashboard", verifyAdmin, (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard" });
});

// Brand Routes
router.post("/brands", authenticateAdmin, upload.single("logo"), async (req, res) => {
    // Validate that the brand name is provided
    if (!req.body.name) {
        return res.status(400).json({ error: "Brand name is required" });
    }
    // Validate that a file has been uploaded
    if (!req.file) {
        return res.status(400).json({ error: "Logo file is required" });
    }
  
    try {
        // Check if brand already exists
        const existingBrand = await Brand.findOne({ name: req.body.name });
        if (existingBrand) {
            return res.status(400).json({ error: "Brand name already exists" });
        }
        
        // Create new brand using the uploaded file path
        const brand = new Brand({
            name: req.body.name,
            logo: `${req.file.filename}`  // File path set by Multer
        });
        
        await brand.save();
        res.status(201).json(brand);
        cache.del("brands");

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
  

router.get("/brands", async (req, res) => {
    // Check if brands are cached
    let brands = cache.get("brands");
    if (brands) {
        return res.json(brands);
    }
    try {
        brands = await Brand.find();
        cache.set("brands", brands); // Cache the result for future requests
        res.json(brands);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.put("/brands/:id", authenticateAdmin, async (req, res) => {
    try {
      const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!brand) return res.status(404).json({ error: "Brand not found" });
  
      res.json(brand);
      cache.del("brands");
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

router.delete("/brands/:id", authenticateAdmin, async (req, res) => {
    try {
      const brand = await Brand.findByIdAndDelete(req.params.id);
      if (!brand) return res.status(404).json({ error: "Brand not found" });
      
      cache.del("brands");
      res.json({ message: "Brand deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});

router.get("/brands/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Product Routes
app.post('/api/products', authenticateAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, brand, MRP, price, inStock, color, about } = req.body;
        if (!req.files || req.files.length === 0) 
            return res.status(400).json({ message: 'At least one image is required' });

        const imageFilenames = req.files.map(file => file.filename);

        const newProduct = new Product({
            name,
            brand,
            MRP,
            price,
            inStock,
            color,
            about,
            images: imageFilenames,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

router.get("/products/brand/:brandId", async (req, res) => {
  try {
    // Fetch all products matching the given brand ID without pagination
    const products = await Product.find({ brand: req.params.brandId });
    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/products", async (req, res) => {
  try {
      const products = await Product.find();
      res.json(products);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});


router.get("/products/new-arrivals", async (req, res) => {
    let newArrivals = cache.get("newArrivals");
    if (newArrivals) {
        console.log("Serving new arrivals from cache");
        return res.json(newArrivals);
    }

    try {
        const limit = parseInt(req.query.limit) || 40;
        newArrivals = await Product.find().sort({ dateAdded: -1 }).limit(limit).lean();
        cache.set("newArrivals", newArrivals, 300); // Cache for 5 minutes
        console.log("Serving new arrivals from DB");
        res.json(newArrivals);
    } catch (err) {
        console.error("Error fetching new arrivals:", err.message);
        res.status(400).json({ error: err.message });
    }
});



router.get("/products/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid product ID" });
  
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
  
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});

router.put("/products/:id", authenticateAdmin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid product ID" });
  
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) return res.status(404).json({ error: "Product not found" });
  
      res.json(product);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  
  router.delete("/products/:id", authenticateAdmin, async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
  
      // Delete associated records from FeaturedWatch and BestSelling collections
      await FeaturedWatch.deleteMany({ productId: product._id });
      await BestSelling.deleteMany({ productId: product._id });
  
      res.json({ message: "Product and related records deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

router.post("/admin/best-selling", authenticateAdmin, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if product already exists in best-selling list
    const exists = await BestSelling.findOne({ productId });
    if (exists) {
      return res.status(400).json({ error: "Product is already in the best-selling list" });
    }

    const bestSelling = new BestSelling({ productId });
    await bestSelling.save();
    res.status(201).json({ message: "Product added to best-selling list", bestSelling });
  } catch (error) {
    console.error("Error adding best-selling product:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/admin/best-selling/:productId", authenticateAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await BestSelling.findOneAndDelete({ productId });
    if (!deleted) {
      return res.status(404).json({ error: "Product not found in best-selling list" });
    }
    res.json({ message: "Product removed from best-selling list" });
  } catch (error) {
    console.error("Error removing best-selling product:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/best-selling", async (req, res) => {
  try {
    const bestSellingItems = await BestSelling.find().populate("productId");
    res.json(bestSellingItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/featured", authenticateAdmin, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if product already exists in the featured list
    const exists = await FeaturedWatch.findOne({ productId });
    if (exists) {
      return res.status(400).json({ error: "Product is already in the featured list" });
    }

    const featured = new FeaturedWatch({ productId });
    await featured.save();
    res.status(201).json({ message: "Product added to featured list", featured });
  } catch (error) {
    console.error("Error adding featured product:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/admin/featured/:productId", authenticateAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await FeaturedWatch.findOneAndDelete({ productId });
    if (!deleted) {
      return res.status(404).json({ error: "Product not found in featured list" });
    }
    res.json({ message: "Product removed from featured list" });
  } catch (error) {
    console.error("Error removing featured product:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/featured", async (req, res) => {
  try {
    // Fetch featured watches sorted by a specified order, and populate the product details.
    const featuredWatches = await FeaturedWatch.find().sort({ order: 1 }).populate("productId");
    res.json(featuredWatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top Brands API Endpoints

router.post("/admin/top-brands", authenticateAdmin, async (req, res) => {
  try {
    const { brandId } = req.body;
    if (!brandId) {
      return res.status(400).json({ error: "Brand ID is required" });
    }

    // Check if the brand already exists in the top brands list
    const exists = await TopBrand.findOne({ brand: brandId });
    if (exists) {
      return res.status(400).json({ error: "Brand is already in the top brands list" });
    }

    const topBrand = new TopBrand({ brand: brandId });
    await topBrand.save();
    res.status(201).json({ message: "Brand added to top brands list", topBrand });
  } catch (error) {
    console.error("Error adding top brand:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/admin/top-brands/:brandId", authenticateAdmin, async (req, res) => {
  try {
    const { brandId } = req.params;
    const deleted = await TopBrand.findOneAndDelete({ brand: brandId });
    if (!deleted) {
      return res.status(404).json({ error: "Brand not found in top brands list" });
    }
    res.json({ message: "Brand removed from top brands list" });
  } catch (error) {
    console.error("Error removing top brand:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/top-brands", async (req, res) => {
  try {
    // Fetch top brands and populate brand details
    const topBrands = await TopBrand.find().populate("brand");
    res.json(topBrands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// --- Cart Endpoints ---

// Get Cart: Returns the current cart with populated product details
router.get("/cart", getCartId, async (req, res) => {
  try {
    const cart = await Cart.findOne({ cartId: req.cartId }).populate("items.product");
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/cart/total", getCartId, async (req, res) => {
    try {
      const cart = await Cart.findOne({ cartId: req.cartId }).populate("items.product");
      if (!cart) return res.json({ total: 0 });
  
      let total = 0;
      cart.items.forEach(item => {
        if (item.product && item.product.price) {
          total += item.product.price * item.quantity;
        }
      });
      res.json({ total });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

// Add to Cart: Add a product to the cart (or update quantity if already present)
router.post("/cart", getCartId, async (req, res) => {
  const { product, quantity = 1 } = req.body;
  if (!product) return res.status(400).json({ error: "Product is required" });
  
  try {
    let cart = await Cart.findOne({ cartId: req.cartId });
    if (!cart) {
      cart = new Cart({ cartId: req.cartId, items: [] });
    }
    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === product);
    if (existingItemIndex >= 0) {
      // Increase quantity; default to 1 if not provided
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ product, quantity: quantity || 1 });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Cart Item: Update the quantity for a specific product in the cart
router.put("/cart/:productId", getCartId, async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined) return res.status(400).json({ error: "Quantity is required" });
  
  try {
    const cart = await Cart.findOne({ cartId: req.cartId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    
    const itemIndex = cart.items.findIndex(item => item.product.toString() === req.params.productId);
    if (itemIndex === -1) return res.status(404).json({ error: "Product not found in cart" });
    
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove Cart Item: Remove a specific product from the cart
router.delete("/cart/:productId", getCartId, async (req, res) => {
  try {
    const cart = await Cart.findOne({ cartId: req.cartId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Clear Cart: Clear the entire cart (e.g., after checkout)
router.delete("/cart", getCartId, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ cartId: req.cartId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/cart/:productId", getCartId, async (req, res) => {
    try {
      const cart = await Cart.findOne({ cartId: req.cartId });
      if (!cart) return res.status(404).json({ error: "Cart not found" });
      
      // Remove the product from the cart's items array
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
      cart.updatedAt = Date.now();
      await cart.save();
      res.json(cart);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});  

router.get("/cart/checkout", getCartId, async (req, res) => {
    try {
      const cart = await Cart.findOne({ cartId: req.cartId }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
  
      let message = "Order Details:\n";
      let total = 0;
      const orderItems = [];
  
      // Process each item in the cart
      for (const item of cart.items) {
        if (item.product) {
          const itemTotal = item.product.price * item.quantity;
          total += itemTotal;
          message += `${item.product.name} - Quantity: ${item.quantity}, Price: ${item.product.price}, Subtotal: ${itemTotal}\n`;
          
          // Increment the per-product order counter by the quantity ordered
          await Product.findByIdAndUpdate(item.product._id, { $inc: { orderCount: item.quantity } });
  
          // Prepare order item snapshot
          orderItems.push({
            product: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          });
        }
      }
      message += `Total: ${total}`;
  
      // Increment the global order counter
      const globalStats = await Stats.findOneAndUpdate(
        {},
        { $inc: { globalOrderCount: 1 } },
        { new: true, upsert: true }
      );
  
      // Save order history record
      const order = new Order({
        cartId: req.cartId,
        items: orderItems,
        total,
        message
      });
      await order.save();
  
      // Generate WhatsApp URL if WHATSAPP_NUMBER is defined
      const whatsappNumber = process.env.WHATSAPP_NUMBER || "";
      let whatsappUrl = "";
      if (whatsappNumber) {
        whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      }
  
      res.json({ message, total, globalOrderCount: globalStats.globalOrderCount, whatsappUrl, orderId: order._id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});
  
router.get("/product/:productId/checkout", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const quantity = 1; // Since it's a direct purchase
    const total = product.price * quantity;
    // Build the image URL (ensure this URL points to a publicly accessible image)
    const productPageUrl = `https://btl.hubzero.in/product/${product._id}`;
    
    // Append the image URL to the message text
    const message = `Order Details:\n${product.name}\nColor: ${product.color}\nPrice: ~${new Intl.NumberFormat('en-IN').format(product.MRP)}~ ${new Intl.NumberFormat('en-IN').format(product.price)}\n--------------------------------\nSubtotal: ${total}\n\nProduct: ${productPageUrl}`;

    // Increment the global order counter
    const globalStats = await Stats.findOneAndUpdate(
      {},
      { $inc: { globalOrderCount: 1 } },
      { new: true, upsert: true }
    );

    // Save order history record
    const order = new Order({
      cartId: 'direct',
      items: [{ product: product._id, name: product.name, price: product.price, quantity }],
      total,
      message
    });
    await order.save();

    // Generate WhatsApp order link with message
    const whatsappNumber = process.env.WHATSAPP_NUMBER || "";
    let whatsappUrl = "";
    if (whatsappNumber) {
      whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    }

    res.json({ 
      message, 
      total, 
      globalOrderCount: globalStats.globalOrderCount, 
      whatsappUrl, 
      orderId: order._id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

  
  

// Upload Routes

// Upload single brand logo
router.post("/upload/brand-logo", authenticateAdmin, upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;
  const filename = req.file.filename;
  const commitMessage = `upload: brand logo ${filename}`;

  exec(`git add "${filePath}" && git commit -m "${commitMessage}" && git push`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Git push failed:", stderr);
      return res.status(500).json({ error: "Image uploaded, but Git push failed." });
    }

    console.log("✅ Git pushed:", stdout);
    res.json({ filePath: `/uploads/${filename}` });
  });
});

// Upload multiple product images
router.post("/upload/product-image", authenticateAdmin, upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files uploaded" });

  const uploadedFiles = req.files.map(file => file.path);
  const commitMessage = `upload: product images ${uploadedFiles.map(f => f.split("/").pop()).join(", ")}`;

  exec(`git add ${uploadedFiles.map(f => `"${f}"`).join(" ")} && git commit -m "${commitMessage}" && git push`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Git push failed:", stderr);
      return res.status(500).json({ error: "Images uploaded, but Git push failed." });
    }

    console.log("✅ Git pushed:", stdout);
    res.json({
      filePaths: req.files.map(file => `/uploads/${file.filename}`)
    });
  });
});

  
router.post("/admin/cleanup-images", authenticateAdmin, async (req, res) => {
  try {
    // 1. Retrieve all valid image references
    const brands = await Brand.find({}, "logo").lean();
    const products = await Product.find({}, "images").lean();

    const validImages = new Set();
    brands.forEach(brand => brand.logo && validImages.add(brand.logo));
    products.forEach(product => product.images?.forEach(image => validImages.add(image)));

    // 2. Scan uploads directory
    const uploadsDir = path.join(__dirname, "uploads");
    const files = await fs.promises.readdir(uploadsDir);

    // 3. Delete orphaned files
    const deletedFiles = [];
    for (const file of files) {
      if (!validImages.has(file)) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.promises.lstat(filePath);
        if (stats.isFile()) {
          await fs.promises.unlink(filePath);
          deletedFiles.push(file);
        }
      }
    }

    // 4. Git commit deleted files
    if (deletedFiles.length > 0) {
      const deletedPaths = deletedFiles.map(f => `"uploads/${f}"`).join(" ");
      const commitMsg = `cleanup: removed ${deletedFiles.length} unused image(s)`;
      exec(`git rm ${deletedPaths} && git commit -m "${commitMsg}" && git push`, (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Git cleanup push failed:", stderr);
          return res.status(500).json({
            message: "Cleanup done, but Git push failed.",
            deletedFiles,
            count: deletedFiles.length
          });
        }

        console.log("✅ Git cleanup pushed:", stdout);
        res.json({
          message: "Cleanup and Git push completed",
          deletedFiles,
          count: deletedFiles.length
        });
      });
    } else {
      res.json({
        message: "No orphaned images found",
        deletedFiles,
        count: 0
      });
    }

  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: error.message });
  }
});


// Serve static files from the 'public' directory
app.use("/apk", express.static(path.join(__dirname, "public/apk")));

// Route to force download the APK
app.get("/download-apk", (req, res) => {
    const filePath = path.join(__dirname, "public/apk/btimeluxe.apk");
    res.download(filePath, "btimeluxe.apk"); // Triggers a download in the browser
});

// Apply Routes
app.use("/api", apiLimiter, router);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running successfully!" });
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


// Global Error Handler
app.use((err, req, res, next) => {
    // Log the error using Winston
    logger.error(err.stack);
    res.status(500).json({ error: "Something went wrong! Try again later." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
