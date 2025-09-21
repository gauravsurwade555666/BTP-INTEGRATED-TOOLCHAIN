const cds = require("@sap/cds");
const XLSX = require("xlsx");
const cron = require("node-cron");


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
            const base64Data = req.data.content; // LargeBinary
            const buffer = Buffer.from(base64Data, 'base64');
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            // // Example: Update child tables
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
            const db = await cds.connect.to("db");
            console.log("Hi Backgrond Job started");
            const aResults = await db.tx(req).run(SELECT.from(RequestSet));
            console.log(aResults);
        }
        await super.init();
    }
}
module.exports = { CapDMS };