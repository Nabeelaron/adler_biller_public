"use strict";

import { app, protocol, BrowserWindow, ipcMain, globalShortcut } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
// const cron = require("node-cron");
const isDevelopment = process.env.NODE_ENV !== "production";
const basePath = isDevelopment ? "src/data" : "resources";
let win;
import { dbRunner } from "./services/dbRunner";
import { saveToDrive, getBackup } from "./services/backup";

let dbProcess;
global.logger = require("./services/logger");
global.user = "System";

logger.info(`Running app in ${process.env.NODE_ENV} mode`);
import "./data/db/connection/localConnection";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

process.on("uncaughtException", (err) => {
    logger.error({ message: err });
});

process.on("unhandledRejection", (err) => {
    logger.error({ message: err });
});

async function createWindow() {
    try {
        dbProcess = await dbRunner(isDevelopment ? "src/data" : "../resources");
    } catch (err) {
        console.log("DB already running");
    }
    logger.info(`DB instance start with pid : ${dbProcess.pid}`);
    let backupStatus = await getBackup(isDevelopment ? "src/data" : "../resources");
    // logger.info(JSON.stringify(backupStatus));
    // cron
    //     .schedule(
    //         "*/1 * * * *",
    //         () => {
    //             logger.info("Running scheduled Task : Uploading backup");
    //             saveToDrive(backupStatus.path, backupStatus.filename);
    //         }, {
    //             scheduled: true,
    //         }
    //     )
    //     .start();
    // Create the browser window.
    win = new BrowserWindow({
        title: "De company  Biller",
        show: false,
        width: 1200,
        height: 900,
        backgroundColor: "#000",
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    win.setMenuBarVisibility(false);
    win.once("ready-to-show", () => {
        let systemCheck = verifySystem();
        if (systemCheck.status) {
            logger.info(systemCheck.message);
            win.show();
        } else logger.error(systemCheck.message);
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    } else {
        createProtocol("app");

        // Load the index.html when not in development
        win.loadURL("app://./index.html");
        openDevTools();
    }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q

    if (process.platform !== "darwin") {
        logger.info("Application exit");
        app.quit();
    }
});
if (!isDevelopment) {
    app.on("browser-window-focus", function() {
        globalShortcut.register("CommandOrControl+R", () => {
            console.log("CommandOrControl+R is pressed: Shortcut Disabled");
        });
        globalShortcut.register("F5", () => {
            console.log("F5 is pressed: Shortcut Disabled");
        });
    });

    app.on("browser-window-blur", function() {
        globalShortcut.unregister("CommandOrControl+R");
        globalShortcut.unregister("F5");
    });
}

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async() => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}

// Application business logic----------------------------------------------------------------------------------------------------------------

import customerModel from "./data/db/model/customer";
import vehiclesModel from "./data/db/model/vehicle";
import servicePackagesModel from "./data/db/model/servicePackage";
import billModel from "./data/db/model/bill";
import userModel from "./data/db/model/user";

import convertToObjectId from "./modules/uint8ArrayTo";
import generatePDF from "./services/PDFGenerator";
import mailer from "./services/Mailer";
import verifySystem from "./services/systemCheck";

const fs = require("fs");
const bcrypt = require("bcrypt");

ipcMain.on("create-customer", async(event, data) => {
    logger.info({ message: `Customer create [${data.name.firstName} ${data.name.middleName}  ${data.name.lastName}]`, user });
    let customer = new customerModel(data);

    try {
        await customer.save();
        let res = await mailer.sendAccountCreation({ fullName: `${data.name.firstName} ${data.name.middleName}  ${data.name.lastName}`, email: data.email, phone: data.phoneNumber, createdAt: new Date() }, data.email);
        logger.info(`Customer create [${data.name.firstName} ${data.name.middleName}  ${data.name.lastName}] done.`);
        event.returnValue = {
            emailStatus: res.status,
            status: true,
            message: "Customer created",
            code: "SUCCESS_200",
        };
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Customer creation failed - Duplicate user found in Database`, user });
            event.returnValue = {
                status: false,
                message: "Duplicate user found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Customer creation failed - Unknown DB error  ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown DB error" + err,
                code: "ERR_DB",
            };
        }
    }
});

ipcMain.on("create-vehicle", async(event, data) => {
    logger.info({ message: `Vehicle create  ${data.vehicleDetails.licensePlateNumber}`, user });
    data.owner = convertToObjectId(data.owner.id)[1];
    data.broughtIn = [data.owner];
    let vehicle = new vehiclesModel(data);

    let result = null;
    try {
        result = await vehicle.save();
        logger.info({ message: `Vehicle creation done`, user });
        event.returnValue = {
            status: true,
            message: "Vehicle created",
            code: "SUCCESS_200",
        };
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Vehicle creation failed - Duplicate vehicle found in Database`, user });
            event.returnValue = {
                status: false,
                message: "Duplicate vehicle found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Vehicle creation failed - Unknown DB error ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown DB error" + err,
                code: "ERR_DB",
            };
        }
    }
});

ipcMain.on("create-bill", async(event, data) => {
    logger.info({ message: `Bill create  ${data.billNo}`, user });
    try {
        data.broughtIn = convertToObjectId(data.broughtIn.id)[1];
        data.vehicleID = convertToObjectId(data.vehicleID.id)[1];
        for (let service of data.billDetails.servicePackageFinal) {
            service.package = convertToObjectId(service.package.id)[1];
        }

        let bill = new billModel(data);
        let result = null;

        result = await bill.save();
        let res = await mailer.sendTracking({ vehicle: data.vehicleName, billNo: data.billNo }, data.email);

        logger.info({ message: `Vehicle creation done`, user });
        event.returnValue = {
            emailStatus: res.status,
            status: true,
            message: "Vehicle created",
            code: "SUCCESS_200",
        };
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Vehicle creation failed - Duplicate vehicle found in Database`, user });
            event.returnValue = {
                status: false,
                message: "Duplicate Bill found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Vehicle creation failed - Unknown DB error ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown DB error" + err,
                code: "ERR_DB",
            };
        }
    }
});

ipcMain.on("find", async(event, data) => {
    try {
        let res = await vehiclesModel.findOne({ "vehicleDetails.licensePlateNumber": data.licensePlateNumber }).populate("broughtIn").lean({ virtuals: true });

        if (!res) throw new Error();
        event.returnValue = { status: true, message: res, code: 200 };
    } catch (err) {
        logger.error({ message: `Searching  ${data.type}-${data.licensePlateNumber} failed ${err}`, user });
        event.returnValue = { status: false, message: err, code: 500 };
    }
});

ipcMain.on("authenticate", async(event, data) => {
    try {
        logger.info(`Authenticating user : ${data.username}`);
        let res = await userModel.findOne({ username: data.username }).lean({ virtuals: true });

        if (!res || res.length == 0 || !bcrypt.compareSync(data.password, res.password)) throw new Error();

        global.user = data.username;
        logger.info(`User ${data.username} authenticated`);
        event.returnValue = { status: true, message: res, code: 200 };
    } catch (err) {
        logger.error("User authentication failed");
        logger.error(err);
        event.returnValue = { status: false, message: err, code: 500 };
    }
});

ipcMain.on("fetch", async(event, data) => {
    logger.info({ message: `Fetching details  {${data.type}}`, user });
    let res = null;
    try {
        switch (data.type) {
            case "customer":
                {
                    res = await customerModel.find({}).lean({ virtuals: true });
                    break;
                }

            case "vehicle":
                {
                    res = await vehiclesModel.find({ owner: convertToObjectId(data.customerId.id)[1] }).lean({ virtuals: true });
                    break;
                }
            case "service":
                {
                    res = await servicePackagesModel.find({}).lean({ virtuals: true });
                    break;
                }
            case "service-by-id":
                {
                    res = await servicePackagesModel
                    .findById(convertToObjectId(data.id.id)[1])
                    .populate({
                        path: "billDetails.servicePackageFinal",
                        populate: { path: "package" },
                    })
                    .lean({ virtuals: true });
                    break;
                }
            case "bill-by-open":
                {
                    res = await billModel.find({ billStatus: "open" }).populate("vehicleID").populate("billDetails.servicePackageFinal.package").populate("broughtIn").lean({ virtuals: true });
                    break;
                }
            case "bill-by-open-vehicle":
                {
                    res = await billModel.find({ billStatus: "open" }).populate("vehicleID").lean({ virtuals: true });
                    res = res.some((bill) => {
                        return bill.vehicleID.vehicleDetails.licensePlateNumber == data.licensePlateNumber;
                    });
                    break;
                }
            case "bill-all":
                {
                    res = await billModel.find({}).populate("vehicleID").populate("broughtIn").populate("billDetails.servicePackageFinal.package").lean({ virtuals: true });
                    break;
                }
            case "bill-by-open-close":
                {
                    res = {
                        close: await billModel.find({ "vehicleStatus.status": "Ready to Deliver" }).populate("vehicleID").populate("broughtIn").populate("billDetails.servicePackageFinal.package").lean({ virtuals: true }),
                        edit: await billModel
                            .find({
                                $and: [{ "vehicleStatus.status": { $ne: "Ready to Deliver" } }, { "vehicleStatus.status": { $ne: "Delivered" } }],
                            })
                            .populate("vehicleID")
                            .populate("billDetails.servicePackageFinal.package")
                            .lean({ virtuals: true }),
                    };
                    break;
                }
            default:
                {
                    res = [];
                }
        }

        logger.info({ message: `Fetching details  {${data.type}} done`, user });
        event.returnValue = { status: true, message: res, code: 200 };
    } catch (err) {
        logger.error({ message: `Fetching details  failed - {${err}}`, user });
        event.returnValue = { status: false, message: err, code: 500 };
    }
});

ipcMain.on("package", async(event, data) => {
    logger.info({ message: `Package  {${data.type}}-ing`, user });

    try {
        let result = null;
        switch (data.type) {
            case "update":
                {
                    delete data.data._id;
                    delete data.data.createdAt;
                    delete data.data.updatedAt;
                    result = await servicePackagesModel.findOneAndUpdate({ _id: convertToObjectId(data.id.id)[1] }, {...data.data }, { upsert: true });
                    break;
                }
            case "save":
                {
                    result = new servicePackagesModel(data.data);
                    result = await result.save();
                    break;
                }
            case "delete":
                {
                    result = await servicePackagesModel.findOneAndDelete({ _id: convertToObjectId(data.id.id)[1] });
                    break;
                }
        }
        logger.info({ message: `Package  {${data.type}}-ing done`, user });
        event.returnValue = {
            status: true,
            message: JSON.parse(JSON.stringify(result)),
            code: "SUCCESS_200",
        };
    } catch (err) {
        logger.error({ message: `Package  {${data.type}}-ing failed :  Unknown DB error ${err}`, user });
        event.returnValue = {
            status: false,
            message: "Unknown DB error" + err,
            code: "ERR_DB",
        };
    }
});

ipcMain.on("bill-stats", async(event, data) => {
    try {
        let result = {
            total: 0,
            pending: { open: 0, close: 0 },
            today: { open: 0, close: 0 },
        };
        let bills = await billModel.find({}).lean();
        for (let bill of bills) {
            ++result.total;
            if (bill.billStatus == "open") {
                ++result.pending.open;

                if (new Date(bill.createdAt).toLocaleDateString().includes(new Date().toLocaleDateString())) ++result.today.open;
            } else {
                ++result.pending.close;
                if (new Date(bill.createdAt).toLocaleDateString().includes(new Date().toLocaleDateString())) ++result.today.close;
            }
        }

        logger.info({ message: `Bill status fetch done`, user });
        event.returnValue = {
            status: true,
            message: result,
            code: "SUCCESS_200",
        };
    } catch (err) {
        logger.error({ message: `Bill status fetch failed :  Unknown DB error ${err}`, user });
        event.returnValue = {
            status: false,
            message: "Unknown DB error" + err,
            code: "ERR_DB",
        };
    }
});

ipcMain.on("update-customer", async(event, data) => {
    try {
        await customerModel.findOneAndUpdate({ _id: convertToObjectId(data.id.id)[1] }, data);
        logger.info({ message: `Customer ${data.name.firstName} ${data.name.middleName} ${data.name.lastName} Update done `, user });
        event.returnValue = {
            status: true,
            message: "Updated",
            code: "SUCCESS_200",
        };
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Customer ${data.name.firstName} ${data.name.middleName} ${data.name.lastName} Update failed :  Duplicate user found in Database`, user });
            event.returnValue = {
                status: false,
                message: "Duplicate user found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Customer ${data.name.firstName} ${data.name.middleName} ${data.name.lastName} Update failed :  Unknown DB error ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown DB error : " + err,
                code: "ERR_DB",
            };
        }
    }
});

ipcMain.on("update-vehicle-status", async(event, data) => {
    try {
        await billModel.findOneAndUpdate({ _id: convertToObjectId(data.id.id)[1] }, { "vehicleStatus.status": data.status, "vehicleStatus.time": new Date() });

        logger.info({ message: `Vehicle status [${data.status}] update done`, user });
        event.returnValue = {
            emailStatus: data.status == "Ready to Deliver" ? await mailer.sendDelivery({ licensePlateNumber: data.licensePlateNumber }, data.email) : false,
            status: true,
            message: "Bill Updated",
            code: "SUCCESS_200",
        };
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Vehicle status update failed :  Duplicate user found in Database`, user });

            event.returnValue = {
                status: false,
                message: "Duplicate user found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Vehicle status update failed :  Unknown DB error ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown DB error" + err,
                code: "ERR_DB",
            };
        }
    }
});

ipcMain.on("update-bill", async(event, data) => {
    try {
        data.serviceCart = data.serviceCart.map(function(i) {
            i.package._id = convertToObjectId(i.package._id.id)[1];
            return i;
        });
        data.additionalCharges = data.additionalCharges.map(function(i) {
            if (i._id) i._id = convertToObjectId(i._id.id)[1];
            return i;
        });
        await billModel.findOneAndUpdate({ _id: convertToObjectId(data.id.id)[1] }, { "billDetails.additionalCharges": data.additionalCharges, "billDetails.servicePackageFinal": data.serviceCart });
        logger.info({ message: `Bill update done`, user });
        event.returnValue = {
            status: true,
            message: "Bill Updated",
            code: "SUCCESS_200",
        };
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Bill update failed :  Duplicate user found in Database`, user });
            event.returnValue = {
                status: false,
                message: "Duplicate user found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Bill update failed :  Unknown DB error ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown DB error" + err,
                code: "ERR_DB",
            };
        }
    }
});

ipcMain.on("close-bill", async(event, data) => {
    try {
        let result = await billModel.findOneAndUpdate({ _id: convertToObjectId(data.id.id)[1] }, {
            billStatus: "close",
            "payment.method": data.payment.paymentMethod,
            "payment.data": data.payment.data,
            "vehicleStatus.status": "Delivered",
            gst: { gstin: data.gst.gstin, bname: data.gst.bname, place: data.gst.place },
        });
        let msg = await preprocessAndGeneratePDF(result.billNo);

        let returnObj = {};
        if (msg.status) {
            returnObj = { billStatus: true, PDFstatus: true, message: "PDF Generated", code: "SUCCESS_200" };
        } else
            returnObj = {
                billStatus: true,
                PDFstatus: false,
                message: msg.msg,
                code: "ERR_GEN_PDF",
            };
        logger.info({ message: `Bill close done ${JSON.stringify(returnObj)}`, user });
        event.returnValue = returnObj;
    } catch (err) {
        if (err.code == 11000) {
            logger.error({ message: `Bill close failed : Duplicate user found in Database`, user });
            event.returnValue = {
                status: false,
                message: "Duplicate user found in Database",
                code: "ERR_DB",
            };
        } else {
            logger.error({ message: `Bill close failed :  Unknown error ${err}`, user });
            event.returnValue = {
                status: false,
                message: "Unknown  error" + err,
                code: "ERR_DB",
            };
        }
    }
});

async function preprocessAndGeneratePDF(billNo) {
    try {
        let data = (await billModel.find({ billNo }).populate("vehicleID").populate("broughtIn").populate("billDetails.servicePackageFinal.package").lean({ virtuals: true }))[0];
        data.dateOfDelivery = data.invoiceDate = new Date().toLocaleDateString();

        data.CGST = 0;
        data.SGST = 0;

        data.subtotal = 0;
        data.total = 0;

        data.billDetails.servicePackageFinal.every(function(element) {
            data.CGST += Number(element.tax);
            data.SGST += Number(element.tax);
            data.total += Number(element.amt);
            return true;
        });

        data.billDetails.additionalCharges.every(function(element) {
            data.CGST += Number(element.tax);
            data.SGST += Number(element.tax);
            data.total += Number(element.amt);
            return true;
        });

        data.CGST = (Number(data.CGST) / 2).toFixed(2);
        data.SGST = (Number(data.SGST) / 2).toFixed(2);
        data.subtotal = data.total.toFixed(2);
        data.createdAt = new Date(data.createdAt).toLocaleDateString();
        let res = await generatePDF(basePath, data.billNo, data);
        if (res.status) {
            logger.info({ message: `preprocessAndGeneratePDF done`, user });
            return { status: true };
        } else throw new Error(res.msg);
    } catch (err) {
        logger.error({ message: `preprocessAndGeneratePDF failed :  Unknown error ${err}`, user });
        return { status: false, msg: err };
    }
}

async function PDF_exists(billNo) {
    let files = fs.readdirSync(path.resolve(`${basePath}/generated/PDFBill/`));
    if (files.includes(billNo)) return true;
    else return false;
}

ipcMain.on("generate-pdf", async(event, data) => {
    if (!(await preprocessAndGeneratePDF(data.billNo)).status)
        event.returnValue = {
            status: false,
            msg: "PDF GENERATION FAILED, try after sometime",
        };
    else
        event.returnValue = {
            status: true,
        };
});

ipcMain.on("email-invoice", async(event, data) => {
    try {
        if (!PDF_exists(data.billNo))
            if (!(await preprocessAndGeneratePDF(data.billNo)).status)
                event.returnValue = {
                    status: false,
                    msg: "PDF GENERATION FAILED, try after sometime",
                };

        let res = await mailer.sendInvoice({ type: data.type, billNo: data.billNo }, data.email);
        if (res.status) {
            logger.info({ message: `Email invoice done`, user });
            event.returnValue = {
                status: true,
            };
        } else {
            logger.error({ message: `Email invoice failed : ${res.err}`, user });
            event.returnValue = {
                status: false,
                msg: res.err,
            };
        }
    } catch (err) {
        logger.error({ message: `Email invoice failed : Unknown error ${err}`, user });
        event.returnValue = {
            status: false,
            msg: "Unknown  error",
        };
    }
});