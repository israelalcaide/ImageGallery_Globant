/* ************************************************************************** */
/*  File: gallery.js                                                           */
/*  Brief: Full grid (popular/search) rendering.                               */
/* ************************************************************************** */

"use strict";

import { $, show_loader, hide_loader, show_error, clear_error } from "../core/ui.js";
import { list_photos, search_photos } from "../api/unsplash.service.js";

let g_current = [];

function render_grid(list) {
  const grid = $("#imageGrid");
  if (!grid) return;

  grid.innerHTML = "";
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    
    const img = document.createElement("img");
    img.src = p.thumb;
    img.alt = p.alt;
    img.loading = "lazy";
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      if (p.regular) window.open(p.regular, "_blank");
    });
    grid.appendChild(img);
  }
}

export function init_gallery() {
  return {
    async load_default() {
      show_loader();
      clear_error();
      try {
        const r = await list_photos({ order_by: "popular", reset: true });
        g_current = r.photos;
        render_grid(g_current);
      } catch (e) {
        show_error("Error al cargar las imágenes: " + (e.message || "desconocido"));
      } finally {
        hide_loader();
      }
    },
    async search(query) {
      if (!query || !query.trim()) return;
      show_loader();
      clear_error();
      try {
        const r = await search_photos(query, { reset: true });
        g_current = r.photos;
        if (!g_current.length) {
          show_error("No se encontraron imágenes para esa búsqueda.");
          hide_loader();
          return;
        }
        render_grid(g_current);
      } catch (e) {
        show_error("Error en la búsqueda. Inténtalo de nuevo.");
      } finally {
        hide_loader();
      }
    },
  };
}
