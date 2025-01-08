import userManager from './userManager.js';

let currentSession = null;

// Función para iniciar sesión
function login(user) {
    window.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Cargar las transacciones del usuario inmediatamente
    const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
    if (storedTransactions) {
        window.transactions = JSON.parse(storedTransactions);
        window.updateUI(); // Actualizar UI inmediatamente
    }

    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
}

// Función para cerrar sesión
function logout() {
    const userId = window.currentUser?.id;
    window.currentUser = null;
    window.transactions = [];
    localStorage.removeItem('currentUser');
    document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
}

// Verificar sesión al cargar
function checkSession() {
    return new Promise((resolve) => {
        const savedSession = localStorage.getItem('session');
        if (savedSession) {
            const user = JSON.parse(savedSession);
            window.currentUser = user; // Establecer currentUser directamente
            resolve(user);
        } else {
            window.currentUser = null;
            resolve(null);
        }
    });
}

// Llamar a checkSession al cargar la página
document.addEventListener('DOMContentLoaded', checkSession);

export { login, logout, checkSession };

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const authModal = document.getElementById('authModal');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const switchAuthMode = document.getElementById('switchAuthMode');
    const registerFields = document.getElementById('registerFields');
    const userButton = document.getElementById('userButton');

    let isLoginMode = true;

    // Inicializar el gestor de usuarios
    userManager.init();

    // Mostrar modal de autenticación
    userButton.addEventListener('click', () => {
        if (userManager.isLoggedIn()) {
            showLogoutConfirmation();
        } else {
            authModal.style.display = 'block';
        }
    });

    // Cambiar entre login y registro
    switchAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Cambiando modo de autenticación');
        console.log('Modo actual:', isLoginMode ? 'login' : 'registro');
        isLoginMode = !isLoginMode;
        console.log('Nuevo modo:', isLoginMode ? 'login' : 'registro');
        updateAuthFormMode();
        authForm.reset();
    });

    // Actualizar la UI según el modo
    function updateAuthFormMode() {
        console.log('Actualizando modo del formulario');
        const registerFields = document.getElementById('registerFields');
        const userName = document.getElementById('userName');
        const confirmPassword = document.getElementById('confirmPassword');

        if (!registerFields || !userName || !confirmPassword) {
            console.error('No se encontraron elementos del formulario');
            return;
        }

        if (!isLoginMode) {
            console.log('Mostrando campos de registro');
            registerFields.style.display = 'block';
            userName.required = true;
            confirmPassword.required = true;
        } else {
            console.log('Ocultando campos de registro');
            registerFields.style.display = 'none';
            userName.required = false;
            confirmPassword.required = false;
        }
        
        authTitle.querySelector('span').textContent = isLoginMode ? 'Iniciar Sesión' : 'Registrarse';
        authSubmitBtn.querySelector('span').textContent = isLoginMode ? 'Iniciar Sesión' : 'Registrarse';
        switchAuthMode.textContent = isLoginMode ? 'Registrarse' : 'Iniciar Sesión';
    }

    // Manejar el envío del formulario
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulario enviado');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Modo actual:', isLoginMode ? 'login' : 'registro');
        console.log('Email:', email);

        try {
            let user;
            if (isLoginMode) {
                console.log('Intentando login...');
                user = await userManager.login(email, password);
            } else {
                console.log('Intentando registro...');
                const name = document.getElementById('userName')?.value;
                const confirmPassword = document.getElementById('confirmPassword')?.value;

                console.log('Campos de registro:', {
                    email: !!email,
                    password: !!password,
                    name: !!name,
                    confirmPassword: !!confirmPassword
                });

                // Verificar que los elementos existen
                if (!document.getElementById('userName') || !document.getElementById('confirmPassword')) {
                    console.error('No se encontraron los campos del formulario de registro');
                    throw new Error('Error en el formulario de registro');
                }

                if (!name || !email || !password || !confirmPassword) {
                    console.log('Faltan campos requeridos');
                    throw new Error('Todos los campos son requeridos');
                }

                if (password !== confirmPassword) {
                    console.log('Las contraseñas no coinciden');
                    throw new Error('Las contraseñas no coinciden');
                }

                if (password.length < 6) {
                    console.log('Contraseña muy corta');
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }

                console.log('Intentando crear usuario con:', { email, name });
                user = await userManager.register(email, password, name);
            }

            console.log('Usuario procesado:', user);
            updateUIAfterAuth(user);
            
            authModal.style.display = 'none';
            authForm.reset();
            showNotification(isLoginMode ? '¡Bienvenido!' : 'Registro exitoso', 'success');
        } catch (error) {
            console.error('Error en autenticación:', error);
            showNotification(error.message, 'error');
        }
    });

    // Agregar esta nueva función para actualizar la UI
    function updateUIAfterAuth(user) {
        console.log('Actualizando UI con usuario:', user);
        const userNameDisplay = document.querySelector('.user-name');
        if (user) {
            userNameDisplay.textContent = user.name;
            document.dispatchEvent(new CustomEvent('authStateChanged', { 
                detail: { user } 
            }));
        } else {
            userNameDisplay.textContent = 'Invitado';
        }
    }

    // Agregar un listener para el evento authStateChanged
    document.addEventListener('authStateChanged', (event) => {
        const user = event.detail.user;
        updateUIAfterAuth(user);
    });

    // Función para mostrar confirmación de cierre de sesión
    function showLogoutConfirmation() {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmAction = document.getElementById('confirmAction');
        const cancelConfirmation = document.getElementById('cancelConfirmation');

        confirmationMessage.textContent = 'Are you sure you want to log out?';
        confirmationModal.style.display = 'block';

        confirmAction.onclick = () => {
            userManager.logout();
            confirmationModal.style.display = 'none';
            showNotification('Session closed successfully', 'success');
        };

        cancelConfirmation.onclick = () => {
            confirmationModal.style.display = 'none';
        };
    }

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // Al cargar la página, verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        window.currentUser = JSON.parse(savedUser);
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: window.currentUser }
        }));
    }

    // Al cargar la página, verificar y actualizar la UI
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        updateUIAfterAuth(currentUser);
    }
});

// Función para mostrar notificaciones (asegúrate de que coincida con tu sistema de notificaciones existente)
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 