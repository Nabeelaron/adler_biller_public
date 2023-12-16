const isOnline = require("is-online");

async function detectOffline() {
    try {
        return await isOnline();
    } catch (err) {
        return false;
    }
}

module.exports = { detectOffline };