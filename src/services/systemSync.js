const fs = require("fs");
let filename = "package.json";
let src = `./${filename}`;
let destination = `src/data/static/meta.json`;

let srcData = JSON.parse(fs.readFileSync(src));
let destinationData = JSON.parse(fs.readFileSync(destination));
destinationData.name = srcData.name;
destinationData.version = srcData.version;
destinationData.productName = srcData.productName;
destinationData.author = srcData.author;
fs.writeFileSync(destination, JSON.stringify(destinationData));