let exec = require("child_process").exec;
const path = require("path");

async function dbRunner(basePath) {
    console.log("Starting DB...", basePath);
    logger.info(`Starting DB... ${__dirname}`);
    let dbProcess = await exec(`${path.resolve(__dirname, `..\\${basePath}\\db\\src\\bin\\mongod`)}  --dbpath=${path.resolve(__dirname, `..\\${basePath}\\db\\src\\data`)} `, function (err, data) {
    console.log(err, data);
    logger.info(path.resolve(__dirname, `..\\${basePath}\\db\\src\\bin\\mongod`));
    logger.info(err);
    logger.info(data.toString());
    logger.info("Done.");
  });

  return dbProcess;
}

// (async() => await dbRunner())();
module.exports = { dbRunner };