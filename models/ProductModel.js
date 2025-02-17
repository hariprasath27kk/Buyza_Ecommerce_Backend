const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    productName: {type:String, required: true},
    category:{type:String, required:true},
    subcategory:{type:String,required:true},
    price : {type: Number, required: true},
    description : {type: String, required: true},
    quantity: {type: Number, required: true},
    imageUrl:{type: String, required: true},
},{timestamps:true})

module.exports = mongoose.model("Products",ProductSchema);