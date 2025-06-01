import { getPlayer } from './players.js';
import { updateBoxesParam, generateUUID, extractYouTubeId, getAvailableMics } from './tools.js';

// ===== Box Top Buttons =====
function expandBox(e) {
    const box = e.target.closest('.box');
    box.classList.toggle('expanded');
}

function editBox(e) {
    const box = e.target.closest('.box');
    box.querySelector('.edit-form').classList.remove('hidden');
}

function refreshBox(e) {
    const box = e.target.closest('.box');
    const container = box.querySelector('.player-container');
    const player = container.querySelector('.player');

    container.removeChild(player);
    container.appendChild(
        getPlayer(
            box.getAttribute('data-type'),
            box.getAttribute('data-value'),
            box.getAttribute('data-id'),
        ),
    );
}

function closeBox(e) {
    const box = e.target.closest('.box');
    box.parentElement.removeChild(box);
    updateBoxNumbers();
    updateBoxesParam();
}

function muteOthers(e) {
    const box = e.target.closest('.box');
    getBoxes().forEach((b) => {
        if (b !== box) {
            muteBox(b);
        }
    });
    unmuteBox(box);
}

function createEditForm(name, type, value) {
    const div = document.createElement('div');
    div.className = 'edit-form absolute z-20 text-center w-full hidden mt-2';
    div.innerHTML = `
        <input type="text" placeholder="Name" value="${name}" class="form-name input input-xs w-48 m-1 mt-1" />
        <select class="form-type select select-xs w-48 m-1">
          <option value="YT" ${type === 'YT' ? 'selected' : ''}>YT (YouTube)</option>
          <option value="YN" ${type === 'YN' ? 'selected' : ''}>YN (YouTube with enhanced privacy)</option>
          <option value="JW" ${type === 'JW' ? 'selected' : ''}>JW (JW Player)</option>
          <option value="VC" ${type === 'VC' ? 'selected' : ''}>VC (VdoCipher Player)</option>
          <option value="SS" ${type === 'SS' ? 'selected' : ''}>SS (Screen Share)</option>
          <option value="FB" ${type === 'FB' ? 'selected' : ''}>FB (Facebook)</option>
          <option value="CU" ${type === 'CU' ? 'selected' : ''}>CU (Custom)</option>
        </select>
        ${
            type === 'SS'
                ? `
            <select class="form-value mic-select form-type select select-xs m-1 w-48">
                <option value="" disabled>Select Microphone</option>
                ${window.mics.map(
                    (mic) => `
                    <option
                        value="${mic.deviceId}"
                        ${value === mic.deviceId ? 'selected' : ''}>
                        ${mic.label}
                    </option>`,
                )}
            </select>`
                : `<input type="text" placeholder="ID" value="${value}" class="form-value input input-xs m-1 w-48" />`
        }
        <br />
        <button class="cancel-btn btn btn-xs mr-1">Cancel</button>
        <button class="save-btn btn btn-xs btn-secondary">Save</button>`;

    const nameInput = div.querySelector('.form-name');
    const typeInput = div.querySelector('.form-type');
    const valueInput = div.querySelector('.form-value');

    typeInput.onchange = (e) => {
        const newForm = createEditForm(nameInput.value, typeInput.value, '');
        newForm.classList.remove('hidden');
        div.parentElement.replaceChild(newForm, div);
    };

    if (type === 'SS' && window.mics.length === 0) {
        (async () => {
            window.mics = await getAvailableMics();
            const newForm = createEditForm(nameInput.value, typeInput.value, value);
            div.parentElement.replaceChild(newForm, div);
        })();
    }

    valueInput.onpaste = (e) => {
        if (type === 'YT') {
            e.preventDefault();
            const paste = e.clipboardData.getData('text');
            e.target.value = extractYouTubeId(paste);
        }
    };

    div.querySelector('.cancel-btn').onclick = (e) => {
        const newForm = createEditForm(name, type, value);
        div.parentElement.replaceChild(newForm, div);
    };

    div.querySelector('.save-btn').onclick = (e) => {
        div.classList.add('hidden');
        const box = div.closest('.box');
        box.setAttribute('data-name', nameInput.value);
        box.setAttribute('data-type', typeInput.value);
        box.setAttribute('data-value', valueInput.value);

        box.querySelector('.box-name').innerText = nameInput.value;
        box.querySelector('.refresh-btn').click();

        updateBoxesParam();
    };

    return div;
}

function createBox(name, type, value) {
    const id = generateUUID();
    const box = document.createElement('div');
    box.setAttribute('data-name', name);
    box.setAttribute('data-type', type);
    box.setAttribute('data-value', value);
    box.setAttribute('data-id', id);
    box.className =
        'box w-[279px] h-fit overflow-hidden rounded-lg bg-slate-700 m-1 border border-neutral';
    box.innerHTML = `
      <div class="box-controls w-full h-[22px] flex items-center relative">
        <div class="box-name-container absolute top-0 left-0 h-[22px] w-full bg-base-300 text-center z-20">
          <div class="box-number badge badge-sm badge-neutral -mt-[5px] h-[18px]"></div>
          <span class="box-name whitespace-nowrap text-sm">${name}</span>
        </div>
        <div class="handle mx-1 cursor-grab">☰</div>
        <div class="flex-grow"></div>
        <button class="expand-btn btn btn-soft btn-secondary btn-xs mx-1 h-[20px]">🖥️</button>

        <label class="swap mx-1">
          <input type="checkbox" class="mute-btn" />
          <div class="swap-on btn btn-xs btn-soft h-[20px]">🔈</div>
          <div class="swap-off btn btn-xs btn-soft h-[20px]">🔇</div>
        </label>
        <button class="solo-btn btn btn-xs btn-soft btn-secondary mx-1 h-[20px]">S</button>

        <button class="edit-btn btn btn-xs btn-soft btn-secondary mx-1 h-[20px]">✎</button>
        <button class="refresh-btn btn btn-xs btn-soft btn-secondary mx-1 h-[20px]">↻</button>
        <button class="close-btn btn btn-xs btn-soft btn-secondary mx-1 h-[20px]">✕</button>
      </div>
      <div class="player-container relative w-full h-[calc(100%-22px)] min-h-[150px]"></div>`;

    // mute-btn will be initialized by Chrome extension
    box.querySelector('.solo-btn').onclick = muteOthers;
    box.querySelector('.expand-btn').onclick = expandBox;
    box.querySelector('.edit-btn').onclick = editBox;
    box.querySelector('.refresh-btn').onclick = refreshBox;
    box.querySelector('.close-btn').onclick = closeBox;

    const player = box.querySelector('.player-container');
    player.appendChild(getPlayer(type, value, id));
    const editForm = createEditForm(name, type, value);
    if (name === '' && value === '') {
        editForm.classList.remove('hidden');
    }
    player.appendChild(editForm);

    return box;
}

function addBox(name = '', type = 'YT', value = '') {
    const gallery = document.getElementById('gallery');
    gallery.appendChild(createBox(name, type, value));
    updateBoxNumbers();
}

function getBoxes() {
    return document.getElementById('gallery').querySelectorAll('.box');
}

function muteBox(box) {
    if (box.classList.contains('unmuted')) {
        box.querySelector('.mute-btn').click();
    }
}

function unmuteBox(box) {
    if (!box.classList.contains('unmuted')) {
        box.querySelector('.mute-btn').click();
    }
}

function updateBoxNumbers() {
    getBoxes().forEach((box, i) => {
        box.querySelector('.box-number').textContent = i + 1;
    });
}

export { createBox, addBox, getBoxes, muteBox, unmuteBox, updateBoxNumbers };
