const langButtons = document.querySelectorAll('.lang-switch button');
const texts = document.querySelectorAll('[data-i18n]');

const translations = {
  ru: {
    hero_title: 'PetSpot — онлайн-паспорт питомца и услуги рядом',
    hero_subtitle: 'Храните прививки и документы, находите грумеров, ветеринаров и передержку по вашему городу',
    card_passport: 'Онлайн-паспорт',
    card_services: 'Услуги рядом',
    phone_passport: 'Паспорт',
    phone_services: 'Услуги рядом',
    phone_vet: 'Ветклиники',
    meta_title: 'Booking – Безопасность',
    meta_link: 'Политика конфиденциальности'
  },
  ge: {
    hero_title: 'PetSpot – Online-Haustierpass und Dienste in der Nähe',
    hero_subtitle: 'Speichern Sie Impfungen und Dokumente, finden Sie Groomer, Tierärzte und Betreuung in Ihrer Stadt',
    card_passport: 'Online-Pass',
    card_services: 'Dienste in der Nähe',
    phone_passport: 'Pass',
    phone_services: 'Dienste in der Nähe',
    phone_vet: 'Tierkliniken',
    meta_title: 'Booking – Sicherheit',
    meta_link: 'Datenschutzerklärung'
  },
  en: {
    hero_title: 'PetSpot — online pet passport and services nearby',
    hero_subtitle: 'Store vaccinations and documents, find groomers, vets, and boarding in your city',
    card_passport: 'Online Passport',
    card_services: 'Services Nearby',
    phone_passport: 'Passport',
    phone_services: 'Services Nearby',
    phone_vet: 'Vet Clinics',
    meta_title: 'Booking – Safety',
    meta_link: 'Privacy Policy'
  }
};

function setLanguage(lang) {
  texts.forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.documentElement.setAttribute('lang', lang);
}

langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    langButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setLanguage(btn.dataset.lang);
  });
});

setLanguage('ru');

