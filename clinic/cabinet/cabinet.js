// Кабинет клиники: услуги, информация, расписание (с таймпикерами)
import {db} from "../../firebase-init.js";
import {
    collection, getDocs, query, where, orderBy, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Auth чтобы правила allow write работали
import {
    getAuth, signInAnonymously, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

async function ensureAnonymousAuth() {
    await setPersistence(auth, browserLocalPersistence);
    if (auth.currentUser) return auth.currentUser;
    const cred = await signInAnonymously(auth);
    return cred.user;
}

const SESSION_KEY = "petspotClinicSession";
const layoutEl = document.getElementById("cabinet-layout");
const emptyEl = document.getElementById("cabinet-empty");
const logoutFallbackBtn = document.getElementById("cabinet-logout-fallback");
const btnServices = document.getElementById("menu-services");
const btnInfo = document.getElementById("menu-info");
const btnLogout = document.getElementById("menu-logout");
const contentEl = document.getElementById("cabinet-content");

// элементы мини-карточки
const miniWrap = document.getElementById("clinic-mini");
const miniLogo = document.getElementById("clinic-mini-logo");
const miniName = document.getElementById("clinic-mini-name");
const miniSub = document.getElementById("clinic-mini-sub");

// читаем язык динамически
const getLang = () => localStorage.getItem("lang") || "ru";

const DAYS = [
    {key: "monday", ru: "Понедельник", en: "Monday", ka: "ორშაბათი"},
    {key: "tuesday", ru: "Вторник", en: "Tuesday", ka: "სამშაბათი"},
    {key: "wednesday", ru: "Среда", en: "Wednesday", ka: "ოთხშაბათი"},
    {key: "thursday", ru: "Четверг", en: "Thursday", ka: "ხუთშაბათი"},
    {key: "friday", ru: "Пятница", en: "Friday", ka: "პარასკევი"},
    {key: "saturday", ru: "Суббота", en: "Saturday", ka: "შაბათი"},
    {key: "sunday", ru: "Воскресенье", en: "Sunday", ka: "კვირა"},
];

/* ========= session / nav ========= */
function readSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function goLogin() {
    window.location.replace("../login/");
}

function setMenuActive(el) {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
    if (el) el.classList.add("active");
}

/* ========= i18n helpers ========= */
function t(ru, en, ka) {
    const lang = getLang();
    return lang === "en" ? en : (lang === "ka" ? ka : ru);
}

function pickName(obj) {
    const lang = getLang();
    if (!obj) return "";
    if (lang === "en") return obj.enName || obj.ruName || obj.geName || obj.name || "";
    if (lang === "ka") return obj.geName || obj.ruName || obj.enName || obj.name || "";
    return obj.ruName || obj.enName || obj.geName || obj.name || "";
}

function pickServiceTitle(svc) {
    const lang = getLang();
    if (!svc) return "";
    if (lang === "en") return svc.enName || svc.enTitle || svc.name || svc.title || "";
    if (lang === "ka") return svc.geName || svc.geTitle || svc.name || svc.title || "";
    return svc.ruName || svc.ruTitle || svc.name || svc.title || "";
}

// словарь подписей
function l(key) {
    const lang = getLang();
    const dict = {
        // меню
        mServices: {ru: "Услуги", en: "Services", ka: "სერვისები"},
        mInfo: {ru: "Информация", en: "Information", ka: "ინფორმაცია"},
        mLogout: {ru: "Выйти", en: "Log out", ka: "გასვლა"},

        // форма
        // --- NEW: языки ---
        langsTitle: {
            ru: "На каком языке говорят в клинике",
            en: "Languages spoken at the clinic",
            ka: "კლინიკაში რომელი ენებით საუბრობენ"
        },
        langKA: {ru: "Грузинский", en: "Georgian", ka: "ქართული"},
        langEN: {ru: "Английский", en: "English", ka: "ინგლისური"},
        langRU: {ru: "Русский", en: "Russian", ka: "რუსული"},

        addressGe: {ru: "Адрес (на грузинском)", en: "Address (in Georgian)", ka: "მისამართი (ქართულად)"},
        addressEn: {ru: "Адрес (на английском)", en: "Address (in English)", ka: "მისამართი (ინგლისურად)"},
        addressRu: {ru: "Адрес (на русском)", en: "Address (in Russian)", ka: "მისამართი (რუსულად)"},
        descrGe: {ru: "Описание (на грузинском)", en: "Description (in Georgian)", ka: "აღწერა (ქართულად)"},
        descrEn: {ru: "Описание (на английском)", en: "Description (in English)", ka: "აღწერა (ინგლისურად)"},
        descrRu: {ru: "Описание (на русском)", en: "Description (in Russian)", ka: "აღწერა (რუსულად)"},
        phone: {ru: "Телефон", en: "Phone", ka: "ტელეფონი"},
        website: {ru: "Веб-сайт", en: "Website", ka: "ვებსაიტი"},
        instagram: {ru: "Instagram", en: "Instagram", ka: "Instagram"},
        facebook: {ru: "Facebook", en: "Facebook", ka: "Facebook"},
        madloba: {ru: "Madloba", en: "Madloba", ka: "Madloba"},
        day: {ru: "День", en: "Day", ka: "დღე"},
        open: {ru: "Открытие", en: "Open", ka: "გახსნა"},
        close: {ru: "Закрытие", en: "Close", ka: "დახურვა"},
        round: {ru: "Круглосуточно", en: "24/7", ka: "24/7"},
        save: {ru: "Сохранить", en: "Save", ka: "შენახვა"},
        loading: {ru: "Загрузка...", en: "Loading...", ka: "იტვირთება..."},
        noCats: {
            ru: "Категории не найдены (clinic_service_category пуста).",
            en: "No categories found.",
            ka: "კატეგორიები ვერ მოიძებნა."
        },
        loadSvcs: {ru: "Загрузка услуг...", en: "Loading services...", ka: "მომსახურებების ჩატვირთვა..."},
        noSvcs: {
            ru: "В этой категории услуг нет.",
            en: "No services in this category.",
            ka: "ამ კატეგორიაში სერვისები არ არის."
        },
        svcsErr: {
            ru: "Ошибка загрузки услуг.",
            en: "Failed to load services.",
            ka: "მომსახურებების ჩატვირთვის შეცდომა."
        },
        clinicNF: {ru: "Клиника не найдена.", en: "Clinic not found.", ka: "კლინიკა ვერ მოიძებნა."},
        saved: {ru: "Сохранено!", en: "Saved!", ka: "შენახულია!"},
        authErr: {
            ru: "Не удалось авторизоваться. Попробуйте ещё раз.",
            en: "Auth failed. Try again.",
            ka: "ავტორიზაცია ვერ მოხერხდა."
        },
        loadClinicErr: {
            ru: "Не удалось загрузить данные клиники.",
            en: "Failed to load clinic data.",
            ka: "ვერ ჩაიტვირთა კლინიკის მონაცემები."
        }
    };
    const item = dict[key];
    return item ? (item[lang] ?? item.ru) : key;
}

/* ========= small helpers ========= */
function showLoading(text = l("loading")) {
    contentEl.innerHTML = `<div class="skeleton">${text}</div>`;
}

function showMessage(text) {
    contentEl.innerHTML = `<div>${text}</div>`;
}

function markSaveBtn(id, active) {
    const b = document.getElementById(id);
    if (!b) return;
    b.disabled = !active;
    b.classList.toggle("active", active);
}

function renderHeader(saveBtnId) {
    const h = document.createElement("div");
    h.className = "services-header";
    h.innerHTML = `<button type="button" id="${saveBtnId}" class="save-btn" disabled>${l("save")}</button>`;
    return h;
}

/* ===== Локализация статичных элементов страницы (левое меню) ===== */
function applyStaticI18n() {
    if (btnServices) btnServices.textContent = l("mServices");
    if (btnInfo) btnInfo.textContent = l("mInfo");
    if (btnLogout) btnLogout.textContent = l("mLogout");
}

window._applyCabinetStaticI18n = applyStaticI18n;

/* ====== Мини-карточка клиники в сайдбаре ====== */
async function loadClinicMini() {
    try {
        const session = readSession();
        const clinicId = session?.clinicId;
        if (!clinicId) return;

        const qClinic = query(collection(db, "vet_clinics"), where("id", "==", clinicId));
        const snap = await getDocs(qClinic);
        if (snap.empty) return;

        const data = snap.docs[0].data() || {};
        const name = data.enName || data.name || data.ruName || data.geName || "Clinic";
        const logo = data.photoUrl || "../../images/logo.png";

        if (miniLogo) {
            miniLogo.src = logo;
            miniLogo.alt = name;
        }
        if (miniName) miniName.textContent = name;

        if (miniSub) miniSub.textContent = "Pet clinic";

        if (miniWrap) miniWrap.hidden = false;
    } catch (e) {
        console.warn("loadClinicMini error", e);
    }
}

/* ===================== SERVICES ===================== */
const originalSelected = new Map();
const selectedServices = new Map();

function floatEq(a, b) {
    return Math.abs(Number(a || 0) - Number(b || 0)) < 1e-9;
}

function mapsEqualByIdPrice(a, b) {
    if (a.size !== b.size) return false;
    for (const [id, A] of a.entries()) {
        const B = b.get(id);
        if (!B) return false;
        if (!floatEq(A.price, B.price)) return false;
    }
    return true;
}

function recomputeServicesDirty() {
    markSaveBtn("save-services-btn", !mapsEqualByIdPrice(selectedServices, originalSelected));
}

async function loadServicesTab() {
    showLoading();
    originalSelected.clear();
    selectedServices.clear();
    markSaveBtn("save-services-btn", false);

    const session = readSession();
    const clinicId = session?.clinicId;
    if (!clinicId) {
        goLogin();
        return;
    }

    const clinicsQ = query(collection(db, "vet_clinics"), where("id", "==", clinicId));
    const savedSnap = await getDocs(clinicsQ);
    let savedList = [];
    let targetDocId = null;
    if (!savedSnap.empty) {
        targetDocId = savedSnap.docs[0].id;
        const data = savedSnap.docs[0].data();
        if (Array.isArray(data?.services_list)) savedList = data.services_list;
    }
    savedList.forEach(it => {
        const sid = String(it.id ?? "");
        const price = Number(it.price ?? 0);
        originalSelected.set(sid, {...it, price});
        selectedServices.set(sid, {...it, price});
    });

    const catsSnap = await getDocs(query(collection(db, "clinic_service_category"), orderBy("id")));
    if (catsSnap.empty) {
        showMessage(l("noCats"));
        return;
    }
    const cats = catsSnap.docs.map(d => ({id: d.data().id, ...d.data()}));

    const root = document.createElement("div");
    root.className = "services-root";
    const header = renderHeader("save-services-btn");
    const wrap = document.createElement("div");
    wrap.className = "service-cats";
    root.appendChild(header);
    root.appendChild(wrap);
    contentEl.innerHTML = "";
    contentEl.appendChild(root);

    document.getElementById("save-services-btn")?.addEventListener("click", async () => {
        if (!targetDocId) return;
        try {
            await ensureAnonymousAuth();
        } catch {
            alert(l("authErr"));
            return;
        }
        const ref = doc(db, "vet_clinics", targetDocId);
        await updateDoc(ref, {services_list: Array.from(selectedServices.values())});
        originalSelected.clear();
        for (const [id, v] of selectedServices.entries()) originalSelected.set(id, {...v});
        recomputeServicesDirty();
        alert(l("saved"));
    });

    for (const cat of cats) {
        const details = document.createElement("details");
        details.className = "cat-item";
        const summary = document.createElement("summary");
        summary.innerHTML = `<span class="cat-name">${pickName(cat)}</span>`;
        const body = document.createElement("div");
        body.className = "cat-services";
        body.innerHTML = `<div class="skeleton">${l("loadSvcs")}</div>`;
        details.appendChild(summary);
        details.appendChild(body);
        wrap.appendChild(details);

        let loaded = false;
        details.addEventListener("toggle", async () => {
            if (!details.open || loaded) return;
            loaded = true;
            try {
                const svcSnap = await getDocs(query(collection(db, "clinics_services"), where("category_id", "==", Number(cat.id))));
                if (svcSnap.empty) {
                    body.innerHTML = `<div>${l("noSvcs")}</div>`;
                    return;
                }
                const list = document.createElement("div");
                list.className = "svc-list";
                svcSnap.forEach(s => {
                    const svc = s.data();
                    const sid = String(svc.id ?? "");
                    const title = pickServiceTitle(svc);

                    const row = document.createElement("label");
                    row.className = "svc";
                    const check = document.createElement("input");
                    check.type = "checkbox";
                    check.className = "svc-check";
                    check.dataset.sid = sid;
                    const txt = document.createElement("span");
                    txt.className = "svc-title";
                    txt.textContent = title;
                    const priceBox = document.createElement("div");
                    priceBox.className = "price-box";
                    const price = document.createElement("input");
                    price.type = "number";
                    price.step = "0.01";
                    price.min = "0";
                    price.inputMode = "decimal";
                    price.className = "price-input";
                    if (selectedServices.has(sid)) {
                        const saved = selectedServices.get(sid);
                        check.checked = true;
                        price.value = String(Number(saved.price ?? 0));
                    } else {
                        price.value = String(Number(svc.price ?? 0) || 0);
                    }
                    const cur = document.createElement("span");
                    cur.className = "currency";
                    cur.textContent = "₾";
                    priceBox.appendChild(price);
                    priceBox.appendChild(cur);
                    check.addEventListener("change", () => {
                        const p = parseFloat(price.value.replace(",", ".")) || 0;
                        if (check.checked) selectedServices.set(sid, {
                            ...svc,
                            price: p
                        }); else selectedServices.delete(sid);
                        recomputeServicesDirty();
                    });
                    price.addEventListener("input", () => {
                        const p = parseFloat(price.value.replace(",", ".")) || 0;
                        if (selectedServices.has(sid)) {
                            const prev = selectedServices.get(sid);
                            selectedServices.set(sid, {...prev, price: p});
                            recomputeServicesDirty();
                        }
                    });
                    row.appendChild(check);
                    row.appendChild(txt);
                    row.appendChild(priceBox);
                    list.appendChild(row);
                });
                body.innerHTML = "";
                body.appendChild(list);
                recomputeServicesDirty();
            } catch (e) {
                console.error("Load services error:", e);
                body.innerHTML = `<div>${l("svcsErr")}</div>`;
            }
        });
    }
}

/* ===================== INFO + SCHEDULE ===================== */
let infoDocId = null;
let infoOriginal = {};

function getInfoFormValues(form){
    const v = n => (form.querySelector(`[name="${n}"]`)?.value ?? "").trim();

    // собираем выбранные языки
    const langs = [];
    if (form.querySelector('[name="lang_KA"]')?.checked) langs.push("KA");
    if (form.querySelector('[name="lang_EN"]')?.checked) langs.push("EN");
    if (form.querySelector('[name="lang_RU"]')?.checked) langs.push("RU");

    const schedule = DAYS.map((d)=>{
        const row = form.querySelector(`.day-row[data-day="${d.key}"]`);
        const round = row.querySelector('.day-24 input').checked;
        const open  = row.querySelector('.day-open').value || "";
        const close = row.querySelector('.day-close').value || "";
        return { day:d.key, open: round ? "00:00" : open, close: round ? "23:59" : close };
    });

    return {
        // <-- единственное новое поле
        language: langs,

        geAddress:v("geAddress"), enAddress:v("enAddress"), ruAddress:v("ruAddress"),
        geDescription:v("geDescription"), enDescription:v("enDescription"), ruDescription:v("ruDescription"),
        phone:v("phone"), instagram:v("instagram"), facebook:v("facebook"),
        website:v("website"), madloba:v("madloba"),
        schedule
    };
}

function setInfoFormValues(form, data){
    const set=(n,val)=>{ const el=form.querySelector(`[name="${n}"]`); if(el) el.value = val ?? ""; };

    // читаем языки (новое поле) + фолбэк на старые
    const langs = Array.isArray(data?.language)  ? data.language
        : Array.isArray(data?.lanuage)  ? data.lanuage
            : Array.isArray(data?.languages)? data.languages
                : [];

    form.querySelector('[name="lang_KA"]') && (form.querySelector('[name="lang_KA"]').checked = langs.includes("KA"));
    form.querySelector('[name="lang_EN"]') && (form.querySelector('[name="lang_EN"]').checked = langs.includes("EN"));
    form.querySelector('[name="lang_RU"]') && (form.querySelector('[name="lang_RU"]').checked = langs.includes("RU"));

    set("geAddress",data.geAddress); set("enAddress",data.enAddress); set("ruAddress",data.ruAddress);
    set("geDescription",data.geDescription); set("enDescription",data.enDescription); set("ruDescription",data.ruDescription);
    set("phone",data.phone); set("instagram",data.instagram); set("facebook",data.facebook);
    set("website",data.website ?? data.cite ?? ""); set("madloba",data.madloba);

    const byDay = new Map((Array.isArray(data.schedule)?data.schedule:[]).map(x=>[x.day,x]));
    DAYS.forEach(d=>{
        const row=form.querySelector(`.day-row[data-day="${d.key}"]`);
        const o=row.querySelector('.day-open'); const c=row.querySelector('.day-close'); const chk=row.querySelector('.day-24 input');
        const item = byDay.get(d.key) || {open:"",close:""};
        const round = item.open==="00:00" && item.close==="23:59";
        o.value = round ? "00:00" : (item.open || "");
        c.value = round ? "23:59" : (item.close || "");
        chk.checked = round;
        toggleDayInputs(row, chk.checked);
    });
}

function infoDirtyNow(form) {
    return JSON.stringify(getInfoFormValues(form)) !== JSON.stringify(infoOriginal);
}

function bindInfoDirty(form) {
    form.addEventListener("input", () => markSaveBtn("save-info-btn", infoDirtyNow(form)));
}

function toggleDayInputs(row, round) {
    const open = row.querySelector(".day-open");
    const close = row.querySelector(".day-close");
    if (round) {
        open.value = "00:00";
        close.value = "23:59";
    }
    open.disabled = close.disabled = round;
}

function renderInfoForm() {
    const root = document.createElement("div");
    root.className = "info-root";
    const header = renderHeader("save-info-btn");
    const form = document.createElement("form");
    form.id = "clinic-info-form";
    form.className = "info-form";
    form.innerHTML = `
   <!-- ЯЗЫКИ -->
  <div class="form-row one">
    <div class="field lang-field">
      <label>${t("На каком языке говорят в клинике","Languages spoken in the clinic","კლინიკაში რომელი ენებით საუბრობენ")}</label>
      <label class="lang-check">
        <input type="checkbox" name="lang_KA">
        ${t("Грузинский","Georgian","ქართული")}
      </label>
      <label class="lang-check">
        <input type="checkbox" name="lang_EN">
        ${t("Английский","English","ინგლისური")}
      </label>
      <label class="lang-check">
        <input type="checkbox" name="lang_RU">
        ${t("Русский","Russian","რუსული")}
      </label>
    </div>
  </div>

    <!-- адреса -->
    <div class="form-row three">
      <div class="field"><label>${l("addressGe")}</label><input type="text" name="geAddress" placeholder="..." /></div>
      <div class="field"><label>${l("addressEn")}</label><input type="text" name="enAddress" placeholder="..." /></div>
      <div class="field"><label>${l("addressRu")}</label><input type="text" name="ruAddress" placeholder="..." /></div>
    </div>

    <!-- описания -->
    <div class="form-row three">
      <div class="field"><label>${l("descrGe")}</label><textarea name="geDescription" rows="4" placeholder="..."></textarea></div>
      <div class="field"><label>${l("descrEn")}</label><textarea name="enDescription" rows="4" placeholder="..."></textarea></div>
      <div class="field"><label>${l("descrRu")}</label><textarea name="ruDescription" rows="4" placeholder="..."></textarea></div>
    </div>

    <div class="form-row one">
      <div class="field"><label>${l("phone")}</label><input type="text" name="phone" placeholder="+995 ..." /></div>
    </div>

    <!-- один столбец: website -> instagram -> facebook -> madloba -->
    <div class="form-row one">
      <div class="field"><label>${l("website")}</label><input type="text" name="website" placeholder="https://..." /></div>
    </div>
    <div class="form-row one">
      <div class="field"><label>${l("instagram")}</label><input type="text" name="instagram" placeholder="https://instagram.com/..." /></div>
    </div>
    <div class="form-row one">
      <div class="field"><label>${l("facebook")}</label><input type="text" name="facebook" placeholder="https://facebook.com/..." /></div>
    </div>
    <div class="form-row one">
      <div class="field"><label>${l("madloba")}</label><input type="text" name="madloba" placeholder="https://madloba.info/..." /></div>
    </div>

    <!-- РАСПИСАНИЕ -->
    <div class="field schedule-block">
      <div class="schedule-head">
        <div>${l("day")}</div><div>${l("open")}</div><div>${l("close")}</div><div>${l("round")}</div>
      </div>
      <div class="schedule-grid">
        ${DAYS.map(d => `
          <div class="day-row" data-day="${d.key}">
            <div class="day-name">${t(d.ru, d.en, d.ka)}</div>
            <div class="day-time"><input type="time" class="day-open" step="60"></div>
            <div class="day-time"><input type="time" class="day-close" step="60"></div>
            <label class="day-24"><input type="checkbox"> ${l("round")}</label>
          </div>
        `).join("")}
      </div>
    </div>
  `;

    // логика круглосуточно
    form.querySelectorAll(".day-24 input").forEach(chk => {
        chk.addEventListener("change", e => {
            const row = e.target.closest(".day-row");
            toggleDayInputs(row, e.target.checked);
            markSaveBtn("save-info-btn", infoDirtyNow(form));
        });
    });
    form.querySelectorAll(".day-open,.day-close").forEach(inp => {
        inp.addEventListener("input", () => markSaveBtn("save-info-btn", infoDirtyNow(form)));
    });

    // NEW: изменения языков тоже помечают «Сохранить»
    form.querySelectorAll('.languages-field input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => markSaveBtn("save-info-btn", infoDirtyNow(form)));
    });

    root.appendChild(header);
    root.appendChild(form);
    return root;
}

async function loadInfoTab() {
    showLoading();
    const session = readSession();
    const clinicId = session?.clinicId;
    if (!clinicId) {
        goLogin();
        return;
    }

    try {
        const qClinic = query(collection(db, "vet_clinics"), where("id", "==", clinicId));
        const snap = await getDocs(qClinic);
        if (snap.empty) {
            showMessage(l("clinicNF"));
            return;
        }
        infoDocId = snap.docs[0].id;
        const data = snap.docs[0].data() || {};

        const root = renderInfoForm();
        contentEl.innerHTML = "";
        contentEl.appendChild(root);
        const form = document.getElementById("clinic-info-form");
        setInfoFormValues(form, data);
        infoOriginal = getInfoFormValues(form);
        markSaveBtn("save-info-btn", false);
        bindInfoDirty(form);

        document.getElementById("save-info-btn")?.addEventListener("click", async () => {
            if (!infoDocId) return;
            try {
                await ensureAnonymousAuth();
            } catch {
                alert(l("authErr"));
                return;
            }
            const values = getInfoFormValues(form);
            await updateDoc(doc(db, "vet_clinics", infoDocId), values);
            infoOriginal = {...values};
            markSaveBtn("save-info-btn", false);
            alert(l("saved"));
        });
    } catch (e) {
        console.error("Load info error:", e);
        showMessage(l("loadClinicErr"));
    }
}

/* ===================== init ===================== */
async function initCabinet() {
    try {
        await ensureAnonymousAuth();
    } catch (e) {
        console.warn("Anonymous auth failed on cabinet init", e);
    }
    const session = readSession();
    if (!session || !session.clinicId) {
        goLogin();
        return;
    }
    layoutEl.hidden = false;
    emptyEl.hidden = true;

    applyStaticI18n();
    loadClinicMini();

    btnServices?.addEventListener("click", () => {
        setMenuActive(btnServices);
        loadServicesTab();
    });
    btnInfo?.addEventListener("click", () => {
        setMenuActive(btnInfo);
        loadInfoTab();
    });
    btnLogout?.addEventListener("click", () => {
        clearSession();
        goLogin();
    });
    logoutFallbackBtn?.addEventListener("click", () => {
        clearSession();
        goLogin();
    });

    loadServicesTab(); // по умолчанию
}

initCabinet();
