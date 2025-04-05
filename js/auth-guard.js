// Verificar autenticación
authService.onAuthStateChanged((user) => {
    if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    // Si hay usuario autenticado, actualizar la UI
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userStatus = document.getElementById('userStatus');

    if (userAvatar) {
        userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    }

    if (userName) {
        userName.textContent = user.displayName || user.email;
    }

    if (userStatus) {
        userStatus.textContent = 'online';
        userStatus.classList.add('online');
    }
});

// Función para cerrar sesión
async function logout() {
    try {
        await authService.logoutUser();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Agregar evento al botón de cerrar sesión
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}); 