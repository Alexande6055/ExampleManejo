// Cambia entre tema claro y oscuro
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    // Guardar preferencia en localStorage
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Al cargar la página, aplicar el tema guardado
window.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
});
