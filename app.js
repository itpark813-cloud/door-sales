// Импортируем официальные модули Firebase Auth через бесплатный CDN (Skypack)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === 1. КОНФИГУРАЦИЯ ТВОЕГО ПРОЕКТА FIREBASE (DOOR-SALES) ===
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

// === 2. БАЗА ДАННЫХ ТОВАРОВ (ДВЕРЕЙ) ===
const products = [
    { id: 1, name: "Дверь 'Nordic Wood'", price: 1200000 },
    { id: 2, name: "Стальная 'Armor Max'", price: 3500000 },
    { id: 3, name: "Дверь 'Milano Classic'", price: 1800000 }
];

// Загружаем сохраненную корзину из памяти браузера, либо создаем пустую
let cart = JSON.parse(localStorage.getItem('door_cart')) || [];

// === 3. НАХОДИМ DOM-ЭЛЕМЕНТЫ ===
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

// Инициализируем UI корзины при загрузке страницы
updateCartUI();

// === 4. ЛОГИКА СИСТЕМЫ КОРЗИНЫ ===

// Слушаем кнопки «В корзину» в каталоге
document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', () => {
        const productId = parseInt(button.getAttribute('data-id'));
        addToCart(productId);
    });
});

// Добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const exists = cart.find(item => item.id === productId);

    if (exists) {
        exists.qty++; // Если уже есть, увеличиваем количество
    } else {
        cart.push({ ...product, qty: 1 }); // Если нет, добавляем новый объект
    }
    
    saveCart();
    updateCartUI();
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Сохранение в LocalStorage (чтобы корзина не стиралась при обновлении)
function saveCart() {
    localStorage.setItem('door_cart', JSON.stringify(cart));
}

// Отрисовка интерфейса корзины
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
                <span><b>${item.name}</b> <small style="color: var(--text-muted)">(x${item.qty})</small></span>
                <span>${(item.price * item.qty).toLocaleString()} сум
                    <i class="fas fa-trash-alt" style="color: #f87171; cursor: pointer; margin-left: 15px;" data-remove-id="${item.id}"></i>
                </span>
            </div>
        `;
    });

    // Навешиваем клик удаления на созданные корзинки
    cartList.querySelectorAll('[data-remove-id]').forEach(trashIcon => {
        trashIcon.addEventListener('click', () => {
            const idToRemove = parseInt(trashIcon.getAttribute('data-remove-id'));
            removeFromCart(idToRemove);
        });
    });

    cartTotal.innerText = `Итого: ${total.toLocaleString()} сум`;
}


// === 5. МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ===

loginBtn.addEventListener('click', () => authModal.classList.add('active'));
closeModalBtn.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

function closeModal() {
    authModal.classList.remove('active');
}


// === 6. НАСТОЯЩАЯ АВТОРИЗАЦИЯ FIREBASE ===

// Вход через всплывающее окно Google Auth
googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            closeModal();
            console.log("Успешный вход через Google:", result.user);
        })
        .catch((error) => {
            console.error(error);
            alert("Ошибка входа через Google: " + error.message);
        });
});

// Регистрация или Вход через Email + Пароль
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailField').value;
    const password = document.getElementById('passwordField').value;

    // Пытаемся залогинить существующего пользователя
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            closeModal();
        })
        .catch((error) => {
            // Если аккаунт не найден — автоматически регистрируем его в Firebase!
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                createUserWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        closeModal();
                        alert("Новый аккаунт успешно создан!");
                    })
                    .catch((regError) => {
                        alert("Ошибка регистрации: " + regError.message);
                    });
            } else {
                alert("Ошибка авторизации: " + error.message);
            }
        });
});

// Отслеживание сессии (работает автоматически даже после перезагрузки страницы)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Пользователь в системе
        loginBtn.style.display = 'none';
        
        // Показываем имя (если вошел через Google) или обрезаем Email (если через пароль)
        const nameToShow = user.displayName || user.email.split('@')[0];
        userName.innerText = nameToShow;
        avatarName.innerText = nameToShow.charAt(0).toUpperCase();
        
        userProfile.style.display = 'flex';
    } else {
        // Пользователь вышел
        userProfile.style.display = 'none';
        loginBtn.style.display = 'flex';
    }
});

// Выход из аккаунта
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        loginForm.reset();
        alert("Вы вышли из аккаунта.");
    }).catch((error) => {
        alert("Ошибка при выходе: " + error.message);
    });
});
