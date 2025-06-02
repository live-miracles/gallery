// ===== Document Config & URL Utils =====
function getInputValue(input) {
    if (input.type === 'checkbox') {
        return input.checked ? '1' : '0';
    } else if (input.type === 'text' || input.type === 'number') {
        return input.value;
    } else {
        console.error('Unknown input type: ' + input.type);
        return null;
    }
}

function setInputValue(input, value) {
    if (input.type === 'checkbox') {
        console.assert(['0', '1'].includes(value));
        input.checked = value === '1';
    } else if (input.type === 'text' || input.type === 'number') {
        input.value = value;
    } else {
        console.error('Unknown input type: ' + input.type);
    }
}

function setDocumentUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);

    document.querySelectorAll('.url-param').forEach((input) => {
        const value = searchParams.get(input.id);
        if (value) {
            setInputValue(input, value);
        }
    });
}

function getDocumentUrlParams() {
    const params = new URLSearchParams();

    document.querySelectorAll('.url-param').forEach((input) => {
        if (input.type === 'checkbox') {
            params.append(input.id, input.checked ? '1' : '0');
        } else if (input.type === 'text' || input.type === 'number') {
            params.append(input.id, input.value);
        } else {
            console.error('unexpected type: ' + input.type);
        }
    });
    return params;
}

function updateUrlParam(e) {
    const name = e.currentTarget.id;
    const value = getInputValue(e.currentTarget);

    const url = new URL(window.location.href);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
    updateGalleryUrlInput();
}

function updateBoxesParam() {
    const boxes = [];
    const param = Array.from(document.querySelectorAll('.box'))
        .map((box) => {
            const name = box.getAttribute('data-name').replace(/[.~]/g, '');
            const type = box.getAttribute('data-type').replace(/[.~]/g, '');
            const value = box.getAttribute('data-value').replaceAll('~', '\\~');
            return name + '.' + type + '.' + value;
        })
        .join('~');

    const url = new URL(window.location.href);
    url.searchParams.set('boxes', param);
    window.history.replaceState({}, '', url);
    updateGalleryUrlInput();
}

function updateGalleryUrlInput() {
    document.getElementById('gallery-url').value = window.location.href;
    if (window.location.search !== '') {
        localStorage.setItem('galleryUrl', window.location.href);
    }
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
        return audioInputDevices.sort((a, b) =>
            a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }),
        );
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
    updateBoxesParam,
    setDocumentUrlParams,
    getDocumentUrlParams,
    updateUrlParam,
    generateUUID,
    extractYouTubeId,
    parseSheetBuffer,
    updateGalleryUrlInput,
    getAvailableMics,
    parseNumbers,
};
