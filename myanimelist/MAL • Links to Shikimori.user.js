// ==UserScript==
// @name         MAL • Links to Shikimori
// @namespace    https://github.com/grin3671/userscript/
// @version      1.3
// @description  Provide links to Shikimori mirror pages.
// @author       grin3671
// @match        https://myanimelist.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shikimori.one
// @grant        none
// @updateURL    https://github.com/grin3671/userscript/raw/main/myanimelist/MAL%20%E2%80%A2%20Links%20to%20Shikimori.user.js
// @downloadURL  https://github.com/grin3671/userscript/raw/main/myanimelist/MAL%20%E2%80%A2%20Links%20to%20Shikimori.user.js
// ==/UserScript==

(function() {
  'use strict';

  // Initial data
  let supportedCategories = ['anime', 'manga', 'character', 'people'];
  let shikimoriCategories = ['animes', 'mangas', 'characters', 'people']

  const createShikimoriLink = (href, index) => {
    let a = document.createElement('a');
    let i = document.createElement('i');
    i.className = 'fa-solid fa-external-link-square mr4';
    a.append(i, 'Shikimori');
    a.style.marginLeft = '10px';
    a.href = 'https://shikimori.one/' + shikimoriCategories[index] + '/' + href[1] + '?utm_source=mal_external';
    return a;
  };

  let currentURL = location.pathname.substring(1).split('/');
  let currentCAT = supportedCategories.indexOf(currentURL[0]);
  if ( currentCAT >= 0 ) {
    let header = document.querySelector('.header-right');
    if (!header) return;
    header.append(createShikimoriLink(currentURL, currentCAT));
  }
})();
