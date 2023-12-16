module.exports = {
    pages: {
        index: {
            entry: "src/main.js",
            title: "company",
        },
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: "company  Biller",
                appId: "com.company.biller",
                copyright: "Copyright © year 2021  company ",

                win: {
                    target: ["nsis"],
                    icon: "public/logo_bw.jpg",
                    requestedExecutionLevel: "requireAdministrator",
                },
                nsis: {
                    // installerIcon: "public/logo.png",
                    // uninstallerIcon: "public/logo.png",
                    // uninstallDisplayName: "company Detailing Biller",
                    license: "public/license.txt",
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                },

                // extraResources: [
                //   {
                //     to: "./",
                //     filter: ["*.json"],
                //   },
                // ],
                extraFiles: [{
                        from: "./src/data/",
                        to: "resources",
                        filter: ["**/*"],
                    },
                    {
                        from: "./src/assets/",
                        to: "resources",
                        filter: ["**/*"],
                    },
                ],
            },
        },
    },
};