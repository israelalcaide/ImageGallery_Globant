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
    const login_btn = $("#loginBtn");
    const login_dot = $("#loginStatusDot");
    const input = $("#searchInput");
    const button = $("#searchBtn");


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

  (async function updateUI() {
    try {
      logged = await isLoggedIn();
      if (login_dot)
        login_dot.style.background = logged ? "#0c0" : "#d00";
    } catch (e) {
      if (login_dot)
        login_dot.style.background = "#d00";
    }
  })();

    function run_search() {
        if (!on_search)
            return;
        const q = input && input.value ? input.value.trim() : "";
        if (q)
            on_search(q);
    }

    if (button)
        on(button, "click", run_search);
    if (input) {
        on(input, "keypress", function (e) {
            if (e.key === "Enter")
                run_search();
        });
        on(input, "input", debounce(run_search, 600));
    }
}
