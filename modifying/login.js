function toggleLogin() {
    const dropdown = document.getElementById('loginDropdown');
    dropdown.classList.toggle('show');
}

window.addEventListener('click', function(event) {
    if (!event.target.matches('.login-btn')) {
        const dropdown = document.getElementById('loginDropdown');
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});


function handleLogin(event) {
    event.preventDefault();
    
    const usuario = document.querySelector('.login-input[type="text"]').value;
    const password = document.querySelector('.login-input[type="password"]').value;
    
    if (usuario && password) {
        console.log('Login attempt:', { usuario, password });
        alert(`WELCOME, ${usuario}!`);
        toggleLogin();
    } else {
        alert('ERRORASO');
    }
}