"use strict";
const nodemailer = require("nodemailer");
const hb = require("handlebars");
const path = require("path");
const fs = require("fs");

let templatePath;
if (process.env.NODE_ENV !== "production") templatePath = "src/data/template/";
else templatePath = "resources/template/";

let transporter = nodemailer.createTransport({
    host: process.env.VUE_APP_SMTP_HOST,
    port: process.env.VUE_APP_SMTP_HOST_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.VUE_APP_MAIL_USERNAME,
        pass: process.env.VUE_APP_MAIL_PASSWORD,
    },
});

async function verifyConnection() {
    // verify connection configuration
    return await transporter.verify();
}

async function sendMail(content) {
    if (!verifyConnection()) throw new Error("connection error");

    let info = await transporter.sendMail(content); //disable for testing
    logger.info({ message: `Email sent ` });
    console.log("Message sent: %s", info.messageId);
    return true;
}

function getHTML(data, templatePath) {
    let filePath;
    try {
        filePath = path.resolve(templatePath);
        return hb.compile(fs.readFileSync(filePath, "utf8").toString(), { strict: true })(data);
    } catch (err) {
        throw new Error(err);
    }
}

function sendAccountCreation(data, email) {
    try {
        let content = {
            from: process.env.VUE_APP_MAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: "Account Creation", // Subject line
            text: "Your account has been created. Welcome to De company ", // plain text body
            html: getHTML(data, templatePath + "customerCreate.html"),
            attachments: [{
                filename: "logo.png",
                path: path.resolve(templatePath, "../../", `assets/img/logo.png`),
                cid: "logo",
            }, ],
        };
        logger.info({ message: `Email [Account Creation] sending to ${email}... ` });

        sendMail(content);
        return { status: true };
    } catch (err) {
        logger.error({ message: `Email [Account Creation] sending failed ${err}. ` });
        return { status: false, err };
    }
}

function sendTracking(data, email) {
    return { status: false }; //disable tracking
    try {
        let content = {
            from: process.env.VUE_APP_MAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: "Track Status", // Subject line
            text: "Status Tracking", // plain text body
            html: getHTML(data, templatePath + "tracking.html"),
        };
        sendMail(content);
        return { status: true };
    } catch (err) {
        console.log(err);
        return { status: false, err };
    }
}

function sendDelivery(data, email) {
    try {
        let content = {
            from: process.env.VUE_APP_MAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: "Ready to take delivery", // Subject line
            text: "Ready to take delivery.", // plain text body
            html: getHTML(data, templatePath + "vehicleDelivery.html"),
            attachments: [{
                filename: "logo.png",
                path: path.resolve(templatePath, "../../", `assets/img/logo.png`),
                cid: "logo",
            }, ],
        };
        logger.info({ message: `Email [Ready to take delivery] sending to ${email}... ` });
        sendMail(content);
        return { status: true };
    } catch (err) {
        logger.error({ message: `Email [Ready to take delivery] sending failed ${err}. ` });
        return { status: false, err };
    }
}

async function sendInvoice(data, email) {
    try {
        let content = {
            from: process.env.VUE_APP_MAIL_USERNAME, // sender address
            to: email, // list of receivers
            subject: "Invoice", // Subject line
            text: "Invoice, PFA", // plain text body
            html: getHTML(data, templatePath + "invoiceInfo.html"),
            attachments: [{
                    filename: "invoice.pdf",
                    path: path.resolve(templatePath, "..", `generated/PDFBill/${data.billNo}.pdf`),
                    contentType: "application/pdf",
                },
                {
                    filename: "logo.png",
                    path: path.resolve(templatePath, "../../", `assets/img/logo.png`),
                    cid: "logo",
                },
            ],
        };
        logger.info({ message: `Email [Invoice] sending to ${email} ... ` });
        await sendMail(content);
        return { status: true };
    } catch (err) {
        logger.error({ message: `Email [Invoice] sending failed ${err}. ` });
        return { status: false, err };
    }
}

module.exports = { sendAccountCreation, sendDelivery, sendInvoice, sendTracking };