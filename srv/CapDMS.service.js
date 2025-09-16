const cds = require("@sap/cds");

class ApplicationSrv extends cds.ApplicationService {
    async init() {
        
        await super.init();
    }
}
module.exports = { ApplicationSrv };