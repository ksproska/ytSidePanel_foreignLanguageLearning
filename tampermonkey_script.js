// ==UserScript==
// @name         YouTube caption display in side panel for foreign language learning
// @namespace    http://tampermonkey.net/
// @version      2024-06-24
// @description  Integrates a side panel for captions next to YouTube's main content, allows to save translations to local storage and display them making it easier to learn the foreign language
// @author       Kamila Sproska
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addStyles(css) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    addStyles(`
        #captionPanel {
            position: fixed;
            right: 0;
            top: 0;
            width: 500px;
            height: calc(100% - 240px);
            background-color: #111;
            color: white;
            border-left: 1px solid #000;
            overflow-y: auto;
            padding: 10px;
            box-sizing: border-box;
            z-index: 10000;
            font-size: 20px;
            line-height: 1.4;
            font-family: 'YouTube Sans';
        }
        #captionContent {
            white-space: pre-wrap;
        }
        ytd-app {
            margin-right: 500px;
            float: left;
        }
        #bottomInputs {
            position: fixed;
            bottom: 200px;
            width: 460px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #bottomInputs input[type="text"] {
            width: 60%;
            padding: 8px 12px;
            margin: 0 1px;
            font-size: 16px;
            box-sizing: border-box;
            background-color: var(--yt-spec-general-background-b, #0f0f0f);
            color: var(--yt-spec-text-primary, #fff);
            border: 1px solid var(--yt-spec-outline, rgba(255, 255, 255, 0.2));
            border-radius: 2px;
        }
        #bottomInputs button {
            width: 20%;
            padding: 8px 12px;
            font-size: 16px;
            box-sizing: border-box;
            background-color: #f00;
            color: var(--yt-spec-static-overlay-text-primary, white);
            border-radius: var(--yt-button-border-radius, 2px);
            border: none;
            cursor: pointer;
        }
        #dictionaryDisplay {
            position: fixed;
            bottom: 0px;
            right: 0px;
            width: 500px;
            background-color: #111;
            color: white;
            padding-left: 20px;
            box-sizing: border-box;
            font-size: 20px;
            line-height: 1.4;
            font-family: 'YouTube Sans';
            overflow-y: auto;
            height: 190px;
            white-space: pre-wrap;
        }
        .translation-tooltip {
            position: absolute;
            transform: translateX(-50px) translateY(25px);
            background-color: #000;
            color: yellow;
            padding: 5px;
            border: 1px solid var(--yt-spec-outline, rgba(255, 255, 255, 0.2));
            border-radius: 5px;
            font-size: 20px;
            visibility: hidden;
            z-index: 10001;
        }
        .translation-hover:hover .translation-tooltip {
            visibility: visible;
        }
        .translation-hover {
            color: #f77;
        }
    `);

    const panel = document.createElement('div');
    panel.id = 'captionPanel';
    const content = document.createElement('div');
    content.id = 'captionContent';
    panel.appendChild(content);

    const bottomInputs = document.createElement('div');
    bottomInputs.id = 'bottomInputs';
    bottomInputs.innerHTML = `
        <input type="text" id="original" placeholder="original">
        <input type="text" id="meaning" placeholder="meaning">
        <button id="buttonAdd">Add</button>
    `;
    panel.appendChild(bottomInputs);

    const dictionaryDisplay = document.createElement('div');
    dictionaryDisplay.id = 'dictionaryDisplay';
    panel.appendChild(dictionaryDisplay);

    document.body.appendChild(panel);

    function saveToLocalStorage(originalWord, translationWord) {
        const map = JSON.parse(localStorage.getItem('translationsMap')) || {};
        if (!map[originalWord]) {
            map[originalWord] = [];
        }
        map[originalWord].push(translationWord);
        localStorage.setItem('translationsMap', JSON.stringify(map));
        updateDictionaryDisplay();
    }

    function updateDictionaryDisplay() {
        const map = JSON.parse(localStorage.getItem('translationsMap')) || {};
        let displayText = '';
        const keys = Object.keys(map).reverse();
        for (const key of keys) {
            displayText += `${key} - ${map[key].join(', ')}\n`;
        }
        dictionaryDisplay.textContent = displayText;
    }

    function decodeHtmlEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    function addHoverEffectToCaptions() {
        const map = JSON.parse(localStorage.getItem('translationsMap')) || {};
        const captions = document.querySelectorAll('#captionContent text');
        captions.forEach(caption => {
            let captionHTML = caption.innerHTML;
            for (const [original, translations] of Object.entries(map)) {
                const regex = new RegExp(`\\b${original}\\b`, 'gi');
                captionHTML = captionHTML.replace(regex, match => {
                    const translation = translations.join(', ');
                    return `<span class="translation-hover">${match}<span class="translation-tooltip">${translation}</span></span>`;
                });
            }
            caption.innerHTML = decodeHtmlEntities(captionHTML);
        });
    }

    document.getElementById('buttonAdd').addEventListener('click', function () {
        const originalWord = document.getElementById('original').value.trim();
        const translationWord = document.getElementById('meaning').value.trim();
        if (originalWord && translationWord) {
            saveToLocalStorage(originalWord, translationWord);
            document.getElementById('original').value = '';
            document.getElementById('meaning').value = '';
            addHoverEffectToCaptions();
        }
    });

    function highlightCurrentCaption() {
        const ytplayer = document.getElementById("movie_player");
        if (ytplayer) {
            const currentTime = ytplayer.getCurrentTime();
            const captions = document.querySelectorAll('#captionContent text');
            let activeCaption = null;

            captions.forEach(caption => {
                const start = parseFloat(caption.getAttribute('start'));
                const duration = parseFloat(caption.getAttribute('dur'));
                const end = start + duration;

                caption.style.color = 'white';

                if (currentTime >= start && currentTime < end) {
                    caption.style.color = '#33ccff';
                    activeCaption = caption;
                }
            });

            if (activeCaption) {
                activeCaption.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    }

    window.addEventListener('load', function () {
        try {
            const playerResponse = window.ytInitialPlayerResponse;

            if (playerResponse && playerResponse.captions && playerResponse.captions.playerCaptionsTracklistRenderer) {
                const captionTracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;

                if (captionTracks && captionTracks.length > 0) {
                    const baseUrl = captionTracks[0].baseUrl;
                    console.log('Fetching Caption Data from:', baseUrl);

                    fetch(baseUrl)
                        .then(response => response.text())
                        .then(data => {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(data, "text/xml");
                            const texts = xmlDoc.getElementsByTagName('text');
                            let formattedText = '';
                            Array.from(texts).forEach(text => {
                                formattedText += `<text start="${text.getAttribute('start')}" dur="${text.getAttribute('dur')}">${decodeHtmlEntities(text.innerHTML)}</text>\n`;
                            });
                            document.getElementById('captionContent').innerHTML = formattedText;

                            setInterval(highlightCurrentCaption, 1000);
                            addHoverEffectToCaptions();
                        })
                        .catch(error => {
                            document.getElementById('captionContent').textContent = 'Error fetching caption data: ' + error.message;
                        });
                } else {
                    document.getElementById('captionContent').textContent = 'No caption tracks found.';
                }
            } else {
                document.getElementById('captionContent').textContent = 'Captions not available or ytInitialPlayerResponse structure has changed.';
            }
        } catch (error) {
            document.getElementById('captionContent').textContent = 'Error accessing YouTube captions: ' + error.message;
        }

        updateDictionaryDisplay();
        addHoverEffectToCaptions();
    });
})();