/* ************************************************************************** */
/*  File: utils.js                                                             */
/*  Brief: Small utilities (debounce, storage, breakpoints).                   */
/* ************************************************************************** */

"use strict";


export function debounce(fn, delay) {
    let t = null;
    const d = (typeof delay === "number") ? delay : 400;

    return function debounced() {
        if (t)
            clearTimeout(t);
        const args = arguments;
        t = setTimeout(function run() { fn.apply(null, args); }, d);
    };
}

export function is_mobile() {
    return window.innerWidth <= 768;
}

export function storage_get(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null)
            return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function storage_set(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore quota */
    }
}
