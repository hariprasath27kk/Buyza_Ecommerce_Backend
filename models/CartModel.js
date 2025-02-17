const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const CartSchema = new Schema({
    productName: {type:String, required: true},
    price : {type: Number, required: true},
    category: {type:String, required:true},
    subcategory:{type:String, required:true},
    description : {type: String, required: true},
    quantity: {type: Number, required: true},
    imageUrl:{type: String, required: true},
    totalPrice:{type:Number,required:true},
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },   
    productId: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
    status:{type:String}
})

module.exports = mongoose.model("Cart",CartSchema);