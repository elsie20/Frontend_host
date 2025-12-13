const API_URL = "http://localhost:5000";  

const storedUser = localStorage.getItem('currentUser');
let currentUser = storedUser ? JSON.parse(storedUser) : null;

function saveCurrentUser() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
}

const cards = document.querySelectorAll('.card');
const cardButtons = document.querySelectorAll('[data-card]');
const cardCloses = document.querySelectorAll('.close');
const navLinksContainer = document.getElementById('nav-links');


function openCard(cardId) {
    const card = document.getElementById(`${cardId}-card`);
    if (card) card.style.display = 'flex';
}

function closeCard(cardId) {
    const card = document.getElementById(`${cardId}-card`);
    if (card) card.style.display = 'none';
}


function renderNavbar() {
    if (!navLinksContainer) return;

    navLinksContainer.innerHTML = '';

    if (currentUser) {

        const profileLi = document.createElement('li');
        const profileLink = document.createElement('a');
        profileLink.href = 'profile.html';
        profileLink.textContent = 'Profile';
        profileLi.appendChild(profileLink);

        const orderLi = document.createElement('li');
        const orderLink = document.createElement('a');
        orderLink.href = 'order-status.html';
        orderLink.textContent = 'Order';
        orderLi.appendChild(orderLink);

        const logoutLi = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentUser = null;
            saveCurrentUser();
            renderNavbar();
            alert('You have been logged out');
        });
        logoutLi.appendChild(logoutLink);

        navLinksContainer.appendChild(profileLi);
        navLinksContainer.appendChild(orderLi);
        navLinksContainer.appendChild(logoutLi);
    } else {

        const homeLi = document.createElement('li');
        const homeLink = document.createElement('a');
        homeLink.href = 'index.html';
        homeLink.textContent = 'Home';
        homeLi.appendChild(homeLink);

        const accountLi = document.createElement('li');
        const accountLink = document.createElement('a');
        accountLink.href = '#';
        accountLink.textContent = 'Account';
        accountLink.addEventListener('click', (e) => {
            e.preventDefault();
            const loginCard = document.getElementById('login-card');
            if (loginCard) {
                openCard('login');
            } else {
                window.location.href = 'index.html';
            }
        });
        accountLi.appendChild(accountLink);

        const catalogueLi = document.createElement('li');
        const catalogueLink = document.createElement('a');
        catalogueLink.href = 'catalogue.html';
        catalogueLink.textContent = 'Catalogue';
        catalogueLi.appendChild(catalogueLink);

        const orderLi = document.createElement('li');
        const orderLink = document.createElement('a');
        orderLink.href = 'order-status.html';
        orderLink.textContent = 'Order';
        orderLi.appendChild(orderLink);

        navLinksContainer.appendChild(homeLi);
        navLinksContainer.appendChild(accountLi);
        navLinksContainer.appendChild(catalogueLi);
        navLinksContainer.appendChild(orderLi);
    }
}

renderNavbar();


cardButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const cardId = e.target.getAttribute('data-card');
        if (cardId) {

            if (cardId === 'catalogue') {
                window.location.href = 'catalogue.html';
                return;
            }
            if (cardId === 'borrow') {
                window.location.href = 'order-status.html';
                return;
            }
            openCard(cardId);
        }
    });
});


cardCloses.forEach(close => {
    close.addEventListener('click', (e) => {
        const cardId = e.target.getAttribute('data-card');
        if (cardId) {
            closeCard(cardId);
        }
    });
});

cards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target === card) {
            card.style.display = 'none';
        }
    });
});


const registerButton = document.getElementById("register-button");
if (registerButton) {
registerButton.addEventListener("click", async () => {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!name || !email || !phone || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
       const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
});

        const data = await response.json();
        alert(data.message);

        if (response.ok && data.user) {
            currentUser = data.user;
            renderNavbar();
            closeCard('register');
            saveCurrentUser();
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong while registering");
    }
});
}


const loginButton = document.getElementById("login-button");
if (loginButton) {
loginButton.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
});

        const data = await response.json();
        alert(data.message);

        if (response.ok && data.user) {
            currentUser = data.user;
            renderNavbar();
            closeCard('login');
            saveCurrentUser();
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong while logging in");
    }
});
}


const profileSaveBtn = document.getElementById('profile-save-button');
const profileDeleteBtn = document.getElementById('profile-delete-button');

function populateProfileForm() {
    if (!currentUser) return;
    const emailEl = document.getElementById('profile-email-display');
    const nameEl = document.getElementById('profile-name');
    const passwordEl = document.getElementById('profile-password');
    if (emailEl) emailEl.textContent = currentUser.email;
    if (nameEl) nameEl.value = currentUser.name || '';
    if (passwordEl) passwordEl.value = '';
}

populateProfileForm();

if (profileSaveBtn) {
    profileSaveBtn.addEventListener('click', async () => {
        if (!currentUser) {
            alert('You must be logged in to update your profile');
            return;
        }

        const name = document.getElementById('profile-name').value.trim();
        const password = document.getElementById('profile-password').value.trim();

        if (!name || !password) {
            alert('Name and password are required');
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, name, password }),
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok && data.user) {
                currentUser = data.user;
                saveCurrentUser();
                renderNavbar();
                closeCard('profile');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong while updating your profile');
        }
    });
}

if (profileDeleteBtn) {
    profileDeleteBtn.addEventListener('click', async () => {
        if (!currentUser) {
            alert('You must be logged in to delete your profile');
            return;
        }

        const confirmDelete = confirm('Are you sure you want to delete your account? This cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch('/api/profile', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email }),
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                currentUser = null;
                saveCurrentUser();
                renderNavbar();
                closeCard('profile');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong while deleting your profile');
        }
    });
}


const searchInput = document.getElementById('find');
const catalogueList = document.getElementById('catalogue-list');
const borrowList = document.getElementById('borrow-list');
const borrowTotalEl = document.getElementById('borrow-total');

const books = [
    {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        isbn: "1234",
        price: 250,
        image: "images/The-Silent-Patient.jpg",
        available: true,
    },
    {
        title: "One of Us Is Lying",
        author: "Karen M. McManus",
        isbn: "5678",
        price: 210,
        image: "images/one of us is lying.webp",
        available: true,
    },
    {
        title: "The Fault in Our Stars",
        author: "John Green",
        isbn: "91011",
        price: 100,
        image: "images/the fault in our stars.jpg",
        available: true,
    },
    {
        title: "Twisted Love",
        author: "Ana Huang",
        isbn: "121314",
        price: 160,
        image: "images/twisted love.webp",
        available: true,
    },
    {
        title: "Becoming",
        author: "Michelle Obama",
        isbn: "151617",
        price: 250,
        image: "images/becoming.webp",
        available: true,
    },
    {
        title: "Twilight",
        author: "Stephenie Meyer",
        isbn: "181920",
        price: 320,
        image: "images/twilight.webp",
        available: true,
    },
];

function loadBookAvailability() {
    try {
        const stored = localStorage.getItem('unavailableBooks');
        if (!stored) return;
        const unavailableIsbns = JSON.parse(stored);
        books.forEach(book => {
            book.available = !unavailableIsbns.includes(book.isbn);
        });
    } catch (e) {
        console.error('Error loading book availability', e);
    }
}

function saveBookAvailability() {
    const unavailableIsbns = books
        .filter(book => book.available === false)
        .map(book => book.isbn);
    localStorage.setItem('unavailableBooks', JSON.stringify(unavailableIsbns));
}

function getBorrowedBooks() {
    return books.filter(book => book.available === false);
}

function renderCatalogue(list) {
    if (!catalogueList) return;
    catalogueList.innerHTML = '';
    list.forEach(book => {
        const div = document.createElement('div');
        div.classList.add('catalogue-book');

        const isAvailable = book.available !== false;

        div.innerHTML = `
            <img src="${book.image}" alt="${book.title} cover">
            <h6>${book.title}</h6>
            <p class="description">${book.author}</p>
            <p class="price">GHS ${book.price}</p>
            <button data-borrow="${book.isbn}" ${isAvailable ? '' : 'disabled'}>
                ${isAvailable ? 'Borrow' : 'Unavailable'}
            </button>
        `;
        catalogueList.appendChild(div);
    });
}

function renderOrderStatus() {
    if (!borrowList || !borrowTotalEl) return;

    const borrowed = getBorrowedBooks();
    borrowList.innerHTML = '';

    let total = 0;
    borrowed.forEach(book => {
        total += book.price;
        const item = document.createElement('div');
        item.classList.add('order-item');
        item.innerHTML = `
            <div class="info">
                <h6>${book.title}</h6>
                <p>GHS ${book.price}</p>
            </div>
            <button data-return="${book.isbn}">Return</button>
        `;
        borrowList.appendChild(item);
    });

    borrowTotalEl.textContent = `Total: GHS ${total}`;
}

function updateHomeAvailability() {
    const homeBooks = document.querySelectorAll('#popular-books .Books');
    homeBooks.forEach(el => {
        const isbn = el.getAttribute('data-isbn');
        const book = books.find(b => b.isbn === isbn);
        if (book && book.available === false) {
            el.classList.add('unavailable');
        } else {
            el.classList.remove('unavailable');
        }
    });
}

loadBookAvailability();
renderCatalogue(books);
renderOrderStatus();
updateHomeAvailability();


if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = books.filter(book =>
            book.title.toLowerCase().includes(value) ||
            book.author.toLowerCase().includes(value) ||
            book.isbn.includes(e.target.value)
        );
        renderCatalogue(filtered);
    });
}


if (catalogueList) {
    catalogueList.addEventListener('click', (e) => {
        const borrowIsbn = e.target.getAttribute('data-borrow');
        if (!borrowIsbn) return;

        const book = books.find(b => b.isbn === borrowIsbn);
        if (!book) return;

        if (book.available === false) {
            alert('This book is currently unavailable.');
            return;
        }


        book.available = false;
        saveBookAvailability();

        fetch('/api/borrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                price: book.price,
            }),
        }).catch(err => {
            console.error('Error saving borrowed book', err);
        });

        renderCatalogue(books);
        updateHomeAvailability();
        renderOrderStatus();
        window.location.href = 'order-status.html';
    });
}

if (borrowList) {
    borrowList.addEventListener('click', (e) => {
        const returnIsbn = e.target.getAttribute('data-return');
        if (!returnIsbn) return;

        const book = books.find(b => b.isbn === returnIsbn);
        if (!book) return;

        book.available = true;
        saveBookAvailability();
        renderCatalogue(books);
        updateHomeAvailability();
        renderOrderStatus();
    });
}
