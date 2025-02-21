// ===== Row Utils =====
function getRowName(row) {
    return row.querySelector('.row-name').value;
}

function getRowType(row) {
    return row.querySelector('.row-type').value;
}

function getRowValue(row) {
    return row.querySelector('.row-value').value;
}

// ===== Document Config & URL Utils =====
function setInputValue(id, value) {
    const input = document.getElementById(id, value);
    console.assert(input !== null, 'Can\'t find element with ID "' + id + '"');
    if (input === null) {
        return;
    }

    if (input.type === 'checkbox') {
        console.assert(['0', '1'].includes(value));
        input.checked = value === '1';
    } else if (input.type === 'text' || input.type === 'number') {
        input.value = value;
    } else {
        console.error('Unknown input type: ' + input.type);
    }
}

function getBoxUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '' || key.startsWith('__')) return;
        params.push({ key: key, value: value });
    });
    return params;
}

function getConfigUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '' || !key.startsWith('__')) return;
        params.push({ key: key.substring(2), value: value });
    });
    return params;
}

function parseDocumentConfig() {
    const params = new URLSearchParams();

    document.querySelectorAll('.url-param').forEach((input) => {
        if (input.type === 'checkbox') {
            params.append('__' + input.id, input.checked ? '1' : '0');
        } else if (input.type === 'text') {
            params.append('__' + input.id, input.value);
        } else {
            console.error('unexpected type: ' + input.type);
        }
    });
    return params;
}

function updateUrlParams() {
    const rowParams = new URLSearchParams();
    document.querySelectorAll('.row').forEach((row) => {
        const key = getRowName(row);
        const val = getRowType(row) + getRowValue(row);
        if (key === '') return;
        rowParams.append(key, val);
    });
    const configParams = parseDocumentConfig();
    window.history.pushState({}, '', `?${rowParams.toString()}&${configParams.toString()}`);
    updateGalleryUrlInput();
}

function updateGalleryUrlInput() {
    document.getElementById('gallery-url').value = window.location.href;
}

// ===== General Purpose Utils =====
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateUUID() {
    return (Math.random() + 1).toString(36).substring(2);
}

function extractYouTubeId(str) {
    try {
        const url = new URL(str);
        const vParam = url.searchParams.get('v');
        if (vParam) {
            // https://www.youtube.com/watch?v=12345
            return vParam;
        } else if (url.pathname.startsWith('/live/')) {
            // https://www.youtube.com/live/12345
            return url.pathname.slice(6);
        } else if (url.origin === 'https://youtu.be') {
            // https://youtu.be/12345
            return url.pathname.slice(1);
        } else {
            return str;
        }
    } catch (error) {
        return str;
    }
}

function isValidYouTubeId(str) {
    return /^[a-zA-Z0-9-_]{11}$/.test(str);
}

function parseSheetBuffer(str) {
    const lines = str.split('\n').filter((line) => line.trim() !== '');
    const result = [];

    for (const line of lines) {
        let parts = line.split('\t');
        if (parts.length === 1) {
            parts.push('');
        }
        if (parts.length !== 2) continue;

        let [first, second] = parts;

        first = extractYouTubeId(first.trim());
        second = extractYouTubeId(second.trim());

        if (isValidYouTubeId(second)) {
            first = first === '' ? String(result.length + 1) : first;
            result.push({ key: first, value: second });
        } else if (isValidYouTubeId(first)) {
            second = second === '' ? String(result.length + 1) : second;
            result.push({ key: second, value: first });
        }
    }

    return result;
}

async function getAvailableMics() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
        return audioInputDevices.sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
        console.error('Error accessing microphones:', error);
        alert('Could not access microphones. Please grant permissions.');
        return [];
    }
}

function parseNumbers(str) {
    return str
        .split(' ')
        .map((num) => num.trim())
        .filter((num) => num !== '')
        .map((num) => parseInt(num));
}

export {
    getRowName,
    getRowType,
    getRowValue,
    getBoxUrlParams,
    setInputValue,
    getConfigUrlParams,
    parseDocumentConfig,
    updateUrlParams,
    generateUUID,
    extractYouTubeId,
    parseSheetBuffer,
    updateGalleryUrlInput,
    getAvailableMics,
    parseNumbers,
};
