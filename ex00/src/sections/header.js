/* ************************************************************************** */
/*  File: header.js                                                            */
/*  Brief: Login dropdown + search wiring.                                     */
/* ************************************************************************** */

"use strict";

import { $, on } from "../core/ui.js";
import { debounce } from "../core/utils.js";
import { loginWithUnsplash, fetchProfile, logoutUnsplash, isLoggedIn } from "../core/auth.js";

export function init_header(opts) {
  const on_search = opts && opts.on_search ? opts.on_search : null;
  const login_btn   = $("#loginBtn");
  const login_dot   = $("#loginStatusDot");
  const profile_btn = $("#profileBtn");
  const input       = $("#searchInput");
  const button      = $("#searchBtn");

    // Login/logout con el mismo botón
    let logged = false;
    if (login_btn) {
      on(login_btn, "click", async (e) => {
        if (logged) {
          await logoutUnsplash();
        } else {
          loginWithUnsplash();
        }
      });
    }

  // Perfil
  if (profile_btn) {
    on(profile_btn, "click", async (e) => {
      await fetchProfile();
    });
  }


  // Mostrar/ocultar botones según login
  (async function updateUI() {
    try {
        logged = await isLoggedIn();
      if (login_btn)   login_btn.style.display   = logged ? "none" : "";
      if (profile_btn) profile_btn.style.display = logged ? "" : "none";
      if (login_dot)   login_dot.style.background = logged ? "#0c0" : "#d00";
    } catch (e) {
      // Si hay error (por ejemplo, 401), mostrar solo login
      if (login_btn)   login_btn.style.display   = "";
      if (profile_btn) profile_btn.style.display = "none";
      if (login_dot)   login_dot.style.background = "#d00";
    }
  })();

  // Búsqueda
  function run_search() {
    if (!on_search) return;
    const q = input && input.value ? input.value.trim() : "";
    if (q) on_search(q);
  }

  if (button) on(button, "click", run_search);
  if (input) {
    on(input, "keypress", function (e) {
      if (e.key === "Enter") run_search();
    });
    on(input, "input", debounce(run_search, 600));
  }
}
