
/* ************************************************************************** */
/*  File: main.js                                                             */
/*  Brief: Entry point. Wires sections and initial loads.                      */
/* ************************************************************************** */

"use strict";

import { capture_unsplash_token } from "./core/oauth.js";
import { init_header } from "./sections/header.js";
import { init_carousel } from "./sections/carousel.js";
import { init_gallery } from "./sections/gallery.js";

window.addEventListener("DOMContentLoaded", async () => {
    // Captura el token de Unsplash si viene en la URL
    capture_unsplash_token();

    const gallery = init_gallery();
    const carousel = init_carousel();

    init_header({
        on_search: async (query) => {
            await gallery.search(query);
            await carousel.from_search(query);
        },
    });

    await gallery.load_default();
    await carousel.load_highlights();
});
