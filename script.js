document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');

    function populateNav() {
        const nav = document.getElementById('nav-links');
        if (!nav) return;

        const currentUser = localStorage.getItem('userEmail');
        const items = [
            { text: 'Home', href: 'index.html' },
            { text: 'Account', card: 'login' },
            { text: 'Catalogue', href: 'catalogue.html' }
        ];

        if (currentUser) {
            items.splice(2, 0, { text: 'Profile', href: 'profile.html' });
            items.push({ text: 'Order Status', href: 'order-status.html' });
            items.push({ text: 'Logout', id: 'nav-logout' });
        }

        nav.innerHTML = items.map(it => {
            if (it.card) return `<li><a href="#" data-card="${it.card}">${it.text}</a></li>`;
            if (it.id) return `<li><a href="#" id="${it.id}">${it.text}</a></li>`;
            return `<li><a href="${it.href}">${it.text}</a></li>`;
        }).join('');
    }

    populateNav();

    function showCard(name) {
        const el = document.getElementById(`${name}-card`);
        if (el) el.style.display = 'flex';
    }
    function hideCard(name) {
        const el = document.getElementById(`${name}-card`);
        if (el) el.style.display = 'none';
    }

    if (location.hash) {
        const h = location.hash.replace('#', '');
        showCard(h);
    }

    document.querySelectorAll('.close').forEach(c => {
        c.addEventListener('click', () => hideCard(c.dataset.card));
    });

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-card]');
        if (trigger) {
            e.preventDefault();
            const card = trigger.dataset.card;
            const cardEl = document.getElementById(`${card}-card`);
            if (cardEl) showCard(card);
            else window.location.href = `index.html#${card}`;
            return;
        }

        if (e.target.id === 'nav-logout') {
            e.preventDefault();
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
            return;
        }
    });

    const regBtn = document.getElementById('register-button');
    if (regBtn) {
        regBtn.addEventListener('click', () => {
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role')?.value || 'user';

            if (!email || !password) return alert('Please provide email and password');

            fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password, role })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || 'Registered');
                    if (data.success || (data.message && data.message.toLowerCase().includes('success'))) {
                        localStorage.setItem('userEmail', email);
                        hideCard('register');
                        populateNav();
                    }
                })
                .catch(err => console.error(err));
        });
    }

    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            if (!email || !password) return alert('Please provide email and password');

            fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || 'Logged in');
                    if (data.success || (data.message && data.message.toLowerCase().includes('success'))) {
                        localStorage.setItem('userEmail', email);
                        hideCard('login');
                        window.location.href = 'profile.html';
                    }
                })
                .catch(err => console.error(err));
        });
    }

    const catalogueList = document.getElementById('catalogue-list');
    if (catalogueList) {
        fetch('http://localhost:5000/api/books')
            .then(res => res.json())
            .then(books => {
                const staticCards = Array.from(catalogueList.querySelectorAll('.catalogue-book'));
                const staticTitles = staticCards.map(c => c.querySelector('h6')?.textContent.trim()).filter(Boolean);
                const fetchedTitles = books.map(b => (b.title || '').trim());

                const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

                if (staticTitles.length && arraysEqual(staticTitles, fetchedTitles)) {
                    staticCards.forEach((card, idx) => {
                        const book = books[idx];
                        const btn = card.querySelector('.borrow-btn');
                        if (btn) {
                            btn.dataset.id = book.id || btn.dataset.id;
                            if (book.title) btn.dataset.title = book.title;
                            if (book.author) btn.dataset.author = book.author;
                            if (book.isbn) btn.dataset.isbn = book.isbn;
                            if (book.price) btn.dataset.price = book.price;
                        } else {
                            const details = card.querySelector('.details');
                            if (details) {
                                const b = document.createElement('button');
                                b.className = 'borrow-btn';
                                b.dataset.id = book.id || '';
                                b.dataset.title = book.title || '';
                                b.dataset.author = book.author || '';
                                b.dataset.isbn = book.isbn || '';
                                b.dataset.price = book.price || '';
                                b.textContent = 'Borrow';
                                details.appendChild(b);
                            }
                        }
                    });
                    return;
                }

                catalogueList.innerHTML = ''; 
                books.forEach(book => {
                    const bookDiv = document.createElement('div');
                    bookDiv.classList.add('catalogue-book');

                    let coverImg = book.cover || ''; 
                    if (!coverImg) {
                        const match = staticCards.find(c => c.querySelector('h6')?.textContent.trim() === (book.title || '').trim());
                        coverImg = match?.querySelector('img')?.src || '';
                    }
                    if (!coverImg) coverImg = 'images/bestseller.avif';

                    bookDiv.innerHTML = `\n                        <img src="${coverImg}" alt="${(book.title || '').replace(/\"/g, '')} cover">\n                        <div class="details">\n                          <h6>${book.title}</h6>\n                          <p class="description">${book.description || ''}</p>\n                          <p class="price">GHS ${book.price}</p>\n                          <button class="borrow-btn" data-id="${book.id}" data-title="${book.title}" data-author="${book.author || ''}" data-isbn="${book.isbn || ''}" data-price="${book.price}">Borrow</button>\n                        </div>`;
                    catalogueList.appendChild(bookDiv);
                });
            })
            .catch(err => console.error(err));

        const findInput = document.getElementById('find');
        if (findInput) {
            findInput.addEventListener('input', () => {
                const q = findInput.value.trim().toLowerCase();
                document.querySelectorAll('#catalogue-list .catalogue-book').forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(q) ? '' : 'none';
                });
            });
        }
    }

    const profilePage = document.getElementById('profile-page');
    if (profilePage && userEmail) {
        const nameInput = document.getElementById('profile-name');
        const passwordInput = document.getElementById('profile-password');
        const emailDisplay = document.getElementById('profile-email-display');
        emailDisplay.textContent = userEmail;

        document.getElementById('profile-save-button').addEventListener('click', () => {
            fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, name: nameInput.value, password: passwordInput.value || undefined })
            })
                .then(res => res.json())
                .then(data => alert(data.message))
                .catch(err => console.error(err));
        });

        document.getElementById('profile-delete-button').addEventListener('click', () => {
            if (!confirm('Are you sure you want to delete your account?')) return;
            fetch('http://localhost:5000/api/profile', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    localStorage.removeItem('userEmail');
                    window.location.href = '/';
                })
                .catch(err => console.error(err));
        });
    }

    const borrowList = document.getElementById('borrow-list');
    if (borrowList) {
        if (!userEmail) return window.location.href = 'index.html';
        function loadBorrows() {
            fetch(`http://localhost:5000/api/borrow?user_email=${encodeURIComponent(userEmail)}`)
                .then(res => res.json())
                .then(data => {
                    borrowList.innerHTML = '';
                    let total = 0;
                    data.forEach(item => {
                        total += Number(item.price || 0);
                        const div = document.createElement('div');
                        div.className = 'order-item';
                        div.innerHTML = `
                            <div class="info"><h6>${item.title}</h6><p>${item.author || ''} — ${item.isbn || ''}</p></div>
                            <div><button class="return-btn" data-borrow-id="${item.id}">Return</button></div>`;
                        borrowList.appendChild(div);
                    });
                    const totalEl = document.getElementById('borrow-total');
                    if (totalEl) totalEl.textContent = `Total: GHS ${total}`;
                })
                .catch(err => console.error(err));
        }
        loadBorrows();
    }

    document.addEventListener('click', (e) => {
        const borrowBtn = e.target.closest('.borrow-btn');
        if (borrowBtn) {
            const logged = localStorage.getItem('userEmail');
            if (!logged) return alert('Please log in to borrow books!');
            const book_id = borrowBtn.dataset.id || borrowBtn.dataset.bookId || borrowBtn.dataset.isbn;
            const payload = book_id ? { book_id, user_email: logged } : { title: borrowBtn.dataset.title, author: borrowBtn.dataset.author, isbn: borrowBtn.dataset.isbn, price: borrowBtn.dataset.price, user_email: logged };

            fetch('http://localhost:5000/api/borrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || 'Request sent');
                    const ok = (data.message && data.message.toLowerCase().includes('success')) || data.success;
                    if (ok) {
                        borrowBtn.disabled = true;
                        borrowBtn.textContent = 'Unavailable';
                        const card = borrowBtn.closest('.catalogue-book') || borrowBtn.closest('.Books');
                        if (card) card.classList.add('unavailable');
                    }
                })
                .catch(err => console.error(err));
            return;
        }

        const returnBtn = e.target.closest('.return-btn');
        if (returnBtn) {
            if (!confirm('Return this book?')) return;
            const borrowId = returnBtn.dataset.borrowId;
            const logged = localStorage.getItem('userEmail');
            fetch('http://localhost:5000/api/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ borrow_id: borrowId, user_email: logged })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message || 'Returned');
                    const borrowListEl = document.getElementById('borrow-list');
                    if (borrowListEl) {
                        fetch(`http://localhost:5000/api/borrow?user_email=${encodeURIComponent(logged)}`)
                            .then(res => res.json())
                            .then(items => {
                                borrowListEl.innerHTML = '';
                                let total = 0;
                                items.forEach(item => {
                                    total += Number(item.price || 0);
                                    const div = document.createElement('div');
                                    div.className = 'order-item';
                                    div.innerHTML = `
                                        <div class="info"><h6>${item.title}</h6><p>${item.author || ''} — ${item.isbn || ''}</p></div>
                                        <div><button class="return-btn" data-borrow-id="${item.id}">Return</button></div>`;
                                    borrowListEl.appendChild(div);
                                });
                                const totalEl = document.getElementById('borrow-total');
                                if (totalEl) totalEl.textContent = `Total: GHS ${total}`;
                            });
                    }
                })
                .catch(err => console.error(err));
            return;
        }
    });
});
