import { db } from "../../firebase-init.js";
import {
    collection,
    query,
    where,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const SESSION_KEY = 'petspotClinicSession';
const form = document.getElementById('clinic-login-form');
const statusEl = document.getElementById('clinic-status');
const submitBtn = document.getElementById('clinic-submit');

function getSavedSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.warn('Unable to read saved clinic session', error);
        return null;
    }
}

function showStatus(message, type = "") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('error', 'success');
    if (type) {
        statusEl.classList.add(type);
    }
}

function saveSession(data) {
    const payload = {
        loginDocId: data.loginDocId,
        clinicId: data.clinicId,
        username: data.username,
        name: data.name ?? "",
        createdAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

async function verifyCredentials(username, password) {
    const q = query(
        collection(db, 'clinics_login'),
        where('username', '==', username.trim()),
        limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) {
        return null;
    }

    const doc = snap.docs[0];
    const data = doc.data();
    if (data.password !== password) {
        return null;
    }

    return {
        loginDocId: doc.id,
        clinicId: data.id,
        username: data.username,
        name: data.name
    };
}

const existingSession = getSavedSession();
if (existingSession?.clinicId) {
    window.location.replace('../cabinet/');
}

form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form) return;

    const formData = new FormData(form);
    const username = (formData.get('username') ?? '').toString();
    const password = (formData.get('password') ?? '').toString();

    if (!username || !password) {
        showStatus('Введите логин и пароль', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Входим...';
    showStatus('Проверяем данные...');

    try {
        const session = await verifyCredentials(username, password);
        if (!session) {
            showStatus('Неверный логин или пароль', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
            return;
        }

        saveSession(session);
        showStatus('Успешный вход', 'success');
        window.location.href = '../cabinet/';
    } catch (error) {
        console.error('Clinic login error', error);
        showStatus('Не удалось выполнить вход. Попробуйте позже.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти';
    }
});

window.addEventListener('pageshow', () => {
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти';
    }
});
