const { startServers } = require("./src/service/localServer");
//const { checkUpdate } = require("./src/service/autoUpdate");
//checkUpdate();
startServers();
require("./src/hook");
require("./main");
