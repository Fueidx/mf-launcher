(async () => {
    const GAME_VERSIONS = (await window.api.getConfig('include-snapshots'))
        ? await window.api.mcAllVersions()
        : await window.api.mcVersions();
    const versionsSelect = document.querySelector('#game-versions');
    const previousGameVersion = (await window.api.getConfig('game-version')) || GAME_VERSIONS[0];

    GAME_VERSIONS.forEach((version) => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;

        if (version === previousGameVersion) option.selected = true;

        versionsSelect.appendChild(option);
    });
    await window.api.setConfig('game-version', versionsSelect.value);

    versionsSelect.addEventListener('change', async () => {
        await window.api.setConfig('game-version', versionsSelect.value);
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
})();
