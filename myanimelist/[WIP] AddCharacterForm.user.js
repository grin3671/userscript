// ==UserScript==
// @name         [WIP] AddCharacterForm
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Changes DB Add Character Form to modern looking
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
    case 'panel.php':
      if (params.get('go') == 'characters' && params.get('do') == 'add') {
        changeCharacterAddForm();
      }
      break;
  }

  function changeCharacterAddForm () {
    // check
    const EXPECTED_FIELDS_NUM = 9;
    let formData = getFormsData([document.forms.charForm]);
    if (Object.keys(formData).length !== EXPECTED_FIELDS_NUM) return false;

    // get fieldsNames
    // get specialElements
    // create new Form
    let formElement = document.getElementById('myCharForm');
    createNewFields().then((fields) => {
      fields.forEach(e => {
        formElement.append(e);
      });
    });


    // SIDEBAR
    createSidebarElements(["charguide", "suggestions"]).then((nodes) => {
      let sidebar = formElement.appendChild(
        createElement("aside", null, e => {
          e.className = "mcf-sidebar";
        })
      );
      nodes.forEach(e => {
        sidebar.append(e);
      });
    });
    formElement.querySelector("table").remove();
    // formElement.querySelector("table").setAttribute("style", "position: absolute; left: -50%;"); // TODO: delete
    // add Observers

    // formFunctions
    function getFormsData (forms) {
      let formObject = {};
      forms.forEach((form, index) => {
        let formData = new FormData(form);

        for(var pair of formData.entries()) {
          console.log(pair[0]+ ', '+ pair[1]);
          if (!pair[0].includes('[]')) {
            formObject[pair[0]] = pair[1];
          }
        };
      });
      return formObject;
    }
    async function createNewFields () {
      let fields = [];

      // 2-3. character first-last name
      createElement("div", null, (e) => {
        e.className = "b-block mcf-name mcf-name-rmj";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Character Name";
          }),

          // 2. character first name
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("span", null, (e) => {
                    e.className = "b-form-group__text";
                    e.textContent = "First";
                  }),
                  createElement("input", null, (e) => {
                    e.className = "b-input";
                    e.type = "text";
                    e.id = "fname";
                    e.name = "char_name_first";
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Ex. Naruto";
              }),
            );
          }),

          // 3. character last name
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("span", null, (e) => {
                    e.className = "b-form-group__text";
                    e.textContent = "Last";
                  }),
                  createElement("input", null, (e) => {
                    e.className = "b-input";
                    e.type = "text";
                    e.id = "lname";
                    e.name = "char_name_last";
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Ex. Uzumaki";
              }),
            );
          }),
        );
        fields.push(e);
      });

      // 4. character japanese name
      createElement("div", null, (e) => {
        e.className = "b-block mcf-name mcf-name-jpn";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Japanese Name";
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("input", null, (e) => {
                    e.className = "b-input";
                    e.type = "text";
                    e.id = "jname"; // for css purposes
                    e.name = "char_jp_name";
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Name in kanji";
              }),
            );
          }),
        );
        fields.push(e);
      });

      // 5. character alternate name
      createElement("div", null, (e) => {
        e.className = "b-block mcf-name mcf-name-alt";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Alternate Name";
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("input", null, (e) => {
                    e.className = "b-input";
                    e.type = "text";
                    e.name = "character_alt_name";
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Nickname";
              }),
            );
          }),
        );
        fields.push(e);
      });

      // 7. character bio info
      createElement("div", null, (e) => {
        e.className = "b-block mcf-bioinfo";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Biography";
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("textarea", null, (e) => {
                    e.className = "b-input";
                    e.name = "character_bio";
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Information and details about the character. Cite your source! BBCode enabled. ";
                e.append(
                  createElement("a", null, (e) => {
                    e.textContent = "BBCode Help";
                    e.href = "javascript:void(0);";
                    e.setAttribute("onclick", "window.open(\"info.php?go=bbcode\",\"bbcode\",\"menubar=no,scrollbars=yes,status=no,width=600,height=700\");");
                  })
                );
                e.innerHTML += '.';
              }),
            );
          }),
        );
        fields.push(e);
      });

      // 8. character picture source
      createElement("div", null, (e) => {
        e.className = "b-block mcf-picture";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Picture";
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("input", null, (e) => {
                    e.className = "b-input";
                    e.type = "file";
                    e.name = "file";
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "No avatars. No ";
                e.append(
                  createElement("a", null, (e) => {
                    e.textContent = "NSFM";
                    e.href = "/forum/?topicid=516059#post2";
                  })
                );
                e.innerHTML += '.';
              }),
            );
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("span", null, (e) => {
                    e.className = "b-form-group__text";
                    e.textContent = "Source";
                  }),
                  createElement("input", null, (e) => {
                    e.className = "b-input";
                    e.type = "text";
                    e.name = "pic_source";
                    e.placeholder = "a link to the source of your image...";
                  }),
                );
              }),
            );
          }),
        );
        fields.push(e);
      });

      // 6.1. character anime relations
      createElement("div", null, (e) => {
        e.className = "b-block mcf-relations mcf-relations-anime";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Anime Relations";
            e.prepend(
              createElement("i", null, (e) => {
                e.className = "fa-solid fa-tv-alt";
              }),
            );
          }),
          createElement("div", null, (e) => {
            e.id = "relationArea";
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("input", null, (e) => {
                    e.id = "queryTitle";
                    e.className = "b-input";
                    e.type = "text";
                  }),
                  createElement("button", null, (e) => {
                    e.className = "b-button b-button--outline";
                    e.type = "button";
                    e.textContent = "Search";
                    e.onclick = (event) => {
                      document.getElementById('searchResults').parentNode.classList.remove('b-block--hidden');
                      window.searchAnimeTitles();
                    };
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Search for an anime title to add for the character.";
              }),
            );
          }),
          createElement("div", null, (e) => {
            e.className = "b-block b-block--hidden js-search-result";
            e.append(
              createElement("div", null, (e) => {
                e.id = "searchResults";
                e.className = "b-block";
              }),
              createElement("button", null, (e) => {
                e.className = "b-button b-button--outline";
                e.type = "button";
                e.textContent = "Hide results";
              }),
            );
          }),
        );
        fields.push(e);
      });

      // 6.2. character manga relations
      createElement("div", null, (e) => {
        e.className = "b-block mcf-relations mcf-relations-manga";
        e.append(
          createElement("h6", null, (e) => {
            e.className = "h6";
            e.textContent = "Manga Relations";
            e.prepend(
              createElement("i", null, (e) => {
                e.className = "fa-solid fa-books";
              }),
            );
          }),
          createElement("div", null, (e) => {
            e.id = "mangarelationArea";
          }),
          createElement("div", null, (e) => {
            e.className = "b-block";
            e.append(
              createElement("div", null, (e) => {
                e.className = "b-form-group";
                e.append(
                  createElement("input", null, (e) => {
                    e.id = "mangaqueryTitle";
                    e.className = "b-input";
                    e.type = "text";
                  }),
                  createElement("button", null, (e) => {
                    e.className = "b-button b-button--outline";
                    e.type = "button";
                    e.textContent = "Search";
                    e.onclick = (event) => {
                      document.getElementById('mangasearchResults').parentNode.classList.remove('b-block--hidden');
                      window.searchMangaTitles();
                    };
                  }),
                );
              }),
              createElement("div", null, (e) => {
                e.className = "b-form__text";
                e.textContent = "Search for a manga title to add for the character.";
              }),
            );
          }),
          createElement("div", null, (e) => {
            e.className = "b-block b-block--hidden js-search-result";
            e.append(
              createElement("div", null, (e) => {
                e.id = "mangasearchResults";
                e.className = "b-block";
              }),
              createElement("button", null, (e) => {
                e.className = "b-button b-button--outline";
                e.type = "button";
                e.textContent = "Hide results";
              }),
            );
          }),
        );
        fields.push(e);
      });

      return fields;
    }

    async function createSidebarElements (elements) {
      let nodes = [];
      elements.forEach((element, index) => {
        switch(element) {
          case "charguide":
            createElement("div", null, (e) => {
              e.className = "b-block mcf-guideline";
              e.append(
                createElement("div", null, (e) => {
                  e.className = "b-action b-action--info";
                  e.append(
                    createElement("span", null, (e) => {
                      e.className = "b-action_message";
                      e.textContent = "Read Character DB Guidelines";
                    }),
                    createElement("a", null, (e) => {
                      e.className = "b-button";
                      e.href = "/forum/?topicid=141103";
                      e.target = "_blank";
                      e.textContent = "Read";
                    }),
                  );
                }),
              );
              nodes.push(e);
            });
            break;
          case "suggestions":
            createElement("div", null, (e) => {
              e.className = "b-block mcf-suggestions";
              e.append(
                createElement("h6", null, (e) => {
                  e.className = "h6";
                  e.textContent = "Suggestions"
                }),
                createElement("div", null, (e) => {
                  e.className = "b-action b-action";
                  e.append(
                    createElement("span", null, (e) => {
                      e.className = "b-action_message";
                      e.textContent = "Fill \"First Name\" field.";
                    }),
                  );
                }),
              );
              nodes.push(e);
            });
            break;
        }
      });
      return nodes;
    }

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
          grid-template-columns: 1fr 1fr 1.25fr;
          grid-gap: 0 36px;
          align-items: start;
          grid-auto-flow: column;
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

      .b-action--info {
        background-color: var(--color-info-container, #cce5ff);
        border-color: var(--color-info-container, #b3d9ff);
        color: var(--color-on-info-container, #033668);
      }

      .b-action_message {
        margin-right: 1em;
      }

      .b-action .b-button {
        margin-left: auto;
      }

      .b-action a.b-button {
        color: inherit;
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







      .b-input[type="file"] {
        width: -webkit-fill-available;
      }

      .b-input[type="file"]::file-selector-button {
        font: inherit;
        padding: .5em .75em;
        margin: -.5em 1em -.5em -1em;
        border: 0;
        background-color: var(--color-surface1, #e9ecef);
        border-right: 1px solid var(--color-outline2, #ced4da);
      }


@media (min-width: 1060px) {
  .mcf-name,
  .mcf-bioinfo,
  .mcf-picture {
    display: grid;
    grid-template-columns: 10em auto;
    grid-gap: 0.5em 1.5em;
    grid-column: 1 / span 2;
  }

  .mcf-name > h6,
  .mcf-bioinfo > h6,
  .mcf-picture > h6 {
    line-height: 32px;
    margin: 0;
  }

  .mcf-name > .b-block,
  .mcf-picture > .b-block {
    grid-column: 2;
    display: flex;
    align-items: center;
    margin: 0;
    align-content: flex-end;
  }

  .mcf-name > .b-block .b-form-group,
  .mcf-picture > .b-block .b-form-group {
    flex: 1;
    max-width: 32em;
  }

  .mcf-name > .b-block .b-form__text,
  .mcf-picture > .b-block .b-form__text {
    margin: 0 0 0 1.5em;
  }

  .mcf-guideline {
    grid-column: 3 / span 1;
  }

  .b-block.mcf-picture {
    margin: 1.5em 0 1.5em;
  }

  .b-block.mcf-relations {
    margin: 1.5em 0 1.5em;
  }

  .mcf-relations-anime {
    grid-column: 1 / span 1;
  }

  .mcf-relations-manga {
    grid-column: 2 / span 1;
  }

  .mcf-sidebar {
    grid-row: 1 / span 99;
    grid-column: 3;
  }
}
    `);
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
})();
