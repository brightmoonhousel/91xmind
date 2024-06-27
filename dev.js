const { startServers } = require("./src/service/localServer_DIY");
const { checkUpdate } = require("./src/service/autoUpdate");
checkUpdate();
require("./src/hook");
startServers();
require("./main");
