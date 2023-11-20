const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    openPage: (name) => ipcRenderer.send('open-page', name),

    mcVersions: () => ipcRenderer.invoke('mc:releases'),
    mcAllVersions: () => ipcRenderer.invoke('mc:all-versions'),
    latestMcVersion: () => ipcRenderer.invoke('mc:release'),
    latestMcSnapshot: () => ipcRenderer.invoke('mc:snapshot'),

    themes: () => ipcRenderer.invoke('themes'),

    setConfig: (key, value) => ipcRenderer.send('setConfig', key, value),
    getConfig: (key) => ipcRenderer.invoke('getConfig', key),

    loginMicrosoft: () => ipcRenderer.invoke('login:microsoft'),
    loginCracked: (username) => ipcRenderer.invoke('login:cracked', username),

    launchGame: () => ipcRenderer.send('launch'),
});
