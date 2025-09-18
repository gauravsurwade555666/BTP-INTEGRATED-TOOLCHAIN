const oCds = require("@sap/cds");
const oProxy = require("@cap-js-community/odata-v2-adapter");

oCds.on("bootstrap", (oApp) => oApp.use(oProxy({
    returnComplexNested: false,
    returnPrimitivePlain: false
})));
module.exports = oCds.server;