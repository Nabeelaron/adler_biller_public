const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
let exec = require("child_process").exec;

const apiData = {
    web: {
        client_id: "",
        project_id: "",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "",
        redirect_uris: ["https://developers.google.com/oauthplayground"],
        refreshToken: ""
    },
};

async function saveToDrive(finalPath, filename) {
    logger.info("saving data to cloud...");

    function createDriveClient(clientId, clientSecret, redirectUri, refreshToken) {
        const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        client.setCredentials({ refresh_token: refreshToken });

        return google.drive({
            version: "v3",
            auth: client,
        });
    }

    const googleDriveService = createDriveClient(apiData.web.client_id, apiData.web.client_secret, apiData.web.redirect_uris[0], apiData.web.refreshToken);
    logger.info(finalPath);
    logger.info(filename);
    if (!fs.existsSync(finalPath)) {
        throw new Error("File not found!");
    }
    let driveFolderId = ""
    let status = googleDriveService.files.create({
        requestBody: {
            name: filename,
            mimeType: "application/x-7z-compressed",
            parents: [driveFolderId],
        },
        media: {
            mimeType: "text/plain",
            body: fs.createReadStream(finalPath),
        },
    });
    logger.info("GCloud : done", status);
}

async function getBackup(basePath) {
    logger.info("Starting backup process...");
    const backupName = path.resolve(__dirname, `..\\${basePath}\\db\\backups\\DB_BCK_${new Date().toLocaleDateString().replace(/\//g, "_")}.7z`);
    if (await runDump(backupName, basePath)) return { status: true, filename: `DB_BCK_${new Date().toLocaleDateString().replace(/\//g, "_")}.7z`, path: backupName };
    return { status: false };
}

async function runDump(file, basePath) {
    let status = await new Promise(function(resolve, reject) {
                exec(`${path.resolve(__dirname, `..\\${basePath}\\db\\src\\bin\\mongodump --archive=${file}`)} `, function (err) {
      logger.info(err, file, basePath, path.resolve(__dirname, `..\\${basePath}\\db\\src\\bin\\mongodump --archive=${file}`));
      if (err) resolve(false);
      resolve(true);
    });
  });
  logger.info(`Backup process ${status ? "successful" : "failed"}`);
  return status;
}
module.exports = { saveToDrive, getBackup };