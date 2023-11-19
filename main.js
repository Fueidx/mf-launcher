const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const minecraft = require('./js/minecraft');
const { loginCracked, loginMicrosoft } = require('./js/auth');

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
    try {
        profilesStore.set('login', await loginMicrosoft());
    } catch (error) {
        return error?.message;
    }
    return true;
});
ipcMain.handle('login:cracked', async (event, username) => {
    try {
        profilesStore.set('login', await loginCracked(username));
    } catch (error) {
        return error?.message;
    }
    return true;
});
