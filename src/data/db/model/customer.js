const mongoose = require("mongoose");
const validator = require("validator");
const mongooseLeanVirtual = require("mongoose-lean-virtuals");
const { Schema } = mongoose;

const customerProfileSchema = new Schema({
    name: {
        firstName: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
        },
        middleName: {
            type: String,
            trim: true,
            required: false,
            lowercase: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
            lowercase: true,
        },
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        validate: function(value) {
            if (validator.isEmail(value)) return true;
            else return false;
        },
    },

    phoneNumber: {
        type: Number,
        default: 0,
        required: true,
        index: true,
        unique: true,
        validate: function(value) {
            if (value > 0 && value <= 9999999999) return true;
            else return false;
        },
    },

    address: {
        state: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        district: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
    },
    serviceBills: [{
        type: mongoose.SchemaTypes.ObjectId,
        required: false,
        ref: "customerServiceDetail",
    }, ],
}, { timestamps: true });

customerProfileSchema.virtual("fullName").get(function() {
    return (this.name.firstName || "") + " " + (this.name.middleName || "") + " " + (this.name.lastName || "");
});

customerProfileSchema.plugin(mongooseLeanVirtual);

const customerProfileModel = mongoose.model("customerProfile", customerProfileSchema, "customerProfiles");

module.exports = customerProfileModel;

// var profile = new customerProfileModel();
// profile.name.firstName = "nabeel";
// profile.name.middleName = "mohammed";
// profile.name.lastName = "sayed";
// profile.email = "email@gamil.com";
// profile.phoneNumber = 9995731024;
// profile.address.state = "kerala";
// profile.address.district = "kannur";
// profile.address.city = "pallikulam";

// profile.save();