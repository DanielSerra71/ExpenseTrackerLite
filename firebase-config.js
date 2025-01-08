// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged }
    from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy }
    from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Tu configuración de Firebase (copia esto de la consola de Firebase)
const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu-messaging-sender-id",
    appId: "tu-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Funciones de autenticación
export const registerUser = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Crear documento de usuario en Firestore
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: name,
            email: email,
            createdAt: new Date()
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Funciones de base de datos
export const saveTransaction = async (userId, transactionData) => {
    try {
        const docRef = await addDoc(collection(db, `users/${userId}/transactions`), {
            ...transactionData,
            createdAt: new Date()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getTransactions = async (userId) => {
    try {
        const q = query(
            collection(db, `users/${userId}/transactions`),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, transactions };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Exportar las instancias principales
export { auth, db }; 