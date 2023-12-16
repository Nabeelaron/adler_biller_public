const apiData = {
    web: {
        client_id: "",
        project_id: "company-biller",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "",
        redirect_uris: ["https://developers.google.com/oauthplayground"],
        refreshToken: "",
    },
};
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
(async() => {
    const googleDriveService = createDriveClient(apiData.web.client_id, apiData.web.client_secret, apiData.web.redirect_uris[0], apiData.web.refreshToken);
    const finalPath = path.resolve(__dirname, "./test.txt");
    const folderName = "Picture";

    if (!fs.existsSync(finalPath)) {
        throw new Error("File not found!");
    }
    let folder = { data: { id: "" } }; // await createFolder(folderName, googleDriveService);
    console.log(folder);
    return googleDriveService.files.create({
        requestBody: {
            name: "test.json",
            mimeType: "text/plain",
            parents: folder.data.id ? [folder.data.id] : [],
        },
        media: {
            mimeType: "text/plain",
            body: fs.createReadStream(finalPath),
        },
    });
})();

function createFolder(folderName, driveClient) {
    return driveClient.files.create({
        resource: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id, name",
    });
}

function createDriveClient(clientId, clientSecret, redirectUri, refreshToken) {
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    client.setCredentials({ refresh_token: refreshToken });

    return google.drive({
        version: "v3",
        auth: client,
    });
}