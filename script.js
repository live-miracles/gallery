import {
    setDocumentUrlParams,
    updateUrlParam,
    updateGalleryUrlInput,
    parseNumbers,
    parseSheetBuffer,
} from './tools.js';
import { addBox, getBoxes, updateBoxNumbers } from './box.js';

function splitTwice(str, separator) {
    const ans = [str, '', ''];

    const index1 = ans[0].indexOf(separator);
    if (index1 === -1) return ans;
    ans[1] = ans[0].slice(index1 + 1);
    ans[0] = ans[0].slice(0, index1);

    const index2 = ans[1].indexOf(separator);
    if (index2 === -1) return ans;
    ans[2] = ans[1].slice(index2 + 1);
    ans[1] = ans[1].slice(0, index2);

    return ans;
}

function initBoxes() {
    document.getElementById('gallery').innerHTML = '';

    const params = new URLSearchParams(window.location.search);
    const boxesParam = params.get('boxes') ? params.get('boxes') : '';
    if (boxesParam === '') addBox();
    boxesParam
        .split(/(?<!\\)¦/)
        .filter(Boolean)
        .map((str) => splitTwice(str, '.'))
        .forEach((param) => addBox(param[0], param[1], param[2].replaceAll('\\¦', '¦')));
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
    setDocumentUrlParams();

    window.mics = [];

    initBoxes();
    document
        .querySelectorAll('.url-param')
        .forEach((elem) => elem.addEventListener('change', updateUrlParam));

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
            const param = rows.map((r) => r.key + '.YT.' + r.value).join('~');
            e.target.value = base + '?boxes=' + param;
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
