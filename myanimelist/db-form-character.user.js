// ==UserScript==
// @name         [MAL] New DB Form for Characters
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Changes DB Add Character Form to modern looking
// @author       grin3671
// @license      MIT
// @match        https://myanimelist.net/*
// @icon         https://www.google.com/s2/favicons?domain=myanimelist.net
// @require      https://unpkg.com/vue@2.7.14/dist/vue.js
// @grant        none
// @updateURL    https://github.com/grin3671/userscript/raw/main/myanimelist/db-form-character.user.js
// @downloadURL  https://github.com/grin3671/userscript/raw/main/myanimelist/db-form-character.user.js
// ==/UserScript==

// HELP: CREATE ELEMENTS
function createElement (type, callback) {
  let e = document.createElement(type);
  if (typeof callback === "function") callback.call(e, e);
  return e;
}

// HELP: ADD STYLES
function insertStyles(styles) {
  let style = document.createElement("style");
  style.innerHTML = styles;
  document.head.appendChild(style);
}

// HELP: ADD OBSERVER
function addObserver(elem, params, func) {
  let observer = new MutationObserver(func);
  observer.observe(elem, params);
  return observer;
}

// CHECK PAGE
let currentURL = location.pathname.substring(1).split("/");
let params = new URLSearchParams(location.search);
switch (currentURL[0]) {
  case "panel.php":
    if (params.get("go") == "characters" && params.get("do") == "add") {
      changeCharacterAddFormV2();
    }
    break;
}

function changeCharacterAddFormV2 () {
  // check
  const EXPECTED_FIELDS_NUM = 9;
  let formData = getFormsData([document.forms.charForm]);
  if (Object.keys(formData).length !== EXPECTED_FIELDS_NUM) return false;

  // create new Form
  let formElement = document.getElementById("myCharForm");
  let mainFormContainer = document.createElement("div");
  mainFormContainer.id = "vue_form_new_character";
  formElement.querySelector("table").remove();
  formElement.append(mainFormContainer);

  // add Observers

  // formFunctions
  function getFormsData (forms) {
    let formObject = {};
    forms.forEach((form, index) => {
      let formData = new FormData(form);

      for(var pair of formData.entries()) {
        console.log(pair[0] + ", " + pair[1]);
        if (!pair[0].includes("[]")) {
          formObject[pair[0]] = pair[1];
        }
      };
    });
    return formObject;
  }

  // Define a new component called todo-item
  Vue.component("vue-fieldset", {
    props: ["fieldset"],
    template: `<div class="b-block" :class="fieldset.class">
                 <h6 v-if="fieldset.text" class="h6">
                   <i v-if="fieldset.icon" :class="fieldset.icon"></i>
                   <span>{{ fieldset.text }}</span>
                 </h6>
                 <vue-input v-for="field in fieldset.fields" :key="field.id" :field="field"></vue-input>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-fieldset--relation", {
    props: ["fieldset"],
    methods: {
      removeRelation(id) {
        let index = this.fieldset.items.findIndex(i => i.id == id);
        if (index >= 0) this.fieldset.items.splice(index, 1);
      }
    },
    template: `<div class="b-block" :class="fieldset.class">
                 <h6 v-if="fieldset.text" class="h6">
                   <i v-if="fieldset.icon" :class="fieldset.icon"></i>
                   <span>{{ fieldset.text }}</span>
                 </h6>
                 <div :id="fieldset.result">
                   <vue-relation v-for="item in fieldset.items" :relation="item" :key="item.type + item.id" @remove="removeRelation"></vue-relation>
                 </div>
                 <template v-for="field in fieldset.fields">
                   <vue-input :field="field" :key="field.id"></vue-input>
                   <vue-search-result :search_id="fieldset.search" :action="field.action"></vue-search-result>
                 </template>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-search-result", {
    props: ["search_id"],
    data() {
      return {
        isHidden: true
      }
    },
    methods: {
      observerFunc(mutationsList, observer) {
        // Use traditional "for loops" for IE 11
        for(const mutation of mutationsList) {
          switch (mutation.type) {
            case "childList":
              for (let item of mutation.addedNodes) {
                if (item.tagName.toUpperCase() === "TABLE") {
                  this.$root.searchRelationHandle(mutation.target.id);
                  this.showElement();
                  break;
                }
              }
              break;
          }
        }
      },
      showElement() {
        this.isHidden = false;
      },
      hideElement() {
        this.isHidden = true;
      },
    },
    mounted() {
      // add Observer to search area
      let searchObserver = addObserver(document.getElementById(this.search_id), { childList: true }, this.observerFunc);
    },
    template: `<div class="b-block js-search-result" :class="{ 'b-block--hidden': isHidden }">
                 <div :id="search_id" class="b-block"></div>
                 <div>
                   <button class="b-button b-button--outline" type="button" @click="hideElement">Hide results</button>
                 </div>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-relation", {
    props: ["relation"],
    methods: {
      removeRelation(event) {
        this.$emit("remove", this.relation.id);
      }
    },
    template: `<div class="db-relation" :id="relation.type + relation.id">
                 <h6 class="db-relation__header">
                   <a :href="'https://myanimelist.net/' + relation.type + '/' + relation.id">{{ relation.title }}</a>
                 </h6>
                 <a class="b-button b-button--icon b-button--outline" href="javascript:void(0)" @click="removeRelation">
                   <i class="fa-solid fa-trash"></i>
                 </a>
                 <div class="b-form-group">
                   <span class="b-form-group__text">Role</span>
                   <input type="hidden" :name="relation.type == 'anime' ? 'relationId[]' : 'mangarelationId[]'" :value="relation.id" />
                   <select class="b-input" v-model="relation.role" :name="relation.type == 'anime' ? 'charAnimeRole[]' : 'charMangaRole[]'" required>
                     <option value="1">Main</option>
                     <option value="2">Supporting</option>
                   </select>
                 </div>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-input", {
    props: ["field"],
    data() {
      return {
        statusClass: "",
        errorClass: "b-input--invalid"
      }
    },
    methods: {
      onInput(event) {
        this.statusClass = this.field.minlength && event.target.value.length < 3 && event.target.value.length != 0 ? this.errorClass : "";
      },
      onKeyDown(event) {
        if (this.statusClass === this.errorClass) return false;
        if (this.field.value && this.field.action === "searchAnimeTitles") window.searchAnimeTitles();
        if (this.field.value && this.field.action === "searchMangaTitles") window.searchMangaTitles();
      }
    },
    template: `<div class="b-block">
                 <div class="b-form-group">
                   <span v-if="field.text" class="b-form-group__text">{{ field.text }}</span>
                   <textarea v-if="field.type == 'textarea'" class="b-input" :id="field.id" :name="field.name" v-model="field.value"></textarea>
                   <input v-else class="b-input" :class="statusClass" :type="field.type" :id="field.id" :name="field.name" :placeholder="field.placeholder" @keydown.enter="onKeyDown" @input="onInput" v-model="field.value">
                   <button v-if="field.button" class="b-button b-button--outline" type="button" @click="onKeyDown">{{ field.button.text }}</button>
                 </div>
                 <div v-if="field.hint && !statusClass" class="b-form__text">{{ field.hint }}</div>
                 <div v-if="field.errorhint && statusClass" class="b-form__text">{{ field.errorhint }}</div>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-action", {
    props: ["action"],
    methods: {
      onClick() {
        this.action.method ? this.action.method() : console.log("null");
      }
    },
    template: `<div class="b-action" :class="action.class">
                 <div class="b-action_text">{{ action.message }}</div>
                 <a v-if="action.link" class="b-button b-button--outline" :href="action.link" target="_blank">{{ action.text }}</a>
                 <button v-if="!action.link && action.text" class="b-button" type="button" @click="onClick">{{ action.text }}</button>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-guildeline", {
    props: ["action"],
    template: `<div class="b-block mcf-guideline">
                 <vue-action :action="{ class: 'b-action--message', message: 'Read Character DB Guidelines', link: '/forum/?topicid=141103', text: 'Read' }"></vue-action>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-suggestions", {
    props: ["suggestions"],
    template: `<div class="b-block mcf-suggestion">
                 <h6 class="h6">
                   <span>Suggested Actions</span>
                 </h6>
                 <vue-action v-for="suggestion in suggestions" :key="suggestion.id" :action="suggestion"></vue-action>
               </div>`
  });

  // Define a new component called todo-item
  Vue.component("vue-duplicates", {
    props: ["state"],
    data() {
      return {
        isSubmitHidden: true,
      }
    },
    methods: {
      observerFunc(mutationsList, observer) {
        // Use traditional "for loops" for IE 11
        for(const mutation of mutationsList) {
          switch (mutation.type) {
            case "childList":
              for (let item of mutation.addedNodes) {
                if (item.tagName.toUpperCase() === "TABLE") {
                  this.observerChangeHandler();
                  break;
                }
              }
              break;
          }
        }
      },
      observerChangeHandler() {
        this.showSubmit();
      },
      showSubmit() {
        this.isSubmitHidden = false;
      },
      hideSubmit() {
        this.isSubmitHidden = true;
      },
      onSubmit() {
        this.$emit("submit");
      },
      onReset() {
        this.$emit("reset");
      },
    },
    mounted() {
      // add Observer to search area
      let searchObserver = addObserver(document.getElementById("dupeResults"), { childList: true }, this.observerFunc);
    },
    template: `<div class="b-block mcf-duplicates" :class="{ 'b-block--hidden': !state }">
                 <h6 class="h6">
                   <i class="fa-solid fa-people-arrows icon"></i>
                   <span>Similarly Named Characters</span>
                 </h6>
                 <p>The following characters were found in the database already. Please make sure the character you are adding is NOT in this list.</p>
                 <div id="dupeArea">
                   <div id="dupeResults"></div>
                 </div>
                 <div class="b-block mcf-submit" v-if="!isSubmitHidden">
                   <button class="b-button b-button--outline" type="button" @click="onReset">Reset</button>
                   <button class="b-button b-button--primary" type="button" @click="onSubmit">Submit</button>
                 </div>
               </div>`
  });

  const app = new Vue({
    name: "vue-character-add-form",
    el: "#vue_form_new_character",
    data: {
      fieldsets: [
        {
          "id": "charrmj",
          "text": "Character Name",
          "class": "mcf-name mcf-name-rmj",
          "fields": [
            {
              "id": "fname",
              "text": "First",
              "hint": "Ex. Naruto",
              "name": "char_name_first",
              "value": ""
            },
            {
              "id": "lname",
              "text": "Last",
              "hint": "Ex. Uzumaki",
              "name": "char_name_last",
              "value": ""
            }
          ]
        },
        {
          "id": "charjpn",
          "text": "Japanese Name",
          "class": "mcf-name mcf-name-jpn",
          "fields": [
            {
              "id": "jname",
              "hint": "Name in kanji",
              "name": "char_jp_name",
              "value": ""
            }
          ]
        },
        {
          "id": "charalt",
          "text": "Alternate Name",
          "class": "mcf-name mcf-name-alt",
          "fields": [
            {
              "id": "aname",
              "hint": "Nickname",
              "name": "character_alt_name",
              "value": ""
            }
          ]
        },
        {
          "id": "charbio",
          "text": "Biography",
          "class": "mcf-biography",
          "fields": [
            {
              "id": "bio",
              "type": "textarea",
              "hint": "Information and details about the character. Cite your source! BBCode enabled. BBCode Help.",
              "name": "character_bio",
              "value": ""
            }
          ]
        },
        {
          "id": "charpic",
          "text": "Picture",
          "class": "mcf-picture",
          "fields": [
            {
              "id": "pic",
              "type": "file",
              "hint": "No avatars. No NSFM.",
              "name": "file",
              "value": ""
            },
            {
              "id": "picsrc",
              "text": "Source",
              "placeholder": "a link to the source of your image...",
              "name": "pic_source",
              "value": ""
            }
          ]
        },
      ],
      relations: [
        {
          "id": "relanime",
          "text": "Anime Relations",
          "class": "mcf-relations mcf-relations-anime",
          "icon": "fa-solid fa-tv-alt",
          "result": "relationArea",
          "search": "searchResults",
          "fields": [
            {
              "id": "queryTitle",
              "hint": "Search for an anime title to add for the character.",
              "value": "",
              "minlength": 3,
              "errorhint": "You must provide more than 2 letters.",
              "action": "searchAnimeTitles",
              "button": {
                "text": "Search"
              }
            }
          ],
          "items": []
        },
        {
          "id": "relmanga",
          "text": "Manga Relations",
          "class": "mcf-relations mcf-relations-manga",
          "icon": "fa-solid fa-books",
          "result": "mangarelationArea",
          "search": "mangasearchResults",
          "fields": [
            {
              "id": "mangaqueryTitle",
              "hint": "Search for a manga title to add for the character.",
              "value": "",
              "minlength": 3,
              "errorhint": "You must provide more than 2 letters.",
              "action": "searchMangaTitles",
              "button": {
                "text": "Search"
              }
            }
          ],
          "items": []
        }
      ],
      form: {
        add: true,
        edit: false,
        stateDupes: false,
        ready: false
      },
      suggestions: [
        {
          "id": "fName",
          "message": "Fill \"First Name\" field.",
          "class": "b-action--warning",
          "text": "Fill",
          "method": false,
          "active": false
        },
        {
          "id": "charRel",
          "message": "Add some DB Relation.",
          "class": "b-action--warning",
          "text": "Add",
          "active": false
        },
        {
          "id": "dupNames",
          "message": "Check Duplicates before submit.",
          "class": "b-action--warning",
          "text": "Check",
          "method": false,
          "active": false
        }
      ]
    },
    mounted() {
      this.$set(this.suggestions[0], "method", this.focusFirstNameField);
      this.$set(this.suggestions[2], "method", this.checkDupes);
    },
    computed: {
      activeSuggestions() {
        return this.suggestions.filter((x, index) => {
          if (index == 0) return this.fieldsets[0].fields[0].value == "";
          if (index == 1) return !this.isRelationsFilled;
          if (index == 2) return this.fieldsets[0].fields[0].value != "" && this.isRelationsFilled;
        });
      },
      isRelationsFilled() {
        return [].concat(this.relations[0].items, this.relations[1].items).length > 0;
      }
    },
    methods: {
      checkDupes() {
        this.form.stateDupes = true;
        window.checkNames();
      },
      focusFirstNameField() {
        document.getElementsByName("char_name_first")[0].focus();
      },
      initApp() {
        this.suggestions[0].active = this.isFirstNameFilled();
      },
      searchRelationHandle(areaId) {
        console.log("searchRelationHandle", areaId);
        let resultData = [],
            resultItems = document.querySelectorAll("#" + areaId + " > table");
        resultItems.forEach(item => {
          let itemLink = item.querySelector("a");
          let itemID = itemLink.href.substring(itemLink.href.indexOf("(") + 1, itemLink.href.indexOf(","));
          let itemType = areaId == "searchResults" ? "anime" : "manga";

          itemLink.onclick = () => this.chooseUpdated(itemID, itemLink.textContent, itemType);
          itemLink.href = "https://myanimelist.net/" + itemType + "/" + itemID;
          item.querySelector("div[id]").remove();
        })
      },
      chooseUpdated(seriesID, seriesName, seriesType) {
        event.preventDefault();
        let blockType = this.relations.filter(rel => rel.text.toUpperCase().includes(seriesType.toUpperCase()))[0];
        if (blockType.items.find(item => item.id == seriesID)) {
          document.querySelector("#" + seriesType + seriesID + " select").focus();
          return;
        }
        blockType.items.push(
          {
            "id": seriesID,
            "title": seriesName,
            "type": seriesType,
            "role": -1
          }
        );
      },
      submitForm() {
        window.submitForm();
      },
      resetForm() {
        window.clearForm();
      },
    },
    template: `
    <div class="mcf-container">
      <div class="mcf-topmenu">
        <vue-guildeline v-if="form.add"></vue-guildeline>
        <vue-navigation v-else></vue-navigation>
      </div>
      <div class="mcf-content">
        <vue-fieldset v-for="fieldset in fieldsets" :fieldset="fieldset" :key="fieldset.id"></vue-fieldset>
        <vue-fieldset--relation v-for="relation in relations" :fieldset="relation" :key="relation.id"></vue-fieldset--relation>
      </div>
      <div class="mcf-sidebar">
        <vue-status v-if="form.edit"></vue-status>
        <vue-suggestions :suggestions="activeSuggestions"></vue-suggestions>
        <vue-duplicates v-if="form.add" :state="form.stateDupes" @submit="submitForm" @reset="resetForm"></vue-duplicates>
        <vue-reason v-if="form.edit"></vue-reason>
      </div>
    </div>
    `
  });
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
    display: none !important;
  }

  .b-block--centered {
    text-align: center;
  }



  .b-form {}

  .b-form__text {
    margin-top: 0.25rem;
    color: var(--c-hint, #6c757d);
    line-height: 1.5;
  }

  .b-form-group {
    display: flex;
    align-items: stretch;
  }

  .b-form-group .b-input {
    flex: 1 1 auto;
  }

  #myCharForm .b-form-group .b-form-group__text {
    display: flex;
    align-items: center;
    min-width: 28px;
    padding: 0.5em 1em;
    background-color: var(--c-input-container-upper, #e9ecef);
    border: 1px solid var(--c-input-outline, #ced4da);
    border-radius: var(--border-rounded, 5px);
    color: var(--c-input-text, #000);
    line-height: 1;
    white-space: nowrap;
  }

  #myCharForm .b-form-group .b-form-group__text:not(:first-child) {
    border-left: 0;
  }

  #myCharForm .b-form-group .b-form-group__text:not(:last-child) {
    border-right: 0;
  }

  #myCharForm .b-form-group .b-input:not(:last-child),
  #myCharForm .b-form-group .b-form-group__text:not(:last-child),
  #myCharForm .b-form-group .b-button:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  #myCharForm .b-form-group .b-input:not(:first-child),
  #myCharForm .b-form-group .b-form-group__text:not(:first-child),
  #myCharForm .b-form-group .b-button:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  #myCharForm .b-form-group .b-button:not(:first-child) {
    margin-left: -1px;
  }



  #myCharForm .b-input {
    display: block;
    padding: 0.5em 1em;
    background: var(--c-input-container, #fff);
    border: thin solid var(--c-input-outline, #ced4da);
    border-radius: var(--border-rounded, 5px);
    color: var(--c-input-text, #000);
    font: inherit;
    line-height: 1.5;
    transition: .16s cubic-bezier(0.4, 0, 0.6, 1);
    transition-property: color, background, border, box-shadow;
  }

  #myCharForm .b-input:focus {
    border-color: #86b7fe;
    border-color: #97a8d1;
    box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(13 110 253 / 25%));
    box-shadow: 0 0 0 0.25rem var(--c-brand-mal-focus, rgb(46  81 162 / 25%));
    outline: none;
    z-index: 1;
  }

  #myCharForm .b-input:invalid,
  #myCharForm .b-input--invalid {
    border-color: #dc3545;
  }

  #myCharForm .b-input:invalid:focus,
  #myCharForm .b-input--invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.25rem rgb(220 53  69 / 25%);
  }

  #myCharForm textarea.b-input {
    width: -webkit-fill-available;
    width: fill-available;
    padding: 0.75em 1em;
    resize: vertical;
  }

  #myCharForm select.b-input {
    appearance: none;
    height: 1.5em;
    padding-right: 2.5em;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75em center;
    background-size: 15px 12px;
    box-sizing: content-box;
  }

  #myCharForm textarea[name="character_bio"] {
    min-height: 9em
  }

  #myCharForm textarea[name="reason"] {
    min-height: 5em
  }

  #myCharForm .b-input#jname {
    padding: 0 12px;
    font-size: 14px;
    line-height: 30px;
  }



  #myCharForm .b-block > .b-button:last-child:not(:first-child) {
    margin: 0 0 0 1em;
  }

  #myCharForm .b-button {
    font-weight: normal;
    text-transform: none;
  }



  .h6 {
    margin: 0 0 .5em;
    font-size: inherit;
    font-weight: bold;
    color: var(--color-on-background, #123);
    line-height: 2.5;
  }

  .h6 > span {
    line-height: 2.5;
  }

  .h6 > i {
    min-width: 1.5em;
    margin-right: 0.7em;
  }

  .b-block > .h6 {
    color: var(--c-label, #5a6172);
    font-family: Tahoma;
    text-transform: uppercase;
  }



  #myCharForm .b-button {
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
    color: inherit;
    font: inherit;
    font-weight: bold;
    line-height: 1.5;
    text-align: center;
    text-transform: none;
    white-space: nowrap;
    cursor: pointer;
    transition: .16s cubic-bezier(0.4, 0, 0.6, 1);
    transition-property: color, background, border, box-shadow;
  }

  #myCharForm .b-button:focus {
    box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(108 117 125 / 50%));
    outline: none;
    z-index: 1;
  }

  #myCharForm .b-button.b-button--icon {
    min-width: 3em;
  }

  #myCharForm .b-button.b-button--icon > i {
    font-size: 16px;
  }

  #myCharForm .b-button:hover {
    text-decoration: none;
  }




  #myCharForm .b-button-group {
    display: flex;
    align-items: stretch;
    font-size: 12px;
  }

  #myCharForm .b-button-group > .b-button {
    flex: 1 1 0;
  }

  #myCharForm .b-button-group .b-button:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }


  #myCharForm .b-button-group .b-button:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  #myCharForm .b-button-group > .b-button:not(:first-child) {
    margin-left: -1px;
  }



  #myCharForm .b-button.b-button--primary {
    background-color: var(--color-primary, #395bad);
    border-color: var(--color-primary, #395bad);
    color: var(--color-on-primary, #fff);
  }

  #myCharForm .b-button.b-button--primary:hover {
    background-color: var(--color-primary, #395bad);
    border-color: var(--color-primary, #395bad);
    color: var(--color-on-primary, #fff);
  }

  #myCharForm .b-button.b-button--primary:focus {
    background-color: var(--color-primary, #395bad);
    border-color: var(--color-primary, #395bad);
    box-shadow: 0 0 0 0.25rem var(--color-primary-container, rgb(57 91 173 / 50%));
    color: var(--color-on-primary, #fff);
    outline: none;
    z-index: 1;
  }



  #myCharForm .b-button.b-button--outline {
    background-color: transparent;
    border-color: var(--color-outline, #789);
    color: var(--color-primary, #234);
  }

  #myCharForm .b-button.b-button--outline:hover {
    background-color: var(--color-primary, #234);
    border-color: var(--color-primary, #234);
    color: var(--color-on-primary, #fff);
  }

  #myCharForm .b-button.b-button--outline:focus {
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
  }

  .b-action--success {
    background-color: var(--c-success-container, #d1e7dd);
    border-color: var(--c-success-outline, #badbcc);
    color: var(--c-success-text, #0f5132);
  }

  .b-action--warning {
    background-color: var(--c-warning-container, #fff3cd);
    border-color: var(--c-warning-outline, #ffecb5);
    color: var(--c-warning-text, #664d03);
  }

  .b-action--message {
    background-color: var(--c-message-container, #cce5ff);
    border-color: var(--c-message-outline, #b3d9ff);
    color: var(--c-message-text, #033668);
  }

  .b-action_text {
    margin-right: 1em;
  }

  #myCharForm .b-action .b-button {
    margin-left: auto;
  }

  #myCharForm .b-action a.b-button {
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
    padding: .5em .75em;
    margin: -.5em 1em -.5em -1em;
    background-color: var(--c-input-container-upper, #e9ecef);
    border: 0;
    border-right: 1px solid var(--c-input-outline, #ced4da);
    color: inherit;
    font: inherit;
  }



  .db-relation {
    position: relative;
    padding: .75em 1em;
    margin: 0 0 .5em 0;
    border: thin dashed var(--c-primary-outline, #1d439b);
    border-radius: 5px;
    box-sizing: border-box;
    color: var(--c-primary-text);
    font-size: 12px;
  }
  .db-relation::after {
    content: "";
    display: table;
    clear: both;
  }
  .db-relation.approved {
    background: var(--c-primary-container, #f5f7fa);
    border: 1px solid var(--c-primary-outline, #eef1f6);
  }
  .db-relation .db-relation__header {
    margin: 0 0 .5em 0;
    font-size: inherit;
    font-weight: bold;
    line-height: 2;
  }
  #myCharForm .db-relation .b-button {
    float: right;
    height: 1.5em;
    margin-left: 2em;
  }


  #myCharForm .mcf-submit {
    display: flex;
    margin-top: 1.5em;
  }
  #myCharForm .mcf-submit .b-button {
    flex: 1;
    margin-left: 1em;
  }
  #myCharForm .mcf-submit .b-button:first-child {
    margin-left: 0;
  }


@media (min-width: 1100px) {
  .mcf-container {
    display: grid;
    align-items: start;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto 1fr;
    grid-gap: 0 36px;
    max-width: 100%;
  }
  .mcf-topmenu {
    grid-row: 1;
    grid-column: 2;
    margin-bottom: 1.5em;
  }
  .mcf-content {
    grid-row: 1 / span 2;
  }
  .mcf-sidebar {
    grid-row: 2;
    grid-column: 2;
  }
}


@media (min-width: 1100px) {
  .mcf-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0 36px;
  }
  .mcf-content > .b-block {
    display: grid;
    grid-template-columns: 10em auto;
    grid-gap: 0.5em 1.5em;
    grid-column: 1 / span 2;
  }
  .mcf-content > .b-block > .h6 {
    margin: 0;
  }
  .mcf-content > .b-block > .h6 > span {
    margin: 0;
    line-height: 32px;
  }

  .mcf-content > .b-block > .b-block {
    grid-column: 2;
    display: flex;
    align-items: center;
    margin: 0;
    gap: .5em 1.5em;
  }
  .mcf-content > .b-block > .b-block:has(textarea) {
    flex-wrap: wrap;
  }
  .mcf-content > .b-block > .b-block .b-form-group {
    flex: 1;
  }
  .mcf-content > .b-block > .b-block .b-form__text {
    min-width: 100px;
    margin: 0;
  }

  /* Larger font for Asian characters */
  .mcf-name-jpn .b-input#jname {
    font-size: 1.25em;
    line-height: 2;
    padding: 0 .8em;
  }

  /* Remove GRID from Realtions blocks */
  .mcf-content > .b-block.mcf-relations {
    grid-column: auto;
    display: block;
  }
  .mcf-content > .b-block.mcf-relations > .b-block {
    display: grid;
  }
}

.dark-mode {
  --u-mix-mode: in oklab;
  --u-mix-color-container: color-mix(var(--u-mix-mode, in oklab), currentColor 20%, var(--c-background));
  --u-mix-color-outline:   color-mix(var(--u-mix-mode, in oklab), currentColor 40%, var(--c-background));

  /* m3 base #2e51b6 */
  --c-background: #121212;
  --c-input-container: #262629; /* n1 - 15 */
  --c-input-container-upper: #303033; /* n1 - 20 */
  --c-input-outline: #46464a; /* n1 - 30 */
  --c-input-text: #e4e2e6; /* n1 - 90 */
  --c-hint: #acaaae; /* n1 - 70 */
  --c-label: #c1c5dd; /* a2 - 80 */
  --c-outline: #2f3032;
  --c-surface: #202124;
  --c-primary: #323941;
  --c-brand-mal-rgb: 180 196 255;
  --c-brand-mal: rgb(var(--c-brand-mal-rgb));
  --c-brand-mal-focus: rgb(var(--c-brand-mal-rgb) / 25%);

  --color-primary: #b4c4ff; /* a1 - 80 */
  --color-on-primary: #1a1b23; /* n2 - 10 */
  --color-primary-container: rgb(var(--c-brand-mal-rgb) / 25%);

  --c-message-container: #1b3448;
  --c-message-outline: #7891ab;
  --c-message-text: #c1deff;

  --c-message-container: var(--u-mix-color-container, #1b3448);
  --c-message-outline: var(--u-mix-color-outline, #7891ab);
  --c-message-text: #58a0da;

  --c-warning-container: var(--u-mix-color-container, #2a2301);
  --c-warning-outline: var(--u-mix-color-outline, #57503d);
  --c-warning-text: #d7b569;

  --c-success-container: var(--u-mix-color-container, #2c3931);
  --c-success-outline: var(--u-mix-color-outline, #466050);
  --c-success-text: #95d5ae;

  --c-surface-container: #272a2c;
  --c-surface-outline: #4b4c4e;
  --c-surface-text: #ffffff;

  --c-primary-container: var(--u-mix-color-container, #3a3e4d);
  --c-primary-outline: var(--u-mix-color-outline, #656c86);
  --c-primary-text: #abc4ed;
}

.dark-mode #myCharForm .b-input {
  color-scheme: dark;
}

.dark-mode #myCharForm select.b-input {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23e4e2e6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/></svg>");
}

`);
