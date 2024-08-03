const mongoose = require('mongoose');

const EuropeSchema = new mongoose.Schema({
Country:{type:String,required:true},
Name:{type:String,required:true},
LastName:{type:String,required:true},
IBAN:{type:String,required:true},
NameOfTheBank:{type:String,required:true}
 
}, { timestamps: true });


const EuropeShipment = mongoose.model("EuropeMlcShipment", EuropeSchema);

module.exports = EuropeShipment;
