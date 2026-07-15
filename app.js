import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === 1. КОНФИГУРАЦИЯ FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyAyqVtbWBA4ZJgt_QU7GVtPC8tPnYbEdF8",
  authDomain: "door-sales.firebaseapp.com",
  projectId: "door-sales",
  storageBucket: "door-sales.firebasestorage.app",
  messagingSenderId: "516237537218",
  appId: "1:516237537218:web:71edf527248774e732705b",
  measurementId: "G-0X6P3Z7R13"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// === 2. СИСТЕМА ЛОКАЛИЗАЦИИ ===
const translations = {
    ru: {
        login: "Войти",
        heroTitle: "Входные и межкомнатные двери премиум качества",
        heroSubtitle: "Подберите идеальную дверь для вашего дома с бесплатной доставкой по Узбекистану",
        filterAll: "Все",
        filterEntrance: "Входные",
        filterInterior: "Межкомнатные",
        cabinet: "Мой Кабинет",
        joined: "В системе с:",
        history: "История заказов",
        noOrders: "Вы еще не совершили ни одной покупки.",
        loginPrompt: "Войдите в аккаунт, чтобы сохранять заказы в облаке и смотреть историю.",
        cartTitle: "Ваша корзина",
        emptyCart: "Корзина пока пуста. Выберите товары в каталоге.",
        checkout: "Оформить заказ",
        modalTitle: "Личный кабинет",
        emailLabel: "Электронная почта",
        passLabel: "Пароль",
        loginSubmit: "Войти / Зарегистрироваться",
        or: "или",
        googleLogin: "Войти через Google",
        toCart: "В корзину",
        total: "Итого",
        currency: "сум",
        orderAlert: "оформлен успешно! Двери отправлены на доставку.",
        orderNum: "Заказ №",
        orderPaid: "Оплачен",
        authAlert: "Внимание! Вы покупаете без авторизации. Заказ сохранится локально на этом устройстве.",
        searchPlaceholder: "Поиск дверей...",
        priceFilter: "Цена до:",
        profileSaved: "Профиль успешно обновлен!"
    },
    uz: {
        login: "Kirish",
        heroTitle: "Premium sifatli kirish va xonalararo eshiklar",
        heroSubtitle: "O'zbekiston bo'ylab bepul yetkazib berish bilan uyingiz uchun ideal eshikni tanlang",
        filterAll: "Barchasi",
        filterEntrance: "Kirish eshiklari",
        filterInterior: "Xonalararo",
        cabinet: "Shaxsiy Kabinet",
        joined: "Ro'yxatdan o'tilgan sana:",
        history: "Buyurtmalar tarixi",
        noOrders: "Siz hali hech qanday xarid amalga oshirmadingiz.",
        loginPrompt: "Buyurtmalarni bulutda saqlash va tarixni ko'rish uchun profilga kiring.",
        cartTitle: "Sizning savatchangiz",
        emptyCart: "Savatcha bo'sh. Katalogni ko'zdan kechiring.",
        checkout: "Buyurtma berish",
        modalTitle: "Tizimga kirish",
        emailLabel: "Elektron pochta",
        passLabel: "Parol",
        loginSubmit: "Kirish / Ro'yxatdan o'tish",
        or: "yoki",
        googleLogin: "Google orqali kirish",
        toCart: "Savatga",
        total: "Jami",
        currency: "so'm",
        orderAlert: "muvaffaqiyatli rasmiylashtirildi! Eshiklar yetkazib berishga topshirildi.",
        orderNum: "Buyurtma №",
        orderPaid: "To'langan",
        authAlert: "Diqqat! Siz tizimga kirmasdan xarid qilyapsiz. Buyurtma faqat ushbu qurilmada saqlanadi.",
        searchPlaceholder: "Eshiklarni qidirish...",
        priceFilter: "Maksimal narx:",
        profileSaved: "Profil muvaffaqiyatli yangilandi!"
    }
};

let currentLang = "ru";

// === 3. БАЗА ДАННЫХ ДВЕРЕЙ (ТОЧНЫЕ ССЫЛКИ НА ДВЕРИ КРУПНЫМ ПЛАНОМ) ===
const products = [
    { 
        id: 1, 
        category: "interior",
        nameRu: "Элитная 'Nordic Wood'", 
        nameUz: "Nafis 'Nordic Wood'",
        descRu: "Премиальная межкомнатная дверь из благородного массива светлого ясеня с оригинальной фактурой дерева и итальянской фурнитурой.",
        descUz: "Sifatli va nafis oq kul daraxtidan yasalgan xonalararo eshik, italyan furniturasi bilan.",
        price: 1850000, 
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop" // Светлая комнатная дверь с четкой деревянной фактурой
    },
    { 
        id: 2, 
        category: "entrance",
        nameRu: "Бронированная 'Armor Max'", 
        nameUz: "Zirhli 'Armor Max'",
        descRu: "Входная сейфовая дверь из 3-мм каленой стали с матовой темной отделкой, взломостойкими замками и премиальной шумоизоляцией.",
        descUz: "3 mm qalinlikdagi po'latdan tayyorlangan kirish seyf eshigi. Shovqindan yuqori darajadagi himoya.",
        price: 4900000, 
        image: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?q=80&w=600&auto=format&fit=crop" // Темная надежная входная металлическая дверь
    },
    { 
        id: 3, 
        category: "interior",
        nameRu: "Эмаль 'Milano Line'", 
        nameUz: "Emal 'Milano Line'",
        descRu: "Современная белая межкомнатная дверь, покрытая гладкой многослойной эмалью с утонченными геометрическими фрезеровками.",
        descUz: "Ko'p qatlamli emal bilan qoplangan, matli shisha elementlariga ega zamonaviy xonalararo eshik.",
        price: 2300000, 
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop" // Минималистичная белая комнатная дверь
    },
    { 
        id: 4, 
        category: "entrance",
        nameRu: "Коттеджная 'Tuscany Port'", 
        nameUz: "Kottej 'Tuscany Port'",
        descRu: "Утепленная уличная дверь с терморазрывом, изящной ковкой ручной работы, матовым стеклом и текстурой темного дуба.",
        descUz: "Hovli uylari uchun namlikka chidamli ko'cha eshigi. Qo'lda ishlangan soxta temir va oyna.",
        price: 5800000, 
        image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=600&auto=format&fit=crop" // Роскошная уличная сине-голубая дверь коттеджа
    }
];

// Глобальные состояния
let cart = JSON.parse(localStorage.getItem('door_cart')) || [];
let activeCategory = "all";
let searchQuery = "";
let maxPrice = 6000000;

// === 4. DOM-ЭЛЕМЕНТЫ ===
const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');

const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const avatarName = document.getElementById('avatarName');
const headerAvatarImg = document.getElementById('headerAvatarImg');
const logoutBtn = document.getElementById('logoutBtn');

const catalogGrid = document.getElementById('catalogGrid');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

const profileSection = document.getElementById('profileSection');
const profilePrompt = document.getElementById('profilePrompt');
const userEmailText = document.getElementById('userEmailText');
const userJoinedDate = document.getElementById('userJoinedDate');
const ordersList = document.getElementById('ordersList');
const langBtn = document.getElementById('langBtn');

const searchInput = document.getElementById('searchInput');
const priceRange = document.getElementById('priceRange');
const priceRangeValue = document.getElementById('priceRangeValue');

// Элементы кастомизации профиля
const avatarInput = document.getElementById('avatarInput');
const cabinetAvatarImg = document.getElementById('cabinetAvatarImg');
const cabinetAvatarFallback = document.getElementById('cabinetAvatarFallback');
const nicknameInput = document.getElementById('nicknameInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');

// === 5. СМЕНА ЯЗЫКОВ ===
if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === "ru" ? "uz" : "ru";
        langBtn.innerText = currentLang.toUpperCase();
        applyLanguage();
    });
}

function applyLanguage() {
    const t = translations[currentLang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    if (priceRange && priceRangeValue) {
        const currentVal = parseInt(priceRange.value);
        priceRangeValue.innerText = `${currentVal.toLocaleString()} ${t.currency}`;
    }

    renderCatalog();
    updateCartUI();
    renderOrdersUI(auth.currentUser);
}

// === 6. ФИЛЬТРАЦИЯ И СОРТИРОВКА ===
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderCatalog();
    });
}

if (priceRange) {
    priceRange.addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value);
        const t = translations[currentLang];
        if (priceRangeValue) {
            priceRangeValue.innerText = `${maxPrice.toLocaleString()} ${t.currency}`;
        }
        renderCatalog();
    });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderCatalog();
    });
});

function renderCatalog() {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';
    const t = translations[currentLang];

    const filtered = products.filter(p => {
        const name = currentLang === 'ru' ? p.nameRu.toLowerCase() : p.nameUz.toLowerCase();
        const desc = currentLang === 'ru' ? p.descRu.toLowerCase() : p.descUz.toLowerCase();
        
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesPrice = p.price <= maxPrice;
        const matchesSearch = name.includes(searchQuery) || desc.includes(searchQuery);

        return matchesCategory && matchesPrice && matchesSearch;
    });

    if (filtered.length === 0) {
        catalogGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); margin-top: 20px;">Ничего не найдено</p>`;
        return;
    }

    filtered.forEach(p => {
        const name = currentLang === 'ru' ? p.nameRu : p.nameUz;
        const desc = currentLang === 'ru' ? p.descRu : p.descUz;

        catalogGrid.innerHTML += `
            <div class="glass-card">
                <div class="door-img-container">
                    <img src="${p.image}" alt="${name}">
                </div>
                <div class="door-details">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    <div class="price-row">
                        <span class="price">${p.price.toLocaleString()} ${t.currency}</span>
                        <button class="btn-add" data-id="${p.id}">${t.toCart}</button>
                    </div>
                </div>
            </div>
        `;
    });

    catalogGrid.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// === 7. ЛОГИКА КОРЗИНЫ ===
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
    if (!cartList) return;
    const t = translations[currentLang];
    if (cart.length === 0) {
        cartList.innerHTML = `<p class="empty-cart-text">${t.emptyCart}</p>`;
        if (cartTotal) cartTotal.innerText = `${t.total}: 0 ${t.currency}`;
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    cartList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        const name = currentLang === 'ru' ? item.nameRu : item.nameUz;
        cartList.innerHTML += `
            <div class="cart-item">
                <span><b>${name}</b> <small style="color: var(--text-muted)">(x${item.qty})</small></span>
                <span>${(item.price * item.qty).toLocaleString()} ${t.currency}
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

    if (cartTotal) cartTotal.innerText = `${t.total}: ${total.toLocaleString()} ${t.currency}`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// === 8. КНОПКА ОФОРМЛЕНИЯ ЗАКАЗА ===
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const activeUser = auth.currentUser;
        const t = translations[currentLang];
        
        if (!activeUser) {
            alert(t.authAlert);
        }

        let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        const newOrder = {
            orderId: Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleDateString('ru-RU'),
            items: cart.map(item => {
                const name = currentLang === 'ru' ? item.nameRu : item.nameUz;
                return `${name} (x${item.qty})`;
            }).join(', '),
            total: total
        };

        const storageKey = activeUser ? `orders_${activeUser.uid}` : 'orders_guest';
        let userOrders = JSON.parse(localStorage.getItem(storageKey)) || [];
        userOrders.push(newOrder);
        localStorage.setItem(storageKey, JSON.stringify(userOrders));

        cart = [];
        saveCart();
        updateCartUI();
        
        if (activeUser) {
            renderOrdersUI(activeUser);
        } else {
            renderGuestOrdersUI();
        }

        alert(`🎉 ${t.orderNum}${newOrder.orderId} ${t.orderAlert}`);
    });
}

function renderOrdersUI(activeUser) {
    if (!ordersList) return;
    const t = translations[currentLang];
    if (!activeUser) return;

    let userOrders = JSON.parse(localStorage.getItem(`orders_${activeUser.uid}`)) || [];

    if (userOrders.length === 0) {
        ordersList.innerHTML = `<p class="empty-orders-text">${t.noOrders}</p>`;
        return;
    }

    ordersList.innerHTML = '';
    userOrders.forEach(order => {
        ordersList.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span>${t.orderNum}${order.orderId}</span>
                    <span class="order-status">${t.orderPaid}</span>
                </div>
                <div class="order-items">${order.items}</div>
                <div style="text-align: right; font-weight: bold;">${t.total}: ${order.total.toLocaleString()} ${t.currency}</div>
            </div>
        `;
    });
}

function renderGuestOrdersUI() {
    if (!profilePrompt) return;
    const t = translations[currentLang];
    let guestOrders = JSON.parse(localStorage.getItem('orders_guest')) || [];
    if (guestOrders.length > 0) {
        profilePrompt.innerHTML = `
            <i class="fas fa-box-open" style="color: var(--primary); font-size: 2rem;"></i>
            <h3 style="margin: 10px 0; color: white;">${t.history} (Гость)</h3>
            <div id="guestOrdersContainer" style="text-align: left;"></div>
        `;
        const container = document.getElementById('guestOrdersContainer');
        if (container) {
            guestOrders.forEach(order => {
                container.innerHTML += `
                    <div class="order-card">
                        <div class="order-header">
                            <span>${t.orderNum}${order.orderId}</span>
                            <span class="order-status">${t.orderPaid}</span>
                        </div>
                        <div class="order-items">${order.items}</div>
                        <div style="text-align: right; font-weight: bold;">${t.total}: ${order.total.toLocaleString()} ${t.currency}</div>
                    </div>
                `;
            });
        }
    }
}

// === 9. ЛОГИКА КАСТОМИЗАЦИИ ПРОФИЛЯ И СЕЙВА ===
function loadCustomProfile(uid) {
    const savedName = localStorage.getItem(`profile_name_${uid}`);
    const savedAvatar = localStorage.getItem(`profile_avatar_${uid}`);

    if (savedName) {
        if (userName) userName.innerText = savedName;
        if (nicknameInput) nicknameInput.value = savedName;
        if (avatarName) avatarName.innerText = savedName.charAt(0).toUpperCase();
        if (cabinetAvatarFallback) cabinetAvatarFallback.innerText = savedName.charAt(0).toUpperCase();
    }

    if (savedAvatar) {
        if (headerAvatarImg) {
            headerAvatarImg.src = savedAvatar;
            headerAvatarImg.classList.remove('hidden');
        }
        if (avatarName) avatarName.classList.add('hidden');

        if (cabinetAvatarImg) {
            cabinetAvatarImg.src = savedAvatar;
            cabinetAvatarImg.classList.remove('hidden');
        }
        if (cabinetAvatarFallback) cabinetAvatarFallback.classList.add('hidden');
    } else {
        if (headerAvatarImg) headerAvatarImg.classList.add('hidden');
        if (avatarName) avatarName.classList.remove('hidden');
        if (cabinetAvatarImg) cabinetAvatarImg.classList.add('hidden');
        if (cabinetAvatarFallback) cabinetAvatarFallback.classList.remove('hidden');
    }
}

// Обработка загрузки новой аватарки
if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && auth.currentUser) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                localStorage.setItem(`profile_avatar_${auth.currentUser.uid}`, base64String);
                loadCustomProfile(auth.currentUser.uid);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Кнопка сохранения нового никнейма
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
        const newName = nicknameInput ? nicknameInput.value.trim() : "";
        if (newName && auth.currentUser) {
            localStorage.setItem(`profile_name_${auth.currentUser.uid}`, newName);
            loadCustomProfile(auth.currentUser.uid);
            alert(translations[currentLang].profileSaved);
        }
    });
}

// === 10. МОДАЛКА И FIREBASE АВТОРИЗАЦИЯ ===
if (loginBtn) loginBtn.addEventListener('click', () => authModal && authModal.classList.add('active'));
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (authModal) {
    authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });
}

function closeModal() {
    if (authModal) authModal.classList.remove('active');
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        signInWithPopup(auth, googleProvider)
            .then(() => closeModal())
            .catch(err => alert("Google Error: " + err.message));
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('emailField').value;
        const password = document.getElementById('passwordField').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => closeModal())
            .catch((error) => {
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    createUserWithEmailAndPassword(auth, email, password)
                        .then(() => {
                            closeModal();
                            alert("Регистрация успешна!");
                        })
                        .catch((regError) => alert("Ошибка: " + regError.message));
                } else {
                    alert("Ошибка: " + error.message);
                }
            });
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        
        const defaultName = user.displayName || user.email.split('@')[0];
        if (userName) userName.innerText = defaultName;
        if (avatarName) avatarName.innerText = defaultName.charAt(0).toUpperCase();
        if (cabinetAvatarFallback) cabinetAvatarFallback.innerText = defaultName.charAt(0).toUpperCase();
        if (nicknameInput) nicknameInput.value = defaultName;
        
        if (userProfile) userProfile.style.display = 'flex';
        if (profilePrompt) profilePrompt.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';
        if (userEmailText) userEmailText.innerText = user.email;
        
        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ru-RU') : 'Сегодня';
        if (userJoinedDate) userJoinedDate.innerText = creationTime;

        loadCustomProfile(user.uid);
        renderOrdersUI(user);
    } else {
        if (userProfile) userProfile.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'flex';
        if (profileSection) profileSection.style.display = 'none';
        if (profilePrompt) profilePrompt.style.display = 'block';
        renderGuestOrdersUI();
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            if (loginForm) loginForm.reset();
            alert("Вы вышли из аккаунта.");
        });
    });
}

// Стартовый запуск
renderCatalog();
applyLanguage();
