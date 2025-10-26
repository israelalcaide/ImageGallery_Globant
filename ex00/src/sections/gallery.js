/* ************************************************************************** */
/*  File: gallery.js                                                           */
/*  Brief: Full grid (popular/search) rendering.                               */
/* ************************************************************************** */

"use strict";

import { $, show_loader, hide_loader, show_error, clear_error } from "../core/ui.js";
import { list_photos, search_photos } from "../api/unsplash.service.js";
import { likePhoto, unlikePhoto } from "./carousel.js";

let g_current = [];

function render_grid(list) {
  const grid = $("#imageGrid");
  if (!grid) return;

  grid.innerHTML = "";
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.style.position = "relative";

    const img = document.createElement("img");
    img.src = p.thumb;
    img.alt = p.alt;
    img.loading = "lazy";
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      if (p.regular) window.open(p.regular, "_blank");
    });



  // Contenedor para los botones, centrados verticalmente
  const btnRow = document.createElement("div");
  btnRow.className = "gallery-like-fav-row";

  // Botón favoritos (izquierda)
  const favBtn = document.createElement("button");
  favBtn.className = "gallery-fav-btn";
  favBtn.title = "Guardar en favoritos";
  favBtn.innerHTML = `<i class=\"fa-regular fa-bookmark\"></i>`;

  // Botón like (derecha)
  const likeBtn = document.createElement("button");
  likeBtn.className = "gallery-like-btn";
  likeBtn.title = "Like";
  likeBtn.innerHTML = `<i class=\"fa-regular fa-heart\"></i>`;

  btnRow.appendChild(favBtn);
  btnRow.appendChild(likeBtn);

    // Like wiring (toggle real like)
    likeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const icon = likeBtn.querySelector("i");
      const isLiked = icon.classList.contains("fa-solid");
      try {
        likeBtn.disabled = true;
        if (!isLiked) {
          await likePhoto(p.id);
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
        } else {
          await unlikePhoto(p.id);
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
        clear_error();
      } catch (err) {
        if (err && err.message && err.message.match(/401|not authenticated|unauthorized/i)) {
          show_error("Only for registered user.");
        } else {
          show_error("Error al actualizar like.");
        }
      } finally {
        likeBtn.disabled = false;
      }
    });

    // Favoritos (local, solo UI)
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!window.isLoggedInState) {
        show_error("Only for registered user.");
        return;
      }
      favBtn.classList.toggle("active");
      favBtn.querySelector("i").classList.toggle("fa-solid");
      favBtn.querySelector("i").classList.toggle("fa-regular");
      clear_error();
      // Aquí puedes guardar en localStorage si quieres persistir favoritos
    });

  card.appendChild(img);
  card.appendChild(btnRow);
  grid.appendChild(card);
  }
}

export function init_gallery() {
  return {
    async load_default() {
      show_loader();
      clear_error();
      try {
        // Detectar login global para favoritos
        if (typeof window.isLoggedInState === "undefined") {
          const res = await fetch("http://localhost:3000/api/me", { credentials: "include" });
          window.isLoggedInState = res.ok;
        }
        const r = await list_photos({ order_by: "popular", reset: true });
        g_current = r.photos;
        render_grid(g_current);
      } catch (e) {
        if (e && e.message && (e.message.includes("Rate Limit") || e.message.includes("403"))) {
          show_error("Has superado el límite de peticiones de Unsplash. Intenta más tarde.");
        } else {
          show_error("Error al cargar las imágenes: " + (e.message || "desconocido"));
        }
      } finally {
        hide_loader();
      }
    },
    async search(query) {
      if (!query || !query.trim()) return;
      show_loader();
      clear_error();
      try {
        // Detectar login global para favoritos
        if (typeof window.isLoggedInState === "undefined") {
          const res = await fetch("http://localhost:3000/api/me", { credentials: "include" });
          window.isLoggedInState = res.ok;
        }
        const r = await search_photos(query, { reset: true });
        g_current = r.photos;
        if (!g_current.length) {
          show_error("No se encontraron imágenes para esa búsqueda.");
          hide_loader();
          return;
        }
        render_grid(g_current);
      } catch (e) {
        if (e && e.message && (e.message.includes("Rate Limit") || e.message.includes("403"))) {
          show_error("Has superado el límite de peticiones de Unsplash. Intenta más tarde.");
        } else {
          show_error("Error en la búsqueda. Inténtalo de nuevo.");
        }
      } finally {
        hide_loader();
      }
    },
  };
}
