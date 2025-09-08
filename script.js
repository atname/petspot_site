const translations = {
  ru: {
    tagline: "Онлайн паспорт питомца и поиск услуг",
    nav: { home: "Главная", services: "Услуги", about: "О нас", contact: "Контакты" },
    welcome: "Добро пожаловать в PetSpot",
    description: "PetSpot — онлайн паспорт питомца и поиск услуг",
    download: "Скачать приложение",
    rights: "Все права защищены"
  },
  en: {
    tagline: "PetSpot — Online pet passport and services search",
    nav: { home: "Home", services: "Services", about: "About", contact: "Contact" },
    welcome: "Welcome to PetSpot",
    description: "PetSpot — Online pet passport and services search",
    download: "Download app",
    rights: "All rights reserved"
  },
  ge: {
    tagline: "PetSpot — ციფრული პასპორტი ცხოველებისთვის",
    nav: { home: "მთავარი", services: "სერვისები", about: "ჩვენ შესახებ", contact: "კონტაქტი" },
    welcome: "მოგესალმებით PetSpot-ში",
    description: "PetSpot — ციფრული პასპორტი ცხოველებისთვის",
    download: "გადმოწერე აპლიკაცია",
    rights: "ყველა უფლება დაცულია"
  }
};

const langButtons = document.querySelectorAll('.lang-switch button');
const elements = document.querySelectorAll('[data-i18n]');

function setLanguage(lang) {
  document.documentElement.lang = lang;
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = key.split('.').reduce((o, k) => o && o[k], translations[lang]);
    if (text) {
      el.textContent = text;
    }
  });
  langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
}

langButtons.forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

setLanguage('ru');
