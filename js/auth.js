const { Authenticator } = require('minecraft-launcher-core');
const { Auth } = require('msmc');

async function loginCracked(username) {
    return await Authenticator.getAuth(username);
}

async function loginMicrosoft() {
    const authManager = new Auth('select_account');
    const xboxManager = await authManager.launch('raw');
    const token = await xboxManager.getMinecraft();

    if (!token) throw new Error('Please login with your Microsoft Account');
    if (token === 'Error') throw new Error('Error logging in with your Microsoft Account');

    return token.mclc();
}

module.exports = { loginCracked, loginMicrosoft };
