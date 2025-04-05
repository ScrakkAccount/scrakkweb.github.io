// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDU_8m_-1RIecI6_EnlzNKWdDH7oXpK2Eg",
    authDomain: "scrakk.netlify.app",
    projectId: "scrakk-944d6",
    storageBucket: "scrakk-944d6.firebasestorage.app",
    messagingSenderId: "38697916454",
    appId: "1:38697916454:web:c328dd327a7b69a6d66ee7",
    measurementId: "G-DL0C7DFEJ4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Funciones de autenticación
const authService = {
    // Inicio de sesión con Google
    async loginWithGoogle() {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;
            
            // Verificar si el usuario ya existe en Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Si es un usuario nuevo, guardar datos en Firestore
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    nombre: user.displayName.split(' ')[0] || '',
                    apellido: user.displayName.split(' ').slice(1).join(' ') || '',
                    avatar: user.photoURL || user.displayName.charAt(0).toUpperCase(),
                    status: 'online',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Si el usuario ya existe, actualizar su estado
                await db.collection('users').doc(user.uid).update({
                    status: 'online',
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return user;
        } catch (error) {
            console.error('Error en login con Google:', error);
            throw error;
        }
    },

    // Actualizar perfil de usuario
    async updateUserProfile(userData) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No hay usuario autenticado');

            // Actualizar displayName en Auth
            await user.updateProfile({
                displayName: `${userData.nombre} ${userData.apellido || ''}`.trim(),
                photoURL: userData.photoURL || user.photoURL
            });

            // Actualizar datos en Firestore
            await db.collection('users').doc(user.uid).update({
                nombre: userData.nombre,
                apellido: userData.apellido,
                photoURL: userData.photoURL || user.photoURL,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return user;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    },

    // Registro de usuario
    async registerUser(userData) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(
                userData.email,
                userData.password
            );

            // Actualizar perfil del usuario
            await userCredential.user.updateProfile({
                displayName: `${userData.nombre} ${userData.apellido || ''}`.trim()
            });

            // Guardar datos adicionales en Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                email: userData.email,
                nombre: userData.nombre,
                apellido: userData.apellido,
                avatar: userData.nombre.charAt(0).toUpperCase(),
                status: 'offline',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return userCredential.user;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    // Inicio de sesión
    async loginUser(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Actualizar estado del usuario
            await db.collection('users').doc(userCredential.user.uid).update({
                status: 'online',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            return userCredential.user;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    // Cerrar sesión
    async logoutUser() {
        try {
            const user = auth.currentUser;
            if (user) {
                await db.collection('users').doc(user.uid).update({
                    status: 'offline',
                    lastLogout: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            await auth.signOut();
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        return auth.currentUser;
    },

    // Observador de cambios en el estado de autenticación
    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    }
};

// Exportar el servicio de autenticación
window.authService = authService; 