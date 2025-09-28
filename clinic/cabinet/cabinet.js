import { db } from "../../firebase-init.js";
import {
    collection,
    getDocs,
    limit,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const SESSION_KEY = 'petspotClinicSession';

const nameEl = document.getElementById('clinic-name');
const infoEl = document.getElementById('clinic-info');
const extraEl = document.getElementById('cabinet-extra');
const layoutEl = document.getElementById('cabinet-layout');
const emptyEl = document.getElementById('cabinet-empty');
const subtitleEl = document.getElementById('cabinet-subtitle');
const logoutButtons = [
    document.getElementById('clinic-logout'),
    document.getElementById('cabinet-logout-fallback')
];

function readSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.error('Unable to parse clinic session', error);
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function redirectToLogin() {
    window.location.replace('../login/');
}

logoutButtons.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
        clearSession();
        redirectToLogin();
    });
});

function isUrl(value) {
    if (typeof value !== 'string') return false;
    return value.startsWith('http://') || value.startsWith('https://');
}

function appendInfo(label, value) {
    if (!value && value !== 0) return;

    const row = document.createElement('div');
    row.className = 'cabinet-info-row';

    const labelEl = document.createElement('div');
    labelEl.className = 'cabinet-info-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'cabinet-info-value';

    if (isUrl(value)) {
        const link = document.createElement('a');
        link.href = value;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = value;
        valueEl.appendChild(link);
    } else {
        valueEl.textContent = value;
    }

    row.append(labelEl, valueEl);
    infoEl?.appendChild(row);
}

function renderClinicInfo(session, clinicData) {
    if (!infoEl) return;
    infoEl.innerHTML = '';

    appendInfo('Логин', session.username);

    const name = clinicData?.name || session.name || 'Клиника';
    if (nameEl) {
        nameEl.textContent = name;
    }

    const fields = [
        ['owner', 'Контактное лицо'],
        ['phone', 'Телефон'],
        ['email', 'Email'],
        ['address', 'Адрес'],
        ['geoAddress', 'Адрес на карте'],
        ['facebook', 'Facebook'],
        ['instagram', 'Instagram'],
        ['tiktok', 'TikTok'],
        ['website', 'Сайт'],
        ['googleMaps', 'Google Maps'],
        ['whatsapp', 'WhatsApp'],
        ['telegram', 'Telegram'],
        ['viber', 'Viber']
    ];

    fields.forEach(([key, label]) => {
        if (clinicData && key in clinicData) {
            appendInfo(label, clinicData[key]);
        }
    });

    if (clinicData && ('lat' in clinicData || 'lon' in clinicData)) {
        const coords = [clinicData.lat, clinicData.lon]
            .filter((value) => value !== undefined && value !== null)
            .join(', ');
        if (coords) {
            appendInfo('Координаты', coords);
        }
    }

    if (clinicData && extraEl) {
        extraEl.innerHTML = '';
        if (clinicData.description) {
            const desc = document.createElement('p');
            desc.textContent = clinicData.description;
            extraEl.appendChild(desc);
        }

        if (clinicData.services && Array.isArray(clinicData.services) && clinicData.services.length) {
            const listTitle = document.createElement('h2');
            listTitle.textContent = 'Услуги клиники';
            const list = document.createElement('ul');
            clinicData.services.forEach((service) => {
                const item = document.createElement('li');
                item.textContent = service;
                list.appendChild(item);
            });
            extraEl.append(listTitle, list);
        }
    }
}

async function fetchClinic(clinicId) {
    if (!clinicId) return null;
    const clinicsRef = collection(db, 'vet_clinics');
    const q = query(clinicsRef, where('id', '==', clinicId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
        return null;
    }
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
}

async function initCabinet() {
    const session = readSession();
    if (!session) {
        redirectToLogin();
        return;
    }

    if (layoutEl) {
        layoutEl.hidden = true;
    }
    if (emptyEl) {
        emptyEl.hidden = true;
    }
    if (subtitleEl) {
        subtitleEl.textContent = 'Загрузка данных клиники...';
    }

    try {
        const clinicData = await fetchClinic(session.clinicId);
        if (!clinicData) {
            throw new Error('Clinic data not found');
        }

        renderClinicInfo(session, clinicData);
        if (subtitleEl) {
            subtitleEl.textContent = 'Управляйте профилем и услугами вашей клиники. Новые инструменты скоро появятся.';
        }
        if (layoutEl) {
            layoutEl.hidden = false;
        }
        if (emptyEl) {
            emptyEl.hidden = true;
        }
    } catch (error) {
        console.error('Unable to load clinic data', error);
        if (layoutEl) {
            layoutEl.hidden = true;
        }
        if (emptyEl) {
            emptyEl.hidden = false;
        }
    }
}

initCabinet();
