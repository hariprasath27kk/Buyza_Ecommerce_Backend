const express = require('express');

const router = express.Router();

const AddtoCart = require('../controller/AddtoCartController');
const verifyToken = require('../middleware/AuthMiddleware');

router.post("/cart/addtocart",verifyToken,AddtoCart.addToCartWithUserId)
router.post("/tempcart/addtocart",AddtoCart.addTempCartWithUserIp)

router.get("/cart/getcartstatus",verifyToken,AddtoCart.getCartWithUserIdStatus)

router.get("/cart/getcart",AddtoCart.getCartWithUserId)
router.post("/tempcart/getcart",AddtoCart.getCartWithUserIp)


router.put("/cart/update/:id",verifyToken,AddtoCart.updateCartWithUserId)
router.put("/cart/updatestatus/:id",AddtoCart.updateStatus)
router.put("/tempcart/update/:ip",AddtoCart.updateCartWithUserIp)


router.delete("/cart/remove/:id",verifyToken,AddtoCart.removeCartWithUserId)
router.delete("/tempcart/remove/:id",AddtoCart.removeCartWithUserIp)

router.post("/tempcart/cartlength", AddtoCart.tempcartLength);


router.post("/cart/cartlength", verifyToken, AddtoCart.cartLength);




module.exports= router;