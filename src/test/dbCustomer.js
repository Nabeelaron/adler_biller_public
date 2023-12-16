const customerProfileModel = require("../data/db/model/customer");
const vehiclesModel = require("../data/db/model/vehicle");
const customerServiceDetailsModel = require("../data/db/model/bill");
const servicePackagesModel = require("../data/db/model/servicePackage");
const mongoose = require("mongoose");

require("../data/db/connection/localConnection");

// for (let i = 0; i < 1000; ++i) {
//     var profile = new customerProfileModel();
//     profile.name.firstName = "name0" + i;
//     profile.name.middleName = "name1" + i;
//     profile.name.lastName = "name2" + i + 2;
//     profile.email = i + "skemail@gamil.com";
//     profile.phoneNumber = 1111111111 + i + 2;
//     profile.address.state = "kerala";
//     profile.address.district = "kannur";
//     profile.address.city = "pallikulam";

//     profile.save();
// }
// for (let i = 0; i < 1000; ++i) {
//     var package = new servicePackagesModel();
//     package.packageName = "package 2" + i;
//     package.packageCode = " STE12" + i;
//     package.packageDetails = " 12layer ceramic coating";
//     package.rate = 2599 + i;
//     package.accessory = "microfibre cloth";
//     package.save();
// }

// async function exec() {
//     let services = await servicePackagesModel.find({});
//     let customers = await customerProfileModel.find({});
//     console.log("Customers : " + customers.length);
//     for (let customerIndex = 0; customerIndex < 1000; ++customerIndex) {
//         const vehicle = new vehiclesModel();
//         vehicle.typeOfVehicle = customerIndex % 2 ? "car" : "motorcycle";
//         for (let i = 0; i < 10; ++i) {
//             vehicle.packages.push(services[customerIndex + i]._id);
//         }
//         vehicle.owner = customers[customerIndex]._id;
//         vehicle.broughtIn.push(customers[customerIndex]._id);
//         vehicle.vehicleDetails = {
//             make: "harley",
//             model: "883r",
//             category: "cruiser",
//             licensePlateNumber: `DL-2-EE-${customerIndex}${customerIndex}0${customerIndex + 2}`,
//             color: "black",
//         };
//         vehicle.save();
//     }
// }
exec();
async function exec() {
    let services = await servicePackagesModel.find({});
    let customers = await customerProfileModel.find({});
    let vehicles = await vehiclesModel.find({});
    console.log("Customers : " + customers.length);
    for (let customerIndex = 0; customerIndex < 3; ++customerIndex) {
        var customerServiceDetail = new customerServiceDetailsModel();
        customerServiceDetail.vehicleStatus = {
            status: customerIndex % 2 ? "initial Inspection" : "Ready to Deliver",
            time: new Date().toISOString(),
        };

        let data = [];
        for (let i = 0; i < 10; ++i) {
            data.push({
                _id: new mongoose.Types.ObjectId(),
                warrantyExpiryDate: new Date().toISOString(),
                package: services[i]._id,
                rate: 100,
                amt: 100,
                tax: 18,
                qty: 1,
            });
        }

        customerServiceDetail.gst = { gstin: "", bname: "", place: "" };

        customerServiceDetail.payment = { method: "cash", data: "" };
        customerServiceDetail.billStatus = customerIndex % 2 ? "open" : "close";
        customerServiceDetail.isCharged = true;
        customerServiceDetail.billType = "null";
        customerServiceDetail.dateOfDelivery = new Date().toISOString();
        customerServiceDetail.broughtIn = customers[customerIndex]._id;
        customerServiceDetail.billNo = `XBX${customerIndex}-${customerIndex}`;
        customerServiceDetail.vehicleID = vehicles[customerIndex]._id;

        customerServiceDetail.billDetails = {
            additionalCharges: [],
            servicePackageFinal: data,
        };

        customerServiceDetail.save((msg, err) => {
            console.log(err, msg);
        });
    }
}