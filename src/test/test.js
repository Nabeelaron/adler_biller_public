// var cron = require("node-cron");

// cron
//     .schedule(
//         "0 6 * * *",
//         () => {
//             console.log("Running a job at 01:00 at America/Sao_Paulo timezone");
//         }, {
//             scheduled: true,
//         }
//     )
//     .start();

var exec = require("child_process").exec;

var fun = function() {
    console.log("fun() start");
    exec(" ..\\data\\db\\src\\bin\\mongod  --dbpath=..\\data\\db\\src\\data ", function(err, data) {
        console.log(err);
        console.log(data.toString());
    });
};
fun();