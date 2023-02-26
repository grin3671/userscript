// ==UserScript==
// @name         [MAL] Unvoiced
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Save and label unvoiced character with icon.
// @author       grin3671
// @match        https://myanimelist.net/anime/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myanimelist.net
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Prepare localStorage
  const characterStorage = {
    name: 'userjsMALUnvoiced',
    get () { return JSON.parse(localStorage.getItem(this.name)); },
    set (arr) { localStorage.setItem(this.name, JSON.stringify(arr)); },
  }

  // Start script
  checkPage();

  function checkPage () {
    let currentURL = location.pathname.substring(1).split('/');
    if (currentURL[0] == 'anime' && currentURL[3] == 'characters') {
      addControls(currentURL[1]);
      addStyles();
    }
  }

  function addControls (animeID) {
    let characters = document.querySelectorAll('.js-anime-character-table');
    characters.forEach((character, index) => {
      let unvoicedCharacters = characterStorage.get();
      let characterID = animeID + '_' + character.querySelector('.spaceit_pad').children[0].href.split('/')[4];
      character.querySelector('.spaceit_pad').append(
        createElement('button', {
          id: characterID,
          class: unvoicedCharacters.includes(characterID) ? 'userjs-btn-mark-unvoiced active' : 'userjs-btn-mark-unvoiced',
          text: 'Unvoiced',
          tooltip: 'Toggle "Unvoiced" label'
        }
      ));
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('userjs-btn-mark-unvoiced')) {
        e.target.classList.contains('active') ? changeMark.call(e.target, 'remove') : changeMark.call(e.target, 'add');
      }
    })
  }

  function changeMark (action) {
    this.classList.toggle('active');
    let unvoicedCharacters = characterStorage.get() || [];
    let thisIndex = unvoicedCharacters.findIndex(chara => chara == this.dataset.id);

    switch (action) {
      case 'add':
        unvoicedCharacters.push(this.dataset.id);
        characterStorage.set(unvoicedCharacters);
        break;

      case 'remove':
        if (thisIndex >= 0) unvoicedCharacters.splice(thisIndex, 1);
        characterStorage.set(unvoicedCharacters);
        break;
    }
  }

  function createElement (type = 'div', data = {}, callback) {
    let e = document.createElement(type);
    if (data.class) e.className = data.class;
    if (data.id) e.dataset.id = data.id;
    if (data.text) e.textContent = data.text;
    if (data.tooltip) e.title = data.tooltip;
    if (callback) callback.call(e);
    return e;
  }

  function addStyles() {
    let style = document.createElement('style');
    style.innerHTML = `
      .userjs-btn-mark-unvoiced {
        appearance: none;
        position: absolute;
        background: #888;
        color: #fff;
        border: none;
        padding: 2px;
        font-size: 0;
        margin: -3px 0 0 16px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
      }
      .userjs-btn-mark-unvoiced:hover {
        opacity: 1;
      }
      .userjs-btn-mark-unvoiced.active {
        background: #2e51a2;
        opacity: 1;
      }

      .userjs-btn-mark-unvoiced::before {
        content: '';
        display: block;
        font-family: 'Font Awesome 6 Pro';
        font-size: 16px;
        width: 20px;
        line-height: 20px;
      }
      .userjs-btn-mark-unvoiced.active::before {
        content: '';
      }
    `;
    document.head.appendChild(style);
  }
})();
