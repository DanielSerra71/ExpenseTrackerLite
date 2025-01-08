class UserManager {
    constructor() {
        this.users = [];
        this.currentUser = null;
    }

    init() {
        // Cargar usuarios guardados del localStorage
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }

        // Verificar si hay una sesión activa
        const savedSession = localStorage.getItem('currentUser');
        if (savedSession) {
            this.currentUser = JSON.parse(savedSession);
        }
    }

    async register(email, password, name) {
        // Validar que el email no esté ya registrado
        if (this.users.some(user => user.email === email)) {
            throw new Error('El email ya está registrado');
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            email,
            password, // En una aplicación real, deberías hashear la contraseña
            name,
            createdAt: new Date().toISOString()
        };

        // Agregar usuario a la lista
        this.users.push(newUser);
        
        // Guardar en localStorage
        localStorage.setItem('users', JSON.stringify(this.users));

        // Iniciar sesión automáticamente
        await this.login(email, password);

        return newUser;
    }

    async login(email, password) {
        // Buscar usuario
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        // Establecer sesión
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));

        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Exportar una única instancia
const userManager = new UserManager();
export default userManager; 