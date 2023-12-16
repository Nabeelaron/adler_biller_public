const mongoose = require("mongoose");
let url = "";
console.log("Establishing connection to locale DB");
url = `mongodb://localhost:27017/alder`;

const dbOptions = {
    autoReconnect: true,
    reconnectTries: 1000,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useFindAndModify: false,
};

let connect = () => {
    mongoose
        .connect(url, dbOptions)
        .then()
        .catch((err) => {
            console.log("Mongo Error : ", err.name);
            setTimeout(connect, 2000);
        });
};

connect();

mongoose.connection.on("error", () => {
    // store.set("DB_CONN_STAT", "error");
    console.log("Connection Error");
    connect();
});
mongoose.connection.on("connected", () => {
    // store.set("DB_CONN_STAT", "connected");
    console.log("Connected");
});

mongoose.connection.on("disconnected", () => {
    // store.set("DB_CONN_STAT", "disconnected");
    console.log("Connection disconnected  ");
    connect();
});