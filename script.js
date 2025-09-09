const langBtn = document.querySelector('.lang-btn');
const dropdown = document.querySelector('.lang-dropdown');
const langOptions = document.querySelectorAll('.dropdown-menu button');
const texts = document.querySelectorAll('[data-i18n]');
const slidesContainer = document.getElementById('slides');

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
        footer_about: 'Онлайн-паспорт питомца и сервисы рядом',
        footer_home: 'Главная',
        footer_features: 'Функции',
        footer_services: 'Услуги',
        footer_download: 'Скачать',
        footer_docs: 'Документы',
        footer_privacy: 'Политика конфиденциальности',
        footer_terms: 'Условия использования',
        footer_contacts: 'Контакты',
        footer_lang: 'Язык',
        footer_rights: 'Все права защищены.'
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
        footer_about: 'ონლაინ პასპორტი და სერვისები ახლოს',
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
        footer_rights: 'ყველა უფლება დაცულია.'
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
        footer_about: 'Pet passport and services nearby',
        footer_nav: 'Navigation',
        footer_home: 'Home',
        footer_features: 'Features',
        footer_services: 'Services',
        footer_download: 'Download',
        footer_docs: 'Documents',
        footer_privacy: 'Privacy Policy',
        footer_terms: 'Terms of Use',
        footer_contacts: 'Contacts',
        footer_lang: 'Language',
        footer_rights: 'All rights reserved.'
    }
};

// Слайды для каждого языка
const slides = {
    ru: ["images/ru/1.png", "images/ru/2.png", "images/ru/3.png", "images/ru/4.png"],
    ge: ["images/ge/1.png", "images/ge/2.png", "images/ge/3.png", "images/ge/4.png"],
    en: ["images/en/1.png", "images/en/2.png", "images/en/3.png", "images/en/4.png"],
};

let currentLang = "ru";
let currentSlide = 0;
let sliderInterval;

function renderSlides() {
    slidesContainer.innerHTML = "";
    slides[currentLang].forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        slidesContainer.appendChild(img);
    });
    currentSlide = 0;
    updateSlide();
}

function updateSlide() {
    const offset = -currentSlide * 100;
    slidesContainer.style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides[currentLang].length;
    updateSlide();
}

function restartSlider() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 3000);
}

function setLanguage(lang) {
    texts.forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('lang', lang);

    currentLang = lang;
    renderSlides();
    restartSlider();
}

// dropdown
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

// init
const savedLang = localStorage.getItem('lang') || 'ru';
setLanguage(savedLang);
const initialBtn = document.querySelector(`.dropdown-menu button[data-lang="${savedLang}"]`);
if (initialBtn) {
    langBtn.querySelector('img').src = initialBtn.querySelector('img').src;
    langBtn.querySelector('span').textContent = initialBtn.querySelector('span').textContent;
}
restartSlider();
