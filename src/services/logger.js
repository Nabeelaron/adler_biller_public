let winston = require("winston");

const isDevelopment = process.env.NODE_ENV !== "production";
const basePath = isDevelopment ? "src/data" : "resources";

var options = {
    fileInfoLog: {
        level: "info",
        filename: `${basePath}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 10485760, // 10MB
        maxFiles: 25,
        colorize: true,
        format: winston.format.combine(
            winston.format.label({
                label: `INFO`,
            }),
            winston.format.align(),
            winston.format.timestamp({
                format: "DD-MMM-YYYY HH:mm:ss",
            }),
            winston.format.ms({}),
            winston.format.printf((info) => `${info.level}: -- ${info.label} [${info.ms}  ${[info.timestamp]}] : ${info.message} - {  User : ${info.user ? info.user : "System"}}`)
        ),
    },
    fileErrorLog: {
        level: "error",
        filename: `${basePath}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 25,
        colorize: true,
        format: winston.format.combine(
            winston.format.label({
                label: `ERROR`,
            }),
            winston.format.align(),
            winston.format.timestamp({
                format: "DD-MMM-YYYY HH:mm:ss",
            }),
            winston.format.ms({}),
            winston.format.printf((info) => `${info.level}: -- ${info.label} [${info.ms}  ${[info.timestamp]}] : ${info.message} - {  User : ${info.user ? info.user : "System"}}`)
        ),
    },
};

var logger = new winston.createLogger({
    transports: [new winston.transports.File(options.fileInfoLog), new winston.transports.File(options.fileErrorLog)],
    exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;