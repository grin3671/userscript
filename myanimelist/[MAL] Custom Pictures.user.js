// ==UserScript==
// @name         [MAL] Custom Pictures
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Beautifully pictures to everyone!
// @author       grin3671
// @match        https://myanimelist.net/*
// @icon         https://www.google.com/s2/favicons?domain=myanimelist.net
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // LOAD/UPDATE LOCALSTORAGE
  let localBase = getCustomPosters();
  setCustomPosters();

  function getCustomPosters () {
    let storage = JSON.parse(localStorage.getItem('malCustomPosters'));
    return storage ? storage : {};
  }

  function setCustomPosters () {
    localStorage.setItem('malCustomPosters', JSON.stringify(localBase));
    updatePosters();
  }

  // CHECK PAGE
  let currentURL = location.pathname.substring(1).split('/');
  switch (currentURL[0]) {
    case 'character':
      if (currentURL[3] === 'pictures' || currentURL[3] === 'pics') addControlButtons();
      break;
  }

  // CHARACTER PAGE
  function addControlButtons () {
    // ADD SCRIPT SETTINGS BUTTON
    let header, dialog, controlButton, controlcon;
    header = document.querySelector('.floatRightHeader');
    controlButton = document.createElement('a');
    controlButton.style.cursor = 'pointer';
    controlcon = document.createElement('i');
    controlcon.classList.add('fa-solid', 'fa-cog', 'mr4');
    controlButton.append(controlcon, 'Set custom poster');
    header.prepend(controlButton, ' | ');
    controlButton.addEventListener('click', openSettings);

    function createSettings () {
      let newDialogue = document.createElement('dialog');
      newDialogue.setAttribute('style', 'position: fixed; top: 0; bottom: 0; width: 500px; padding: 0; border: 1px solid rgba(0,0,0,.2); border-radius: .3rem; font-size: 1rem; font-family: "Segoe UI"; line-height: 1.5; text-align: left;');
      newDialogue.id = 'customPostersSettings';

      let dialogHeader,
            dialogHeaderTitle,
            dialogHeaderClose,
          dialogContent,
            dialogSelect,
              dialogOption,
            dialogCol,
              dialogFormText,
              dialogImage,
              dialogName,
              dialogButtonDelete,
                dialogButtonDeleteIcon,
              dialogButtonLink,
              dialogInputGroup,
                dialogInputIcon,
                dialogInput,
                dialogButtonSave,
          dialogFooter,
            dialogButtonClear,
            dialogButtonClose;

      dialogHeaderTitle = document.createElement('h5');
      dialogHeaderTitle.setAttribute('style', 'padding: 0; margin: 0; font-size: 1.25rem; line-height: 1.5;');
      dialogHeaderTitle.textContent = 'Custom Posters Settings';

      dialogHeaderClose = document.createElement('button');
      dialogHeaderClose.className = 'btn-close';
      dialogHeaderClose.setAttribute('style', 'width: 1em; height: 1em; margin: -.25em; margin-left: auto; background: transparent; border: 0; font-size: 2rem; line-height: 0; cursor: pointer;');
      dialogHeaderClose.textContent = '×';
      dialogHeaderClose.onclick = closeSettings;

      dialogHeader = document.createElement('div');
      dialogHeader.className = 'modal-header';
      dialogHeader.setAttribute('style', 'display: flex; align-items: center; padding: 1rem 1rem; border-bottom: 1px solid #dee2e6;');
      dialogHeader.append(dialogHeaderTitle, dialogHeaderClose);

      dialogSelect = document.createElement('select');
      dialogSelect.id = 'customPostersList';
      dialogSelect.setAttribute('style', 'width: 100%; padding: .375rem 1.75rem .375rem .75rem; border: 1px solid #ced4da; border-radius: .25rem; font: inherit; line-height: 1.5;');

      dialogOption = document.createElement('option');
      dialogOption.disabled = 'disabled';
      dialogOption.selected = 'selected';
      dialogOption.textContent = 'Change customized posters';
      dialogSelect.append(dialogOption);

      Object.entries(localBase).forEach(([key, value]) => {
        dialogOption = document.createElement('option');
        dialogOption.value = key;
        dialogOption.textContent = '#' + value.id + ' '+ value.title;
        dialogSelect.append(dialogOption);
      });

      dialogSelect.addEventListener('change', (event) => {
        loadSettings(localBase[event.target.value], event.target.value);
      });

      dialogImage = document.createElement('img');
      dialogImage.setAttribute('style', 'float: left; width: 112px; height: 175px; padding: 1px; margin-right: 16px; border: 1px solid #bebebe;');

      dialogContent = document.createElement('div');
      dialogContent.className = 'modal-body';
      dialogContent.setAttribute('style', 'display: flex; flex: 1 1 auto; flex-wrap: wrap; padding: 1rem;');
      dialogContent.append(dialogSelect);

      dialogCol = document.createElement('div');
      dialogCol.className = 'col-3 mt8';
      dialogCol.setAttribute('style', 'flex: 0 0 auto; width: 25%;');
      dialogCol.append(dialogImage);
      dialogContent.append(dialogCol);

      dialogName = document.createElement('strong');
      dialogName.setAttribute('style', 'font-size: 1rem; line-height: 2;');
      dialogName.textContent = 'Name';

      dialogInput = document.createElement('input');
      dialogInput.id = 'customPosterSource';
      dialogInput.className = 'form-control';
      dialogInput.type = 'text';
      dialogInput.placeholder = 'ex: https://i.imgur.com/image.jpg';
      dialogInput.setAttribute('style', 'flex: 1 1 auto; padding: .375rem .75rem; border: 1px solid #ced4da; border-radius: .25rem 0 0 .25rem; font-size: 1rem; box-sizing: border-box;');

      dialogButtonSave = document.createElement('input');
      dialogButtonSave.id = 'customPosterUpdate';
      dialogButtonSave.className = 'btn btn-primary';
      dialogButtonSave.setAttribute('style', 'padding: .375rem .75rem; margin-left: -1px; background: #0d6efd; border: 1px solid #0d6efd; border-radius: 0 .25rem .25rem 0; color: #fff; font-size: 1rem; line-height: 1.5; cursor: pointer;');
      dialogButtonSave.type = 'button';
      dialogButtonSave.value = 'Save';

      dialogInputGroup = document.createElement('div');
      dialogInputGroup.className = 'input-group mt8';
      dialogInputGroup.setAttribute('style', 'display: flex; width: 100%;');
      dialogInputGroup.append(dialogInput, dialogButtonSave);

      dialogButtonDeleteIcon = document.createElement('i');
      dialogButtonDeleteIcon.className = 'fa-solid fa-trash mr8';

      dialogButtonDelete = document.createElement('button');
      dialogButtonDelete.id = 'customPosterDelete';
      dialogButtonDelete.className = 'btn btn-outline-secondary mt8';
      dialogButtonDelete.setAttribute('style', 'padding: .375rem .75rem; margin-left: -1px; background: transparent; border: 1px solid transparent; border-radius: .25rem; color: #6c757d; font-size: 1rem; line-height: 1.5; cursor: pointer;');
      dialogButtonDelete.title = 'Delete this poster from settings and use default poster.';
      dialogButtonDelete.append(dialogButtonDeleteIcon, 'Use default');

      dialogButtonLink = document.createElement('a');
      dialogButtonLink.className = 'btn btn-outline-primary mt8';
      dialogButtonLink.setAttribute('style', 'display: inline-block; padding: .375rem .75rem; margin-left: auto; background: transparent; border: 1px solid transparent; border-radius: .25rem; color: #0d6efd; font-size: 1rem; line-height: 1.5; cursor: pointer;');
      dialogButtonLink.textContent = 'Go to page.';

      dialogFormText = document.createElement('div');
      dialogFormText.className = 'form-text';
      dialogFormText.setAttribute('style', 'margin: .25rem 0; font-size: .875em; color: #6c757d;');
      dialogFormText.textContent = 'To use external image, enter it\'s link in the field above and click on the save button.';

      dialogCol = document.createElement('div');
      dialogCol.className = 'col-9 mt8';
      dialogCol.setAttribute('style', 'display: flex; flex-wrap: wrap; flex: 0 0 auto; width: calc(75% - 1rem); margin-left: 1rem;');
      dialogCol.append(dialogName, dialogInputGroup, dialogFormText, dialogButtonDelete, dialogButtonLink);
      dialogContent.append(dialogCol);

      dialogButtonClear = document.createElement('button');
      dialogButtonClear.className = 'btn btn-outline-danger';
      dialogButtonClear.setAttribute('style', 'padding: .375rem .75rem; background: transparent; border: 1px solid #dc3545; border-radius: .25rem; color: #dc3545; font-size: 1rem; line-height: 1.5; cursor: pointer;');
      dialogButtonClear.append(dialogButtonDeleteIcon, 'Clear All Settings');
      dialogButtonClear.onclick = clearSettings;

      dialogButtonClose = document.createElement('input');
      dialogButtonClose.className = 'inputButton flat';
      dialogButtonClose.setAttribute('style', 'padding: .375rem .75rem; margin-left: 10px; background: transparent; border: 1px solid #6c757d; border-radius: .25rem; color: #6c757d; font-size: 1rem; line-height: 1.5; cursor: pointer;');
      dialogButtonClose.type = 'button';
      dialogButtonClose.value = 'Close';
      dialogButtonClose.onclick = closeSettings;

      dialogFooter = document.createElement('div');
      dialogFooter.className = 'modal-footer';
      dialogFooter.setAttribute('style', 'display: flex; justify-content: space-between; padding: .75rem; border-top: 1px solid #dee2e6; text-align: right;');
      dialogFooter.append(dialogButtonClear, dialogButtonClose);

      newDialogue.append(dialogHeader, dialogContent, dialogFooter);
      document.body.append(newDialogue);
      return newDialogue;
    }

    function openSettings () {
      if (!dialog) dialog = createSettings();
      dialog.showModal();

      let key = currentURL[0] + '_' + currentURL[1];
      if (localBase.hasOwnProperty(key)) {
        loadSettings(localBase[key], key);
      } else {
        loadSettings(getDefaultSettings(), key);
      }
    }

    function loadSettings (data, key) {
      let image, name, url, buttonDelete, buttonUpdate, buttonLink;

      image = dialog.querySelector('img');
      image.src = data.image;

      name = dialog.querySelector('strong');
      name.textContent = data.title.substring(0, data.title.indexOf('(') - 1);

      url = dialog.querySelector('#customPosterSource');
      url.value = data.image;

      buttonDelete = dialog.querySelector('#customPosterDelete');
      buttonDelete.onclick = function () {
        deleteSettings(key);
      };

      buttonUpdate = dialog.querySelector('#customPosterUpdate');
      buttonUpdate.onclick = function () {
        data.image = url.value;
        setCustomPosters();
      };

      buttonLink = dialog.querySelector('a');
      buttonLink.href = 'https://myanimelist.net/' + data.cat + '/' + data.id + '/';
    }

    function deleteSettings (id) {
      console.warn('CUSTOM POSTER: You now delete poster of ' + localBase[id].title + '!', id);
      delete localBase[id];
      setCustomPosters();
    }

    function clearSettings () {
      localStorage.removeItem('malCustomPosters');
    }

    function closeSettings () {
      dialog.close();
    }


    // ADD INDIVIDUAL POSTERS BUTTON
    let pictures = document.querySelectorAll('td[width="225"][align="center"] > div:last-child');
    pictures.forEach((element, i) => {
      let controlButton = document.createElement('a');
      let controlcon = document.createElement('i');
      controlcon.classList.add('fa-solid', 'fa-check-square', 'mr4');
      controlButton.append(controlcon, 'Set as main');
      controlButton.style.cursor = 'pointer';
      controlButton.addEventListener('click', selectImage);
      element.prepend(controlButton, ' | ');
    });

    function selectImage (event) {
      let src = event.target.closest('td').querySelector('img').src;
      let title = document.title.toString();
      localBase['character_' + currentURL[1]] = {"id": currentURL[1], "cat": "character", "title": title.substring(0, title.indexOf(' - Pictures')), "image": src};
      setCustomPosters();
    }

    function getDefaultSettings () {
      let arr = {};
      arr.id = currentURL[1];
      arr.cat = 'character';
      arr.title = document.title.toString();
      arr.title = arr.title.substring(0, arr.title.indexOf(' - Pictures'));
      arr.image = document.querySelector('a[href *= "/' + arr.cat + '/' + arr.id + '"] > img').src;
      return arr;
    }
  }

  // UPDATE PAGE
  function updatePosters () {
    console.warn(localBase);
    Object.entries(localBase).forEach(([key, value]) => {
      let pictures = document.querySelectorAll('a[href *= "/' + value.cat + '/' + value.id + '"] > img');
      // MAL's CDN provides small thumbnails for main picture only!
      // MAL's thumbnail has different dimension from full image: 42x62 not 42x65
      pictures.forEach((element) => {
        element.class = '';
        element.setAttribute('data-srcset', '');
        element.setAttribute('data-src', '');
        element.setAttribute('srcset', '');
        element.src = value.image;
        console.warn('Poster Update:', element, value.image);
      });
    });
  }
})();
