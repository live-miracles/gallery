import { getDocumentUrlParams } from './tools.js';

function getPlayer(type, value, id) {
    console.assert(id);
    const config = new URLSearchParams();
    getDocumentUrlParams().forEach((val, key) => config.append(key, val));
    const urlParams = `boxId=${id}&value=${value}&${config.toString()}`;

    if (type === 'SS') {
        return getCustomPlayer('./screen-share.html?' + urlParams);
    } else if (type === 'CU' && value.endsWith('.m3u8')) {
        return getCustomPlayer(`./m3u8-player.html?` + urlParams);
    } else if (type === 'CU' || value === '') {
        return getCustomPlayer(value);
    } else if (type === 'YT') {
        return getYouTubePlayer(value, urlParams, true);
    } else if (type === 'YN') {
        return getYouTubePlayer(value, urlParams, false);
    } else if (type === 'JW') {
        return getJWPlayer(value, urlParams);
    } else if (type === 'VC') {
        return getVCPlayer(value, urlParams);
    } else if (type === 'FB') {
        return getFacebookPlayer(value, urlParams);
    } else {
        return getCustomPlayer(type + value);
    }
}

function getCustomPlayer(value) {
    const iframe = document.createElement('iframe');
    iframe.className = 'player';
    iframe.src = value;
    iframe.title = 'Custom Video Player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share; fullscreen;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getYouTubePlayer(value, urlParams, cookies) {
    const iframe = document.createElement('iframe');
    iframe.className = 'player';
    const host = cookies ? 'youtube' : 'youtube-nocookie';

    iframe.src = `https://www.${host}.com/embed/${value}?autoplay=1&enablejsapi=1&iv_load_policy=3&${urlParams}`;
    iframe.title = 'YouTube Video Player';
    iframe.frameBorder = '0';
    iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen;';
    iframe.allowfullscreen = 'true';
    return iframe;
}

function getJWPlayer(value, urlParams) {
    const iframe = document.createElement('iframe');
    iframe.className = 'player';
    iframe.src = `https://player.controlhub.innerengineering.vualto.com/Player/Index/${value}?viewUnpublished=True&${urlParams}`;
    iframe.title = 'JWP';
    iframe.seamless = 'seamless';
    iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; autoplay; fullscreen; clipboard-read; clipboard-write;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getVCPlayer(value, urlParams) {
    const iframe = document.createElement('iframe');
    iframe.className = 'player';
    iframe.src = `https://player.vdocipher.com/live?liveId=${value}&preview=true?autoplay=1&${urlParams}`;
    iframe.title = 'VdoCipher Player';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; autoplay; fullscreen; clipboard-read; clipboard-write;';
    iframe.allowfullscreen = true;
    return iframe;
}

function getFacebookPlayer(value, urlParams) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.facebook.com/video/embed?video_id=${value}&${urlParams}`;
    iframe.className = 'player fb-video';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
    iframe.allowfullscreen = 'true';
    iframe.setAttribute('allowFullScreen', 'true');
    return iframe;
}

export { getPlayer };
