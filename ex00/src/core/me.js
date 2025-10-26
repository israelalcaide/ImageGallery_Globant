/* ************************************************************************** */
/*  File: me.js                                                              */
/*  Brief: Obtener y mostrar el perfil del usuario autenticado de Unsplash.   */
/* ************************************************************************** */


import { get_unsplash_token } from "./oauth.js";

export async function fetch_unsplash_profile() {
    const token = get_unsplash_token();
    if (!token) {
        alert("No autenticado. Haz login con Unsplash primero.");
        return null;
    }
    try {
        const res = await fetch("https://api.unsplash.com/me", {
            headers: {
                "Authorization": "Bearer " + token,
                "Accept-Version": "v1"
            }
        });
        if (!res.ok)
            throw new Error("No autorizado o token inválido");
        const data = await res.json();
        alert("Usuario: " + data.username + "\nNombre: " + data.name);
        return data;
    } catch (e) {
        alert("Error obteniendo perfil: " + e.message);
        return null;
    }
}
