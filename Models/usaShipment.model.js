const mongoose = require('mongoose');

const USASchema = new mongoose.Schema({
 
Name:{type:String,required:true},
LastName:{type:String,required:true},
AccountNumber:{type:String,required:true},
RouteNumber:{type:String,required:true},
RecipientAddress:{type:String,required:true},
SwiftCode:{type:String,required:true}

}, { timestamps: true });


const USAShipment = mongoose.model("USAShipmentMlc", USASchema);

module.exports = USAShipment;
