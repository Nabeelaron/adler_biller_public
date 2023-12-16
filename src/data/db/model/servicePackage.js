const mongoose = require("mongoose");
const { Schema } = mongoose;

const servicePackagesSchema = new Schema({
    packageName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    packageCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: false,
        trim: true,
        minlength: 5,
        maxlength: 8,
    },
    packageDetails: {
        type: String,
        required: false,
        trim: true,
        lowercase: false,
        uppercase: false,
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
    },
    accessory: {
        type: String,
        required: false,
        trim: true,
    },
    HSNCode: { type: String },
    tax: { required: true, default: 18, type: Number },
}, { timestamps: true });

servicePackagesSchema.virtual("name").get(function() {
    return this.packageName;
});

const servicePackagesModel = mongoose.model("servicePackage", servicePackagesSchema, "servicePackages");

module.exports = servicePackagesModel;

// var package = new servicePackagesModel();
// package.packageName = "package 2";
// package.packageCode = " STE12";
// package.packageDetails = " 12layer ceramic coating";
// package.rate = "2599";
// package.accessory = "microfibre cloth";
// package.save();'
// servicePackagesModel.findOneAndUpdate({ _id: convertToObjectId(data.data._id.id)[1] }, {...data }, { upsert: true });
// require("../connection/localConnection");
// (async function main() {
//     let result = servicePackagesModel.findOneAndUpdate({ _id: "60c501454070741990b5ab5e" }, { packageName: "neww" }, { upsert: true }, (one, two) => {
//         console.log(one, two);
//     });
//     console.log(result);
// })();