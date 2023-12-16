const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
require("../data/db/connection/localConnection");

async function createUser() {
    let username = "";
    let password = "";
    let admin = false;
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.question(`Username [min length 6]: `, (name) => {
        if (name.length < 6) {
            console.log("Invalid username structure !");
            readline.close();
        }
        username = name.trim();
        readline.question(`Password [min length 6]: `, (psswd) => {
            if (psswd.length < 6) {
                console.log("Invalid password structure !");
                readline.close();
            }
            password = bcrypt.hashSync(psswd.trim(), 10);
            readline.question(`Add as Admin? [y/n]: `, (value) => {
                value = value.trim();
                if (!value.includes("y") && !value.includes("n")) {
                    console.log("Invalid admin input !");
                }
                if (value.includes("y")) admin = true;
                readline.close();
            });
        });
    });

    readline.on("close", async function() {
        try {
            const userModel = require("../data/db/model/user");
            let user = new userModel();
            user.username = username;
            user.password = password;
            user.admin = admin;
            await user.save();
            console.log("data saved !");
        } catch (err) {
            console.log(err);
            console.log("data failed to save.");
        }
        process.exit(0);
    });
}
mongoose.connection.on("connected", () => {
    console.log("Connected");
    createUser();
});