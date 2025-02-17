const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const SubCategory = new Schema({
    categoryId: { type:Schema.Types.ObjectId ,ref:'Category',required:true},
    subCategory: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('SubCategory',SubCategory);