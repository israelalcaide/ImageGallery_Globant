/* ************************************************************************** */
/*  File: oauth.js                                                           */
/*  Brief: Captura y almacenamiento del access_token de Unsplash OAuth2.      */
/* ************************************************************************** */

"use strict";

export function capture_unsplash_token() {
    let hash = window.location.hash;
    let params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : window.location.search);
    let token = params.get('access_token');
    if (token) {
        localStorage.setItem('unsplash_token', token);
        window.location.hash = '';
    }
}

export function get_unsplash_token() {
    return localStorage.getItem('unsplash_token');
}
