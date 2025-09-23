const cds = require('@sap/cds');
const xssec = require("@sap/xssec");
const axios = require('axios');
const FormData = require("form-data");
const oCfEnv = require("cfenv");
const Util = {

    getSDMToken: async () => {
        let oAppServices;
        if (process.env?.LOCAL) {
            oAppServices = oCfEnv.getAppEnv().getServices();
        } else {
            oAppServices = Util.getCfEnvLocal();
        }

        if (oAppServices["sdm-di-instance"]) {
            const URL = oAppServices["sdm-di-instance"]?.credentials?.endpoints?.ecmservice?.url;
            const clientID = oAppServices["sdm-di-instance"]?.credentials?.uaa?.clientid;
            const clientSecret = oAppServices["sdm-di-instance"]?.credentials?.uaa?.clientsecret;
            const AuthURL = oAppServices["sdm-di-instance"]?.credentials?.uaa?.url;
            if (clientID && clientSecret && AuthURL) {
                try {
                    const sTokenURL = `${AuthURL}/oauth/token?grant_type=client_credentials`
                    const oTokenResponse = await axios({
                        method: "GET",
                        url: sTokenURL,
                        data: {},
                        headers: {
                            "content-type": "application/json"
                        },
                        auth: {
                            username: clientID,
                            password: clientSecret
                        }
                    });

                    if (oTokenResponse) {

                        return {
                            "token": oTokenResponse.data["access_token"],
                            "sdmEndPoint": URL
                        };
                    } else {
                        throw new Error("util.js:fetchSDMToken:Could not fetch token")
                    }
                } catch (oError) {

                    throw new Error("util.js:fetchSDMToken:Could not fetch token")
                }
            } else {
                throw new Error("Could not acccess sdm-di-instance service ")
            }
        }
    },

    createFolder: async (sdmEndpoint, token, repositoryId, path, folderName) => {

        const folderCreateURL = sdmEndpoint + "browser/" + repositoryId + "/root" + path;
        const formData = new FormData();
        formData.append("cmisaction", "createFolder");
        formData.append("propertyId[0]", "cmis:name");
        formData.append("propertyValue[0]", folderName);
        formData.append("propertyId[1]", "cmis:objectTypeId");
        formData.append("propertyValue[1]", "cmis:folder");
        formData.append("succinct", "true");

        let headers = formData.getHeaders();
        headers["Authorization"] = "Bearer " + token;
        const config = {
            headers: headers,
        };
        return await Util.updateServerRequest(folderCreateURL, formData, config);
    },
    createDocument: async (data, sdmEndpoint, token, parentId, repositoryId, path) => {
        const buffer = Buffer.from(data.content, 'base64');
        const documentCreateURL =
            sdmEndpoint + "browser/" + repositoryId + "/root" + path;
        const formData = new FormData();
        formData.append("cmisaction", "createDocument");
        // formData.append("objectId", parentId);
        formData.append("propertyId[0]", "cmis:name");
        formData.append("propertyValue[0]", data.fileName ? data.fileName : "ProcessFile.xlsx");
        formData.append("propertyId[1]", "cmis:objectTypeId");
        formData.append("propertyValue[1]", "cmis:document");
        formData.append("succinct", "true");
        formData.append("includeAllowableActions", "true");

        formData.append("filename", buffer, {
            // contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            name: "file",
            filename: data.fileName ? data.fileName : "ProcessFile.xlsx"
        });

        let headers = formData.getHeaders();
        headers["Authorization"] = "Bearer " + token;
        const config = {
            headers: headers,
        };
        const response = await Util.updateServerRequest(
            documentCreateURL,
            formData,
            config
        );
        return response;
    },
    updateServerRequest: async (url, formData, config) => {
        try {
            const result = await axios.post(url, formData, config);
            return result;
        } catch (error) {
            return error;
        }
    },
    getCfEnvLocal: () => {
        return {

            "sdm-di-instance": {
                label: "sdm",
                provider: null,
                plan: "free",
                name: "sdm-di-instance",
                tags: [
                    "sdm",
                ],
                instance_guid: "489399d4-fbf9-4a85-b648-45765c8f4b98",
                instance_name: "sdm-di-instance",
                binding_guid: "b86bd800-56ca-435c-9b5a-8c8779884eca",
                binding_name: null,
                credentials: {

                    "endpoints": {
                        "aibridgeservice": {
                            "url": "https://sdm-ai-bridge.cfapps.us10.hana.ondemand.com"
                        },
                        "ecmservice": {
                            "url": "https://api-sdm-di.cfapps.us10.hana.ondemand.com/",
                            "timeout": 900000
                        },
                        "migrationservice": {
                            "url": "https://sdm-migration.cfapps.us10.hana.ondemand.com"
                        }
                    },
                    "html5-apps-repo": {
                        "app_host_id": "9571327e-cbde-41cd-ac47-dd32c4591b16"
                    },
                    "saasregistryenabled": true,
                    "sap.cloud.service": "com.sap.ecm.reuse",
                    "uaa": {
                        "clientid": "sb-489399d4-fbf9-4a85-b648-45765c8f4b98!b504205|sdm-di-DocumentManagement-sdm_integration!b6332",
                        "clientsecret": "0e0ccf87-87e1-456b-9e7b-e1eab3e6b8c4$rawVKH559KUTj2ixXse6qd62i0oRjCxkiHm4dlgPgXQ=",
                        "url": "https://sap-integrated-toolchain-l7fe6os2.authentication.us10.hana.ondemand.com",
                        "identityzone": "sap-integrated-toolchain-l7fe6os2",
                        "identityzoneid": "6d1e7228-caa7-47d8-8e6c-7249a75fc25c",
                        "tenantid": "6d1e7228-caa7-47d8-8e6c-7249a75fc25c",
                        "tenantmode": "dedicated",
                        "sburl": "https://internal-xsuaa.authentication.us10.hana.ondemand.com",
                        "apiurl": "https://api.authentication.us10.hana.ondemand.com",
                        "verificationkey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzxuPWJDXeUYc7ZvuuX59\n+F0sw4AH495l8r/m9epXIITC2O9+WYraOTfcPDtFSy70T88JjKuyVa7pzn9Uojmj\n4VAI7Sr1OBUqIafO1Z2aaChU5kin8KHBdErgLaK5pXA4anJAkm9yP7SSSswgXEAg\nlm2mOBVYFjyVmbSvbawHAdP1sxRSba4gi5sstyWF6wr9L0i7WjgzEB3ERw5XK67w\nFmKsRXJwofKpSlpvCxWS/zn00ptKojZh6imrnAXlUel2Dm/EpZ5rRQu74ZjlGVwq\nlMwYJYef5jQkvTZNHXg29ZtXS6/HivfBO7EZ0mCy5Z/HVQZiA8G07jLhNuuFZAi6\nuQIDAQAB\n-----END PUBLIC KEY-----",
                        "xsappname": "489399d4-fbf9-4a85-b648-45765c8f4b98!b504205|sdm-di-DocumentManagement-sdm_integration!b6332",
                        "subaccountid": "6d1e7228-caa7-47d8-8e6c-7249a75fc25c",
                        "uaadomain": "authentication.us10.hana.ondemand.com",
                        "zoneid": "6d1e7228-caa7-47d8-8e6c-7249a75fc25c",
                        "credential-type": "binding-secret",
                        "serviceInstanceId": "489399d4-fbf9-4a85-b648-45765c8f4b98"
                    },
                    "uri": "https://api-sdm-di.cfapps.us10.hana.ondemand.com/"
                }
            },
            "BTP-INTEGRATED-TOOLCHAIN-dest-srv": {
                label: "destination",
                provider: null,
                plan: "lite",
                name: "BTP-INTEGRATED-TOOLCHAIN-dest-srv",
                tags: [
                    "destination",
                    "conn",
                    "connsvc",
                ],
                instance_guid: "8520fa67-5b59-41ec-9941-c0e848792239",
                instance_name: "BTP-INTEGRATED-TOOLCHAIN-dest-srv",
                binding_guid: "9d7750e1-9ae4-4421-9284-2fa459e19835",
                binding_name: null,
                credentials: {
                    tenantmode: "dedicated",
                    "token-type": [
                        "xsuaa",
                        "ias",
                    ],
                    clientid: "sb-clone8520fa675b5941ec9941c0e848792239!b504205|destination-xsappname!b62",
                    "credential-type": "binding-secret",
                    xsappname: "clone8520fa675b5941ec9941c0e848792239!b504205|destination-xsappname!b62",
                    clientsecret: "9d7750e1-9ae4-4421-9284-2fa459e19835$5f8PtoSTOAJ5cUBnznHQu8MzMFTKiJnLkMvTpBc1g_I=",
                    uri: "https://destination-configuration.cfapps.us10.hana.ondemand.com",
                    url: "https://sap-integrated-toolchain-l7fe6os2.authentication.us10.hana.ondemand.com",
                    uaadomain: "authentication.us10.hana.ondemand.com",
                    instanceid: "8520fa67-5b59-41ec-9941-c0e848792239",
                    verificationkey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzxuPWJDXeUYc7ZvuuX59
+F0sw4AH495l8r/m9epXIITC2O9+WYraOTfcPDtFSy70T88JjKuyVa7pzn9Uojmj
4VAI7Sr1OBUqIafO1Z2aaChU5kin8KHBdErgLaK5pXA4anJAkm9yP7SSSswgXEAg
lm2mOBVYFjyVmbSvbawHAdP1sxRSba4gi5sstyWF6wr9L0i7WjgzEB3ERw5XK67w
FmKsRXJwofKpSlpvCxWS/zn00ptKojZh6imrnAXlUel2Dm/EpZ5rRQu74ZjlGVwq
lMwYJYef5jQkvTZNHXg29ZtXS6/HivfBO7EZ0mCy5Z/HVQZiA8G07jLhNuuFZAi6
uQIDAQAB
-----END PUBLIC KEY-----`,
                    identityzone: "sap-integrated-toolchain-l7fe6os2",
                    tenantid: "6d1e7228-caa7-47d8-8e6c-7249a75fc25c",
                },
                syslog_drain_url: null,
                volume_mounts: [
                ],
            },
            "BTP-INTEGRATED-TOOLCHAIN-db": {
                label: "hana",
                provider: null,
                plan: "hdi-shared",
                name: "BTP-INTEGRATED-TOOLCHAIN-db",
                tags: [
                    "hana",
                    "database",
                    "relational",
                ],
                instance_guid: "5cdce146-3617-4d39-b77c-05eed83f1c9b",
                instance_name: "BTP-INTEGRATED-TOOLCHAIN-db",
                binding_guid: "33ec41a9-80e2-4b30-8077-cb2e59b01bf7",
                binding_name: null,
                credentials: {
                    database_id: "1984a8f4-a01e-49f7-9c20-2c98b2f79039",
                    host: "1984a8f4-a01e-49f7-9c20-2c98b2f79039.hana.prod-us10.hanacloud.ondemand.com",
                    port: "443",
                    driver: "com.sap.db.jdbc.Driver",
                    url: "jdbc:sap://1984a8f4-a01e-49f7-9c20-2c98b2f79039.hana.prod-us10.hanacloud.ondemand.com:443?encrypt=true&validateCertificate=true&currentschema=A07B80FBC51044F98CC368B51D8F2873",
                    schema: "A07B80FBC51044F98CC368B51D8F2873",
                    certificate: `-----BEGIN CERTIFICATE-----
MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD
QTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB
CSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97
nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt
43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P
T19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4
gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO
BgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR
TLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw
DQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr
hMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg
06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF
PnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls
YSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk
CAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIFZjCCA06gAwIBAgIQCPm0eKj6ftpqMzeJ3nzPijANBgkqhkiG9w0BAQwFADBN
MQswCQYDVQQGEwJVUzEXMBUGA1UEChMORGlnaUNlcnQsIEluYy4xJTAjBgNVBAMT
HERpZ2lDZXJ0IFRMUyBSU0E0MDk2IFJvb3QgRzUwHhcNMjEwMTE1MDAwMDAwWhcN
NDYwMTE0MjM1OTU5WjBNMQswCQYDVQQGEwJVUzEXMBUGA1UEChMORGlnaUNlcnQs
IEluYy4xJTAjBgNVBAMTHERpZ2lDZXJ0IFRMUyBSU0E0MDk2IFJvb3QgRzUwggIi
MA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCz0PTJeRGd/fxmgefM1eS87IE+
ajWOLrfn3q/5B03PMJ3qCQuZvWxX2hhKuHisOjmopkisLnLlvevxGs3npAOpPxG0
2C+JFvuUAT27L/gTBaF4HI4o4EXgg/RZG5Wzrn4DReW+wkL+7vI8toUTmDKdFqgp
wgscONyfMXdcvyej/Cestyu9dJsXLfKB2l2w4SMXPohKEiPQ6s+d3gMXsUJKoBZM
pG2T6T867jp8nVid9E6P/DsjyG244gXazOvswzH016cpVIDPRFtMbzCe88zdH5RD
nU1/cHAN1DrRN/BsnZvAFJNY781BOHW8EwOVfH/jXOnVDdXifBBiqmvwPXbzP6Po
sMH976pXTayGpxi0KcEsDr9kvimM2AItzVwv8n/vFfQMFawKsPHTDU9qTXeXAaDx
Zre3zu/O7Oyldcqs4+Fj97ihBMi8ez9dLRYiVu1ISf6nL3kwJZu6ay0/nTvEF+cd
Lvvyz6b84xQslpghjLSR6Rlgg/IwKwZzUNWYOwbpx4oMYIwo+FKbbuH2TbsGJJvX
KyY//SovcfXWJL5/MZ4PbeiPT02jP/816t9JXkGPhvnxd3lLG7SjXi/7RgLQZhNe
XoVPzthwiHvOAbWWl9fNff2C+MIkwcoBOU+NosEUQB+cZtUMCUbW8tDRSHZWOkPL
tgoRObqME2wGtZ7P6wIDAQABo0IwQDAdBgNVHQ4EFgQUUTMc7TZArxfTJc1paPKv
TiM+s0EwDgYDVR0PAQH/BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcN
AQEMBQADggIBAGCmr1tfV9qJ20tQqcQjNSH/0GEwhJG3PxDPJY7Jv0Y02cEhJhxw
GXIeo8mH/qlDZJY6yFMECrZBu8RHANmfGBg7sg7zNOok992vIGCukihfNudd5N7H
PNtQOa27PShNlnx2xlv0wdsUpasZYgcYQF+Xkdycx6u1UQ3maVNVzDl92sURVXLF
O4uJ+DQtpBflF+aZfTCIITfNMBc9uPK8qHWgQ9w+iUuQrm0D4ByjoJYJu32jtyoQ
REtGBzRj7TG5BO6jm5qu5jF49OokYTurWGT/u4cnYiWB39yhL/btp/96j1EuMPik
AdKFOV8BmZZvWltwGUb+hmA+rYAQCd05JS9Yf7vSdPD3Rh9GOUrYU9DzLjtxpdRv
/PNn5AeP3SYZ4Y1b+qOTEZvpyDrDVWiakuFSdjjo4bq9+0/V77PnSIMx8IIh47a+
p6tv75/fTM8BuGJqIz3nCU2AG3swpMPdB380vqQmsvZB6Akd4yCYqjdP//fx4ilw
MUc/dNAUFvohigLVigmUdy7yWSiLfFCSCmZ4OIN1xLVaqBHG5cGdZlXPU8Sv13WF
qUITVuwhd4GTWgzqltlJyqEI8pc7bZsEGCREjnwB8twl2F6GmrE52/WRMmrRpnCK
ovfepEWFJqgejF0pW8hL2JpqA15w8oVPbEtoL8pU9ozaMv7Da4M/OMZ+
-----END CERTIFICATE-----`,
                    hdi_user: "A07B80FBC51044F98CC368B51D8F2873_CAORQCRK9HND6F1242W55SSM5_DT",
                    hdi_password: "Fq31cjZhoMTRYBcKjZYKmmsYGNWdv2V3VgE52aQA8U4mJC-sLWgVxpDe1-mwfKonuZ_VUDbFYQ.ZKvWMOPIz2aZI-Rj0JjTZGRryyCcNH9RDpix4K3yrC3NNoDEmhrtd",
                    user: "A07B80FBC51044F98CC368B51D8F2873_CAORQCRK9HND6F1242W55SSM5_RT",
                    password: "Ro1fYAkfuYlh7sVzwQLZ-vcvM7o1OLkwyof2By3FuYeYpC3gaqnYTH5bwjG-5iWcHgGfkKHj5pmQzk98b1UQW_N59Be2gYNfBV9L8Tx74G_BlKmMIs0EWMpDaj3B.B.V",
                },
                syslog_drain_url: null,
                volume_mounts: [
                ],
            },
        }
    }
}
module.exports = Util;