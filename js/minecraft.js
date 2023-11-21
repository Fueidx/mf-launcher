// constants
const API_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

// utils
let cacheData;

const fetchData = async () => {
    if (!cacheData) cacheData = await (await fetch(API_URL)).json();
    return cacheData;
};

// functions
const getReleases = async () => {
    const data = await fetchData();
    return data.versions.filter((v) => v.type === 'release').map((v) => `${v.id} - ${v.type}`);
};

const getAllVersions = async () => {
    const data = await fetchData();
    return data.versions.map((v) => `${v.id} - ${v.type}`);
};

// exports
module.exports = { getReleases, getAllVersions };
