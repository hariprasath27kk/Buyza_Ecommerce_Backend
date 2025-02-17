const Cart = require('../models/CartModel');
const TempCart = require('../models/TempCartModel');
const Product = require('../models/ProductModel');
const io = require('../app')

const handleProduct = async (model, filter, productDetails) => {
    try {
        console.log('handle product')
        const existingProduct = await model.findOne(filter);
        console.log("existingProduct", existingProduct);

        const product = await model.findOne(filter)
        console.log("prdout ", product);
        if (product) {
            existingProduct.quantity += productDetails.quantity;
            existingProduct.totalPrice = existingProduct.quantity * productDetails.price;
            return await existingProduct.save();
        } else {
            const newProduct = new model({
                ...productDetails,
                totalPrice: productDetails.quantity * productDetails.price,
                status: "notsold"
            });
            console.log("new product in cart", newProduct);
            return await newProduct.save();
        }

    } catch (error) {
        console.log("error", error)
    }

};

// Set product with user ID
exports.addToCartWithUserId = async (req, res) => {
    try {
        
        const userID = req.userId;
        // console.log('user id', userID);
        const { productName, price, category, subcategory, description, imageUrl, _id } = req.body.product;
        // console.log("bodyyyyyyy======", req.body.product);

        const savedProduct = await handleProduct(Cart, { userID, productId: _id, status: 'notsold' }, {
            productId: _id,
            productName,
            price,
            category,
            subcategory,
            description,
            quantity: 1,
            imageUrl,
            userID,
        });



        // const len =await Cart.countDocuments({status:'notsold'});
        // console.log("cart length",len)

        // io.emit('cartUpdated',{length:len});
        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.addTempCartWithUserIp = async (req, res) => {
    try {
        console.log("cart in temp")
        const io = req.io;
        const { productName, price, category, subcategory, description, imageUrl, _id } = req.body.product;
        const { ip } = req.body;

        console.log("ip", ip);
        const savedProduct = await handleProduct(TempCart, { ip: ip, productName }, {
            productId: _id,
            productName,
            price,
            category,
            subcategory,
            description,
            quantity: 1,
            imageUrl,
            ip
        });

        // io.emit('cartUpdated');
        res.status(200).json(savedProduct);
    } catch (err) {
        console.log('error', err);
        res.status(500).json({ error: err.message });
    }
};

// Get products with user ID
//user page
exports.getCartWithUserIdStatus = async (req, res) => {
    try {
        // console.log("stus methosd")
        const status = 'notsold';
        const userID = req.userId;
        // console.log("use id", userID);
        // console.log("st", status);

        const cart = await Cart.find({ userID, status });
        // console.log('cart in user page',cart)
        res.status(200).send(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//admin page
exports.getCartWithUserId = async (req, res) => {
    try {
        // console.log("stus methosd")
        // const userID = req.userId;
        // console.log("user id",userID)
        // const cart = await Cart.find({ userID:userID });
        const cart = await Cart.find().populate('productId userID')
        .sort({
            createdAt: "descending"})
        // .exec()
        // console.log('cart', cart);
        res.status(200).send(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get products with user IP
exports.getCartWithUserIp = async (req, res) => {
    try {

        const { ip } = req.body;
        const tempCart = await TempCart.find({ ip: ip }).lean()
        res.status(200).send(tempCart);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update product with user ID
exports.updateCartWithUserId = async (req, res) => {
    const io = req.io;
    const { id } = req.params;
    const { quantity } = req.body;
    console.log("quantity", quantity);

    if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    try {
        const cartItem = await Cart.findOne({ _id: id });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        console.log('cartItem.productId', cartItem.productId)
        // Find the product details to recalculate the total price
        const product = await Product.findById(cartItem.productId).exec();

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        cartItem.quantity = quantity;
        cartItem.totalPrice = quantity * product.price;

        const updatedCartItem = await cartItem.save();
        // io.emit('cartUpdated');
        res.status(200).json(updatedCartItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, quantity } = req.body;

    try {
        const updatedCart = await Cart.findByIdAndUpdate(id, { status }, { new: true });

        // Find the product and update its quantity
        const product = await Product.findById(updatedCart.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log(product)
        product.quantity -= quantity;
        await product.save();

        console.log("Cart updated:", updatedCart);
        res.status(200).json(updatedCart);

    } catch (error) {
        console.error("Error updating cart status", error);
        res.status(500).json({ message: 'Error updating cart status' });
    }
}

// Update product with user IP
exports.updateCartWithUserIp = async (req, res) => {
    const io = req.io;
    const { ip } = req.params;
    const { quantity } = req.body;
    console.log('ip in update tempcart', ip)
    console.log('quan', quantity)

    if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    try {
        const tempCartItem = await TempCart.findOne({ ip: ip });
        console.log("tempCartItem ", tempCartItem);
        if (!tempCartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        const product = await Product.findById(tempCartItem.productId).exec();

        console.log("product in update in temp", product)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        tempCartItem.quantity = quantity;
        tempCartItem.totalPrice = quantity * product.price;

        const updatedCartItem = await tempCartItem.save();
        io.emit('cartUpdated');
        res.status(200).json(updatedCartItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove product with user ID
exports.removeCartWithUserId = async (req, res) => {
    try {
        const io = req.io;
        const productId = req.params.id;
        const deleteproduct = await Cart.findByIdAndDelete(productId);
        // io.emit('cartUpdated');
        res.status(200).json(deleteproduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.removeCartWithUserIp = async (req, res) => {
    try {
        const io = req.io;
        const productId = req.params.id;
        await TempCart.findByIdAndDelete(productId);
        console.log("Product removed, emitting cartUpdated event");
        // io.emit('cartUpdated');
        res.status(200).json('Product removed');
    } catch (err) {
        console.log('Error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// For temp cart length
exports.tempcartLength = async (req, res) => {
    try {
        console.log('temp cart length method');
        const { ip } = req.body;
        console.log(ip, "ip");
        if (!ip) {
            return res.status(400).json({ error: "IP address is required" });
        }
        const itemCount = await TempCart.countDocuments({ ip: ip });
        console.log('cartcount', itemCount);
        res.status(200).json({ length: itemCount });
    } catch (err) {
        res.status(500).json({ error: err.message }); 
    }
};

// For user cart length
exports.cartLength = async (req, res) => {
    try {
        const userID = req.userId;

        const itemCount = await Cart.countDocuments({ userID });

        res.status(200).json({ length: itemCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
