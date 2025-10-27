/* ************************************************************************** */
/*  File: carousel.js                                                          */
/*  Brief: Highlight cards + desktop auto-scroll (conveyor), mobile prev/next.*/
/* ************************************************************************** */

export async function likePhoto(photoId) {
	const res = await fetch(`http://localhost:3000/api/photos/${photoId}/like`, {
		method: "POST",
		credentials: "include"
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(msg || "No se pudo dar like");
	}
}

export async function unlikePhoto(photoId) {
	const res = await fetch(`http://localhost:3000/api/photos/${photoId}/like`, {
		method: "DELETE",
		credentials: "include"
	});
	if (!res.ok) {
		const msg = await res.text().catch(() => res.statusText);
		throw new Error(msg || "No se pudo quitar like");
	}
}

"use strict";

import { $, $all, on, show_loader, hide_loader, show_error } from "../core/ui.js";
import { is_mobile, storage_get, storage_set } from "../core/utils.js";
import { list_photos, search_photos, register_download } from "../api/unsplash.service.js";

const FAV_KEY = "favs";
const GAP_PX  = 32;
const SPEED   = 1.5;

let g_photos = [];
let g_anim_id = null;
let g_translate_x = 0;

function get_favs() { return new Set(storage_get(FAV_KEY, [])); }
function set_favs(s) { storage_set(FAV_KEY, Array.from(s)); }

function should_auto() {
	const cont = $("#cardsContainer");
	if (!cont)
		return false;
	const n = cont.querySelectorAll(".photo-card").length;
	return !is_mobile() && n > 1;
}

function create_card(p) {
	const favs  = get_favs();
	const liked = favs.has(p.id);

	const card = document.createElement("div");
	card.className = "photo-card";
	card.dataset.id = p.id;
	let title = (p.alt && typeof p.alt === 'string' && p.alt.trim().length > 0)
	  ? p.alt.trim().split(/\s+/)[0]
	  : 'Photo';

	card.innerHTML =
	  '<div class="card-image"><img loading="lazy" alt="' + p.alt + '" src="' + p.small + '"/></div>' +
	  '<div class="card-info">' +
	    '<h3 class="card-title" style="text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;margin:0 auto;">' + title + '</h3>' +
	    '<div class="card-meta">' +
	      '<p class="card-category" style="margin:0;text-align:center;width:100%;">by ' + p.author_name + '</p>' +
	      '<button class="like-btn ' + (liked ? "liked" : "") + '" data-id="' + p.id + '">' +
	        '<i class="' + (liked ? "fa-solid" : "fa-regular") + ' fa-heart"></i> ' + p.likes +
	      '</button>' +
	    '</div>' +
	    '' +
	  '</div>';

	return card;
}

/* render: hasta 12 pics photo para fluidez */
function render(list = g_photos) {
	const wrap = $("#cardsContainer");
	if (!wrap)
		return;
	wrap.innerHTML = "";

	const show = list.slice(0, Math.min(12, list.length));
	for (let i = 0; i < show.length; i++)
		wrap.appendChild(create_card(show[i]));
}

function set_mobile_single() {
	const nodes = $all(".photo-card");
	for (let i = 0; i < nodes.length; i++)
		nodes[i].style.display = (i === 0 ? "block" : "none");
}

function mobile_shift(dir) {
	const nodes = $all(".photo-card");
	if (!nodes.length)
		return;

	let active = -1;
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].style.display !== "none") {
			active = i;
			break;
		}
	}
	
	if (active < 0)
		active = 0;

	const next = (active + dir + nodes.length) % nodes.length;
	for (let i = 0; i < nodes.length; i++)
		nodes[i].style.display = (i === next ? "block" : "none");
}

/* cinta transport carrussel! : mueve la primera al final cuando sale */
function start_auto(resume) {
	stop_auto();

	const cont = $("#cardsContainer");
	if (!cont)
		return;
	if (!should_auto())
		return;

	if (!resume)
		g_translate_x = 0;

	function step() {
		g_translate_x -= SPEED;
		
	cont.style.transform = "translateX(" + g_translate_x + "px)";

    const first = cont.querySelector(".photo-card");
	
	if (first) {
		const w = first.getBoundingClientRect().width + GAP_PX;
		if (Math.abs(g_translate_x) >= w) {
			g_translate_x += w;
			cont.style.transform = "translateX(" + g_translate_x + "px)";
			cont.appendChild(first);
		}
	}
	g_anim_id = requestAnimationFrame(step);
	}
	g_anim_id = requestAnimationFrame(step);
}

function stop_auto() {
	if (g_anim_id)
		cancelAnimationFrame(g_anim_id);
	g_anim_id = null;
}

function bind_events() {
	const wrap = $("#cardsContainer");
	const next_btn = $("#nextBtn");
	const prev_btn = $("#prevBtn");

	on(next_btn, "click", () => {
		if (is_mobile())
			mobile_shift(1);
	});
	on(prev_btn, "click", () => {
		if (is_mobile())
			mobile_shift(-1);
	});
	
	if (wrap) {
		wrap.addEventListener("click", async (e) => {
			const like = e.target.closest?.(".like-btn");
			const dnl  = e.target.closest?.(".download-btn");
			if (!like && !dnl) return;

			if (like) {
				const id = like.dataset.id;
				const isOn = like.classList.toggle("liked");
				const icon = like.querySelector("i");
				icon?.classList.toggle("fa-regular", !isOn);
				icon?.classList.toggle("fa-solid", isOn);
				try {
					if (isOn) await likePhoto(id); else await unlikePhoto(id);
				} catch (err) {
					like.classList.toggle("liked"); // revertir UI si falla
					icon?.classList.toggle("fa-regular");
					icon?.classList.toggle("fa-solid");
					alert("Error al actualizar favorito: " + err.message);
				}
				return;
			}

			if (dnl) {
				const id  = dnl.dataset.id;
				const loc = dnl.dataset.download;
				try { 
					await register_download(loc);
				}
				catch {}
				for (let i = 0; i < g_photos.length; i++) {
					if (g_photos[i].id === id && g_photos[i].regular) { 
						window.open(g_photos[i].regular, "_blank");
						break;
					}
				}
			}
		});
		
		wrap.addEventListener("mouseenter", () => { if (should_auto()) stop_auto(); });
		wrap.addEventListener("mouseleave", () => { if (should_auto()) start_auto(true); });
	}

	window.addEventListener("resize", () => {
		if (should_auto())
			start_auto(true);
		else
			stop_auto();
		});
	}

	export function init_carousel() {
		bind_events();
		
		return {
			async load_highlights() {
				show_loader();
				try {
					const r = await list_photos({ order_by: "popular", reset: true });
					g_photos = r.photos;
					render(g_photos);
					should_auto() ? start_auto(false) : set_mobile_single();
				} catch {
					show_error("Error al cargar el carrusel.");
				} finally {
					hide_loader();
				}
			},
			async from_search(query) {
				try {
					const r = await search_photos(query, { reset: true });
					g_photos = r.photos;
					render(g_photos);
					should_auto() ? start_auto(true) : set_mobile_single();
				} catch {}
			},
		};
	}
