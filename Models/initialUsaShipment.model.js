const mongoose = require('mongoose');

const InitialUSASchema = new mongoose.Schema({
 
Name:{type:String,required:true},
LastName:{type:String,required:true},
AccountNumber:{type:String,required:true},
RouteNumber:{type:String,required:true},
RecipientAddress:{type:String,required:true},
SwiftCode:{type:String,required:true}

}, { timestamps: true });


const initialUSAShipment = mongoose.model("InitialMlcUSAShipment", InitialUSASchema);

module.exports = initialUSAShipment;
