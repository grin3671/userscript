// ==UserScript==
// @name         [FIX] Search Autocomplete
// @namespace    https://myanimelist.net/
// @version      1.0
// @description  Fixes annoying Chrome bug with autocomplete username in search field.
// @author       grin3671
// @match        https://myanimelist.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myanimelist.net
// @grant        none
// @updateURL    https://github.com/grin3671/userscript/raw/main/myanimelist/fix-search-autocomplete.user.js
// @downloadURL  https://github.com/grin3671/userscript/raw/main/myanimelist/fix-search-autocomplete.user.js
// ==/UserScript==

(function() {
  "use strict";
  let searchBar = document.getElementById("topSearchText");
  searchBar.name = "search";
  searchBar.value = "1";
  setTimeout(() => {
    searchBar.value = "";
  }, 500);
})();
