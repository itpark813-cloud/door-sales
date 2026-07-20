// База данных товаров
const products = [
    { id: 1, name: "Дверь 'Nordic Wood'", price: 1200000 },
    { id: 2, name: "Стальная 'Armor Max'", price: 3500000 },
    { id: 3, name: "Дверь 'Milano Classic'", price: 1800000 }
];

let cart = [];

const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const avatarName = document.getElementById('avatarName');
const logoutBtn = document.getElementById('logoutBtn');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const userEmailText = document.getElementById('userEmailText');
const userJoinedDate = document.getElementById('userJoinedDate');

// === 1. КОРЗИНА (без изменений) ===

document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', () => {
        const productId = parseInt(button.getAttribute('data-id'));
        addToCart(productId);
    });
});

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const exists = cart.find(item => item.id === productId);
    if (exists) { exists.qty++; } else { cart.push({ ...product, qty: 1 }); }
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-cart-text">Корзина пока пуста. Выберите товары в каталоге.</p>';
        cartTotal.innerText = 'Итого: 0 сум';
        return;
    }
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        cartList.innerHTML += `
            <div class="cart-item">
                <span>${item.name} (x${item.qty})</span>
                <span>${(item.price * item.qty).toLocaleString()} сум
                    <i class="fas fa-trash-alt" style="color: #f87171; cursor: pointer; margin-left: 15px;" data-remove-id="${item.id}"></i>
                </span>
            </div>
        `;
    });
    cartList.querySelectorAll('[data-remove-id]').forEach(trashIcon => {
        trashIcon.addEventListener('click', () => {
            removeFromCart(parseInt(trashIcon.getAttribute('data-remove-id')));
        });
    });
    cartTotal.innerText = `Итого: ${total.toLocaleString()} сум`;
}

// === 2. МОДАЛЬНОЕ ОКНО ===

loginBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

function openModal() { authModal.classList.add('active'); }
function closeModal() { authModal.classList.remove('active'); }

// === 3. РЕАЛЬНАЯ АВТОРИЗАЦИЯ ЧЕРЕЗ VERCEL API ===

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailField').value.trim();
    const password = document.getElementById('passwordField').value;
    const submitBtn = loginForm.querySelector('.btn-submit');

    submitBtn.disabled = true;
    submitBtn.innerText = 'Подождите...';

    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Ошибка авторизации');
            return;
        }

        localStorage.setItem('doorlux_token', data.token);
        loginUser(data.user);
        loginForm.reset();

    } catch (err) {
        console.error(err);
        alert('Сервер недоступен. Попробуйте позже.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Войти / Зарегистрироваться';
    }
});

googleLoginBtn.addEventListener('click', () => {
    alert('Вход через Google требует отдельной настройки OAuth. Пока используйте вход по email.');
});

function loginUser(user) {
    loginBtn.style.display = 'none';
    userName.innerText = user.name;
    avatarName.innerText = user.name.charAt(0).toUpperCase();
    userProfile.style.display = 'flex';

    if (userEmailText) userEmailText.innerText = user.email;
    if (userJoinedDate) userJoinedDate.innerText = user.joined;

    closeModal();
}

// Выход из аккаунта
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('doorlux_token');
    userProfile.style.display = 'none';
    loginBtn.style.display = 'flex';
    loginForm.reset();
});

// === 4. АВТО-ВХОД ПРИ ЗАГРУЗКЕ СТРАНИЦЫ (если токен есть) ===

async function restoreSession() {
    const token = localStorage.getItem('doorlux_token');
    if (!token) return;

    try {
        const res = await fetch('/api/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            localStorage.removeItem('doorlux_token');
            return;
        }
        const data = await res.json();
        loginUser(data.user);
    } catch (err) {
        console.error('Не удалось восстановить сессию', err);
    }
}

restoreSession();
