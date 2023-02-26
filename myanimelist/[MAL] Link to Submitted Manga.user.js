// ==UserScript==
// @name         [MAL] Link to Submitted Manga
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a link to submitted manga to the following notification page.
// @author       grin3671
// @match        https://myanimelist.net/panel.php?go=mangadb&do=add
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myanimelist.net
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Function Get Manga ID from "Add another pic" Link
  const getNewMangaID = () => {
    let link = document.querySelector("[href*=\"&manga_id=\"]");
    return link ? link.href.substring(link.href.lastIndexOf("=") + 1) : false;
  }

  // Function Helper Create Element with Callback
  const createElement = (type, callback) => {
    let e = document.createElement(type);
    if (typeof callback === 'function') callback(e);
    return e;
  }

  // Main Function
  let mangaID = getNewMangaID();
  if (mangaID) {
    // create Element
    document.querySelector(".goodresult").append(createElement("div", e => {
      e.setAttribute("style", "padding-top: 10px; text-align: center;");
      e.append(createElement("a", e => {
        e.href = "https://myanimelist.net/manga/" + mangaID;
        e.className = "mal-btn primary";
        e.textContent = "Go to Manga Page";
        e.setAttribute("style", "color: var(--mal-btn-text-color);");
      }));
    }));
  }
})();
