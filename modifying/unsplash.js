// src/unsplash.js


window.UnsplashAPI = (() => {

  const ACCESS_KEY = "dcsFT30KGGIStWRqJ1-pGXoWgMZD0EEGhTufldiPxJc";
  const BASE = "https://api.unsplash.com";

  let page = 1;
  let perPage = 24;
  let lastQuery = "";
  let abortCtrl = null;


  const qs = (obj) =>
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

  function normalizePhoto(p) {
    return {
      id: p.id,
      alt: p.alt_description || p.description || "Untitled",
      authorName: p.user?.name || "Unknown",
      authorLink: p.user?.links?.html || "#",
      small: p.urls?.small,
      regular: p.urls?.regular,
      thumb: p.urls?.thumb,
      likes: p.likes ?? 0,
      downloadLocation: p.links?.download_location,
    };
  }

  function cancelOngoing() {
    if (abortCtrl) {
      abortCtrl.abort();
      abortCtrl = null;
    }
  }

  async function request(path, params = {}) {
    cancelOngoing();
    abortCtrl = new AbortController();

    const url =
      `${BASE}${path}` +
      (Object.keys(params).length ? `?${qs(params)}` : "");

    const res = await fetch(url, {
      signal: abortCtrl.signal,
      headers: {
        "Accept-Version": "v1",
        "Authorization": `Client-ID ${ACCESS_KEY}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status} – ${text || res.statusText}`);
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



  async function searchPhotos(query, { reset = false } = {}) {
    if (reset) page = 1;
    lastQuery = query;

    const { data, rate } = await request("/search/photos", {
      query,
      page,
      per_page: perPage,
      orientation: "landscape",
    });

    const results = (data.results || []).map(normalizePhoto);
    const totalPages = data.total_pages ?? 0;
    return { photos: results, page, perPage, totalPages, rate };
  }

  async function listPhotos({ orderBy = "popular", reset = false } = {}) {
    if (reset) page = 1;
    const { data, rate } = await request("/photos", {
      page,
      per_page: perPage,
      order_by: orderBy,
    });
    const results = (data || []).map(normalizePhoto);
    return { photos: results, page, perPage, totalPages: null, rate };
  }

  function nextPage() {
    page += 1;
    return page;
  }

  function resetPagination() {
    page = 1;
  }

  function setPerPage(n) {
    perPage = Math.max(1, Math.min(30, n));
  }

  async function registerDownload(downloadLocation) {
    if (!downloadLocation) return;
    try {
      await request(new URL(downloadLocation).pathname, {});
    } catch {

    }
  }

  function debounce(fn, delay = 400) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  return {
    searchPhotos,
    listPhotos,
    nextPage,
    resetPagination,
    setPerPage,
    registerDownload,
    debounce,
  };
})();
