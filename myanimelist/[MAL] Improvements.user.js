// ==UserScript==
// @name         [MAL] Improvements
// @namespace    http://tampermonkey.net/
// @version      0.5.0
// @description  Small improvements for DB Fans.
// @author       grin3671
// @match        https://myanimelist.net/*
// @icon         https://www.google.com/s2/favicons?domain=myanimelist.net
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // CHECK PAGE
  let currentURL = location.pathname.substring(1).split('/');
  let params = new URLSearchParams(location.search);
  switch (currentURL[0]) {
    case 'anime':
      addDBEntriesNavigation(currentURL, 'anime');
      break;

    case 'manga':
      addDBEntriesNavigation(currentURL, 'manga');
      break;

    case 'character':
      characterPageImprovements(+currentURL[1]);
      break;

    case 'myblog.php':
      if (params.get('go') == 'edit') {
        blogCharacterCounter();
      }
      break;

    case 'dbchanges.php':
      if (params.get('go') == 'voiceactor' && params.get('do') == 'addrole') {
        addVoiceActorDBPageStyles();
        tableVoiceActorsRoles();
      }
      break;

    case 'panel.php':
      if (params.get('go') == 'characters' && params.get('do') == 'edit') {
        changeCharacterEditPageFields();
      }
      break;
  }


  // DB Navigation
  function addDBEntriesNavigation (url, type) {
    let headerElement
      , ID = +url[1] + 0;

    if (ID !== ID) return;

    headerElement = document.querySelector('.header-right');
    headerElement = headerElement ? headerElement : adjustHeader();

    if (!headerElement) return;

    headerElement.append(
      addNavigationLink(type, ID - 1),
      createElement('i', { class: 'ml8', text: '|' }),
      addNavigationLink(type, ID + 1)
    );

    function addNavigationLink(type, newID, icon) {
      return createElement('a', { class: 'ml8' }, (link) => {
        link.href = 'https://myanimelist.net/' + type + '/' + newID;
        if (newID < ID) {
          link.append(
            createElement('i', { class: 'fa-solid fa-circle-chevron-left mr4' }),
            'Prev ID'
          );
        } else {
          link.append(
            'Next ID',
            createElement('i', { class: 'fa-solid fa-circle-chevron-right ml4' })
          );
        }
      });
    };

    function adjustHeader() {
      let header = document.querySelector('#contentWrapper > div:first-child');
      header.querySelector('h1').remove();
      header.append(
        createElement('div', { class: 'h1 edit-info' }, (newHeader) => {
          newHeader.append(
            createElement('div', { class: 'h1-title', text: '404 Not Found' }),
            createElement('div', { class: 'header-right' })
          );
        })
      );
      return header.querySelector('.header-right');
    }
  }


  // BLOG
  function blogCharacterCounter () {
    let $ = {
      textarea: document.querySelector('[name="entry_text"]'),
      hintarea: document.querySelector('[name="entry_text"] + .spaceit_pad')
    };

    $.hintarea.append(
      createElement('small', false, (hint) => {
        hint.style.float = 'right';
        $.hint = hint;
        fillText();
      })
    );

    $.textarea.addEventListener('input', fillText);

    function fillText () {
      $.hint.textContent = 'Max length: ' + $.textarea.value.length + '/60000';
      $.hint.style.color = $.textarea.value.length >= 60000 ? 'red' : $.textarea.value.length >= 55000 ? 'darkorange' : '';
    }
  }

  // CHARACTER PAGE
  function characterPageImprovements (id) {
    if (document.querySelector("#contentWrapper > #content > .badresult")) {
      // Add "Edit Character Information" Link
      document.querySelector("#contentWrapper > div:first-child").prepend(
        createElement("a", null, e => {
          e.textContent = "Edit Character Information";
          e.href = "https://myanimelist.net/panel.php?go=characters&do=edit&character_id=" + id;
          e.setAttribute("style", "float: right; padding: 5px 7px; font: normal 12px/19px verdana,arial,sans-serif;");
          e.prepend(
            createElement("i", { class: "fa-solid fas fa-file-edit mr4" }),
          )
        }),
      );
    }

    let characterImages = document.querySelectorAll('.page-common img.portrait-225x350');

    characterImages.forEach((element) => {
      element.complete ? loaded(element) : element.addEventListener('load', function () {
        loaded(element);
      });
    });

    function loaded (image, completed) {
      let interval = setTimeout(function run () {
        image.classList.contains('lazyloaded') ? checkPosterSize() : setTimeout(run, 500);
      });

      function checkPosterSize () {
        clearTimeout(interval);

        let dummyImage = new Image();
        dummyImage.onload = function() {
          if (this.width !== 225 || this.height !== 350) {
            if (this.width === 450 && this.height === 700) return;
            if (this.width >= 225 && this.height >= 350 && this.width / 9 === this.height / 14) return;

            let mainPosterSizes = document.createElement('a');
            mainPosterSizes.href = 'https://myanimelist.net/dbchanges.php?cid=' + id + '&t=addpicture';
            mainPosterSizes.className = 'js-warning-notify';
            mainPosterSizes.textContent = 'Size: ' + this.width + ' × ' + this.height + ' pixels';
            image.parentNode.parentNode.append(mainPosterSizes);
          }
        };

        dummyImage.src = image.src;
      }
    }

    (function addStyles () {
      let styles = `
        .js-warning-notify {
          display: block;
          padding: 4px 8px;
          background: red;
          color: white !important;
        }

        .picSurround > .js-warning-notify {
          position: absolute;
          width: 209px;
          margin: -26px 0 0 2px;
        }

        .picSurround:hover > .js-warning-notify:not(:hover) {
          opacity: 0;
        }
      `;

      insertStyles(styles);
    })();
  };

  // DB CHANGES: CHARACTER FIELDS
  function changeCharacterEditPageFields () {
    //
    let formElement = document.getElementById('myCharForm');
    let relationsSelector = 'div[id^="rel"]:not(#relationArea), div[id^="mangarel"]:not(#mangarelationArea)';
    let formObject = getFormData(document.forms.charForm, relationsSelector);
    let paramsURL = new URLSearchParams(document.location.search.substring(1));
    let characterID = parseInt(params.get('character_id'), 10);
    let isNewCharacter = params.get('do') == 'add';
    console.log('Is this adding new character page:', isNewCharacter);

    // Remove old Form' Elements
    formElement.querySelector('table').remove();

    // Add new Form' Elements
    addNewForm(formElement, () => {
      fillNewForm(formElement, formObject);
      fillRelations(formElement, formObject);

      // Add Relation Search Listeners and Observers
      // Callback function to execute when mutations are observed
      let observerFunc = (mutationsList, observer) => {
        // Use traditional 'for loops' for IE 11
        for(const mutation of mutationsList) {
          switch (mutation.type) {
            case 'childList':
              for (let item of mutation.addedNodes) {
                if (item.tagName.toUpperCase() === 'TABLE') {
                  changeSearchRelationResults(mutation.target.id);
                  break;
                }
              }
              break;
          }
        }
      };

      let animeObserver = insertObserver(document.getElementById('searchResults'), { childList: true }, observerFunc);
      let mangaObserver = insertObserver(document.getElementById('mangasearchResults'), { childList: true }, observerFunc);

      // Add additional Controls
      document.getElementById('characterControlBlock').prepend(
        createDBNavigation(),
        createPendingStatusForm((message) => {
          // Check Character Status via Jikan API
          fetch('https://api.jikan.moe/v4/characters/' + characterID)
            .then((response) => {
              if (response.status == 500) return { status: 500 };
              return response.json();
            })
            .then((data) => {
              console.info(data);
              if (!data.status) {
                message.innerHTML = '';
                message.append(createActionMessage({
                  text: 'Character is approved!',
                  status: 'success',
                }));
              } else if (data.status == 500) {
                let status = message.querySelector('.b-action');
                status.className = 'b-action b-action--warning';
                status.querySelector('.b-action_message').textContent = 'API Server Down (500).';
              } else {
                let status = message.querySelector('.b-action');
                status.className = 'b-action b-action--warning';
                status.querySelector('.b-action_message').textContent = 'Character is not approved.';
              }
            });
        }),
        createSuggestedChangesBlock(() => {
          initErrorChecker(formElement, [
            {
              'name': 'char_name_first',
              'label': 'First Name',
              'text': true,
              'trim': true,
              'error': false,
            },
            {
              'name': 'char_name_last',
              'label': 'Last Name',
              'text': true,
              'trim': true,
              'error': false,
            },
            {
              'name': 'char_jp_name',
              'label': 'Japanese Name',
              'text': true,
              'trim': true,
              'error': false,
            },
            {
              'name': 'character_alt_name',
              'label': 'Alternate Name',
              'text': true,
              'trim': true,
              'error': false,
            },
            {
              'name': 'character_bio',
              'label': 'Biography',
              'text': true,
              'trim': true,
              'error': false,
            }
          ]);
        })
      );

    });

    //
    function changeSearchRelationResults (targetParentNode) {
      let containerNode = document.getElementById(targetParentNode);
      let targetNodes = containerNode.querySelectorAll('a');

      targetNodes.forEach((elem) => {
        let seriesID = elem.href.substring(elem.href.indexOf('(') + 1, elem.href.indexOf(','));
        if (seriesID == '') alert('Alert!!' + seriesID + ' ' + elem.textContent); // TODO: check this alert
        let seriesType = targetParentNode == 'searchResults' ? 'anime' : 'manga';
        elem.onclick = () => chooseUpdated(seriesID, elem.textContent, seriesType);
        elem.href = 'https://myanimelist.net/' + seriesType + '/' + seriesID;
      });


      function chooseUpdated (seriesID, seriesName, seriesType) {
        event.preventDefault();
        console.log('seriesID: ' + seriesID + '\nseriesName: ' + seriesName + '\nseriesType: ' + seriesType);

        let targetNode = document.getElementById(seriesType == 'anime' ? 'relationArea' : 'mangarelationArea');
        targetNode.append(
          createRelationElement({ id: seriesID, title: seriesName, type: seriesType, role: -1 })
        );
      }
    }

    function getFormData (form, relationsSelector) {
      let formData = new FormData(form);
      let formObject = {};

      for(var pair of formData.entries()) {
        console.log(pair[0]+ ', '+ pair[1]);
        if (!pair[0].includes('[]')) {
          formObject[pair[0]] = pair[1];
        }
      };

      Object.assign(
        formObject,
        {
          'characterRelations': getRelations(relationsSelector),
          'animeRelationID': mergeRelations(formData.getAll('relationId[]'), formData.getAll('charAnimeRole[]')),
          'mangaRelationID': mergeRelations(formData.getAll('mangarelationId[]'), formData.getAll('charMangaRole[]'))
        }
      );

      function mergeRelations (relID, role) {
        return role.reduce((result, value, index) => {
          result.push([relID[index], value]);
          return result;
        }, []);
      };

      //
      function getRelations (selector) {
        let currentRelations = document.querySelectorAll(selector);
        let arr = [];

        currentRelations.forEach(elem => {
          let rel = {};

          rel.id = elem.childNodes[1].value;
          rel.type = elem.childNodes[1].name.includes('manga') ? 'manga' : 'anime';;
          rel.title = elem.childNodes[0].textContent;
          rel.role = elem.childNodes[3].selectedIndex;

          arr.push(rel);
        });

        return arr;
      }

      console.info(formObject);

      return formObject;
    }

    //
    function addNewForm (form, callback) {
      let characterFirstNameFormGroup;
      characterFirstNameFormGroup = createElement('div', { class: 'b-form-group' });
      characterFirstNameFormGroup.append(
        createElement('span', { class: 'b-form-group__text', text: 'First' }),
        createElement('input', { id: 'fname', class: 'b-input', name: 'char_name_first' })
      );

      let characterFirstNameBlock;
      characterFirstNameBlock = createElement('div', { class: 'b-block' });
      characterFirstNameBlock.append(
        characterFirstNameFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Ex. Naruto' })
      );

      let characterLastNameFormGroup;
      characterLastNameFormGroup = createElement('div', { class: 'b-form-group' });
      characterLastNameFormGroup.append(
        createElement('span', { class: 'b-form-group__text', text: 'Last' }),
        createElement('input', { id: 'lname', class: 'b-input', name: 'char_name_last' })
      );

      let characterLastNameBlock;
      characterLastNameBlock = createElement('div', { class: 'b-block' });
      characterLastNameBlock.append(
        characterLastNameFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Ex. Uzumaki' })
      );

      let characterNameBlock;
      characterNameBlock = createElement('div', { class: 'b-block b-grid--columns' });
      characterNameBlock.append(
        createElement('h6', { class: 'h6', text: 'Character Name' }),
        characterFirstNameFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Ex. Naruto' }),
        characterLastNameFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Ex. Uzumaki' })
      );

      let characterJapaneseNameFormGroup;
      characterJapaneseNameFormGroup = createElement('div', { class: 'b-form-group' });
      characterJapaneseNameFormGroup.append(
        // createElement('span', { class: 'b-form-group__text', text: '姓名' }),
        createElement('input', { id: 'jname', class: 'b-input', name: 'char_jp_name' })
      );

      let characterJapaneseNameBlock;
      characterJapaneseNameBlock = createElement('div', { class: 'b-block b-grid--columns' });
      characterJapaneseNameBlock.append(
        createElement('h6', { class: 'h6', text: 'Japanese Name' }),
        characterJapaneseNameFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Name in kanji' })
      );

      let characterAlternateNameFormGroup;
      characterAlternateNameFormGroup = createElement('div', { class: 'b-form-group' });
      characterAlternateNameFormGroup.append(
        createElement('input', { id: 'aname', class: 'b-input', name: 'character_alt_name' })
      );

      let characterAlternateNameBlock;
      characterAlternateNameBlock = createElement('div', { class: 'b-block b-grid--columns' });
      characterAlternateNameBlock.append(
        createElement('h6', { class: 'h6', text: 'Alternate Name' }),
        characterAlternateNameFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Nickname' })
      );

      let searchAnimeRelationFormGroup;
      searchAnimeRelationFormGroup = createElement('div', { class: 'b-form-group' });
      searchAnimeRelationFormGroup.append(
        // createElement('span', { class: 'b-form-group__text', text: 'Anime' }),
        createElement('input', { id: 'queryTitle', class: 'b-input' }),
        createElement('button', { class: 'b-button b-button--outline', type: 'button', text: 'Search' }, (elem) => {
          elem.onclick = (event) => {
            document.getElementById('searchResults').parentNode.classList.remove('b-block--hidden');
            window.searchAnimeTitles();
          };
        })
      );

      let searchAnimeRelationBlock;
      searchAnimeRelationBlock = createElement('div', { class: 'b-block' });
      searchAnimeRelationBlock.append(
        searchAnimeRelationFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Search for an anime title to add for the character.' })
      );

      let searchAnimeRelationResultBlock;
      searchAnimeRelationResultBlock = createElement('div', { class: 'b-block b-block--hidden js-search-result' });
      searchAnimeRelationResultBlock.append(
        createElement('div', { id: 'searchResults', class: 'b-block' }),
        createElement('button', { class: 'b-button b-button--outline', type: 'button', text: 'Hide results' }, (elem) => {
          elem.onclick = (event) => {
            document.getElementById('searchResults').parentNode.classList.add('b-block--hidden');
          };
        })
      );

      let animeRelationBlock;
      animeRelationBlock = createElement('div', { class: 'b-block' });
      animeRelationBlock.append(
        createElement('h6', { class: 'h6', text: 'Anime Relations' }, elem => { elem.prepend( createElement('i', { class: 'fa-solid fa-tv-alt' }) ) }),
        createElement('div', { id: 'relationArea' }),
        searchAnimeRelationBlock,
        searchAnimeRelationResultBlock
      );

      let searchMangaRelationFormGroup;
      searchMangaRelationFormGroup = createElement('div', { class: 'b-form-group' });
      searchMangaRelationFormGroup.append(
        // createElement('span', { class: 'b-form-group__text', text: 'Manga' }),
        createElement('input', { id: 'mangaqueryTitle', class: 'b-input' }),
        createElement('button', { class: 'b-button b-button--outline', type: 'button', text: 'Search' }, (elem) => {
          elem.onclick = (event) => {
            document.getElementById('mangasearchResults').parentNode.classList.remove('b-block--hidden');
            window.searchMangaTitles();
          };
        })
      );

      let searchMangaRelationBlock;
      searchMangaRelationBlock = createElement('div', { class: 'b-block' });
      searchMangaRelationBlock.append(
        searchMangaRelationFormGroup,
        createElement('div', { class: 'b-form__text', text: 'Search for a manga title to add for the character.' })
      );

      let searchMangaRelationResultBlock;
      searchMangaRelationResultBlock = createElement('div', { class: 'b-block b-block--hidden js-search-result' });
      searchMangaRelationResultBlock.append(
        createElement('div', { id: 'mangasearchResults', class: 'b-block' }),
        createElement('button', { class: 'b-button b-button--outline', type: 'button', text: 'Hide results' }, (elem) => {
          elem.onclick = (event) => {
            document.getElementById('mangasearchResults').parentNode.classList.add('b-block--hidden');
          };
        })
      );

      let mangaRelationBlock;
      mangaRelationBlock = createElement('div', { class: 'b-block' });
      mangaRelationBlock.append(
        createElement('h6', { class: 'h6', text: 'Manga Relations' }, elem => { elem.prepend( createElement('i', { class: 'fa-solid fa-books' }) ) }),
        createElement('div', { id: 'mangarelationArea' }),
        searchMangaRelationBlock,
        searchMangaRelationResultBlock
      );

      let characterBiographyBlock;
      characterBiographyBlock = createElement('div', { class: 'b-block b-block--fullwidth b-grid--columns' });
      characterBiographyBlock.append(
        createElement('h6', { class: 'h6', text: 'Biography' }),
        createElement('textarea', { class: 'b-input', name: 'character_bio' }),
        createElement('div', { class: 'b-form__text', text: 'Information and details about the character. Cite your source! BBCode enabled. ' }, (elem) => {
          elem.append(
            createElement('a', { text: 'BBCode Help', href: 'javascript:void(0);', onclick: 'window.open("info.php?go=bbcode","bbcode","menubar=no,scrollbars=yes,status=no,width=600,height=700");' })
          );
          elem.innerHTML += '.';
        })
      );

      let submissionReasonBlock;
      submissionReasonBlock = createElement('div', { class: 'b-block b-block--fullwidth' });
      submissionReasonBlock.append(
        createElement('h6', { class: 'h6', text: 'Reason' }),
        createElement('textarea', { class: 'b-input', name: 'reason' }),
        createElement('div', { class: 'b-form__text', text: 'What is your reason for making this submit? Not providing a reason may result in a denial.' })
      );

      let submissionSubmitBlock;
      submissionSubmitBlock = createElement('div', { class: 'b-block b-block--fullwidth b-block--centered' });
      submissionSubmitBlock.append(
        createElement('button', { class: 'b-button b-button--primary', type: 'button', name: 'subButton', text: 'Submit' }, (elem) => {
          elem.onclick = () => {
            testFormSubmit();
          }
        })
      );

      let characterDuplicatesResultBlock;
      characterDuplicatesResultBlock = createElement('div', { class: 'b-block b-block--fullwidth' });
      characterDuplicatesResultBlock.append(
        createElement('div', { id: 'dupeResults' })
      );

      let characterFormButtonsBlock;
      characterFormButtonsBlock = createElement('div', { class: 'b-block b-block--fullwidth b-block--centered' });
      characterFormButtonsBlock.append(
        createElement('button', { class: 'b-button b-button--outline', type: 'reset', text: 'Reset' }),
        createElement('button', { class: 'b-button b-button--primary', type: 'button', text: 'Yes, Add Unique Character' })
      );

      let characterDuplicatesBlock;
      characterDuplicatesBlock = createElement('div', { class: 'b-block b-block--fullwidth b-block--hidden' });
      characterDuplicatesBlock.append(
        createElement('div', { id: 'dupeArea' }),
        characterDuplicatesResultBlock,
        characterFormButtonsBlock
      );

      let characterDataBlock;
      characterDataBlock = createElement('div', { id: 'characterDataBlock', class: 'b-block' });
      characterDataBlock.append(
        characterNameBlock,
        characterJapaneseNameBlock,
        characterAlternateNameBlock,
        animeRelationBlock,
        mangaRelationBlock,
        characterBiographyBlock
      );

      let characterControlBlock;
      characterControlBlock = createElement('div', { id: 'characterControlBlock', class: 'b-block' });
      characterControlBlock.append(
        submissionReasonBlock,
        submissionSubmitBlock,
        characterDuplicatesBlock
      );

      form.append(
        characterDataBlock,
        characterControlBlock
      );

      callback();
    }

    //
    function fillNewForm (form, data) {
      for (const [key, value] of Object.entries(data)) {
        let input = document.getElementsByName(key)[0];
        if (input) input.value = value;
      }
    }

    //
    function fillRelations (form, data) {
      let animeRels;
      animeRels = data.characterRelations.filter(element => element.type == 'anime');
      animeRels.forEach(entry => {
        document.getElementById('relationArea').append(createRelationElement(entry));
      });

      let mangaRels;
      mangaRels = data.characterRelations.filter(element => element.type == 'manga');
      mangaRels.forEach(entry => {
        document.getElementById('mangarelationArea').append(createRelationElement(entry));
      });
    }

    //
    function createRelationElement (entry) {
      let eid = entry.type == 'anime' ? 'rel' + entry.id : 'mangarel' + entry.id;

      let relationHeader;
      relationHeader = createElement('h6', { class: 'h6' });
      relationHeader.append(
        createElement('a', { href: 'https://myanimelist.net/' + entry.type + '/' + entry.id, text: entry.title })
      );

      let relationRoleSelect;
      relationRoleSelect = createElement('select', { class: 'b-input', name: entry.type == 'anime' ? 'charAnimeRole[]' : 'charMangaRole[]' }, (elem) => { elem.required = true });
      relationRoleSelect.append(
        createElement('option', { value: 1, text: 'Main' }),
        createElement('option', { value: 2, text: 'Supporting' }),
      );
      relationRoleSelect.selectedIndex = entry.role;

      let relationActions;
      relationActions = createElement('div', { class: 'b-form-group' });
      relationActions.append(
        createElement('span', { class: 'b-form-group__text', text: 'Role' }),
        createElement('input', { type: 'hidden', name: entry.type == 'anime' ? 'relationId[]' : 'mangarelationId[]', value: entry.id }),
        relationRoleSelect
      );

      let relationElement = createElement('div', { id: eid, class: entry.role >= 0 ? 'db-relation approved' : 'db-relation' });
      relationElement.append(
        relationHeader,
        createElement('a', { class: 'b-button b-button--icon b-button--outline', href: 'javascript:void(0)', onclick: entry.type == 'anime' ? 'removeDiv(\'' + eid + '\')' : 'removemangaDiv(\'' + eid + '\')', html: '<i class="fa-solid fa-trash"></i>' }),
        relationActions
      );


      return relationElement;
    }

    //
    function createDBNavigation () {
      let paramsURL, characterID, navButtonGroup, navBlock;

      paramsURL = new URLSearchParams(document.location.search.substring(1));
      characterID = parseInt(params.get('character_id'), 10);

      navButtonGroup = createElement('div', { class: 'b-button-group' });
      navButtonGroup.append(
        createElement(
          'a',
          { class: 'b-button b-button--outline', text: 'Prev', href: 'https://myanimelist.net/panel.php?go=characters&do=edit&character_id=' + (characterID - 1) },
          (elem) => {
            elem.onclick = (event) => {
              event.preventDefault();
              window.location.replace(event.target.href);
            };
          }
        ),
        createElement('a', { class: 'b-button b-button--outline', text: 'Page', href: 'https://myanimelist.net/character/' + characterID }),
        createElement('a', { class: 'b-button b-button--outline', text: 'Add picture', href: 'https://myanimelist.net/dbchanges.php?cid=' + characterID + '&t=addpicture' }),
        createElement(
          'a',
          { class: 'b-button b-button--outline', text: 'Next', href: 'https://myanimelist.net/panel.php?go=characters&do=edit&character_id=' + (characterID + 1) },
          (elem) => {
            elem.onclick = (event) => {
              event.preventDefault();
              window.location.replace(event.target.href);
            };
          }
        )
      );

      navBlock = createElement('div', { class: 'b-block' });
      navBlock.append(
        createElement('h6', { class: 'h6', text: 'Navigation' }),
        navButtonGroup
      );

      return navBlock;
    }

    //
    function createPendingStatusForm (callback) {
      return createElement('div', { class: 'b-block' }, (elem) => {
        elem.append(
          createElement('h6', { class: 'h6', text: 'Status' }),
          createElement('div', { id: 'statusContent' }, (elem) => {
            elem.append(createActionMessage({
              text: 'Checking status...',
              status: 'warning',
            }));
            if (typeof callback === 'function') callback(elem);
          })
        );
      });
    }

    //
    function createSuggestedChangesBlock (callback) {
      return createElement('div', { class: 'b-block' }, (elem) => {
        elem.append(
          createElement('h6', { class: 'h6', text: 'Suggested Changes' }),
          createElement('div', { id: 'helperContent' })
        );
        setTimeout(() => callback(), 200);
      });
    }

    //
    function initErrorChecker (form, formFields) {
      let elements = form.elements;

      console.log(elements);
      for (let i = 0; i < elements.length; i++) {
        if (formFields.filter(k => k.name == elements[i].name && k.text).length) {
          //
          elements[i].addEventListener('input', (event) => {
            checkFormInputs.call(event.target, form, formFields)
          });
          checkFormInputs.call(elements[i], form, formFields);
        }
      }

      // Change formFields entries "error"-key
      function checkFormInputs (form, formFields) {
        let pair = [this.name, this.value];
        let field = formFields.filter(k => k.name == this.name)[0];

        // Compare string lenght
        if (!compareTrim(pair[1])) {
          field.error = 'trimRequered';
        } else {
          // There no error now
          if (field.error) field.error = 'fixed';
        }

        //
        document.getElementById('helperContent').innerHTML = '';
        formFields.forEach(checkErrorFields);
      }

      // If formFields entry has "error"-key creates Alert element
      function checkErrorFields (element, index, array) {
        if (element.error) {
          document.getElementById('helperContent').append(createActionMessage({
            text: 'Remove whitespace from both ends of a string in "' + element.label + '" field.',
            input: element.name,
            status: element.error === 'fixed' ? 'success' : 'warning',
          }, (e) => {
            let field = document.getElementsByName(element.name)[0];
            if (element.error === 'trimRequered') field.value = field.value.trim();
            field.dispatchEvent(new Event('input'));
          }));
        }
      }
    }

    //
    function testFormSubmit () {
      let formData = new FormData(document.getElementById('myCharForm'));

      for(var pair of formData.entries()) {
        console.log(pair[0]+ ', '+ pair[1]);
      };


      //
      let currentURL = location.pathname.substring(1).split('/');
      let params = new URLSearchParams(location.search);
      switch (currentURL[0]) {
        case 'panel.php':
          if (params.get('go') == 'characters' && params.get('do') == 'edit') {
            window.submitForm();
          }
          if (params.get('go') == 'characters' && params.get('do') == 'add') {
            console.log('Submit new character...');
          }
          break;
      }
    }

    // Add Alert element with Action button
    function createActionMessage (data, callback) {
      let actionContainer, actionText, actionButton, actionButtonIcon, actionFunc;

      actionContainer = createElement('div', {class: 'b-action b-action--' + data.status});

      actionText = createElement('div', {
                                  class: 'b-action_message',
                                  text: data.text || 'Fix problem with data in ' + data.input + ' automatocally:'});

      actionContainer.append(actionText);

      if (callback) {
        actionButton = createElement('button', {
                                      class: 'b-button',
                                      type: 'button',
                                      text: data.btnText ? data.btnText : data.status === 'success' ? 'Fixed' : 'Fix'});
        actionButton.onclick = (e) => { callback(e) };

        actionContainer.append(actionButton);
      }

      return actionContainer;
    }

    (function addStyles () {
      let stylesheet;
      stylesheet = document.createElement('style');
      document.head.appendChild(stylesheet);
      stylesheet = stylesheet.sheet;
      stylesheet.insertRule('.db-relation { position: relative; padding: .75em 1em; margin: .5em 0; border: thin dashed #1d439b; border-radius: 5px; box-sizing: border-box; font-size: 12px; }');
      stylesheet.insertRule('.db-relation::after { content: ""; display: table; clear: both; }');
      stylesheet.insertRule('.db-relation.approved { background: var(--color-primary-container, #f5f7fa); border: 1px solid var(--color-primary-container-outline, #eef1f6); }');
      stylesheet.insertRule('.db-relation .db-relation__header { padding: .25em 0; font-size: 12px; font-weight: bold; line-height: 1.5; }');
      stylesheet.insertRule('.db-relation .b-button { float: right; height: 1.5em; margin-left: 3em; }');
    })();

    // Styles
    insertStyles(`

      .b-block {
        font-size: 12px;
      }

      .b-block:not(:last-child) {
        margin: 0 0 1.5em;
      }

      .b-block.b-block--hidden {
        display: none;
      }

      .b-block--centered {
        text-align: center;
      }



      .b-form {}

      .b-form__text {
        margin-top: 0.25rem;
        color: #6c757d;
        line-height: 1.5;
      }

      .b-form-group {
        display: flex;
        align-items: stretch;
      }

      .b-form-group .b-input {
        flex: 1 1 auto;
      }

      .b-form-group .b-form-group__text {
        display: flex;
        align-items: center;
        min-width: 28px;
        padding: 0.5em 1em;
        background-color: var(--color-surface1, #e9ecef);
        border: 1px solid var(--color-outline2, #ced4da);
        border-radius: var(--border-rounded, 5px);
        line-height: 1;
        white-space: nowrap;
      }

      .b-form-group .b-form-group__text:not(:first-child) {
        border-left: 0;
      }

      .b-form-group .b-form-group__text:not(:last-child) {
        border-right: 0;
      }

      .b-form-group .b-input:not(:last-child),
      .b-form-group .b-form-group__text:not(:last-child),
      .b-form-group .b-button:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .b-form-group .b-input:not(:first-child),
      .b-form-group .b-form-group__text:not(:first-child),
      .b-form-group .b-button:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      .b-form-group .b-button:not(:first-child) {
        margin-left: -1px;
      }



      .b-input {
        display: block;
        padding: 0.5em 1em;
        background: var(--color-background, #fff);
        border: thin solid var(--color-outline2, #ced4da);
        border-radius: var(--border-rounded, 5px);
        color: var(--color-on-background, #000);
        font: inherit;
        line-height: 1.5;
        transition: .16s cubic-bezier(0.4, 0, 0.6, 1);
        transition-property: color, background, border, box-shadow;
      }

      .b-input:focus {
        border-color: #86b7fe;
        border-color: #97a8d1;
        box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(13 110 253 / 25%));
        box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(46  81 162 / 25%));
        outline: none;
        z-index: 1;
      }

      .b-input:invalid {
        border-color: #dc3545;
      }

      .b-input:invalid:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.25rem rgb(220 53  69 / 25%);
        box-shadow: 0 0 0 0.25rem rgb(46  81 162 / 25%);
      }

      textarea.b-input {
        width: -webkit-fill-available;
        width: fill-available;
        padding: 0.75em 1em;
        resize: vertical;
      }

      select.b-input {
        appearance: none;
        height: 1.5em;
        padding-right: 2.5em;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/></svg>");
        background-repeat: no-repeat;
        background-position: right 0.75em center;
        background-size: 15px 12px;
        box-sizing: content-box;
      }

      textarea[name="character_bio"] {
        min-height: 9em
      }

      textarea[name="reason"] {
        min-height: 5em
      }

      .b-input#jname {
        padding: 0 12px;
        font-size: 14px;
        line-height: 30px;
      }



      .b-block > .b-button:last-child:not(:first-child) {
        margin: 0 0 0 1em;
      }

      form .b-button {
        font-weight: normal;
        text-transform: none;
      }

      @media (min-width: 1060px) {
        #myCharForm {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 0 36px;
          align-items: start;
        }

        #characterDataBlock {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          grid-column: 1 / span 2;
          grid-row: 1 / span 2;
        }

        #characterDataBlock > .b-block:not(.b-grid--columns) {
          width: calc((100% - 36px) / 2);
        }
      }

      @media (min-width: 1060px) {
        .b-grid--columns {
          width: 100%;
          display: grid;
          grid-template-columns: 10em auto 12em;
          grid-gap: .5em 1.5em;
          align-items: center;
        }

        .b-grid--columns > .h6 {
          align-self: self-start;
          margin: 0;
          line-height: 32px;
        }

        #characterDataBlock > .b-grid--columns:first-child > .h6 {
          grid-row: 1 / 3;
        }

        .b-grid--columns.b-block--fullwidth > :not(.h6) {
          grid-column: 2 / 4;
        }

        .b-grid--columns > .b-form__text {
          margin: 0;
        }

        #characterDataBlock > .b-grid--columns {
          order: -1;
          margin: 0 0 1.5em;
        }

        #characterDataBlock > .b-grid--columns:last-child {
          margin-bottom: 3em;
        }
      }



      .h6 {
        margin: 0 0 .5em;
        font-size: inherit;
        font-weight: bold;
        color: var(--color-on-background, #123);
        line-height: 1.5;
      }

      .h6 > i {
        min-width: 1.5em;
        margin-right: 0.7em;
      }

      .b-block > .h6 {
        color: #5a6172;
        font-family: 'Roboto';
        text-transform: uppercase;
      }



      .b-button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 6em;
        height: auto;
        padding: .5em 1em;
        margin: 0;
        background: transparent;
        border: thin solid var(--color-outline, #6c757d);
        border-radius: var(--border-rounded, 5px);
        font: inherit;
        font-weight: bold;
        line-height: 1.5;
        text-align: center;
        text-transform: uppercase;
        white-space: nowrap;
        cursor: pointer;
        transition: .16s cubic-bezier(0.4, 0, 0.6, 1);
        transition-property: color, background, border, box-shadow;
      }

      .b-button:focus {
        box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(108 117 125 / 50%));
        outline: none;
        z-index: 1;
      }

      .b-button.b-button--icon {
        min-width: 3em;
      }

      .b-button.b-button--icon > i {
        font-size: 16px;
      }

      .page-common .b-button:hover {
        text-decoration: none;
      }




      .b-button-group {
        display: flex;
        align-items: stretch;
        font-size: 12px;
      }

      .b-button-group > .b-button {
        flex: 1 1 0;
      }

      .b-button-group .b-button:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }


      .b-button-group .b-button:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .b-button-group > .b-button:not(:first-child) {
        margin-left: -1px;
      }



      .page-common .b-button.b-button--primary {
        background-color: var(--color-primary, #395bad);
        border-color: var(--color-primary, #395bad);
        color: var(--color-on-primary, #fff);
      }

      .page-common .b-button.b-button--primary:hover {
        background-color: var(--color-primary, #395bad);
        border-color: var(--color-primary, #395bad);
        color: var(--color-on-primary, #fff);
      }

      .page-common .b-button.b-button--primary:focus {
        background-color: var(--color-primary, #395bad);
        border-color: var(--color-primary, #395bad);
        box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(57 91 173 / 50%));
        color: var(--color-on-primary, #fff);
        outline: none;
        z-index: 1;
      }



      .page-common .b-button.b-button--outline {
        background-color: transparent;
        border-color: var(--color-outline, #789);
        color: var(--color-primary, #234);
      }

      .page-common .b-button.b-button--outline:hover {
        background-color: var(--color-primary, #234);
        border-color: var(--color-primary, #234);
        color: var(--color-on-primary, #fff);
      }

      .page-common .b-button.b-button--outline:focus {
        background-color: var(--color-primary, #234);
        border-color: var(--color-primary, #234);
        box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(34 51 68 / 50%));
        color: var(--color-on-primary, #fff);
        outline: none;
        z-index: 1;
      }



      .b-action {
        display: flex;
        align-items: center;
        padding: 1em;
        margin: .5em 0;
        border: thin solid var(--color-outline, #777);
        border-radius: var(--border-rounded, 5px);
        font-size: 12px;
      }

      .b-action--success {
        background-color: var(--color-success-container, #d1e7dd);
        border-color: var(--color-success-container, #badbcc);
        color: var(--color-on-success-container, #0f5132);
      }

      .b-action--warning {
        background-color: var(--color-warning-container, #fff3cd);
        border-color: var(--color-warning-container, #ffecb5);
        color: var(--color-on-warning-container, #664d03);
      }

      .b-action_message {
        margin-right: 1em;
      }



      .js-search-result {
        display: flex;
        flex-wrap: wrap;
      }

      .js-search-result td {
        font-size: inherit;
      }

      .b-block.js-search-result .b-button:last-child {
        margin: -.5em 0 0 auto;
      }

      .js-search-result .b-block {
        flex: 1 1 100%;
      }
    `);
  }

  // DB CHANGES: VA
  function tableVoiceActorsRoles () {
    let observedElement, observerOptions, observerFunction;

    observedElement = document.querySelector('#animeQueryBox + small');
    observerOptions = {
      childList: true,
      attributes: true,
      subtree: true // Omit or set to false to observe only changes to the parent node.
    };

    // observerFunction
    observerFunction = function (mutationList, observer) {
      mutationList.forEach((mutation) => {
        switch(mutation.type) {
          case 'childList':
            if (mutation.addedNodes[0].className == 'borderClass') break;
            if (mutation.addedNodes[0] instanceof window.Text) break;
            if (mutation.addedNodes.length !== 1) {
              grabData();
            }
            break;
        }
      });
    };

    // add Observer
    insertObserver(observedElement, observerOptions, observerFunction);

    // Table in VoiceActorsRoles
    let dataRoles = [];

    function grabData () {
      console.log('grabData launch! ' + Date.now());

      dataRoles = [];

      let links = document.querySelectorAll('.borderClass > a');
      links.forEach(function (link, index) {
        let dataRole = {};
        if (link.hasAttribute('onclick')) {
          dataRole.name = link.textContent;
          dataRole.index = index;
          dataRole.role = 'character';
          dataRole.func = link.getAttribute('onclick');
          let dataset = dataRole.func.slice(dataRole.func.indexOf('(') + 1, dataRole.func.indexOf(')')).split(',');
          dataRole.animeID = dataset[0].trim();
          dataRole.characterID = dataset[1].trim();
          dataRoles.push(dataRole);

          link.parentNode.style.display = 'none';
        }
      });

      console.log(dataRoles);
      if (dataRoles.length > 0) writeTable(dataRoles, 'index', false);
    }


    function writeTable (dataRoles, sort, reverse) {
      let table = document.querySelector('#table_roles');
      if (table) table.remove(); // if table already existed it should be removed
      document.querySelector('#animeQueryBox').parentNode.append(createTable(sort, reverse));


      if (sort === 'name') {
        dataRoles.sort((a, b) => a[sort].localeCompare(b[sort]));
      } else {
        dataRoles.sort((a, b) => a[sort] - b[sort]);
      }

      if (reverse) dataRoles.reverse();

      dataRoles.forEach((dataRole) => {
        document.querySelector('#table_content').append(createRow(dataRole));
      });
    }

    function createTable (sort, reverse) {
      let table = document.createElement('table');
      table.id = 'table_roles';

      let thead = document.createElement('thead');
      let tr = document.createElement('tr');

      let td1 = document.createElement('td');
      td1.textContent = '#';
      if (sort === 'index') td1.classList.add('selected');
      if (sort === 'index' && reverse === true) td1.classList.add('reversed');
      td1.setAttribute('data-sort', 'index');
      td1.onclick = () => writeTable(dataRoles, 'index', td1.className == 'selected');

      let td2 = document.createElement('td');
      td2.textContent = 'Name';
      td2.style.width = '100%';
      if (sort === 'name') td2.classList.add('selected');
      if (sort === 'name' && reverse === true) td2.classList.add('reversed');
      td2.setAttribute('data-sort', 'name');
      td2.onclick = () => writeTable(dataRoles, 'name', td2.className == 'selected');

      let td3 = document.createElement('td');
      td3.textContent = 'ID';
      if (sort === 'characterID') td3.classList.add('selected');
      if (sort === 'characterID' && reverse === true) td3.classList.add('reversed');
      td3.setAttribute('data-sort', 'characterID');
      td3.onclick = () => writeTable(dataRoles, 'characterID', td3.className == 'selected');

      let td4 = document.createElement('td');
      td4.textContent = 'Edit';

      let td5 = document.createElement('td');
      td5.textContent = 'Actions';

      let tbody = document.createElement('tbody');
      tbody.id = 'table_content';

      tr.append(td1, td2, td3, td4, td5);
      thead.append(tr);
      table.append(thead, tbody);

      return table;
    }

    function createRow(dataRow) {
      let row = document.createElement('tr');

      let td1 = document.createElement('td');
      td1.textContent = dataRow.index;

      let td2 = document.createElement('td');
      let characterLink = document.createElement('a');
      characterLink.href = 'https://myanimelist.net/character/' + dataRow.characterID;
      characterLink.textContent = dataRow.name;
      td2.append(characterLink);

      let td3 = document.createElement('td');
      td3.textContent = dataRow.characterID;

      let td4 = document.createElement('td');
      let characterEditLink = document.createElement('a');
      characterEditLink.href = 'https://myanimelist.net/panel.php?go=characters&do=edit&character_id=' + dataRow.characterID;
      characterEditLink.textContent = 'edit';
      td4.append(characterEditLink);

      let td5 = document.createElement('td');
      let buttonSubmit = document.createElement('button');
      buttonSubmit.type = 'button';
      buttonSubmit.className = 'inputButton';
      buttonSubmit.setAttribute("onclick", dataRow.func);
      buttonSubmit.textContent = 'Select';
      td5.append(buttonSubmit);

      row.append(td1, td2, td3, td4, td5);

      return row;
    }


    let styles = `
      #table_roles {
        border-collapse: collapse;
      }

      #table_roles tr {
        border-top: 1px solid #ddd;
      }

      #table_roles tr td {
        padding: 5px 7px;
      }

      #table_roles thead {
        position: sticky;
        top: 0;
      }

      #table_roles thead tr {
        background: #eee;
        border-top: 0;
        border-bottom: 1px solid #ccc;
        color: #777;
        font-weight: bold;
      }

      #table_roles thead td {
        padding: 7px;
        user-select: none;
      }

      #table_roles thead td[data-sort] {
        cursor: pointer;
        transition: .3s ease;
      }

      #table_roles thead td[data-sort]:hover {
        background: rgba(0,0,0,.08);
      }

      #table_roles thead td[data-sort]::after {
        content: '▴';
        font-size: 18px;
        line-height: 0;
      }

      #table_roles thead td.selected {
        color: #222;
      }

      #table_roles thead td.reversed[data-sort]::after {
        content: '▾';
      }

      #table_roles tbody tr:hover {
        background: rgba(0,0,0,.04);
      }

      #table_roles .inputButton {
        width: 100%;
      }
    `;

    insertStyles(styles);
  }


  function addVoiceActorDBPageStyles () {
    let styles = `
      td[conspan="2"] > div {
        text-align: left !important;
        border-top: 1px dashed #d8d8d8;
        margin: 4px 0;
        padding: 6px 0 2px;
      }

      td[conspan="2"] > div:nth-child(2) {
        margin-top: 0;
        border: 0;
      }

      td[conspan="2"] > div > div[style="float: left;"] + div:last-child {
        display: none;
      }

      td[conspan="2"] > div::after {
        content: '';
        display: table;
        clear: both;
      }

      td[conspan="2"] a[href^="/character/"] {
        padding: 2px 4px;
        background: #e1e7f5;
        border-radius: 2px;
        font-weight: 700;
      }
    `;

    insertStyles(styles);
  }

  // HELP: CREATE ELEMENTS
  function createElement (type, data, callback) {
    let e = document.createElement(type);

    if (data && data.id) e.id = data.id;
    if (data && data.class) e.className = data.class;
    if (data && data.value) e.value = data.value;
    if (data && data.type) e.type = data.type;
    if (data && data.name) e.name = data.name;
    if (data && data.placeholder) e.placeholder = data.placeholder;
    if (data && data.onclick) e.setAttribute('onclick', data.onclick);
    if (data && data.href) e.href = data.href;
    if (data && data.text) e.textContent = data.text;
    if (data && data.html) e.innerHTML = data.html;

    if (typeof callback === 'function') callback(e);

    return e;
  }

  // HELP: ADD STYLES
  function insertStyles(styles) {
    let style = document.createElement('style');
    style.innerHTML = styles;
    document.head.appendChild(style);
  }

  // HELP: ADD OBSERVER
  function insertObserver(elem, params, func) {
    let observer = new MutationObserver(func);
    observer.observe(elem, params);
    return observer;
  }

  function compareTrim (str) {
    return str === str.trim();
  }

  function compareNormalize (str) {
    return str === str.normalize('NFKC');
  }
})();
