/* ************************************************************************** */
/*  File: header.js                                                            */
/*  Brief: Login dropdown + search wiring.                                     */
/* ************************************************************************** */

"use strict";

import { $, on } from "../core/ui.js";
import { debounce } from "../core/utils.js";

export function init_header(opts) {
  const on_search = opts && opts.on_search ? opts.on_search : null;

  const login_btn = $("#loginBtn");
  const dropdown  = $("#loginDropdown");
  const input     = $("#searchInput");
  const button    = $("#searchBtn");

  on(login_btn, "click", function (e) {
	if (!dropdown)
		return;
	
	if (dropdown.classList.contains("show")) {
		dropdown.classList.remove("show");
	} else {
		dropdown.classList.add("show");
	}
  });

  window.addEventListener("click", function (e) {
    const target = e.target;
    const inside = target && target.closest ? target.closest("#loginBtn") : null;
    if (!inside && dropdown && dropdown.classList.contains("show")) {
      dropdown.classList.remove("show");
    }
  });

  if (dropdown) {
    dropdown.addEventListener("submit", function (e) {
      e.preventDefault();
      const user = dropdown.querySelector('input[type="text"]');
      const pass = dropdown.querySelector('input[type="password"]');
      const u = user ? user.value : "";
      const p = pass ? pass.value : "";
      if (u && p) {
        alert("WELCOME, " + u + "!");
        dropdown.classList.remove("show");
      } else {
        alert("ERRORASO");
      }
    });
  }

  function run_search() {
    if (!on_search)
		return;
    const q = input && input.value ? input.value.trim() : "";
    if (q) on_search(q);
  }

  on(button, "click", run_search);
  on(input, "keypress", function (e) {
    if (e.key === "Enter")
		run_search();
  });
  
  on(input, "input", debounce(run_search, 600));
}
