document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        const url = this.getAttribute('href');

        if (
            url &&
            !url.startsWith('#') &&
            !url.startsWith('mailto:') &&
            !url.startsWith('tel:') &&
            !this.target &&
            this.origin === window.location.origin
        ) {
            e.preventDefault();

            document.body.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = this.href;
            }, 100);
        }
    });
});

const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

const priceUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTmpAZiaTEV9rrEPd1wSGbcE4g3OfzqSYuiINuKEl0JXXchrL7OsKcx0H4IU9J8wpdIQVRhwaLGeAi/pub?gid=0&single=true&output=csv";

async function loadPrice() {
    const tbody = document.querySelector("#price-table-body");

    try {
        const response = await fetch(priceUrl);

        if (!response.ok) {
            throw new Error("Ошибка загрузки прайса");
        }

        const csv = await response.text();

        const result = Papa.parse(csv, {
            skipEmptyLines: true
        });

        tbody.innerHTML = "";

        result.data.forEach(row => {
            const [type, name, price, time] = row;

            if (!name) return;

            const tr = document.createElement("tr");

            if (!type.trim() || type.trim() === "section") {
                tr.classList.add("section__title");

                const td = document.createElement("td");
                td.colSpan = 3;
                td.textContent = name;

                tr.appendChild(td);
            } else {
                [name, price, time].forEach(value => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    tr.appendChild(td);
                });
            }

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Не удалось загрузить прайс:", error);
    }
}

loadPrice();

// MOBILE MENU

const menuButton = document.querySelector('.header__menu');
const headerElement = document.querySelector('header');
const mobileLinks = document.querySelectorAll('.header__mobile-links a');

menuButton.addEventListener('click', () => {
    const isOpen = headerElement.classList.toggle('menu-open');

    menuButton.setAttribute('aria-expanded', isOpen);
    menuButton.setAttribute(
        'aria-label',
        isOpen ? 'Закрыть меню' : 'Открыть меню'
    );
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        headerElement.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        headerElement.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
    }
});