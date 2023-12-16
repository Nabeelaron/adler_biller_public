const mongoose = require("mongoose");

function convertToString(inputData) {
    let newData = Object.values(inputData);

    return newData.map((elem) => {
        let i = elem.toString(16);
        return i.length === 2 ? i : "0" + i;
    });
}

function convertToObjectId(uInit8Array) {
    let stringArray = convertToString(uInit8Array).join("");
    return [stringArray, mongoose.Types.ObjectId(stringArray)];
}

module.exports = convertToObjectId;