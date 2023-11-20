(async () => {
    const GAME_VERSIONS = (await window.api.getConfig('include-snapshots'))
        ? await window.api.mcAllVersions()
        : await window.api.mcVersions();
    const versionsSelect = document.querySelector('#game-versions');

    const prevVNumber = await window.api.getConfig('game-version.number');
    const prevVType = await window.api.getConfig('game-version.type');
    const previousGameVersion = prevVNumber + ' - ' + prevVType || GAME_VERSIONS[0];

    GAME_VERSIONS.forEach((version) => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;

        if (version === previousGameVersion) option.selected = true;

        versionsSelect.appendChild(option);
    });
    await window.api.setConfig('game-version', {
        number: versionsSelect.value.split(' - ')[0],
        type: versionsSelect.value.split(' - ')[1],
    });

    versionsSelect.addEventListener('change', async () => {
        await window.api.setConfig('game-version', {
            number: versionsSelect.value.split(' - ')[0],
            type: versionsSelect.value.split(' - ')[1],
        });
    });

    const modLoaders = Array.from(document.querySelectorAll('fieldset input[type="radio"]'));
    const previousModLoader = (await window.api.getConfig('mod-loader')) || 'none';

    modLoaders.forEach((el) => {
        if (el.id === previousModLoader) el.checked = true;

        el.addEventListener('change', async () => {
            if (el.checked) await window.api.setConfig('mod-loader', el.id);
        });
    });

    window.api.setConfig('mod-loader', modLoaders.find((el) => el.checked).id);

    document.querySelector('#main-form').addEventListener('submit', async () => {
        const launchBtn = document.querySelector('#launch-btn');

        launchBtn.disabled = true;
        launchBtn.value = 'Launched';

        await window.api.launchGame();

        launchBtn.disabled = false;
        launchBtn.value = 'Launch';
    });
})();
