// База данных товаров
const products = [
    { id: 1, name: "Дверь 'Nordic Wood'", price: 1200000 },
    { id: 2, name: "Стальная 'Armor Max'", price: 3500000 },
    { id: 3, name: "Дверь 'Milano Classic'", price: 1800000 }
];

// Массив корзины
let cart = [];

// DOM-элементы интерфейса
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

// === 1. ЛОГИКА КОРЗИНЫ ===

// Слушатель событий клика на "В корзину" прямо по ID
document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', () => {
        const productId = parseInt(button.getAttribute('data-id'));
        addToCart(productId);
    });
});

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const exists = cart.find(item => item.id === productId);

    if (exists) {
        exists.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
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

    // Добавляем обработчики на иконки удаления
    cartList.querySelectorAll('[data-remove-id]').forEach(trashIcon => {
        trashIcon.addEventListener('click', () => {
            const idToRemove = parseInt(trashIcon.getAttribute('data-remove-id'));
            removeFromCart(idToRemove);
        });
    });

    cartTotal.innerText = `Итого: ${total.toLocaleString()} сум`;
}


// === 2. МОДАЛЬНОЕ ОКНО ===

loginBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

// Закрытие модалки при клике на серый фон
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
});

function openModal() {
    authModal.classList.add('active');
}

function closeModal() {
    authModal.classList.remove('active');
}


// === 3. ФЕЙКОВАЯ АВТОРИЗАЦИЯ ===

// Вход по Email + Пароль
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailField').value;
    const username = email.split('@')[0]; // вытаскиваем имя из почты
    
    loginUser(username);
});

// Имитация входа через Google Account
googleLoginBtn.addEventListener('click', () => {
    const googleUser = "Окихо Мухаммадов"; // заглушка юзера
    loginUser(googleUser);
});

function loginUser(name) {
    // Скрываем кнопку "Войти"
    loginBtn.style.display = 'none';
    
    // Заполняем данные пользователя
    userName.innerText = name;
    avatarName.innerText = name.charAt(0).toUpperCase(); // Первая буква имени на аватарку
    
    // Показываем блок профиля
    userProfile.style.display = 'flex';
    
    closeModal();
    alert(`Рады вас видеть, ${name}!`);
}

// Выход из аккаунта
logoutBtn.addEventListener('click', () => {
    userProfile.style.display = 'none';
    loginBtn.style.display = 'flex';
    
    // Очищаем формы ввода
    loginForm.reset();
    
    alert("Вы успешно вышли из личного кабинета.");
});
