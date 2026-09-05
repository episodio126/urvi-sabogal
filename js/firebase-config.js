// ============================================
// FIREBASE CONFIG — Solo Firestore
// Proyecto: hnass-radiologia-vascular
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyAW-6rAKWoyxaG2s2V0aquKJFNj4-ic00s",
    authDomain: "hnass-radiologia-vascular.firebaseapp.com",
    projectId: "hnass-radiologia-vascular",
    storageBucket: "hnass-radiologia-vascular.firebasestorage.app",
    messagingSenderId: "685569317021",
    appId: "1:685569317021:web:19e3cfbd3f2f64f3bcdc74"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const procedimientosRef = db.collection('procedimientos');
const usuariosRef      = db.collection('usuarios');
const configRef        = db.collection('configuracion').doc('general');