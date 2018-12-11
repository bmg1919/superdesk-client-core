import * as action from './actions';
import {forEachMatch} from './helpers/find-replace';
import {toHTML} from './html';
import {clearHighlights} from './helpers/find-replace';
import {getTansaHtml} from './helpers/tansa';

/**
 * @type {Object} Redux stores
 * @description Holds the store of the find and replace target
 * of the open article.
 * @private
 */
let store = null;

/**
 * @type {array} Redux stores
 * @description Holds the stores of the editors on the open article
 * if they are spellchecker targets
 * @private
 */
const spellcheckerStores = [];

/**
 * @ngdoc service
 * @module superdesk.core.editor3
 * @name editor3
 * @description editor3 is the service that allows interacting with the editor from
 * the outside. It uses the same interface as the editor service of core/editor2/editor.js
 * to allow plugging one or the other based on the editor of the item being edited.
 */
export class EditorService {
    /**
     * @ngdoc method
     * @name editor3#setStore
     * @param {Object} redux store
     * @description Registers the passed redux store with the service.
     */
    setStore(s) {
        if (store !== null) {
            console.warn('You\'ve overwritten the find & replace target.');
        }

        store = s;
    }

    /**
     * @ngdoc method
     * @name editor3#addSpellcheckerStore
     * @param {Object} redux store
     * @description Registers the passed redux store with the spellchecker service
     * @returns {Integer}
     */
    addSpellcheckerStore(s) {
        spellcheckerStores.push(s);
        return spellcheckerStores.length - 1;
    }

    /**
     * @ngdoc method
     * @name editor3#version
     * @description Returns the editor version (this is for when using editorResolver).
     * @returns {string}
     */
    version() {
        return '3';
    }

    /**
     * @ngdoc method
     * @name editor3#unsetStore
     * @description Clears the find and replace store.
     */
    unsetStore() {
        store = null;
    }

    /**
     * @ngdoc method
     * @name editor3#removeSpellcheckerStore
     * @param {Integer}
     * @description Clears a spellchecker store
     */
    removeSpellcheckerStore(i) {
        spellcheckerStores.slice(i, 1);
    }

    /**
     * @ngdoc method
     * @name editor3#selectNext
     * @description Triggers the action to select the next occurence of the search
     * criteria in the editor.
     */
    selectNext() {
        if (ok()) {
            store.dispatch(action.findNext());
        }
    }

    /**
     * @ngdoc method
     * @name editor3#selectPrev
     * @description Triggers the action to select the previous occurence of the search
     * criteria in the editor.
     */
    selectPrev() {
        if (ok()) {
            store.dispatch(action.findPrev());
        }
    }

    /**
     * @ngdoc method
     * @name editor3#replace
     * @param {string} txt
     * @description Replaces the currently highlighted search criteria with the given text.
     */
    replace(txt) {
        if (ok()) {
            store.dispatch(action.replace(txt));
        }
    }

    /**
     * @ngdoc method
     * @name editor3#replace
     * @param {string} txt
     * @description Replaces all the search criteria with the given text.
     */
    replaceAll(txt) {
        if (ok()) {
            store.dispatch(action.replaceAll(txt));
        }
    }

    /**
     * @ngdoc method
     * @name editor3#setSearchCriteria
     * @param {Object} findReplace The new search criteria. An object containing the keys
     * caseSensitive (boolean) and diff (object having one key that is the pattern).
     * @description Updates the search criteria.
     */
    setSearchCriteria(criteria) {
        if (criteria === null) {
            store.dispatch(action.setHighlightCriteria({pattern: ''}));

            return;
        }

        const {diff, caseSensitive} = criteria;
        const pattern = Object.keys(diff || {})[0] || '';

        store.dispatch(action.setHighlightCriteria({pattern, caseSensitive}));
    }

    /**
     * @ngdoc method
     * @name editor3#setSettings
     * @param {Object} The setting can be findreplace or spellcheck.
     * @description Updates the settings for editor3.
     */
    setSettings({findreplace, spellcheck}) {
        if (!ok()) {
            return;
        }

        if (typeof findreplace !== 'undefined') {
            this.setSearchCriteria(findreplace);
        }

        if (typeof spellcheck !== 'undefined') {
            spellcheckerStores.map((s) => s.dispatch(action.setAutoSpellchecker(spellcheck)));
        }
    }

    /**
     * @ngdoc method
     * @name editor3#render
     * @description Highlights the current search criteria in the editor.
     */
    render() {
        if (ok()) {
            store.dispatch(action.renderHighlights());
        }
    }

    /**
     * @ngdoc method
     * @name editor3#getActiveText
     * @description Gets the text under the current selection.
     */
    getActiveText() {
        if (!ok()) {
            return;
        }

        const state = store.getState();
        const {editorState, searchTerm} = state;
        const {index, pattern, caseSensitive} = searchTerm;
        const content = editorState.getCurrentContent();

        let txt = pattern;

        // find the active match
        forEachMatch(content, pattern, caseSensitive, (i, selection, block) => {
            if (i === index) {
                const start = selection.getStartOffset();
                const end = selection.getEndOffset();

                txt = block.getText().slice(start, end);
            }
        });

        return txt;
    }

    /**
     * @ngdoc method
     * @name editor3#getHTML
     * @description Gets the content of the editor as HTML.
     * @returns {string} HTML
     */
    getHTML() {
        if (!ok()) {
            return '';
        }

        const state = store.getState();
        const content = state.editorState.getCurrentContent();
        const cleanedContent = clearHighlights(content).content;

        return toHTML(cleanedContent);
    }

    /**
     * @ngdoc method
     * @name editor3#getHtmlForTansa
     * @description Gets the content of the editor as custom(simplified) html for Tansa.
     * @returns {string} HTML
     */
    getHtmlForTansa() {
        if (!ok()) {
            return '';
        }

        const state = store.getState();
        const {editorState} = state;

        return getTansaHtml(editorState);
    }

    /**
     * @ngdoc method
     * @name editor3#setHtmlFromTansa
     * @param {string} html
     * @description For every block from editor content merge the changes received from tansa.
     */
    setHtmlFromTansa(html) {
        if (ok()) {
            store.dispatch(action.setHtmlFromTansa(html));
        }
    }
}

function ok() {
    if (store === null) {
        console.error('No editor set as target in service.');
    }

    return store !== null;
}
