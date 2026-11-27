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
// ...
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

// ...

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



// ...
const container = document.querySelector('.price__container');
const thumb = document.querySelector('.price__scroll__thumb');
const track = document.querySelector('.price__scroll');

let isDragging = false;
let startX = 0;
let startScroll = 0;

function updateScroll() {
    const maxScroll = container.scrollHeight - container.clientHeight;
    const progress = maxScroll > 0 ? container.scrollTop / maxScroll : 0;

    const thumbWidth = container.clientHeight / container.scrollHeight * 100;
    thumb.style.width = `${Math.min(100, thumbWidth)}%`;

    const maxPosition = track.clientWidth - thumb.offsetWidth;
    thumb.style.transform = `translateX(${progress * maxPosition}px)`;
}

// Нажатие на дорожку
track.addEventListener('pointerdown', (e) => {
    if (e.target === thumb) return;

    const rect = track.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const maxPosition = track.clientWidth - thumb.offsetWidth;

    if (maxPosition <= 0) return;

    const progress = Math.max(0, Math.min(1,
        (clickPosition - thumb.offsetWidth / 2) / maxPosition
    ));

    container.scrollTop = progress *
        (container.scrollHeight - container.clientHeight);
});

// Начало перетаскивания
thumb.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startScroll = container.scrollTop;
    thumb.setPointerCapture(e.pointerId);
});

// Перетаскивание
thumb.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const maxPosition = track.clientWidth - thumb.offsetWidth;
    const maxScroll = container.scrollHeight - container.clientHeight;

    if (maxPosition <= 0) return;

    const deltaX = e.clientX - startX;
    container.scrollTop = startScroll + (deltaX / maxPosition) * maxScroll;
});

// Завершение перетаскивания
thumb.addEventListener('pointerup', () => isDragging = false);
thumb.addEventListener('pointercancel', () => isDragging = false);

// Обновление положения
container.addEventListener('scroll', updateScroll);
window.addEventListener('resize', updateScroll);

updateScroll();

// ...

const header = document.querySelector('header');
const home = document.querySelector('.home__home');

let headerTimer;

lenis.on('scroll', ({ scroll }) => {

    if (scroll >= home.offsetHeight) {

        clearTimeout(headerTimer);

        if (!header.classList.contains('fixed')) {
            header.classList.add('fixed');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    header.classList.add('visible');
                });
            });

        } else {
            header.classList.add('visible');
        }

    } else {

        if (header.classList.contains('fixed')) {

            header.classList.remove('visible');

            clearTimeout(headerTimer);

            headerTimer = setTimeout(() => {
                if (window.scrollY < home.offsetHeight) {
                    header.classList.remove('fixed');
                }
            }, 600);
        }
    }
});

// Мобильное меню

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

// Закрытие при выборе раздела

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        headerElement.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
    });
});

// Закрытие по Escape

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        headerElement.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
    }
});
