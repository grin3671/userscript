// ==UserScript==
// @name         Рейтинг правщиков
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет возможность запоминать плюсы/минусы по правкам пользователей.
// @author       grin3671
// @license      MIT
// @match        https://shikimori.one/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shikimori.one
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Prepare localStorage
  const scoreStorage = {
    name: 'usersVersionsScores2',
    get () { return JSON.parse(localStorage.getItem(this.name)); },
    set (arr) { localStorage.setItem(this.name, JSON.stringify(arr)); },
  }

  function checkPage () {
    let currentURL = location.pathname.substring(1).split('/');
    // Launch on moderations pages
    if (currentURL[0] == 'moderations' && currentURL[1] == 'versions') {
      updateControls();
      addStyles();
    }
    // Launch on entries edit pages
    if (currentURL[currentURL.length - 2] == 'edit') {
      updateControls();
      addStyles();
    }
  }

  function updateControls() {
    let selector, authors;
    selector = '.b-log_entry > .author';
    authors = document.querySelectorAll(selector);
    authors.forEach(item => {
      if (!item.classList.contains('userjs--updated')) {
        let userID, versionID;
        // Get IDs from log_entry & user avatar link
        userID = item.querySelector('img').src.split('/')[6].split('.')[0]; // TODO: replace to regex if it faster
        versionID = item.parentElement.id;
        item.append(createControls(userID, versionID));
        item.classList.add('userjs--updated');
      }
    });
  }

  function createControls (userID, versionID) {
    let container, increaseButton, scoreSum, decreaseButton, scoreBar;

    container = createElement();

    increaseButton = createElement('button', { class: 'btn btn--round btn--icon icon--increase' }, function () {
      this.addEventListener('click', (e) => { changeScore(e, 'increase', userID, versionID) });
    });

    decreaseButton = createElement('button', { class: 'btn btn--round btn--icon icon--decrease' }, function () {
      this.addEventListener('click', (e) => { changeScore(e, 'decrease', userID, versionID) });
    });

    scoreSum = createElement('span', { id: userID }, function () {
      this.textContent = 0;
      this.className = "text--neutral";
      let el = this;
      document.addEventListener('userjs-version-score:updated', (e) => {
        if (e.detail == userID) updateControl.call(el, userID);
      });
    });

    scoreBar = createElement("div", { class: 'progress' });

    container.append(increaseButton, scoreSum, decreaseButton, scoreBar);
    updateControl.call(scoreSum, userID);

    return container;
  }


  function updateControl (userID) {
    let userScore = getScore(userID);
    let scoreRatio = Math.round(userScore.ratio * 100) + "%";
    this.textContent = userScore.value;
    this.className = userScore.value >= 100 ? "text--green" : userScore.value <= -5 ? "text--red" : "text--neutral";
    this.parentNode.setAttribute("style", "--score-ratio: " + scoreRatio);
    this.title = userScore.total + " (" + scoreRatio + ")";
    if (userScore.total > 0) this.parentNode.setAttribute("data-total", userScore.total);
  }


  function changeScore (event, action, id, version) {
    let scores, userScore, updateEvent;
    scores = scoreStorage.get() || [];
    userScore = scores.findIndex(item => item.id == id);

    if (userScore >= 0) {
      userScore = scores[userScore];
      // Check if value already in arrays
      let mergeArray = userScore.versions[0].concat(userScore.versions[1]);
      if (mergeArray.includes(version)) {
        let isInDesireArray = userScore.versions[action == 'increase' ? 0 : 1].includes(version);
        // if true remove it and add to another array
        if (isInDesireArray) return false;
        let versionIndex = userScore.versions[action == 'increase' ? 1 : 0].findIndex(version);
        if (versionIndex => 0) userScore.versions[action == 'increase' ? 1 : 0].splice(versionIndex, 1);
      }
      userScore.versions[action == 'increase' ? 0 : 1].push(version);
      userScore.updatedAt = Date.now();
    } else {
      userScore = {
        id: id,
        versions: [[], []],
        updatedAt: Date.now()
      };
      userScore.versions[action == 'increase' ? 0 : 1].push(version);
      scores.push(userScore);
    }

    scoreStorage.set(scores);

    updateEvent = new CustomEvent('userjs-version-score:updated', { detail: id });
    document.dispatchEvent(updateEvent);
  }


  function getScore (id) {
    let scores, userScore, values;
    scores = scoreStorage.get() || [];
    userScore = scores.filter(item => item.id == id)[0];
    values = {};
    values.total = userScore ? userScore.versions[0].length + userScore.versions[1].length : 0;
    values.value = userScore ? userScore.versions[0].length - userScore.versions[1].length : 0;
    values.ratio = userScore ? userScore.versions[0].length / values.total : 0;
    return values;
  }


  function addStyles() {
    let style = document.createElement('style');
    style.innerHTML = `
    .b-log_entry > .author.userjs--updated {
      display: flex;
      align-items: center;
    }
    .b-log_entry > .author.userjs--updated > div:last-child {
      position: relative;
      display: flex;
      align-items: center;
      margin: 0 0 0 1em;
    }
    .b-log_entry > .author.userjs--updated > div:last-child > span {
      min-width: 16px;
      margin: 0 2px;
      font-weight: bold;
      text-align: center;
    }
    .b-log_entry > .author.userjs--updated .btn--round {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin: 0 2px;
      background: var(--color-surface, #456);
      border-radius: 50%;
      color: var(--color-text-secondary, #fff);
      font-family: shikimori;
      font-size: 12px;
      line-height: 20px;
    }
    .b-log_entry > .author.userjs--updated .btn--round:hover {
      background: var(--color-surface-hover, #1d78b7);
    }
    .b-log_entry > .author.userjs--updated .btn--round:active {
      background: var(--color-surface-active, #155785);
    }
    .b-log_entry > .author.userjs--updated .icon--increase::before {
      content: '+';
    }
    .b-log_entry > .author.userjs--updated .icon--decrease::before {
      content: '-';
    }
    .text--red {
      color: var(--color-danger, red);
    }
    .text--green {
      color: var(--color-success, green);
    }
    .b-log_entry > .author.userjs--updated .progress {
      position: absolute;
      inset: 0;
      display: none;
      background: #700;
      border-radius: 12px;
      overflow: hidden;
      opacity: .3;
      z-index: -1;
      pointer-events: none;
    }
    .b-log_entry > .author.userjs--updated .progress::before {
      content: "";
      width: var(--score-ratio, 0%);
      background: green;
    }
    .b-log_entry > .author.userjs--updated [data-total] .progress {
      display: flex;
    }
    `;
    document.head.appendChild(style);
  }

  function createElement (type = 'div', data = {}, callback) {
    let e = document.createElement(type);
    if (data && data.class) e.className = data.class;
    if (data && data.id) e.dataset.id = data.id;
    if (callback) callback.call(e);
    return e;
  }

  checkPage();

  document.addEventListener('page:load', checkPage);
  document.addEventListener('turbolinks:load', checkPage);
})();
