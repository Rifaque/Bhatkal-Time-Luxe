const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

// Assuming you have your models already imported:
const { Brand, Product } = require("../server");

// This middleware ensures only authenticated admins can access this endpoint.
const authenticateAdmin = require("./middleware/authMiddleware.js").authenticateAdmin;

router.post("/admin/cleanup-images", authenticateAdmin, async (req, res) => {
  try {
    // 1. Retrieve all valid image references from Brands and Products
    const brands = await Brand.find({}, "logo").lean();
    const products = await Product.find({}, "images").lean();

    // Build a set of valid image filenames
    const validImages = new Set();

    brands.forEach((brand) => {
      if (brand.logo) validImages.add(brand.logo);
    });

    products.forEach((product) => {
      if (product.images && product.images.length > 0) {
        product.images.forEach((image) => validImages.add(image));
      }
    });

    // 2. Scan the uploads folder
    const uploadsDir = path.join(__dirname, "uploads");
    const files = await fs.promises.readdir(uploadsDir);

    // 3. Delete orphaned images
    let deletedFiles = [];
    for (const file of files) {
      if (!validImages.has(file)) {
        const filePath = path.join(uploadsDir, file);
        await fs.promises.unlink(filePath);
        deletedFiles.push(file);
      }
    }

    // Return the result to the admin dashboard
    res.json({ 
      message: "Cleanup completed", 
      deletedFiles, 
      count: deletedFiles.length 
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
