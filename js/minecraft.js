const minecraft = {
    apiUrl: 'https://launchermeta.mojang.com/mc/game/version_manifest.json',

    releases: async () => {
        const data = await (await fetch(minecraft.apiUrl)).json();
        return data.versions.filter((v) => v.type === 'release').map((v) => v.id);
    },

    snapshots: async () => {
        const data = await (await fetch(minecraft.apiUrl)).json();
        return data.versions.filter((v) => v.type === 'snapshot').map((v) => v.id);
    },

    latestRelease: async () => {
        const data = await (await fetch(minecraft.apiUrl)).json();
        return data.latest.release;
    },

    latestSnapshot: async () => {
        const data = await (await fetch(minecraft.apiUrl)).json();
        return data.latest.snapshot;
    },
};

module.exports = minecraft;
