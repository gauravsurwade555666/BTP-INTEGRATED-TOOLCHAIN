const cds = require("@sap/cds");
const XLSX = require("xlsx");
const cron = require("node-cron");
const oCfEnv = require("cfenv");
const Util = require("./helper/utils")
const GuidUtil = require("./helper/guidutils");

class CapDMS extends cds.ApplicationService {
    async init() {
        const { RequestSet } = this.entities;
        cron.schedule('*/5 * * * *', async (req) => {
            console.log(">> Schedule Job started at every 2 min", new Date());
            cds.spawn(async (params) => {

                await this.backgroundJob(req);
            })
        });
        this.on('uploadToDMS', async (req) => {
            let db = await cds.connect.to('db')
            const base64Data = req.data.content; // LargeBinary
            const buffer = Buffer.from(base64Data, 'base64');
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);
            const repositoryId = process.env.REPOSITORY_ID;

            //create request
            const sRequestID = GuidUtil.createGuid();

            //upload file to dms
            const oToken = await Util.getSDMToken();
            //create folder
            let rootPath = "";
            const createdFolder = await Util.createFolder(oToken.sdmEndPoint, oToken.token, repositoryId, rootPath, sRequestID);

            //upload ECON file to folder
            if (createdFolder?.data?.succinctProperties["cmis:name"] && createdFolder.status === 201) {
                const parentId = "";
                const path = `/${createdFolder.data.succinctProperties["cmis:name"]}`;
                const createdDocument = await Util.createDocument(req.data, oToken.sdmEndPoint, oToken.token, parentId, repositoryId, path);
                if (createdDocument?.data?.succinctProperties["cmis:objectId"] && createdDocument.status === 201) {
                    //Creating data in HANA DB
                    await db.tx(req).run(INSERT.into('db.Request').entries({
                        RequestID: sRequestID,
                        process: "MAIN"
                    }));
                    //ECON file details saving to HANA DB
                    await db.tx(req).run(INSERT.into('db.FileAttachment').entries({
                        RequestID: sRequestID,
                        process: "MAIN",
                        path: path,
                        repository: repositoryId,
                        fileName: req.data.fileName ? req.data.fileName : "ProcessFile.xlsx",
                        objectId: createdDocument?.data?.succinctProperties["cmis:objectId"],
                        folderId: createdFolder?.data?.succinctProperties["cmis:name"],
                        isSubProcess: false,
                    }));

                    const aEntries = rows.slice(1).map(obj => ({
                        RequestID: sRequestID,
                        processName: obj["__EMPTY_4"],
                        code: obj["Level 4"],
                        isLinkedToCloudALM: false,
                        level: "L4"
                    }));
                    await db.tx(req).run(INSERT.into('db.Process').entries(aEntries));

                }
            } else {
                throw new Error("Could not create folder")
            }
            //create Process in Table

            //return Request ID in response


            // const { tenant, metadata } = req.data;
            // const subdomain = metadata?.subscribedSubdomain;
            // const SDMCredentials = cds.env.requires?.sdm?.credentials;
            // const sdmUrl = SDMCredentials?.uri;
            // const repository = buildRepositoryObject();
            // const token = await fetchSDMToken(subdomain, SDMCredentials.uaa);
            // Example: Update child tables
            // const tx = cds.transaction(req);
            // for (const row of rows) {
            //     await tx.run(
            //         INSERT.into('MyChildTable').entries(row)
            //     );
            // }
            // return { success: true, count: rows.length };
            return {
                "isFileSaved": false,
                "isProcessCreated": false,
                "message": "Hi"
            }
        });


        this.backgroundJob = async (req) => {

            console.log("Hi Backgrond Job started");

        }
        await super.init();
    }
}
module.exports = { CapDMS };