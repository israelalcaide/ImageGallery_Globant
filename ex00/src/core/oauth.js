/* ************************************************************************** */
/*  File: oauth.js                                                           */
/*  Brief: Captura y almacenamiento del access_token de Unsplash OAuth2.      */
/* ************************************************************************** */

"use strict";

// Llama a esta función al inicio de tu app (por ejemplo, desde main.js)
export function capture_unsplash_token() {
    // Busca el token en el hash o en la querystring
    let hash = window.location.hash;
    let params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : window.location.search);
    let token = params.get('access_token');
    if (token) {
        localStorage.setItem('unsplash_token', token);
        // Limpia el hash de la URL para no dejar el token visible
        window.location.hash = '';
    }
}

// Para obtener el token en cualquier parte de la app
export function get_unsplash_token() {
    return localStorage.getItem('unsplash_token');
}
