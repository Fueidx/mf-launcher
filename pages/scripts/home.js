(async () => {
    const GAME_VERSIONS = (await window.api.getConfig('include-snapshots'))
        ? await window.api.mcAllVersions()
        : await window.api.mcVersions();
    const versionsSelect = document.querySelector('#game-versions');

    GAME_VERSIONS.forEach((version) => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;

        versionsSelect.appendChild(option);
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
