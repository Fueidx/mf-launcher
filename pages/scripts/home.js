(async () => {
    const GAME_VERSIONS = await window.api.mcVersions();
    const versionsSelect = document.querySelector('#game-versions');

    GAME_VERSIONS.forEach((version) => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;

        versionsSelect.appendChild(option);
    });
})();
