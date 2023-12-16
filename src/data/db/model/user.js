const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
    username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true, minlength: 5, maxlength: 10 },
    password: { type: String, required: true, lowercase: false, trim: true, minlength: 5 },
    admin: { type: Boolean, required: true, default: false, required: true },
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema, "users");

module.exports = userModel;

// require("../connection/localConnection");
// var user = new userModel();
// user.username = "as";
// user.password = "as";
// user.admin = true;
// user.save();