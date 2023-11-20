const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const minecraft = require('./js/minecraft');
const { loginCracked, loginMicrosoft } = require('./js/auth');
const { launchGame, getGamePath } = require('./js/game');

const defaultStoreOptions = {
    // encryptionKey: 'MF', // obfuscate stores so they aren't easily modified ( https://github.com/sindresorhus/electron-store/tree/main#encryptionkey )
    cwd: __dirname, // the directory where the store file is located
    fileExtension: 'store', // the file extension of the store file
};
const profilesStore = new Store({ name: 'profiles', ...defaultStoreOptions }); // store for profiles
const configStore = new Store({ name: 'config', ...defaultStoreOptions }); // store for user settings

const isDevEnv = !app.isPackaged;

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
    BrowserWindow.getFocusedWindow()?.loadFile(path.join(__dirname, 'pages', `${name}.html`));
});

ipcMain.handle('mc:releases', async (event) => {
    return await minecraft.getReleases();
});
ipcMain.handle('mc:all-versions', async (event) => {
    return await minecraft.getAllVersions();
});
ipcMain.handle('mc:release', async (event) => {
    return await minecraft.getLatestRelease();
});
ipcMain.handle('mc:snapshot', async (event) => {
    return await minecraft.getLatestSnapshot();
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
    const GAME_OPTIONS = {
        authorization: profilesStore.get('login'),
        root: GAME_PATH,
        cache: path.join(GAME_PATH, '.cache'),
        version: {
            number: configStore.get('game-version.number'),
            type: configStore.get('game-version.type') === 'snapshot' ? 'snapshot' : 'release',
        },
        memory: {
            min: '2G',
            max: configStore.get('max-memory') + 'G',
        },
        javaPath: 'javaw',
    };

    const LAUNCHER_BEHAVIOR = parseInt(configStore.get('launcher-visibility'));
    switch (LAUNCHER_BEHAVIOR) {
        case 1:
            await launchGame(GAME_OPTIONS);
            process.exit(0); // close launcher when game starts
        case 2:
            await launchGame(GAME_OPTIONS);
            break; // keep launcher open
        case 3:
            const CURRENT_WINDOW = BrowserWindow.getFocusedWindow();

            CURRENT_WINDOW.setSkipTaskbar(true);
            CURRENT_WINDOW.hide(); // hide window

            await launchGame(GAME_OPTIONS); // wait for game to close

            CURRENT_WINDOW.setSkipTaskbar(false);
            CURRENT_WINDOW.show(); // show window
            break;
        default:
            break;
    }

    return true;
});
