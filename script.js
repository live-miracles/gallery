import {
    getBoxUrlParams,
    getConfigUrlParams,
    setInputValue,
    updateUrlParams,
    updateGalleryUrlInput,
    parseNumbers,
    parseSheetBuffer,
} from './tools.js';
import { addBox, getBoxes, updateBoxNumbers } from './box.js';

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

function getRotationBoxes() {
    const allBoxes = getBoxes();
    const boxesText = document.getElementById('rotation-boxes').value.trim();
    if (boxesText === '') return allBoxes;

    const rotationBoxes = parseNumbers(boxesText);
    return rotationBoxes.map((i) => allBoxes[i - 1]).filter(Boolean);
}

function rotateAudio(index = 0, waitTime = -1) {
    const time = parseInt(document.getElementById('rotation-time').value);
    const rotationTime = isNaN(time) ? 1 : Math.max(1, time);

    const isRotationEnabled = document.getElementById('mute-rotation').checked;
    if (isRotationEnabled) {
        if (waitTime === -1 || waitTime >= rotationTime) {
            const boxes = getRotationBoxes();
            const len = boxes.length;
            const newIndex = len === 0 ? 0 : (index + 1) % len;
            setTimeout(() => rotateAudio(newIndex, 0), 1000);
            if (len === 0) return;
            boxes[index % len].querySelector('.solo-btn').click();
        } else {
            setTimeout(() => rotateAudio(index, waitTime + 1), 1000);
        }
    } else {
        setTimeout(rotateAudio, 1000);
    }
}

(() => {
    updateGalleryUrlInput();
    setInputElements();

    window.mics = [];

    updateBoxes();
    document
        .querySelectorAll('.url-param')
        .forEach((elem) => elem.addEventListener('change', updateUrlParams));

    document.getElementById('add-box-btn').addEventListener('click', () => addBox());

    const base = window.location.origin + window.location.pathname;
    const galleryUrl = document.getElementById('gallery-url');
    const updateGalleryUrl = document.getElementById('update-gallery-url');
    updateGalleryUrl.addEventListener('click', () => {
        const url = galleryUrl.value.trim();
        window.location.href = url === '' ? base : url;
    });
    const lastGalleryUrl = document.getElementById('last-gallery-url');
    lastGalleryUrl.addEventListener('click', () => {
        const lastUrl = localStorage.getItem('galleryUrl');
        window.location.href = lastUrl;
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

    rotateAudio();

    new Sortable(document.getElementById('gallery'), {
        animation: 150,
        handle: '.handle', // Draggable by the entire row
        ghostClass: 'bg-base-300', // Adds a class for the dragged item
        onSort: updateBoxNumbers,
    });
})();
