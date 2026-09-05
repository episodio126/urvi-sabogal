// ============================================
// AUTH.JS — Autenticación simple por DNI (sin Firebase Auth)
// ============================================

const SESSION_KEY = 'rvii_session';

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const dni      = document.getElementById('dni').value.trim();
        const password = document.getElementById('password').value;
        const errorAlert = document.getElementById('errorAlert');

        errorAlert.style.display = 'none';

        if (!dni || !password) {
            errorAlert.textContent = 'Ingrese DNI y contraseña.';
            errorAlert.style.display = 'block';
            return;
        }

        // Buscar en Firestore
        usuariosRef.where('dni', '==', dni).where('activo', '==', true).get()
            .then(snapshot => {
                if (snapshot.empty) {
                    throw new Error('Usuario no encontrado o inactivo.');
                }

                const doc = snapshot.docs[0];
                const userData = doc.data();

                if (userData.password !== password) {
                    throw new Error('Contraseña incorrecta.');
                }

                // Guardar sesión
                const session = {
                    uid: doc.id,
                    dni: userData.dni,
                    nombre: userData.nombre,
                    rol: userData.rol
                };
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

                window.location.href = 'dashboard.html';
            })
            .catch(err => {
                errorAlert.textContent = err.message || 'Error al iniciar sesión.';
                errorAlert.style.display = 'block';
            });
    });
}

// Obtener sesión actual
function getSession() {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
}

// Verificar sesión (para páginas protegidas)
function requireAuth() {
    return new Promise((resolve, reject) => {
        const session = getSession();
        if (!session) {
            window.location.href = 'login.html';
            reject('No autenticado');
            return;
        }

        // Verificar que sigue activo en Firestore
        usuariosRef.doc(session.uid).get().then(doc => {
            if (doc.exists && doc.data().activo) {
                resolve({ ...session, data: doc.data() });
            } else {
                logout();
                reject('Usuario inactivo');
            }
        }).catch(() => {
            logout();
            reject('Error de verificación');
        });
    });
}

// Logout
function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

// Verificar si ya hay sesión en login.html
if (window.location.pathname.includes('login.html')) {
    const session = getSession();
    if (session) {
        window.location.href = 'dashboard.html';
    }
}