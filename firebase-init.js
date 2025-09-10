// Firebase init
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDNhOm2-O-ZEplzvgC6kxI0zwhJ_XvbrVY",
    authDomain: "pets-seracher.firebaseapp.com",
    projectId: "pets-seracher",
    storageBucket: "pets-seracher.firebasestorage.app",
    messagingSenderId: "218671596894",
    appId: "1:218671596894:web:35e243daffe658126d7bcf",
    measurementId: "G-FKWVXSCDVH"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

export async function loadServiceCategories() {
    const snap = await getDocs(collection(db, "service_categories"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function loadUserServices() {
    const snap = await getDocs(collection(db, "users_services"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function loadCities() {
    const snap = await getDocs(collection(db, "cities"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function loadVetClinics() {
    const snap = await getDocs(collection(db, "vet_clinics"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
