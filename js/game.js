const { Client, Authenticator } = require('minecraft-launcher-core');
const { Auth } = require('msmc');
const path = require('path');

class Game {
    #launcher;
    #path;
    #token;

    constructor(options) {
        this.#launcher = new Client();
        this.options = {
            ramMin: '4G',
            ramMax: '6G',
            portable: false,
            cracked: false,
            ...options,
        };

        if (!this.options?.version) throw new Error('Game version is required!');
        if (this.options?.username.length < 2) throw new Error('Username must be at least 2 characters!');
        this.#init();
    }

    #init() {
        this.#path = this.options?.portable // if portable
            ? path.join(__dirname, '.MF-launcher') // current dir
            : process.platform === 'win32' // else if Windows
            ? path.join(process.env.APPDATA, '.MF-launcher') // appdata dir
            : path.join(process.env.HOME, '.MF-launcher'); // else (OSX, Linux) home dir
    }

    async login(token) {
        if (!!token && typeof token === 'object') this.#token = token;
        else
            this.#token = this.options?.cracked // if cracked
                ? await Authenticator.getAuth(this.options?.username) // username login
                : (await this.#loginMicrosoft()).mclc(); // else Microsoft login

        return this.#token;
    }

    async #loginMicrosoft() {
        const authManager = new Auth('select_account');
        const xboxManager = await authManager.launch('raw');
        const token = await xboxManager.getMinecraft();

        if (!token) throw new Error('Please login with your Microsoft Account');
        if (token === 'Error') throw new Error('Error logging in with your Microsoft Account');

        return token;
    }

    async launch() {
        this.#launcher.launch({
            authorization: this.#token,
            root: this.#path,
            cache: path.join(this.#path, '.cache'),
            version: {
                number: this.options.version,
                type: 'release',
            },
            memory: {
                max: this.options.ramMax,
                min: this.options.ramMin,
            },
        });

        this.#launcher.on('debug', (e) => console.log(e));
        this.#launcher.on('data', (e) => console.log(e));
        this.#launcher.on('download', (e) => console.log(e));
        this.#launcher.on('progress', (e) => console.log(e));
    }
}

module.exports = Game;
