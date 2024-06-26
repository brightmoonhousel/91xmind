const { app } = require('electron');



const { startServers } = require("./src/service/localserver");
const { checkUpdate } = require("./src/service/updateService");
checkUpdate();
require("./src/hook/hook");
startServers();
require("./main");
