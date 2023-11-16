(async () => {
    const microsoftBtn = document.querySelector('#microsoft-btn');
    const crackedUsername = document.querySelector('#cracked-username');
    const submitBtn = document.querySelector('#login-btn');
    const usernameRegex = /[^a-zA-Z0-9_]/;

    microsoftBtn.addEventListener('click', async () => {
        if (await window.api.loginMicrosoft()) await window.api.openPage('home');
    });

    crackedUsername.addEventListener('keyup', () => {
        const errorMessage = crackedUsername.parentElement.querySelector('.error-message');
        function errorMsg(msg) {
            crackedUsername.parentElement.classList.add('error');
            errorMessage.textContent = msg;
            submitBtn.disabled = true;
        }

        if (!crackedUsername.value.length) errorMsg('* You must provide a username');
        else if (crackedUsername.value.length < 3) errorMsg('* Username must be at least 3 characters long');
        else if (crackedUsername.value.length > 16) errorMsg('* Username must be max 16 characters long');
        else if (usernameRegex.test(crackedUsername.value))
            errorMsg('* The username must contain only alphanumeric characters and underscores');
        else {
            crackedUsername.parentElement.classList.remove('error');
            submitBtn.disabled = false;
        }
    });

    document.querySelector('form').addEventListener('submit', async () => {
        if (await window.api.loginCracked(crackedUsername.value)) await window.api.openPage('home');
    });
})();
