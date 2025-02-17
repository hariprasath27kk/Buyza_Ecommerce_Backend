var mongoose = require('mongoose')

const Schema = mongoose.Schema;

const TransectionSchema = new Schema({
    name: {type: String,required:true},
    from: {type: String,required:true},
    to: {type: String,required:true},
    value: {type: String,required:true},
    hash: {type: String,required:true},
    type: {type: String,required:true},
},{timestamps:true})

module.exports = mongoose.model("Transection",TransectionSchema)