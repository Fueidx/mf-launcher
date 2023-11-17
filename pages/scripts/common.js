(async () => {
    // ========== Prevent forms from reloading the page ==========
    document.querySelector('form')?.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // ========== THEMES ==========
    const THEMES = await window.api.themes();
    const DEFAULT_THEME = THEMES.find((theme) => theme.name === 'M');
    const themesSelect = document.querySelector('#themes');
    const previousTheme = (await window.api.getConfig('theme')) || DEFAULT_THEME;

    async function applyTheme(path) {
        document.querySelector('#theme').setAttribute('href', path);
        const selectedTheme = THEMES.find((theme) => theme.path === path);
        await window.api.setConfig('theme', selectedTheme);
    }

    THEMES.forEach((theme) => {
        const option = document.createElement('option');
        option.textContent = theme.name;
        option.value = theme.path;

        if (theme.name === previousTheme.name) {
            option.selected = true;
            applyTheme(theme.path);
        }

        themesSelect.appendChild(option);
    });

    themesSelect.addEventListener('change', async () => {
        await applyTheme(themesSelect.value);
    });

    document.querySelector('span#exit')?.addEventListener('click', async () => {
        await window.api.openPage('home');
    });

    document.querySelector('span#settings')?.addEventListener('click', async () => {
        await window.api.openPage('settings');
    });
})();
