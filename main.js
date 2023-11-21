const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const minecraft = require('./js/minecraft');
const { loginCracked, loginMicrosoft } = require('./js/auth');
const { launchGame, getGamePath } = require('./js/game');
const { fabric, forge, quilt } = require('tomate-loaders');

const defaultStoreOptions = {
    // encryptionKey: 'MF', // obfuscate stores so they aren't easily modified ( https://github.com/sindresorhus/electron-store/tree/main#encryptionkey )
    cwd: __dirname, // the directory where the store file is located
    fileExtension: 'store', // the file extension of the store file
};
const profilesStore = new Store({ name: 'profiles', ...defaultStoreOptions }); // store for profiles
const configStore = new Store({ name: 'config', ...defaultStoreOptions }); // store for user settings

// const isDevEnv = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        resizable: false,
        show: false,
        title: 'MF Launcher',
        backgroundColor: '#000',
        icon: path.join(__dirname, 'images', 'icon.ico'), // app icon
        webPreferences: {
            preload: path.join(__dirname, 'js', 'preload.js'), // preload script
            spellcheck: false,
        },
    });

    // win.setMenu(null); // https://stackoverflow.com/a/39092033
    win.loadFile(path.join(__dirname, 'pages', profilesStore.get('login') ? 'home.html' : 'login.html'));
    win.on('ready-to-show', win.show);

    win.webContents.on('did-start-loading', () => {});
    win.webContents.on('did-stop-loading', () => {});

    // if (isDevEnv) win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// prevent reloading window
app.on('browser-window-focus', function () {
    globalShortcut.register('CommandOrControl+R', () => {
        return;
    });
    globalShortcut.register('F5', () => {
        return;
    });
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});

// ========== IPC EVENTS ==========
ipcMain.on('open-page', (event, name) => {
    BrowserWindow.getFocusedWindow().loadFile(path.join(__dirname, 'pages', `${name}.html`));
});

ipcMain.handle('mc:releases', async (event) => {
    return await minecraft.getReleases();
});
ipcMain.handle('mc:all-versions', async (event) => {
    return await minecraft.getAllVersions();
});

ipcMain.handle('themes', async (event) => {
    const dir = path.join(__dirname, 'themes'); // dunno if join() is needed
    const files = fs.readdirSync(dir);

    return files
        .filter((file) => path.extname(file) === '.css')
        .map((file) => {
            const name = path.basename(file, '.css');
            return {
                name: name, // get the file name
                path: `../themes/${name}.css`, // get the path to the file relative to the /pages folder
            };
        });
});

ipcMain.on('setConfig', (event, key, value) => configStore.set(key, value));
ipcMain.handle('getConfig', (event, key) => configStore.get(key));

ipcMain.handle('login:microsoft', async (event) => {
    profilesStore.set('login', await loginMicrosoft());
    return true;
});
ipcMain.handle('login:cracked', async (event, username) => {
    profilesStore.set('login', await loginCracked(username));
    return true;
});

ipcMain.handle('launch', async (event) => {
    const GAME_PATH = getGamePath(configStore.get('portable'));
    const GAME_VERSION = configStore.get('game-version.number');
    const MOD_LOADER = configStore.get('mod-loader');

    let MODLOADER_OPTIONS = {
        root: GAME_PATH,
        version: {
            number: GAME_VERSION,
            type: configStore.get('game-version.type') === 'snapshot' ? 'snapshot' : 'release',
        },
    };

    // https://github.com/doublekekse/tomate-loaders/blob/main/README.md?plain=1#L43-L46
    const tomateLoadersConfig = {
        gameVersion: GAME_VERSION,
        rootPath: GAME_PATH,
    };

    switch (MOD_LOADER) {
        case 'none':
            break;
        case 'fabric':
            MODLOADER_OPTIONS = await fabric.getMCLCLaunchConfig(tomateLoadersConfig);
            break;
        case 'forge':
            MODLOADER_OPTIONS = await forge.getMCLCLaunchConfig(tomateLoadersConfig);
            break;
        case 'quilt':
            MODLOADER_OPTIONS = await quilt.getMCLCLaunchConfig(tomateLoadersConfig);
            break;
        default:
            break;
    }

    // https://github.com/Pierce01/MinecraftLauncher-core#launch
    const GAME_OPTIONS = {
        ...MODLOADER_OPTIONS,
        authorization: profilesStore.get('login'),
        cache: path.join(GAME_PATH, '.cache'),
        memory: {
            min: '2G',
            max: (configStore.get('max-memory') || 4) + 'G',
        },
        javaPath: 'javaw',
    };

    const LAUNCHER_BEHAVIOR = parseInt(configStore.get('launcher-visibility')) || 1;
    switch (LAUNCHER_BEHAVIOR) {
        case 1:
            configStore.set('launching', true);
            await launchGame(GAME_OPTIONS);
            configStore.set('launching', false);
            process.exit(0); // close launcher when game starts
        case 2:
            configStore.set('launching', true);
            await launchGame(GAME_OPTIONS);
            configStore.set('launching', false);
            break; // keep launcher open
        case 3:
            const CURRENT_WINDOW = BrowserWindow.getFocusedWindow();

            CURRENT_WINDOW.setSkipTaskbar(true);
            CURRENT_WINDOW.hide(); // hide window

            configStore.set('launching', true);
            await launchGame(GAME_OPTIONS, true); // wait for game to close
            configStore.set('launching', false);

            CURRENT_WINDOW.setSkipTaskbar(false);
            CURRENT_WINDOW.show(); // show window
            break;
        default:
            break;
    }

    return true;
});

// https://stackoverflow.com/a/14032965
process.stdin.resume(); // so the program will not close instantly

function exitHandler() {
    configStore.set('launching', false); // remove launching flag if launcher gets closed during launch
}

// do something when app is closing
process.on('exit', exitHandler);

// catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

// catches uncaught exceptions
process.on('uncaughtException', exitHandler);
