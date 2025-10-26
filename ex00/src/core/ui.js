/* ************************************************************************** */
/*  File: ui.js                                                                */
/*  Brief: Minimal DOM helpers + loader/error.                                 */
/* ************************************************************************** */

"use strict";


export function $(sel, root) {
    const r = root || document;
    return r.querySelector(sel);
}

export function $all(sel, root) {
    const r = root || document;
    return Array.prototype.slice.call(r.querySelectorAll(sel));
}

export function on(el, ev, cb) {
    if (!el)
        return;
    el.addEventListener(ev, cb);
}

export function show_loader() {
    const el = $("#loader");
    if (el)
        el.hidden = false;
}

export function hide_loader() {
    const el = $("#loader");
    if (el)
        el.hidden = true;
}

export function show_error(msg) {
    const el = $("#error");
    if (!el)
        return;
    el.textContent = msg;
    el.hidden = false;
}

export function clear_error() {
    const el = $("#error");
    if (el)
        el.hidden = true;
}
