/* ************************************************************************** */
/*  File: unsplash.service.js                                                  */
/*  Brief: Network layer + normalization for Unsplash API.                     */
/* ************************************************************************** */

"use strict";

const ACCESS_KEY = "dcsFT30KGGIStWRqJ1-pGXoWgMZD0EEGhTufldiPxJc";
const BASE_URL   = "https://api.unsplash.com";
const MAX_PER_PAGE = 30;

let g_page = 1;
let g_per_page = 24;
let g_abort = null;

function build_query(params) {
  const parts = [];
  for (const k in params) {
    const v = params[k];
    if (v !== undefined && v !== null && v !== "") {
      parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return parts.join("&");
}

function normalize_photo(p) {
  const user = (p && p.user) ? p.user : null;
  const urls = (p && p.urls) ? p.urls : null;
  const links = (p && p.links) ? p.links : null;

  return {
    id: p.id,
    alt: p.alt_description || p.description || "Untitled",
    author_name: user ? (user.name || "Unknown") : "Unknown",
    author_link: user && user.links ? (user.links.html || "#") : "#",
    small: urls ? urls.small : null,
    regular: urls ? urls.regular : null,
    thumb: urls ? urls.thumb : null,
    likes: typeof p.likes === "number" ? p.likes : 0,
    download_location: links ? links.download_location : null,
  };
}

async function do_request(path, params) {
  if (g_abort) g_abort.abort();
  g_abort = new AbortController();

  const has_params = params && Object.keys(params).length > 0;
  const url = BASE_URL + path + (has_params ? ("?" + build_query(params)) : "");

  const res = await fetch(url, {
    signal: g_abort.signal,
    headers: {
      "Accept-Version": "v1",
      "Authorization": "Client-ID " + ACCESS_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err  = new Error("HTTP " + res.status + " – " + (text || res.statusText));
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const rate = {
    remaining: res.headers.get("x-ratelimit-remaining"),
    limit: res.headers.get("x-ratelimit-limit"),
  };
  return { data, rate };
}

export async function list_photos(opts) {
  const reset = opts && opts.reset === true;
  const order = (opts && opts.order_by) ? opts.order_by : "popular";
  if (reset) g_page = 1;

  const r = await do_request("/photos", {
    page: g_page,
    per_page: g_per_page,
    order_by: order,
  });

  const arr = Array.isArray(r.data) ? r.data : [];
  return { photos: arr.map(normalize_photo), page: g_page, per_page: g_per_page, total_pages: null, rate: r.rate };
}

export async function search_photos(query, opts) {
  const reset = opts && opts.reset === true;
  if (reset) g_page = 1;

  const r = await do_request("/search/photos", {
    query: query,
    page: g_page,
    per_page: g_per_page,
    orientation: "landscape",
  });

  const results = (r.data && r.data.results) ? r.data.results : [];
  const total   = (r.data && typeof r.data.total_pages === "number") ? r.data.total_pages : 0;

  return { photos: results.map(normalize_photo), page: g_page, per_page: g_per_page, total_pages: total, rate: r.rate };
}

export function set_per_page(n) {
  if (typeof n !== "number") return;
  if (n < 1) n = 1;
  if (n > MAX_PER_PAGE) n = MAX_PER_PAGE;
  g_per_page = n;
}

export function next_page() { g_page += 1; return g_page; }
export function reset_pagination() { g_page = 1; }

export async function register_download(download_location) {
  if (!download_location) return;
  try {
    const path = new URL(download_location).pathname;
    await do_request(path, {});
  } catch {
    /* swallow */
  }
}
