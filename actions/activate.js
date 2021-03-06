const datafire = require('datafire');
const setup = require('./setup');
const config = require('./config.json');
const logger = require('./winston');

module.exports = new datafire.Action({
    inputs: [{
        type: "string",
        title: "accountName",
        default: ""
    }, {
        type: "string",
        title: "type"
    }, {
        type: "boolean",
        title: "apikey",
        default: false,
    }],
    handler: async (input) => {
        if (input.type === "view") {
            let res;
            let database = new setup.database(config);
            let query = "SELECT AccountName, IntegrationName, active from AccessKeys";
            if (input.apikey === true) {
                query = "SELECT AccountName, IntegrationName, active from ApiKeys"
            }
            await database.query(query).catch(e => {
                logger.errorLog.error("Error in activate.js 'view' " + e);
            }).then(async (result) => {
                res = result;
                try {
                    await database.close();
                } catch (e) {
                    logger.errorLog.warn("Error closing database in activate.js 'view' " + e);
                }
            });
            return res;
        } else if (input.type === "on") {
            let database = new setup.database(config);
            logger.accessLog.info("Enabling integration for " + input.accountName);
            let sql = "UPDATE AccessKeys SET Active = 1 WHERE AccountName = ?";
            if (input.apikey === true) {
                sql = "UPDATE ApiKeys SET Active = 1 WHERE AccountName = ?";
            }
            await database.query(sql, input.accountName).catch(err => {
                logger.errorLog.error("Error enabling integration for " + input.accountName + " " + err);
            }).then(async () => {
                try {
                    await database.close();
                } catch (e) {
                    logger.errorLog.error("Error closing database in activate.js for action 'on' ");
                }
            });
        } else if (input.type === "off") {
            let database = new setup.database(config);
            logger.accessLog.info("Enabling integration for " + input.accountName);
            let sql = "UPDATE AccessKeys SET Active = 0 WHERE AccountName = ?";
            if (input.apikey === true) {
                sql = "UPDATE ApiKeys SET Active = 0 WHERE AccountName = ?";
            }
            await database.query(sql, input.accountName).catch(err => {
                logger.errorLog.error("Error enabling integration for " + input.accountName + " " + err);
            }).then(async () => {
                try {
                    await database.close();
                } catch (e) {
                    logger.errorLog.error("Error closing database in activate.js for action 'on' ");
                }
            });
        } else {
            logger.errorLog.info("Incorrect 'type' parameter: values are 'view' , 'on' or 'off'");
            return {error: "Incorrect 'type' parameter: values are 'view' , 'on' or 'off'"};
        }
    },
});
