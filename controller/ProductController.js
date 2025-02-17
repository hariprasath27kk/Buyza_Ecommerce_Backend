const Product = require('../models/ProductModel');
const path = require('path')

exports.setProducts = async (req, res) => {
    try {
        console.log("set method");
        // console.log("bodyyy", req.body);
        const { productName, category, subcategory,  price, description, quantity } = req.body;

        // const imageUrl = req.file ? req.file.originalname : '';
        const imageUrl = random + path.extname(req.file.originalname);
        // console.log("imageurl", imageUrl)

        if (!productName && !price && !description && !quantity && !imageUrl && !category && !subcategory ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check for duplicate product
        const existingProduct = await Product.findOne({ productName });
        if (existingProduct) {
            return res.status(400).json({ error: "A product with the same name already exists" });
        }

        // Validation checks
        const requiredFields = { productName, price, description, quantity, imageUrl, category, subcategory };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }


        const newProduct = new Product({
            productName,
            category,
            subcategory,
            price,
            description,
            quantity,
            imageUrl
        });

        const savedProduct = await newProduct.save();

        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        .sort({
            createdAt: -1})
        res.status(200).send(products);
        console.log('product in all ',products)
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = req.body;

        let imageUrl = null;

        // If a new file is uploaded, use its filename
        if (req.file) {
            imageUrl = req.file.filename;
        } else if (req.body.imageUrl) {
            // If no new file is uploaded, retain the existing image URL
            imageUrl = req.body.imageUrl;
        }

        // Add the image URL to the update data
        data.imageUrl = imageUrl;

        // Update the product in the database
        const updatedProduct = await Product.findByIdAndUpdate(productId, data, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', updatedProduct });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getbyCategory = async (req, res) => {
    try {
        const category = req.params.category;
        let products;
        console.log('cate',category);

        if (!category || category === 'All') {
            products = await Product.find();
        } else {
            products = await Product.find({ category });
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getbySubCategoryinCategory = async (req, res) => {

    try {
        const { category, subcategory } = req.params;
        console.log(category,"categoryyyy")
        console.log(subcategory,"subcategory")
        const items = await Product.find({ category:category, subcategory:subcategory });

        console.log('subcategory',subcategory);

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getProductsByName = async (req, res) => {
    console.log("search");
    const { searchTerm } = req.params;

    console.log("searchTerm=========",searchTerm)
    // Validate productName query parameter
    // if (!searchTerm) {
    //     return res.status(201).json({ message: 'Product name query parameter is required' });
    // }
       

    try {
        if (searchTerm === ' ') {
            const products = await Product.find();
            res.status(200).json(products);
        }
        else{
            const products = await Product.find({ productName: { $regex: new RegExp(searchTerm, 'i') } });

            if (!products || products.length === 0) {
                return res.status(201).json({ message: 'No products found matching the search criteria' });
            }
    
            res.status(200).json(products);
        }
       
       
    } catch (error) {
        console.error('Error fetching products by name:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.deleteproduct = async (req, res) => {
    try {
        const {id} = req.params;
        
        const result = await Product.findByIdAndDelete(id);

        if (result) {
            res.status(200).json({ message: "Product deleted successfully" });
        } else {
            console.log("Product not found");
            res.status(404).json({ message: "Product not found" });
        }
    } catch (err) {
        console.error("Error deleting Product:", err);
        res.status(500).json({ message: "Error deleting Product", error: err });
    }
};



exports.viewproduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
