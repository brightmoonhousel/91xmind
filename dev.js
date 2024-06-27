const { startServers } = require("./src/service/localServer");
const { checkUpdate } = require("./src/service/autoUpdate");
checkUpdate();
require("./src/hook");
startServers();
require("./main");
