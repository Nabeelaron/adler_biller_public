//random bill number
//bill number XXXX-00999
let randomString = require("randomstring");
let fs = require("fs");

let billNos = {};
const isDevelopment = process.env.NODE_ENV !== "production";
const basePath = isDevelopment ? "src/data" : "resources";
let billNoPath = basePath + "/generated/billNo.json";
let clashPath = basePath + "/generated/billNoClash.json";
let clash = { dupe: 0, digit2: 0, code: 0, digit3: 0 };

function writeBillNoJSONFile() {
    try {
        fs.writeFileSync(billNoPath, JSON.stringify(billNos));
    } catch (err) {
        if (err.errno == -4058) {
            fs.mkdirSync(basePath + "/generated");
            fs.writeFileSync(clashPath, JSON.stringify(clash));
        } else console.log(err);
        writeBillNoJSONFile();
    }
}

function writeClash() {
    fs.writeFileSync(clashPath, JSON.stringify(clash));
}

function readBillNoJSONFile() {
    try {
        billNos = JSON.parse(fs.readFileSync(billNoPath));
        clash = JSON.parse(fs.readFileSync(clashPath));
    } catch (err) {
        writeBillNoJSONFile();
        billNos = JSON.parse(fs.readFileSync(billNoPath));
    }
}

function generateRandomBillNo() {
    /*
                                                            Arguments : None
                                                            Dependency : randomstring
                                                            Returns : Random Uppercase String of format XXXX-9H555 
                                                            where XXXX is any sequence of alphabets ; 9H is combination of Hex ; 555 is a 3digits
                                                            all excludes l,i,0,o,O placed sequentially
                                                            */
    let chars = randomString.generate({
        length: 4,
        readable: true,
        charset: "alphabetic",
        capitalization: "uppercase",
    });

    let digit2 = randomString.generate({
        length: 2,
        charset: "hex",
        capitalization: "uppercase",
    });

    let digit3 = randomString.generate({
        length: 3,
        charset: "numeric",
    });
    return chars + "-" + digit2 + digit3;
}

function storeRandomBillNo(value) {
    value = value.split("-");
    let digit2 = value[1].toString().match(/^[A-Z0-9]{2}?/g);
    let digit3 = value[1].toString().match(/[0-9]{3}$/g);
    let results = findBillNo(value[0], digit2, digit3);
    let insertValue = {};

    if (results[0] && results[1] && results[2]) {
        //found duplicate
        //request for another
        // console.log("clash!!")
        clash.dupe = ++clash.dupe;
        let result = generateRandomBillNo();
        storeRandomBillNo(result);
        return;
    } else if (results[0] && results[1]) {
        //code and digit2 exists but not digit3
        clash.digit2 = ++clash.digit2;
        billNos[value[0]][digit2].push(digit3[0]);
    } else if (results[0]) {
        // code exists but not digit2
        clash.code = ++clash.code;
        insertValue[digit2] = digit3;
        billNos[value[0]] = {
            ...billNos[value[0]],
            ...insertValue,
        };
    } else {
        insertValue[digit2] = digit3;
        billNos[value[0]] = insertValue;
    }

    // console.log(billNos);
    writeBillNoJSONFile();
    writeClash();
    return value;
}

function findBillNo(code, digit2, digit3) {
    readBillNoJSONFile();

    let billNoCode = Object.keys(billNos);

    // console.log(billNoCode, Object.keys(billNos[code]), (billNos[code])[digit2[0]])

    if (billNoCode.includes(code)) {
        if (Object.keys(billNos[code]).includes(digit2[0])) {
            if (billNos[code][digit2[0]].includes(digit3[0])) return [true, true, true];
            else return [true, true, false];
        } else return [true, false, false];
    } else return [false, false, false];
}

function generateBillNo() {
    return storeRandomBillNo(generateRandomBillNo()).join("-");
}

function billExists(billno) {
    billno = billno.split("-");
    let digit2 = billno[1].toString().match(/^[A-Z0-9]{2}?/g);
    let digit3 = billno[1].toString().match(/[0-9]{3}$/g);
    let results = findBillNo(billno[0], digit2, digit3);
    return results[0] && results[1] && results[2] ? true : false;
}

function listBillNo() {
    readBillNoJSONFile();
    return billNos;
}

// function removeBillNo() {}

module.exports = { generateBillNo, billExists, listBillNo };