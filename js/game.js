const { Client } = require('minecraft-launcher-core');
const path = require('path');

function getGamePath(portable = false) {
    return portable // if portable
        ? path.join(__dirname, '.MF-launcher') // current dir
        : process.platform === 'win32' // else if Windows
        ? path.join(process.env.APPDATA, '.MF-launcher') // appdata dir
        : path.join(process.env.HOME, '.MF-launcher'); // else (OSX, Linux) home dir
}

function launchGame(options) {
    return new Promise((resolve, reject) => {
        if (!options) reject('Missing game options');

        const LAUNCHER = new Client();

        LAUNCHER.on('debug', (e) => console.log(e));
        LAUNCHER.on('data', (e) => console.log(e));
        LAUNCHER.on('download', (e) => console.log(e));
        LAUNCHER.on('progress', (e) => console.log(e));
        LAUNCHER.on('close', resolve);

        LAUNCHER.launch(options);
    });
}

module.exports = { getGamePath, launchGame };
