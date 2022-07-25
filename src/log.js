const {parseBooleans} = require("xml2js/lib/processors");
const core = require("@actions/core");
const debug = parseBooleans(core.getInput("debug"));

function log(title, message){
    if (debug) core.info(`${title}: ${JSON.stringify(message, " ", 4)}`)
}

module.exports = {
    log
}