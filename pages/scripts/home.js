(async () => {
    const GAME_VERSIONS = (await window.api.getConfig('include-snapshots'))
        ? await window.api.mcAllVersions()
        : await window.api.mcVersions();
    const versionsSelect = document.querySelector('#game-versions');

    const prevVNumber = await window.api.getConfig('game-version.number');
    const prevVType = await window.api.getConfig('game-version.type');
    const previousGameVersion = prevVNumber + ' - ' + prevVType || GAME_VERSIONS[0];

    const modLoaders = Array.from(document.querySelectorAll('fieldset input[type="radio"]'));

    function disableModLoaders() {
        const messageLabel = document.querySelector('label[for="mod-loaders"]');
        messageLabel.textContent = 'Mod loaders unavailable';

        modLoaders.forEach(async (el) => {
            if (el.id === 'none') {
                el.checked = true;
                await window.api.setConfig('mod-loader', el.id);
            } else {
                el.disabled = true;
                el.title = 'Mod loaders are not avaiable for non-release versions';
            }
        });
    }

    function enableModLoaders() {
        const messageLabel = document.querySelector('label[for="mod-loaders"]');
        messageLabel.textContent = 'Mod loader';

        modLoaders.forEach((el) => {
            el.disabled = false;
            el.title = '';
        });
    }

    GAME_VERSIONS.forEach((version) => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;

        if (version === previousGameVersion) {
            if (version.split(' - ')[1] !== 'release') disableModLoaders();
            else enableModLoaders();

            option.selected = true;
        }

        versionsSelect.appendChild(option);
    });

    const previousModLoader = (await window.api.getConfig('mod-loader')) || 'none';

    modLoaders.forEach((el) => {
        if (el.id === previousModLoader) el.checked = true;

        el.addEventListener('change', async () => {
            if (el.checked) await window.api.setConfig('mod-loader', el.id);
        });
    });

    window.api.setConfig('mod-loader', modLoaders.find((el) => el.checked).id);

    await window.api.setConfig('game-version', {
        number: versionsSelect.value.split(' - ')[0],
        type: versionsSelect.value.split(' - ')[1],
    });

    versionsSelect.addEventListener('change', async () => {
        const vType = versionsSelect.value.split(' - ')[1];

        if (vType !== 'release') disableModLoaders();
        else enableModLoaders();

        await window.api.setConfig('game-version', {
            number: versionsSelect.value.split(' - ')[0],
            type: vType,
        });
    });

    document.querySelector('#main-form').addEventListener('submit', async () => {
        const launchBtn = document.querySelector('#launch-btn');

        launchBtn.disabled = true;
        launchBtn.value = 'Launched';

        await window.api.launchGame();

        launchBtn.disabled = false;
        launchBtn.value = 'Launch';
    });
})();
