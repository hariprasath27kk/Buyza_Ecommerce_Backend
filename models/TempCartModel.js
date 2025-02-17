const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TempCartSchema = new Schema({
    productName: {type:String, required: true},
    price : {type: Number, required: true},
    category:{type:String, required:true},
    subcategory: {type:String, required:true},
    description : {type: String, required: true},
    quantity: {type: Number, required: true},
    imageUrl:{type: String, required: true},
    ip:{type:String, required:true},
    totalPrice:{type:String,required:true},
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
},{timestamps:true})


module.exports= mongoose.model('TempCart',TempCartSchema);

