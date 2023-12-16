const fs = require("fs");
const path = require("path");
const utils = require("util");
const puppeteer = require("puppeteer");
const hb = require("handlebars");
const readFile = utils.promisify(fs.readFile);
const numWords = require("num-words");

async function getTemplateHTML(basePath) {
    console.log("Loading template file in memory");
    try {
        const invoicePath = path.resolve(basePath + "/template/PDF.html");
        return (await readFile(invoicePath, "utf8")).toString();
    } catch (err) {
        console.log(err);
        return Promise.reject("Could not load html template");
    }
}

async function generatePDF(basePath, fileName, data) {
    return getTemplateHTML(basePath)
        .then(async(res) => {
            // Now we have the html code of our template in res object
            // you can check by logging it on console

            console.log("Compiling the template with handlebars");

            hb.registerHelper("sum", function(lvalue, rvalue, options) {
                lvalue = parseInt(lvalue);
                rvalue = parseInt(rvalue);

                return lvalue + rvalue;
            });
            const isDevelopment = process.env.NODE_ENV !== "production";
            const assetsPath = isDevelopment ? "src/assets/img" : "resources";
            data.imagesBinary = {
                qr: fs.readFileSync(`${assetsPath}/qr-code.png`).toString("base64"),
                logo: fs.readFileSync(`${assetsPath}/logo.png`).toString("base64"),
            };

            const template = hb.compile(res, { strict: true });
            data.numWord = numWords(data.total);
            // we have compile our code with handlebars\
            const result = template(data);
            // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
            const html = result;
            // we are using headless mode
            const browser = await puppeteer.launch({
                //   executablePath: "./node_modules/puppeteer/.local-chromium/win64-884014/chrome-win/chrome.exe",
                executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
                args: ["--no-sandbox"],
                headless: true,
            });

            const page = await browser.newPage();
            // We set the page content as the generated html by handlebars
            await page.setContent(html);
            // We use pdf function to generate the pdf in the same folder as this file.
            await page.pdf({
                path: path.resolve(`${basePath}/generated/PDFBill/${fileName}.pdf`),
                format: "A4",
            });
            await browser.close();
            console.log("PDF generated");
            return { status: true, msg: "CREATE_PDF_SUCCESS" };
        })
        .catch((err) => {
            return { status: false, msg: err };
        });
}

// const billModel = require("../data/db/model/bill");
// require("../data/db/connection/localConnection");
// require("../data/db/model/customer");
// require("../data/db/model/vehicle");
// require("../data/db/model/servicePackage");

// billModel
//     .find({})
//     .populate("vehicleID")
//     .populate("broughtIn")
//     .populate("billDetails.servicePackageFinal.package")
//     .lean({ virtuals: true })
//     .then((doc) => {
//         console.log(doc[0].billDetails.servicePackageFinal);
//         // generatePDF("test", doc[0]);
//     });

module.exports = generatePDF;