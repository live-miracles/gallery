import {
    getBoxUrlParams,
    getConfigUrlParams,
    setInputValue,
    updateUrlParams,
    updateGalleryUrlInput,
    parseNumbers,
    parseSheetBuffer,
} from './tools.js';
import { addBox, getBoxes } from './box.js';
import { addRow, updateRowNumbers } from './row.js';

function initRows() {
    document.getElementById('data-rows').innerHTML = '';
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addRow();
    }
    urlParams.forEach((param) => {
        addRow(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function updateRows() {
    updateUrlParams();
    updateBoxes();
    updateRowNumbers();
}

function updateBoxes() {
    document.getElementById('gallery').innerHTML = '';
    const urlParams = getBoxUrlParams();
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function setInputElements() {
    const urlParams = getConfigUrlParams();
    urlParams.forEach((param) => setInputValue(param.key, param.value));
}

function showElements() {
    document.querySelectorAll('.show-toggle').forEach((elem) => {
        const name = elem.id.slice('show-'.length);
        const show = elem.checked;
        document.querySelectorAll('.' + name).forEach((e) => {
            if (show) {
                e.classList.remove('hidden');
            } else {
                e.classList.add('hidden');
            }
        });
    });
}

let rotationInterval = null;
function muteRotation() {
    const toggleElem = document.getElementById('mute-rotation');
    const checked = toggleElem.checked;
    if (!checked) {
        clearInterval(rotationInterval);
        return;
    }
    const allBoxes = getBoxes();
    const boxesElem = document.getElementById('rotation-boxes');
    const rotationBoxes = parseNumbers(boxesElem.value);
    const boxes =
        boxesElem.value === ''
            ? allBoxes
            : rotationBoxes.map((i) => allBoxes[i - 1]).filter(Boolean);
    if (boxes.length < 2) {
        setTimeout(() => toggleElem.click(), 350);
        boxesElem.classList.add('border-error');
        return;
    }
    boxesElem.classList.remove('border-error');

    const timeElem = document.getElementById('rotation-time');
    const time = parseInt(timeElem.value);
    if (isNaN(time) || time <= 0) {
        setTimeout(() => toggleElem.click(), 350);
        timeElem.classList.add('border-error');
        return;
    }
    timeElem.classList.remove('border-error');

    let i = 1;
    boxes[0].querySelector('.solo-btn').click();
    rotationInterval = setInterval(() => {
        const box = boxes[i];
        i = (i + 1) % boxes.length;
        box.querySelector('.solo-btn').click();
    }, time * 1000);
}

(() => {
    updateGalleryUrlInput();
    setInputElements();

    window.mics = [];
    initRows();

    updateBoxes();
    document
        .querySelectorAll('.url-param')
        .forEach((elem) => elem.addEventListener('change', updateUrlParams));

    showElements();
    document
        .querySelectorAll('.show-toggle')
        .forEach((elem) => elem.addEventListener('click', showElements));

    const base = window.location.origin + window.location.pathname;
    const galleryUrl = document.getElementById('gallery-url');
    const updateGalleryUrl = document.getElementById('update-gallery-url');
    updateGalleryUrl.addEventListener('click', () => {
        let url = galleryUrl.value.trim();
        window.location.href = url === '' ? base : url;
    });
    galleryUrl.onpaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').trim();
        if (paste.startsWith(base)) {
            e.target.value = paste;
        } else {
            const rows = parseSheetBuffer(paste);
            const pairs = rows.map((r) => r.key + '=YT' + r.value);
            e.target.value = base + '?' + pairs.join('&');
        }
    };
    galleryUrl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            updateGalleryUrl.click();
        }
    });

    document.getElementById('add-data-row').addEventListener('click', () => addRow());
    document.getElementById('update-rows').addEventListener('click', updateRows);

    const muteRotationToggle = document.getElementById('mute-rotation');
    muteRotationToggle.addEventListener('click', muteRotation);
    if (muteRotationToggle.checked) {
        muteRotationToggle.click();
        muteRotationToggle.click();
    }

    const dataRows = document.getElementById('data-rows');
    new Sortable(dataRows, {
        animation: 150,
        handle: '.handle', // Draggable by the entire row
        ghostClass: 'bg-base-300', // Adds a class for the dragged item
        onSort: updateRowNumbers,
    });
})();
