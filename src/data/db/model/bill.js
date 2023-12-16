require("../connection/localConnection");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const customerServiceSchema = new Schema({
    broughtIn: { type: mongoose.SchemaTypes.ObjectId, ref: "customerProfile" },
    vehicleStatus: {
        status: { type: String, default: "Registered" },
        time: { type: Date, default: new Date() },
    },
    billNo: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        maxlength: 10,
        required: true,
        // validate: function(value) {
        //     value = value.split("-");
        //     return typeof Number(value[1][3]) == "number" ? true : false;
        // },
    },
    gst: {
        gstin: { type: String, trim: true, required: false, default: "" },
        bname: { type: String, trim: true, required: false, default: "" },
        place: { type: String, trim: true, required: false, default: "" },
    },
    payment: {
        method: { type: String, trim: true, default: "Card" },
        data: { type: String, default: "" },
    },
    billStatus: {
        type: String,
        default: "open",
        trim: true,
        required: true,
        enum: ["open", "close"],
    },
    isCharged: {
        type: Boolean,
        default: true,
    },
    billType: {
        type: String,
        required: false,
        default: "Null",
    },
    vehicleID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        index: false,
        ref: "vehicle",
    },
    dateOfDelivery: { type: Date, required: false, default: new Date() },
    billDetails: {
        additionalCharges: [{
            name: String,
            code: { type: String, default: "00000" },
            HSNCode: String,
            tax: Number,
            rate: Number,
            amt: Number,
        }, ],
        servicePackageFinal: [{
            package: { type: mongoose.SchemaTypes.ObjectId, required: false, index: false, ref: "servicePackage" },
            warrantyExpiryDate: {
                type: Date,
                required: true,
                default: new Date(),
            },
            qty: Number,
            rate: Number,
            tax: Number,
            amt: Number,
        }, ],
    },
}, { timestamps: true });

const billModel = mongoose.model("bill", customerServiceSchema, "bills");
// const billCloseModel = mongoose.model("bill", customerServiceSchema, "closedbills");

module.exports = billModel;

// var customerServiceDetail = new customerServiceDetailsModel()

// // customerServiceDetail.billDetails.modeOfPayment = 'cash'
// customerServiceDetail.package = new mongoose.Types.ObjectId('5f3bd76bdd07d72d50f54a7a')

// customerServiceDetail.belongsTo = new mongoose.Types.ObjectId('5f3bd76bdd07d72d50f54a7a')
// customerServiceDetail.vehicleID = new mongoose.Types.ObjectId('5f3bd76bdd07d72d50f54a7a')

// customerServiceDetail.broughtIn = "someone"
// customerServiceDetail.complaintFromUser = "none"
// customerServiceDetail.isCharged = true
// customerServiceDetail.warrantyExpiryDate = new Date()

// customerServiceDetail.save((msg, err) => {
//     console.log(err, msg)
// })