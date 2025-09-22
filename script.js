// =================== CONFIG ===================
import {loadServiceCategories, loadUserServices, loadCities, loadVetClinics} from "./firebase-init.js";

// Если ключ положишь глобально: window.GOOGLE_MAPS_API_KEY = "xxx"
const GOOGLE_MAPS_API_KEY = "AIzaSyCPJD9pGSjZeDx11wFDUj5jB6jMX1wdhHY"; // <-- вставь свой ключ (или задай window.GOOGLE_MAPS_API_KEY)

// =================== UI QUERIES ===================
const langBtn = document.querySelector('.lang-btn');
const dropdown = document.querySelector('.lang-dropdown');
const langOptions = document.querySelectorAll('.dropdown-menu button');
const pageContent = document.getElementById("page-content");
const navLinks = document.querySelectorAll(".header-nav a");

// сохраняем домашнюю разметку (слайдер внутри неё)
const homeContent = pageContent.innerHTML;

// ================ TRANSLATIONS ====================
const translations = {
    ru: {
        hero_title: 'PetSpot — незаменимый помощник для вас и вашего питомца',
        hero_subtitle: 'Онлайн-паспорт питомца, услуги и ветеринарные клиники в вашем городе.',
        card_passport: 'Онлайн-паспорт',
        card_services: 'Услуги рядом',
        card_clinic: 'Клиники с услугами',
        phone_passport: 'Паспорт',
        phone_services: 'Услуги рядом',
        phone_vet: 'Ветклиники',
        meta_link: 'Политика конфиденциальности',
        footer_about: 'Онлайн-паспорт питомца, услуги и ветеринарные клиники в вашем городе.',
        footer_home: 'Главная',
        footer_features: 'Функции',
        footer_services: 'Услуги',
        footer_download: 'Скачать',
        footer_docs: 'Документы',
        footer_privacy: 'Политика конфиденциальности',
        footer_terms: 'Условия использования',
        footer_contacts: 'Контакты',
        footer_lang: 'Язык',
        nav_home: "Главная",
        nav_services: "Услуги",
        nav_clinics: "Клиники",
        services_filters_title: "Фильтры",
        services_filters_city: "Город",
        services_filters_services: "Услуги",
        services_filters_apply: "Применить",
        services_filters_all_cities: "Все города",
        services_warning: "В данный момент записаться на услугу можно только через приложение",
    },
    ge: {
        hero_title: 'PetSpot — შეუცვლელი დამხმარე თქვენთვის და თქვენი ცხოველისთვის',
        hero_subtitle: 'ონლაინ პასპორტი, სერვისები და ვეტერინარული კლინიკები თქვენს ქალაქში.',
        card_passport: 'ონლაინ პასპორტი',
        card_services: 'სერვისები ახლოს',
        card_clinic: 'კლინიკები მომსახურებით',
        phone_passport: 'პასპორტი',
        phone_services: 'სერვისები',
        phone_vet: 'ვეტკლინიკები',
        meta_link: 'კონფიდენციალურობის პოლიტიკა',
        footer_about: 'ონლაინ პასპორტი, სერვისები და ვეტერინარული კლინიკები თქვენს ქალაქში.',
        footer_nav: 'ნავიგაცია',
        footer_home: 'მთავარი',
        footer_features: 'ფუნქციები',
        footer_services: 'სერვისები',
        footer_download: 'გადმოწერა',
        footer_docs: 'დოკუმენტები',
        footer_privacy: 'კონფიდენციალურობის პოლიტიკა',
        footer_terms: 'გამოყენების პირობები',
        footer_contacts: 'კონტაქტები',
        footer_lang: 'ენა',
        nav_home: "მთავარი",
        nav_services: "სერვისები",
        nav_clinics: "კლინიკები",
        services_filters_title: "ფილტრები",
        services_filters_city: "ქალაქი",
        services_filters_services: "სერვისები",
        services_filters_apply: "გამოყენება",
        services_filters_all_cities: "ყველა ქალაქი",
        services_warning: "ამჟამად სერვისზე ჩაწერა მხოლოდ აპლიკაციიდან შეიძლება",
    },
    en: {
        hero_title: 'PetSpot — an essential helper for you and your pet',
        hero_subtitle: 'Online pet passport, services and veterinary clinics in your city.',
        card_passport: 'Online Passport',
        card_services: 'Services Nearby',
        card_clinic: 'Clinics with services',
        phone_passport: 'Passport',
        phone_services: 'Services Nearby',
        phone_vet: 'Vet Clinics',
        meta_link: 'Privacy Policy',
        footer_about: 'Online pet passport, services and veterinary clinics in your city.',
        footer_nav: 'Navigation',
        footer_home: 'Home',
        footer_features: 'Features',
        footer_services: 'Services',
        footer_download: 'Download',
        footer_privacy: 'Privacy Policy',
        footer_terms: 'Terms of Use',
        footer_contacts: 'Contacts',
        footer_lang: 'Language',
        nav_home: "Home",
        nav_services: "Services",
        nav_clinics: "Clinics",
        services_filters_title: "Filters",
        services_filters_city: "City",
        services_filters_services: "Services",
        services_filters_apply: "Apply",
        services_filters_all_cities: "All cities",
        services_warning: "At the moment, you can book a service only through the app",
    }
};

// =================== SLIDES =======================
const slides = {
    ru: ["images/ru/1.png", "images/ru/2.png", "images/ru/3.png", "images/ru/4.png"],
    ge: ["images/ge/1.png", "images/ge/2.png", "images/ge/3.png", "images/ge/4.png"],
    en: ["images/en/1.png", "images/en/2.png", "images/en/3.png", "images/en/4.png"],
};

// текущее состояние
let currentLang = localStorage.getItem("lang") || "ru";
let currentSlide = 0;
let sliderInterval;
let currentPage = localStorage.getItem("page") || "home";

function applyTranslations(lang = currentLang) {
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(el => {
        const key = el.dataset.i18n;
        const translation = translations[lang] && translations[lang][key];
        if (translation) {
            el.textContent = translation;
        }
    });
}

// помощник — каждый раз ищем контейнер слайдов (на других страницах его нет)
function getSlidesContainer() {
    return document.getElementById('slides');
}

function renderSlides() {
    const container = getSlidesContainer();
    if (!container) return; // не на главной — выходим
    container.innerHTML = "";
    slides[currentLang].forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        container.appendChild(img);
    });
    currentSlide = 0;
    updateSlide();
}

function updateSlide() {
    const container = getSlidesContainer();
    if (!container) return;
    const offset = -currentSlide * 100;
    container.style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
    const arr = slides[currentLang];
    if (!arr || !arr.length) return;
    currentSlide = (currentSlide + 1) % arr.length;
    updateSlide();
}

function restartSlider() {
    clearInterval(sliderInterval);
    if (!getSlidesContainer()) return; // нет слайдера на текущей странице
    sliderInterval = setInterval(nextSlide, 3000);
}

// ================= LANGUAGE =======================
function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('lang', lang);

    applyTranslations(lang);

    // если на главной — перерисуем слайдер
    if (currentPage === "home") {
        renderSlides();
        restartSlider();
    }

    // если мы на внутренней — перерисовать текущую
    if (currentPage === "services") {
        renderServicesPage();
    } else if (currentPage === "clinics") {
        renderClinicsPage();
    }
}

// ================= DROPDOWN =======================
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
            dropdown.classList.remove('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !langBtn.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

// ================= INIT ===========================
setLanguage(currentLang);
const initialBtn = document.querySelector(`.dropdown-menu button[data-lang="${currentLang}"]`);
if (initialBtn) {
    langBtn.querySelector('img').src = initialBtn.querySelector('img').src;
    langBtn.querySelector('span').textContent = initialBtn.querySelector('span').textContent;
}

// после расстановки языка нужно показать сохраненную страницу
showPage(currentPage);

// подсветим активный пункт меню
navLinks.forEach(l => {
    if (l.dataset.page === currentPage) l.classList.add("active");
    else l.classList.remove("active");
});

// ================= PAGE SWITCH ====================
function showPage(page) {
    currentPage = page;
    localStorage.setItem("page", page);

    pageContent.classList.add("fade-out");
    setTimeout(async () => {
        if (page === "home") {
            pageContent.innerHTML = homeContent;
        } else if (page === "services") {
            await renderServicesPage();
        } else if (page === "clinics") {
            await renderClinicsPage();
        }

        pageContent.classList.toggle("page-stack", page !== "home");

        applyTranslations();

        if (page === "home") {
            // важно: после вставки домашней разметки снова найти слайдер и запустить
            renderSlides();
            restartSlider();
        }
        pageContent.classList.remove("fade-out");
        pageContent.classList.add("fade-in");
        setTimeout(() => pageContent.classList.remove("fade-in"), 300);
    }, 150);
}

navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const page = link.dataset.page;
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        showPage(page);
    });
});

// ================ DATA LOADERS =====================
async function fetchServiceCategories() {
    return await loadServiceCategories();
}

async function fetchUsersServices() {
    return await loadUserServices();
}

async function fetchCities() {
    return await loadCities();
}

// ================= SERVICES PAGE ==================
// ================= SERVICES PAGE ==================
async function renderServicesPage(selectedCityId = "all", selectedTypes = []) {
    const categories = await fetchServiceCategories();
    const cities = await fetchCities();
    const services = await fetchUsersServices();

    const t = translations[currentLang] || translations.ru;
    const noResultsMessages = {
        ru: "Ничего не найдено ☹️",
        ge: "ვერაფერი მოიძებნა ☹️",
        en: "Nothing found ☹️",
    };

    // фильтр по городу
    let filteredServices = (selectedCityId === "all")
        ? services
        : services.filter(s => String(s.region) === String(selectedCityId));

    // фильтр по типам
    if (selectedTypes.length > 0) {
        filteredServices = filteredServices.filter(s => selectedTypes.includes(String(s.type)));
    }

    pageContent.innerHTML = `
    <div class="services-warning">
      <span class="services-warning__emoji">⚠️</span>
      <span data-i18n="services_warning">${t.services_warning}</span>
    </div>
    <div class="services-layout">
      <div class="filter-card">
        <h3>${t.services_filters_title}</h3>
        <div class="filter-group">
          <label for="city">${t.services_filters_city}</label>
          <select id="city">
            <option value="all">${t.services_filters_all_cities}</option>
            ${cities.map(c => {
        const title = currentLang === "ru" ? c.ruName : currentLang === "ge" ? c.geName : c.enName;
        return `<option value="${c.id}" ${c.id == selectedCityId ? "selected" : ""}>${title}</option>`;
    }).join("")}
          </select>
        </div>

        <div class="filter-group">
          <label>${t.services_filters_services}</label>
          <div class="filter-options">
            ${categories.map(c => {
        const title = currentLang === "ru" ? c.ruName : currentLang === "ge" ? c.geName : c.enName;
        return `<label>
                        <input type="checkbox" value="${c.id}" ${selectedTypes.includes(String(c.id)) ? "checked" : ""}>
                        ${title}
                      </label>`;
    }).join("")}
          </div>
        </div>

        <button class="apply-btn">${t.services_filters_apply}</button>
      </div>

      <div class="services-main">
        <div class="cards-grid${filteredServices.length ? "" : " empty"}">
          ${filteredServices.length ? filteredServices.map((s,idx) => {
        const category = categories.find(c => String(c.id) === String(s.type));
        const serviceName = category
            ? (currentLang === "ru" ? category.ruName : currentLang === "ge" ? category.geName : category.enName)
            : (s.role || s.type || "");
        return `<div class="service-card" data-idx="${idx}">
                      <img src="${s.photoUrl}" alt="${s.name}">
                      <h3>${s.name || ""}</h3>
                      <p>${serviceName}</p>
                    </div>`;
    }).join("") : `<div class="no-results">${noResultsMessages[currentLang] || noResultsMessages.ru}</div>`}
        </div>
      </div>
    </div>`;

    // события фильтров
    document.getElementById("city").addEventListener("change", e => {
        renderServicesPage(e.target.value, selectedTypes);
    });

    document.querySelector(".apply-btn").addEventListener("click", () => {
        const checked = [...document.querySelectorAll(".filter-options input:checked")].map(cb => cb.value);
        const cityValue = document.getElementById("city").value;
        renderServicesPage(cityValue, checked);
    });

    // клики по карточкам -> модалка
    document.querySelectorAll(".service-card").forEach(card => {
        card.addEventListener("click", () => {
            const idx = Number(card.dataset.idx);
            const data = filteredServices[idx];
            if (data) openServiceModal(data, cities, categories);
        });
    });
}

// ============== GOOGLE MAPS LOADER ===============
// ============== GOOGLE MAPS LOADER ===============
function ensureGoogleMaps() {
    if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
    if (window._gmapsPromise) return window._gmapsPromise;

    const key = window.GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY;
    const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;

    window._gmapsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve(window.google.maps);
        s.onerror = () => reject(new Error("Google Maps failed to load"));
        document.head.appendChild(s);
    });
    return window._gmapsPromise;
}




// ================= CLINICS PAGE ===================

// Достаём координаты города из разных возможных полей
// Достаём координаты города из разных возможных полей Firestore
function getCityCenter(city) {
    const lat = Number(city?.Lang ?? city?.lang ?? city?.lat);
    const lng = Number(city?.Long ?? city?.long ?? city?.lng);
    return {
        lat: Number.isFinite(lat) ? lat : 41.7151,   // fallback: Тбилиси
        lng: Number.isFinite(lng) ? lng : 44.8271,
    };
}

const CLINIC_LABELS = {
    city:         { ru: "Город",        ge: "ქალაქი",       en: "City" },
    address:      { ru: "Адрес",        ge: "მისამართი",    en: "Address" },
    phone:        { ru: "Телефон",      ge: "ტელეფონი",     en: "Phone" },
    description:  { ru: "Описание",     ge: "აღწერა",       en: "Description" },
    opening:      { ru: "График работы",ge: "გრაფიკი",      en: "Opening hours" },
    social:       { ru: "Соцсети",      ge: "სოც.ქსელები",  en: "Social" },
    status:       { ru: "Статус",       ge: "სტატუსი",      en: "Status" },
};

async function renderClinicsPage(selectedCityId = "all", viewMode = "list") {
    const cities  = await fetchCities();
    const clinics = await loadVetClinics();

    // Находим Тбилиси по любому названию
    const tbilisi = cities.find(c => {
        const n = [c?.ruName, c?.enName, c?.geName].map(v => (v || "").trim().toLowerCase());
        return n.includes("тбилиси") || n.includes("tbilisi") || n.includes("თბილისი");
    });

    const defaultCityId = tbilisi ? String(tbilisi.id) : (cities[0] ? String(cities[0].id) : "");
    const currentCityId = (selectedCityId && selectedCityId !== "all") ? String(selectedCityId) : defaultCityId;

    // Фильтруем клиники по выбранному городу
    const filteredClinics = clinics.filter(c => String(c.cityId) === currentCityId);

    // Options БЕЗ "Все города"
    const optionsHtml = cities.map(c => {
        const title = currentLang === "ru" ? c.ruName : currentLang === "ge" ? c.geName : c.enName;
        return `<option value="${c.id}" ${String(c.id) === currentCityId ? "selected" : ""}>${title}</option>`;
    }).join("");

    // Рендер страницы
    pageContent.innerHTML = `
    <div class="services-layout">
      <div class="filter-card">
        <h3>Фильтры</h3>
        <div class="filter-group">
          <label for="clinic-city">Город</label>
          <select id="clinic-city">${optionsHtml}</select>
        </div>
        <button class="apply-btn">Применить</button>
      </div>

      <div class="services-main">
        <h2>${currentLang === "ru" ? "Клиники" : currentLang === "ge" ? "კლინიკები" : "Clinics"}</h2>

        <div class="view-switch">
          <button class="list-view ${viewMode === "list" ? "active" : ""}">Списком</button>
          <button class="map-view ${viewMode === "map" ? "active" : ""}">На карте</button>
        </div>

        <div class="cards-grid ${viewMode === "list" ? "two-columns" : ""}" id="clinics-container">
          ${
        viewMode === "list"
            ? filteredClinics.map((c, idx) => {
                const title    = currentLang === "ru" ? c.ruName : currentLang === "ge" ? c.geName : c.enName;
                const cityObj  = cities.find(ct => String(ct.id) === String(c.cityId));
                const cityName = cityObj ? (currentLang === "ru" ? cityObj.ruName : currentLang === "ge" ? cityObj.geName : cityObj.enName) : "";
                const address  = currentLang === "ru" ? c.ruAddress : currentLang === "ge" ? c.geAddress : c.enAddress;

                const st = getClinicStatus(c);
                const statusLabel = st[currentLang] || st.ru;
                const statusClass = st.color === "green"
                    ? "clinic-status--open"
                    : st.color === "red"
                        ? "clinic-status--closed"
                        : "clinic-status--unknown";

                return `
                  <div class="service-card clinic-card" data-idx="${idx}">
                    <img src="${c.photoUrl}" alt="${title}">
                    <div class="clinic-info">
                      <div class="clinic-header">
                        <h3>${title}</h3>
                        <span class="clinic-status ${statusClass}">${statusLabel}</span>
                      </div>
                      <p>${cityName}</p>
                      <p>${address || ""}</p>
                    </div>
                  </div>`;
            }).join("")
            : `<div class="map-container"><div id="map"></div></div>`
    }
        </div>
      </div>
    </div>
    `;

    // Обработчики переключателей/фильтра
    document.querySelector(".list-view").addEventListener("click", () => {
        renderClinicsPage(currentCityId, "list");
    });
    document.querySelector(".map-view").addEventListener("click", () => {
        renderClinicsPage(currentCityId, "map");
    });
    document.getElementById("clinic-city").addEventListener("change", (e) => {
        renderClinicsPage(e.target.value, viewMode);
    });
    document.querySelector(".apply-btn").addEventListener("click", () => {
        const val = document.getElementById("clinic-city").value;
        renderClinicsPage(val, viewMode);
    });

    // Клики по карточкам (показываем модалку с инфой)
    if (viewMode === "list") {
        document.querySelectorAll(".clinic-card").forEach(card => {
            card.addEventListener("click", () => {
                const idx = Number(card.dataset.idx);
                const data = filteredClinics[idx];
                if (data) openClinicModal(data, cities);
            });
        });
    }

    // Карта
    if (viewMode === "map") {
        try {
            await ensureGoogleMaps();

            const cityObj = cities.find(c => String(c.id) === currentCityId);
            const center = getCityCenter(cityObj);

            const map = new google.maps.Map(document.getElementById("map"), {
                center,
                zoom: 12,
            });

            const withCoords = filteredClinics.filter(c => Number.isFinite(c.lat) && Number.isFinite(c.long));
            const icons = await Promise.all(withCoords.map(c => createCircleIcon(c.photoUrl, 36)));

            const infoWindow = new google.maps.InfoWindow();
            withCoords.forEach((c, i) => {
                const title   = currentLang === "ru" ? c.ruName : currentLang === "ge" ? c.geName : c.enName;
                const address = currentLang === "ru" ? c.ruAddress : currentLang === "ge" ? c.geAddress : c.enAddress;

                const st = getClinicStatus(c);
                const statusLabel = st[currentLang] || st.ru;

                const marker = new google.maps.Marker({
                    position: { lat: c.lat, lng: c.long },
                    map,
                    title,
                    icon: icons[i],
                });

                marker.addListener("click", () => {
                    infoWindow.setContent(`
                        <div style="max-width:220px;">
                          <img src="${c.photoUrl}" style="width:100%;border-radius:8px;margin-bottom:8px;">
                          <h3 style="margin:0 0 6px;">${title}</h3>
                          <p style="margin:0 0 4px;">${address || ""}</p>
                          <p style="margin:0;">
                            <b>${CLINIC_LABELS.status[currentLang]}:</b>
                            <span style="color:${st.color};font-weight:600;">${statusLabel}</span>
                          </p>
                        </div>
                    `);
                    infoWindow.open(map, marker);
                });
            });

        } catch (e) {
            const el = document.getElementById("map");
            if (el) {
                el.innerHTML = `
                  <div style="padding:16px;background:#fff;border-radius:12px;">
                    Не удалось загрузить карту. Проверь API-ключ Google Maps.
                  </div>`;
            }
        }
    }
}

function openClinicModal(clinic, cities) {
    const modalRoot = ensureModalHost();

    // Название/адрес/описание по текущему языку
    const name = currentLang === "ru" ? clinic.ruName : currentLang === "ge" ? clinic.geName : clinic.enName;
    const address = currentLang === "ru" ? clinic.ruAddress : currentLang === "ge" ? clinic.geAddress : clinic.enAddress;
    const description = currentLang === "ru" ? clinic.ruDescription : currentLang === "ge" ? clinic.geDescription : clinic.enDescription;

    const cityName = getCityNameById(cities, clinic.cityId) || "";
    const st = getClinicStatus(clinic);
    const statusLabel = st[currentLang] || st.ru;

    const phone = clinic.phone ? String(clinic.phone).trim() : "";
    const website = clinic.website || clinic.madloba || "";
    const facebook = clinic.facebook || "";
    const instagram = clinic.instagram || "";

    const scheduleHtml = renderClinicSchedule(clinic);

    const html = `
    <div class="ps-modal-backdrop" id="ps-modal-clinic-backdrop">
      <div class="ps-modal" role="dialog" aria-modal="true">
        <button class="ps-close" id="ps-close-clinic" aria-label="Close">×</button>

        <header>
          <img class="ps-avatar" src="${clinic.photoUrl || 'images/placeholder.png'}" alt="">
          <div>
            <h3>${name || ""}</h3>
          </div>
        </header>

        <div class="ps-body">
          ${cityName ? `<div class="ps-row"><span>${CLINIC_LABELS.city[currentLang]}</span><div>${cityName}</div></div>` : ""}

          ${address ? `<div class="ps-row"><span>${CLINIC_LABELS.address[currentLang]}</span><div>${address}</div></div>` : ""}

          ${phone ? `<div class="ps-row"><span>${CLINIC_LABELS.phone[currentLang]}</span><div><a href="tel:${phone.replace(/\s+/g,'')}">${phone}</a></div></div>` : ""}

          <div class="ps-row">
            <span>${CLINIC_LABELS.status[currentLang]}</span>
            <div style="color:${st.color};font-weight:600;">${statusLabel}</div>
          </div>

          ${description ? `<div class="ps-row"><span>${CLINIC_LABELS.description[currentLang]}</span><div>${description}</div></div>` : ""}

          ${scheduleHtml ? `<div class="ps-row"><span>${CLINIC_LABELS.opening[currentLang]}</span><div>${scheduleHtml}</div></div>` : ""}

          ${
        (website || facebook || instagram)
            ? `<div class="ps-row"><span>${CLINIC_LABELS.social[currentLang]}</span>
                 <div class="ps-links">
                   ${website   ? `<a href="${website}" target="_blank" rel="noopener">Website</a>` : ""}
                   ${facebook  ? `<a href="${facebook}" target="_blank" rel="noopener">Facebook</a>` : ""}
                   ${instagram ? `<a href="${instagram}" target="_blank" rel="noopener">Instagram</a>` : ""}
                 </div>
               </div>`
            : ""
    }
        </div>
      </div>
    </div>`;

    modalRoot.innerHTML = html;

    const close = () => { modalRoot.innerHTML = ""; };
    modalRoot.querySelector("#ps-close-clinic").addEventListener("click", close);
    modalRoot.querySelector("#ps-modal-clinic-backdrop").addEventListener("click", (e) => {
        if (e.target.id === "ps-modal-clinic-backdrop") close();
    });
    document.addEventListener("keydown", function onEsc(ev){
        if (ev.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); }
    });
}

function renderClinicSchedule(clinic) {
    if (!clinic || !Array.isArray(clinic.schedule) || !clinic.schedule.length) return "";

    const ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    const RU = {
        monday:"Понедельник", tuesday:"Вторник", wednesday:"Среда",
        thursday:"Четверг", friday:"Пятница", saturday:"Суббота", sunday:"Воскресенье"
    };
    const GE = {
        monday:"ორშაბათი", tuesday:"სამშაბათი", wednesday:"ოთხშაბათი",
        thursday:"ხუთშაბათი", friday:"პარასკევი", saturday:"შაბათი", sunday:"კვირა"
    };
    const EN = {
        monday:"Monday", tuesday:"Tuesday", wednesday:"Wednesday",
        thursday:"Thursday", friday:"Friday", saturday:"Saturday", sunday:"Sunday"
    };
    const titleByLang = currentLang === "ru" ? RU : currentLang === "ge" ? GE : EN;

    const map = new Map();
    clinic.schedule.forEach(s => {
        // ожидается {day:'monday', open:'10:00', close:'18:00'}
        if (s && s.day) map.set(String(s.day).toLowerCase(), s);
    });

    const rows = ORDER.map(d => {
        const s = map.get(d);
        const val = (s && s.open && s.close) ? `${s.open} - ${s.close}` : "—";
        return `<div style="display:flex;justify-content:space-between;gap:12px;">
                  <span>${titleByLang[d]}</span>
                  <span>${val}</span>
                </div>`;
    }).join("");

    return `<div class="ps-schedule">${rows}</div>`;
}


// Кэш готовых иконок, чтобы не перерисовывать одно и то же
const iconCache = new Map();

function createCircleIcon(url, size = 36) {
    if (iconCache.has(url)) return iconCache.get(url);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.crossOrigin = "anonymous"; // чтобы не падал canvas на внешних картинках
    img.src = url;

    const p = new Promise((resolve) => {
        img.onload = () => {
            ctx.clearRect(0, 0, size, size);
            // круглая маска
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            // отрисовали изображение внутрь круга
            ctx.drawImage(img, 0, 0, size, size);

            resolve({
                url: canvas.toDataURL(),
                scaledSize: new google.maps.Size(size, size),
            });
        };
        img.onerror = () => {
            // фолбек — просто оригинал нужного размера
            resolve({
                url,
                scaledSize: new google.maps.Size(size, size),
            });
        };
    });

    iconCache.set(url, p);
    return p;
}


// ====== OPEN/CLOSED helpers ======
const DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function toMinutes(t) {
    if (!t) return null;
    const [h, m = 0] = String(t).split(":").map(Number);
    return Number.isFinite(h) ? h * 60 + m : null;
}

/** c.schedule = [{day:'monday', open:'09:00', close:'18:00'}, ...] */
function getClinicStatus(c, now = new Date()) {
    if (!c || !Array.isArray(c.schedule) || !c.schedule.length) {
        return { ru: "Закрыто", ge: "დახურული", en: "Closed", color: "red" };
    }
    const today = DAYS[now.getDay()];
    const s = c.schedule.find(x => x.day === today);
    if (!s || !s.open || !s.close) {
        return { ru: "Закрыто", ge: "დახურული", en: "Closed", color: "red" };
    }

    const open = toMinutes(s.open);
    const close = toMinutes(s.close);
    if (open === null || close === null) {
        return { ru: "Закрыто", ge: "დახურული", en: "Closed", color: "red" };
    }

    if (open === 0 && (close === 1439 || close === 1440)) {
        return { ru: "Круглосуточно", ge: "24/7", en: "24/7", color: "green" };
    }

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const isOpen = close > open ? (nowMin >= open && nowMin < close)
        : (nowMin >= open || nowMin < close);

    return isOpen
        ? { ru: "Открыто", ge: "გახსნილია", en: "Open", color: "green" }
        : { ru: "Закрыто", ge: "დახურული", en: "Closed", color: "red" };
}

// === Helpers for modal / labels ===
const LABELS = {
    region: {ru:"Регион", ge:"რეგიონი", en:"Region"},
    about:  {ru:"О себе", ge:"შესახებ", en:"About"},
    schedule:{ru:"График работы", ge:"გრაფიკი", en:"Schedule"},
    languages:{ru:"Общается на", ge:"ენები", en:"Languages"},
    options:{ru:"Опции", ge:"ოპციები", en:"Options"},
    price:{ru:"Цена", ge:"ფასი", en:"Price"},
};

const AVAIL_MAP = {
    "1": {ru:"Каждый день", ge:"ყოველდღე", en:"Every day"},
    "2": {ru:"Будни", ge:"სამუშაო დღეები", en:"Weekdays"},
    "3": {ru:"Выходные", ge:"დასვენების დღეები", en:"Weekends"}
};

function getCityNameById(cities, id){
    const c = cities.find(x => String(x.id) === String(id));
    if(!c) return "";
    return currentLang === "ru" ? c.ruName : currentLang === "ge" ? c.geName : c.enName;
}
function getServiceTitle(categories, s){
    const cat = categories.find(c => String(c.id) === String(s.type));
    if (cat) return currentLang === "ru" ? cat.ruName : currentLang === "ge" ? cat.geName : cat.enName;
    return s.role || s.type || "";
}
function humanAvailability(s){
    const key = String(s?.availability ?? "");
    const v = AVAIL_MAP[key];
    if (!v) return "";
    return v[currentLang] || v.ru;
}
function normalizeLanguages(l){
    if(!l) return "";
    if(Array.isArray(l)) return l.join(", ");
    return String(l);
}
function normalizeOptions(o){
    if(!o) return "";
    if(Array.isArray(o)) return o.join(", ");
    if(typeof o === "object") return Object.values(o).join(", ");
    return String(o);
}
function extractPrice(s){
    const guess = s.price ?? s.cost ?? s.pricePerDay ?? s.pricePerHour;
    if(guess) return String(guess);
    // попытка вытащить из текста (напр. "Один день 10₾")
    const src = normalizeOptions(s.options);
    const m = src.match(/(\d+(?:[.,]\d+)?)\s*([₾₽$€])?/);
    return m ? (m[1] + (m[2] || " ₾")) : "";
}

// === Единственный контейнер модалки ===
let modalHost = null;
function ensureModalHost(){
    if (modalHost) return modalHost;
    modalHost = document.createElement("div");
    document.body.appendChild(modalHost);
    return modalHost;
}

function openServiceModal(service, cities, categories){
    const modalRoot = ensureModalHost();
    const title = service.name || "";
    const badge = getServiceTitle(categories, service);
    const cityName = getCityNameById(cities, service.region);
    const about = service.about || "";
    const schedule = humanAvailability(service);
    const langs = normalizeLanguages(service.languages);
    const opts = normalizeOptions(service.options);
    const price = extractPrice(service);

    const labels = LABELS;

    const html = `
  <div class="ps-modal-backdrop" id="ps-modal-backdrop">
    <div class="ps-modal" role="dialog" aria-modal="true">
      <button class="ps-close" id="ps-close" aria-label="Close">×</button>
      <header>
        <img class="ps-avatar" src="${service.photoUrl || 'images/placeholder.png'}" alt="">
        <div>
          <h3>${title}</h3>
          ${badge ? `<span class="ps-badge">${badge}</span>` : ""}
        </div>
      </header>
      <div class="ps-body">
        ${cityName ? `<div class="ps-row"><span>${labels.region[currentLang]||labels.region.ru}</span><div>${cityName}</div></div>`:""}
        ${about ? `<div class="ps-row"><span>${labels.about[currentLang]||labels.about.ru}</span><div>${about}</div></div>`:""}
        ${schedule ? `<div class="ps-row"><span>${labels.schedule[currentLang]||labels.schedule.ru}</span><div>${schedule}</div></div>`:""}
        ${langs ? `<div class="ps-row"><span>${labels.languages[currentLang]||labels.languages.ru}</span><div>${langs}</div></div>`:""}
        ${opts ? `<div class="ps-row"><span>${labels.options[currentLang]||labels.options.ru}</span><div>${opts}</div></div>`:""}
        ${price ? `<div class="ps-row"><span>${labels.price[currentLang]||labels.price.ru}</span><div>${price}</div></div>`:""}
      </div>
    </div>
  </div>`;

    modalRoot.innerHTML = html;

    const close = () => { modalRoot.innerHTML = ""; };
    modalRoot.querySelector("#ps-close").addEventListener("click", close);
    modalRoot.querySelector("#ps-modal-backdrop").addEventListener("click", (e)=>{
        if (e.target.id === "ps-modal-backdrop") close();
    });
    document.addEventListener("keydown", function onEsc(ev){
        if(ev.key === "Escape"){ close(); document.removeEventListener("keydown", onEsc); }
    });
}

