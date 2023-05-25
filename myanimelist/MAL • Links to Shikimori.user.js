// ==UserScript==
// @name         MAL • Links to Shikimori
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Provide links to Shikimori mirror pages.
// @author       grin3671
// @match        https://myanimelist.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shikimori.me
// @grant        none
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
    a.href = 'https://shikimori.me/' + shikimoriCategories[index] + '/' + href[1] + '?utm_source=mal_external';
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
