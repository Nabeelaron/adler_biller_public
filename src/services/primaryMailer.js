const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: "",
    })
);
const fs = require("fs");

transport
    .sendMail({
        from: "",
        to: "",
        subject: "",
        html: fs.readFileSync("../data/template/PDF.html", "utf8").toString(),
        attachments: [{
            filename: "invoice.pdf",
            path: "",
            contentType: "application/pdf",
        }, ],
    })
    .then(([res]) => {
        console.log("Message delivered with code %s %s", res.statusCode, res.statusMessage);
    })
    .catch((err) => {
        console.log("Errors occurred, failed to deliver message");

        if (err.response && err.response.body && err.response.body.errors) {
            err.response.body.errors.forEach((error) => console.log("%s: %s", error.field, error.message));
        } else {
            console.log(err);
        }
    });