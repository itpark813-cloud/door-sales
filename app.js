import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === 1. КОНФИГУРАЦИЯ ТВОЕГО ПРОЕКТА FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyAyqVtbWBA4ZJgt_QU7GVtPC8tPnYbEdF8",
  authDomain: "door-sales.firebaseapp.com",
  projectId: "door-sales",
  storageBucket: "door-sales.firebasestorage.app",
  messagingSenderId: "516237537218",
  appId: "1:516237537218:web:71edf527248774e732705b",
  measurementId: "G-0X6P3Z7R13"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// === 2. БАЗА ДАННЫХ ТОВАРОВ ===
const products = [
    { id: 1, name: "Дверь 'Nordic Wood'", price: 1200000 },
    { id: 2, name: "Стальная 'Armor Max'", price: 3500000 },
    { id: 3, name: "Дверь 'Milano Classic'", price: 1800000 }
];

// Корзина и текущий пользователь
let cart = JSON.parse(localStorage.getItem('door_cart')) || [];
let currentUser = null;

// === 3. DOM-ЭЛЕМЕНТЫ ===
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
const checkoutBtn = document.getElementById('checkoutBtn');

const profileSection = document.getElementById('profileSection');
const profilePrompt = document.getElementById('profilePrompt');
const userEmailText = document.getElementById('userEmailText');
const userJoinedDate = document.getElementById('userJoinedDate');
const ordersList = document.getElementById('ordersList');

// Стартовый рендеринг
updateCartUI();

// === 4. КОРЗИНА И СИСТЕМА ПОКУПКИ ===

// Добавление в корзину
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
    
    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('door_cart', JSON.stringify(cart));
}

function updateCartUI() {
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-cart-text">Корзина пока пуста. Выберите товары в каталоге.</p>';
        cartTotal.innerText = 'Итого: 0 сум';
        checkoutBtn.disabled = true;
        return;
    }

    cartList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        cartList.innerHTML += `
            <div class="cart-item">
                <span><b>${item.name}</b> <small style="color: var(--text-muted)">(x${item.qty})</small></span>
                <span>${(item.price * item.qty).toLocaleString()} сум
                    <i class="fas fa-trash-alt" style="color: #f87171; cursor: pointer; margin-left: 15px;" data-remove-id="${item.id}"></i>
                </span>
            </div>
        `;
    });

    cartList.querySelectorAll('[data-remove-id]').forEach(trashIcon => {
        trashIcon.addEventListener('click', () => {
            const idToRemove = parseInt(trashIcon.getAttribute('data-remove-id'));
            removeFromCart(idToRemove);
        });
    });

    cartTotal.innerText = `Итого: ${total.toLocaleString()} сум`;
    checkoutBtn.disabled = false; // Кнопка "Оформить заказ" теперь доступна
}

// === 5. ЛОГИКА ОФОРМЛЕНИЯ ЗАКАЗА ===
checkoutBtn.addEventListener('click', () => {
    if (!currentUser) {
        alert("Пожалуйста, войдите в аккаунт, чтобы совершить покупку!");
        authModal.classList.add('active');
        return;
    }

    // Рассчитываем сумму
    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Создаем объект заказа
    const newOrder = {
        orderId: Math.floor(100000 + Math.random() * 900000), // Рандомный 6-значный ID заказа
        date: new Date().toLocaleDateString('ru-RU'),
        items: cart.map(item => `${item.name} (x${item.qty})`).join(', '),
        total: total
    };

    // Сохраняем в localStorage для конкретного юзера
    let userOrders = JSON.parse(localStorage.getItem(`orders_${currentUser.uid}`)) || [];
    userOrders.push(newOrder);
    localStorage.setItem(`orders_${currentUser.uid}`, JSON.stringify(userOrders));

    // Очищаем корзину
    cart = [];
    saveCart();
    updateCartUI();

    // Обновляем список заказов в профиле
    renderOrdersUI();

    alert(`🎉 Заказ №${newOrder.orderId} оформлен успешно! Двери отправлены на доставку.`);
});


// === 6. НАСТРОЙКА КЛИЕНТСКОГО КАБИНЕТА ===

function renderOrdersUI() {
    if (!currentUser) return;

    let userOrders = JSON.parse(localStorage.getItem(`orders_${currentUser.uid}`)) || [];

    if (userOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-orders-text">Вы еще не совершили ни одной покупки.</p>';
        return;
    }

    ordersList.innerHTML = '';
    userOrders.forEach(order => {
        ordersList.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span>Заказ №${order.orderId}</span>
                    <span class="order-status">Оплачен</span>
                </div>
                <div class="order-items">${order.items}</div>
                <div style="text-align: right; font-weight: bold;">Сумма: ${order.total.toLocaleString()} сум</div>
            </div>
        `;
    });
}


// === 7. МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ===

loginBtn.addEventListener('click', () => authModal.classList.add('active'));
closeModalBtn.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

function closeModal() {
    authModal.classList.remove('active');
}


// === 8. FIREBASE AUTHENTICATION ===

// Вход через Google
googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then(() => {
            closeModal();
        })
        .catch((error) => {
            console.error(error);
            alert("Ошибка входа через Google: " + error.message);
        });
});

// Регистрация / вход по почте
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailField').value;
    const password = document.getElementById('passwordField').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            closeModal();
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                createUserWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        closeModal();
                        alert("Регистрация успешна!");
                    })
                    .catch((regError) => {
                        alert("Ошибка регистрации: " + regError.message);
                    });
            } else {
                alert("Ошибка входа: " + error.message);
            }
        });
});

// Отслеживание входа/выхода
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Юзер зашел
        currentUser = user;
        loginBtn.style.display = 'none';
        
        const nameToShow = user.displayName || user.email.split('@')[0];
        userName.innerText = nameToShow;
        avatarName.innerText = nameToShow.charAt(0).toUpperCase();
        
        userProfile.style.display = 'flex';

        // Обновляем кабинет
        profilePrompt.style.display = 'none';
        profileSection.style.display = 'block';
        userEmailText.innerText = user.email;
        
        // Дата создания аккаунта в красивом формате
        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ru-RU') : 'Сегодня';
        userJoinedDate.innerText = creationTime;

        renderOrdersUI();
    } else {
        // Юзер вышел
        currentUser = null;
        userProfile.style.display = 'none';
        loginBtn.style.display = 'flex';

        // Скрываем кабинет
        profileSection.style.display = 'none';
        profilePrompt.style.display = 'block';
    }
});

// Выход
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        loginForm.reset();
        alert("Вы вышли из аккаунта.");
    }).catch((error) => {
        alert("Ошибка выхода: " + error.message);
    });
});
