// ---------- AUTH + I18N ----------
import { db } from "../../firebase-init.js";
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// >>> Firebase Auth для анонимной сессии <<<
import {
    getAuth,
    signInAnonymously,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- UI
const form = document.getElementById('clinic-login-form');
const statusEl = document.getElementById('clinic-status');
const submitBtn = document.getElementById('clinic-submit');
const langBtn = document.querySelector('.lang-btn');
const dropdown = document.querySelector('.lang-dropdown');
const langOptions = document.querySelectorAll('.dropdown-menu button');

// --- Session
const SESSION_KEY = 'petspotClinicSession';

// --- Translations (RU / GE / EN)
const tDict = {
    ru: {
        page_title: "PetSpot Clinic — Вход",
        login_title: "Кабинет клиники",
        login_subtitle: "Войдите, чтобы управлять данными вашей ветеринарной клиники.",
        login_username_label: "Логин",
        login_password_label: "Пароль",
        login_submit: "Войти",
        auth_enter_both: "Введите логин и пароль",
        auth_checking: "Проверяем данные...",
        auth_signing_in: "Входим...",
        auth_bad: "Неверный логин или пароль",
        auth_error: "Не удалось выполнить вход. Попробуйте позже.",
        auth_ok: "Успешный вход",
        footer_about: "Онлайн-паспорт питомца и сервисы рядом",
        footer_docs: "Документы",
        footer_privacy: "Политика конфиденциальности",
        footer_terms: "Условия использования",
        footer_contacts: "Контакты",
        footer_lang: "Язык",
    },
    ge: {
        page_title: "PetSpot Clinic — შესვლა",
        login_title: "კლინიკის კაბინეტი",
        login_subtitle: "შედით თქვენი ვეტერინარული კლინიკის მონაცემების სამართავად.",
        login_username_label: "ლოგინი",
        login_password_label: "პაროლი",
        login_submit: "შესვლა",
        auth_enter_both: "შეიყვანეთ ლოგინი და პაროლი",
        auth_checking: "მოწმდება მონაცემები...",
        auth_signing_in: "შესვლა...",
        auth_bad: "არასწორი ლოგინი ან პაროლი",
        auth_error: "ვერ მოხერხდა შესვლა. სცადეთ მოგვიანებით.",
        auth_ok: "წარმატებით შე-login-დით",
        footer_about: "ონლაინ პასპორტი და სერვისები თქვენს ქალაქში",
        footer_docs: "დოკუმენტები",
        footer_privacy: "კონფიდენციალურობის პოლიტიკა",
        footer_terms: "გამოყენების პირობები",
        footer_contacts: "კონტაქტები",
        footer_lang: "ენა",
    },
    en: {
        page_title: "PetSpot Clinic — Sign in",
        login_title: "Clinic Cabinet",
        login_subtitle: "Sign in to manage your veterinary clinic data.",
        login_username_label: "Username",
        login_password_label: "Password",
        login_submit: "Sign in",
        auth_enter_both: "Enter username and password",
        auth_checking: "Checking credentials...",
        auth_signing_in: "Signing in...",
        auth_bad: "Invalid username or password",
        auth_error: "Could not sign in. Please try later.",
        auth_ok: "Signed in successfully",
        footer_about: "Online pet passport and services nearby",
        footer_docs: "Documents",
        footer_privacy: "Privacy Policy",
        footer_terms: "Terms of Use",
        footer_contacts: "Contacts",
        footer_lang: "Language",
    },
};

// --- Language state
let currentLang = localStorage.getItem("lang") || "ru";

function applyTranslations(lang = currentLang) {
    const dict = tDict[lang] || tDict.ru;
    document.title = dict.page_title;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    });
    submitBtn.dataset.labelDefault = dict.login_submit;
    submitBtn.dataset.labelProgress = dict.auth_signing_in;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang);
    applyTranslations(lang);
}

// --- Dropdown interactions
if (langBtn) {
    langBtn.addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });

    langOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
            langBtn.querySelector('img').src = btn.querySelector('img').src;
            langBtn.querySelector('span').textContent = btn.querySelector('span').textContent;
            document.querySelectorAll('.dropdown-menu button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            dropdown.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !langBtn.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

// init language UI
setLanguage(currentLang);
const initialBtn = document.querySelector(`.dropdown-menu button[data-lang="${currentLang}"]`);
if (initialBtn) {
    langBtn.querySelector('img').src = initialBtn.querySelector('img').src;
    langBtn.querySelector('span').textContent = initialBtn.querySelector('span').textContent;
}

// -------- AUTH HELPERS (Firebase Auth анонимно) ----------
const auth = getAuth();

/** Создаёт/гарантирует анонимную Firebase Auth-сессию (request.auth != null) */
async function ensureAnonymousAuth() {
    await setPersistence(auth, browserLocalPersistence);
    if (auth.currentUser) return auth.currentUser;
    const cred = await signInAnonymously(auth);
    return cred.user;
}

// -------- AUTH LOGIC ----------
const SESSION_KEY_LOCAL = SESSION_KEY;

function getSavedSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY_LOCAL);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function showStatus(messageKey, type = "") {
    if (!statusEl) return;
    const dict = tDict[currentLang] || tDict.ru;
    statusEl.textContent = dict[messageKey] || messageKey;
    statusEl.classList.remove('error', 'success');
    if (type) statusEl.classList.add(type);
}

function saveSession(data) {
    const payload = {
        loginDocId: data.loginDocId,
        clinicId: data.clinicId,
        username: data.username,
        name: data.name ?? "",
        createdAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY_LOCAL, JSON.stringify(payload));
}

async function verifyCredentials(username, password) {
    const q = query(
        collection(db, 'clinics_login'),
        where('username', '==', username.trim()),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const d = snap.docs[0];
    const data = d.data();
    if (data.password !== password) return null;

    return {
        loginDocId: d.id,
        clinicId: data.id,
        username: data.username,
        name: data.name
    };
}

// авто-редирект, если уже есть локальная сессия
const existingSession = getSavedSession();
if (existingSession?.clinicId) {
    ensureAnonymousAuth().then(() => {
        window.location.replace('../cabinet/');
    }).catch(() => {
        // даже если не удалось — пойдем на страницу логина
        window.location.replace('../cabinet/');
    });
}

form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form) return;

    const formData = new FormData(form);
    const username = (formData.get('username') ?? '').toString();
    const password = (formData.get('password') ?? '').toString();

    if (!username || !password) {
        showStatus('auth_enter_both', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = submitBtn.dataset.labelProgress || (tDict[currentLang]?.auth_signing_in);
    showStatus('auth_checking');

    try {
        const session = await verifyCredentials(username, password);
        if (!session) {
            showStatus('auth_bad', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.labelDefault || (tDict[currentLang]?.login_submit);
            return;
        }

        // 1) Сохраняем локальную сессию
        saveSession(session);
        // 2) Обязательно создаём Firebase Auth (анонимную)
        await ensureAnonymousAuth();

        showStatus('auth_ok', 'success');
        window.location.href = '../cabinet/';
    } catch (error) {
        console.error('Clinic login error', error);
        showStatus('auth_error', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.labelDefault || (tDict[currentLang]?.login_submit);
    }
});

window.addEventListener('pageshow', () => {
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.labelDefault || (tDict[currentLang]?.login_submit);
    }
});
