const BKP = require("mongodb-snapshot");

async function mongoSnap(path, restore = false) {
    const mongo_connector = new BKP.MongoDBDuplexConnector({
        connection: { uri: "mongodb://<>:<>@localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false", dbname: "alder" },
    });
    const localfile_connector = new BKP.LocalFileSystemDuplexConnector({
        connection: { path: path },
    });
    const transferer = restore ? new BKP.MongoTransferer({ source: localfile_connector, targets: [mongo_connector] }) : new BKP.MongoTransferer({ source: mongo_connector, targets: [localfile_connector] });
    for await (const { total, write }
        of transferer) {}
}

mongoSnap("./collections.tar");