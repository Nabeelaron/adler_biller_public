const mongoose = require("mongoose");

const { Schema } = mongoose;

const vehicleSchema = new Schema({
    typeOfVehicle: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        lowercase: true,
        enum: ["car", "motorcycle"],
    },
    packages: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "servicePackage",
    }, ],
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "customerProfile",
        required: true,
    },
    broughtIn: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "customerProfile",
        required: true,
    }, ],

    vehicleDetails: {
        licensePlateNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
            lowercase: true,
        },
        color: {
            type: String,
            required: true,
            trim: true,
        },
        make: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        model: {
            type: String,
            required: true,
            trim: true,
        },
    },
}, { timestamps: true });

const vehiclesModel = mongoose.model("vehicle", vehicleSchema, "vehicles");

module.exports = vehiclesModel;

// const vehicle = new vehiclesModel()
// vehicle.typeOfVehicle = 'car'
// vehicle.packages.push('package1')
// vehicle.owner = 'nabeel'
// vehicle.vehicleDetails = {
//     licensePlateNumber: 'KL13V4404',
//     color: 'black'
// }

// vehicle.save()