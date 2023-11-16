(async () => {
    const memorySlider = document.querySelector('#max-memory');
    const memoryDisplaySpan = document.querySelector('label[for="max-memory"] > span');
    const previousMaxMemory = await window.api.getConfig(memorySlider.id);

    memorySlider.value = previousMaxMemory || 4;
    memoryDisplaySpan.textContent = previousMaxMemory + 'G' || memorySlider.value + 'G';
    await window.api.setConfig(memorySlider.id, memorySlider.value);

    memorySlider.addEventListener('input', async () => {
        memoryDisplaySpan.textContent = memorySlider.value + 'G';
        await window.api.setConfig(memorySlider.id, memorySlider.value);
    });

    const portableCheckbox = document.querySelector('#portable');

    portableCheckbox.checked = (await window.api.getConfig(portableCheckbox.id)) || false;
    await window.api.setConfig(portableCheckbox.id, portableCheckbox.checked);

    portableCheckbox.addEventListener('change', async () => {
        await window.api.setConfig(portableCheckbox.id, portableCheckbox.checked);
    });

    const launcherVisibilitySelect = document.querySelector('#launcher-visibility');

    launcherVisibilitySelect.value = (await window.api.getConfig(launcherVisibilitySelect.id)) || 1;
    await window.api.setConfig(launcherVisibilitySelect.id, parseInt(launcherVisibilitySelect.value));

    launcherVisibilitySelect.addEventListener('change', async () => {
        await window.api.setConfig(launcherVisibilitySelect.id, parseInt(launcherVisibilitySelect.value));
    });
})();
