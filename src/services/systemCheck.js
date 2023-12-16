const bcrypt = require("bcrypt");
const fs = require("fs");

function verifySystem() {
    let returnValue = {};
    try {
        const systemHash = fs.readFileSync("rsa location").toString();
        const metaKey = "";
        if (bcrypt.compareSync(metaKey, systemHash)) {
            returnValue = { status: true, message: "System verification success" };
        } else throw new Error({ message: "Invalid System key" });
    } catch (err) {
        logger.error(`System check failed ${err}`);
        returnValue = { status: false, message: err };
    }
    return returnValue;
}
module.exports = verifySystem;