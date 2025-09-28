import { db } from "../../firebase-init.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where
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

const LOGIN_FIELDS = ['username', 'login'];

function normaliseInput(value) {
    return (value ?? '').toString().trim();
}

async function findLoginDoc(cleanUsername) {
    if (!cleanUsername) return null;

    const candidates = Array.from(new Set([
        cleanUsername,
        cleanUsername.toLowerCase()
    ]));

    const loginCollection = collection(db, 'clinics_login');
    let permissionDenied = false;

    for (const field of LOGIN_FIELDS) {
        for (const candidate of candidates) {
            try {
                const snap = await getDocs(query(loginCollection, where(field, '==', candidate), limit(1)));
                if (!snap.empty) {
                    return snap.docs[0];
                }
            } catch (error) {
                if (error?.code === 'permission-denied') {
                    permissionDenied = true;
                    break;
                }
                throw error;
            }
        }

        if (permissionDenied) {
            break;
        }
    }

    if (permissionDenied) {
        for (const candidate of candidates) {
            try {
                const docSnap = await getDoc(doc(loginCollection, candidate));
                if (docSnap.exists()) {
                    return docSnap;
                }
            } catch (error) {
                if (error?.code === 'permission-denied') {
                    throw error;
                }
                if (error?.code !== 'not-found') {
                    throw error;
                }
            }
        }
    }

    return null;
}

async function verifyCredentials(username, password) {
    const cleanUsername = normaliseInput(username);
    const loginDoc = await findLoginDoc(cleanUsername);

    if (!loginDoc) {
        return null;
    }

    const data = loginDoc.data();
    const storedPassword = normaliseInput(data.password ?? data.pass ?? '');
    const providedPassword = normaliseInput(password);

    if (!storedPassword || storedPassword !== providedPassword) {
        return null;
    }

    const clinicId = data.clinicId ?? data.clinic_id ?? data.id ?? loginDoc.id;
    const name = data.name ?? data.title ?? '';
    const resolvedUsername = data.username ?? data.login ?? cleanUsername;

    return {
        loginDocId: loginDoc.id,
        clinicId,
        username: resolvedUsername,
        name
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

    if (!username.trim() || !password.trim()) {
        showStatus('Введите логин и пароль', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Входим...';
    showStatus('Проверяем данные...');

    let success = false;

    try {
        const session = await verifyCredentials(username, password);
        if (!session) {
            showStatus('Неверный логин или пароль', 'error');
            return;
        }

        saveSession(session);
        showStatus('Успешный вход', 'success');
        success = true;
        window.location.href = '../cabinet/';
    } catch (error) {
        console.error('Clinic login error', error);
        const message = error?.code === 'permission-denied'
            ? 'Нет доступа к данным клиники. Обратитесь к администратору.'
            : 'Не удалось выполнить вход. Попробуйте позже.';
        showStatus(message, 'error');
    } finally {
        if (!success) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
        }
    }
});

window.addEventListener('pageshow', () => {
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти';
    }
});
