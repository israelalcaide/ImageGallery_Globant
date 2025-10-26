
// auth.js - Lógica de login OAuth Authorization Code y helpers para backend

let config = null;

async function fetchConfig() {
    if (config) return config;
    const res = await fetch('/config.json');
    if (!res.ok) throw new Error('No se pudo cargar config.json');
    config = await res.json();
    return config;
}

export async function loginWithUnsplash() {
    const { CLIENT_ID, REDIRECT_URI } = await fetchConfig();
    const AUTH_URL =
        `https://unsplash.com/oauth/authorize?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code&scope=${encodeURIComponent('public read_user write_likes')}`;
    window.location.href = AUTH_URL;
}


export async function fetchProfile() {
    const res = await fetch("http://localhost:3000/api/me", { credentials: "include" });
    if (!res.ok)
        return alert("No autenticado o error en el backend");
    const me = await res.json();
    alert(`Usuario: ${me.username}\nNombre: ${me.name}`);
    return me;
}


export async function logoutUnsplash() {
    await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
    window.location.reload();
}


export async function isLoggedIn() {
    // Intenta obtener el perfil, si responde 401 no está logueado
    try {
        const res = await fetch("http://localhost:3000/api/me", { credentials: "include" });
        return res.ok;
    } catch {
        return false;
    }
}
