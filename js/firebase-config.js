// ============================================
// FIREBASE CONFIG — Solo Firestore
// Reemplaza con tus datos de Firebase Console
// ============================================

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const procedimientosRef = db.collection('procedimientos');
const usuariosRef      = db.collection('usuarios');
const configRef        = db.collection('configuracion').doc('general');