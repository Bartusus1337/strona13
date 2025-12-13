document.addEventListener('DOMContentLoaded', () => {
    // Konfiguracja
    const TOTAL_COUNTRIES = 195; // Prawdziwa liczba krajów
    const STORAGE_KEY = 'santa_simple_tracker_v1';
    
    // Elementy DOM
    const mapContainer = document.getElementById('map-wrapper');
    const totalEl = document.getElementById('total-countries');
    const visitedEl = document.getElementById('visited-countries');
    const remainingEl = document.getElementById('remaining-countries');
    const resetBtn = document.getElementById('reset-btn');

    let countriesData = [];

    function init() {
        // Dekoracja mapy (kontynenty)
        renderContinents();

        // Ładowanie danych
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            countriesData = JSON.parse(stored);
            // Zabezpieczenie: jeśli zmieniliśmy liczbę krajów w kodzie, zresetuj
            if (countriesData.length !== TOTAL_COUNTRIES) generateData();
        } else {
            generateData();
        }

        renderMapPoints();
        updateUI();
    }

    function generateData() {
        countriesData = [];
        for (let i = 0; i < TOTAL_COUNTRIES; i++) {
            countriesData.push({
                id: i,
                // Generujemy pozycje tak, aby mniej więcej przypominały mapę świata
                // (unikamy krawędzi i staramy się grupować - prosta symulacja)
                x: Math.random() * 90 + 5, // 5-95% szerokości
                y: Math.random() * 80 + 10, // 10-90% wysokości
                visited: false
            });
        }
        save();
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(countriesData));
    }

    function renderContinents() {
        // Proste kształty w tle, żeby mapa nie była pusta
        const shapes = [
            { w: '25%', h: '30%', t: '20%', l: '10%' }, // Ameryka Płn
            { w: '20%', h: '40%', t: '55%', l: '25%' }, // Ameryka Płd
            { w: '30%', h: '40%', t: '20%', l: '55%' }, // Eurazja
            { w: '20%', h: '30%', t: '50%', l: '45%' }, // Afryka
            { w: '15%', h: '15%', t: '70%', l: '80%' }  // Australia
        ];

        shapes.forEach(s => {
            const el = document.createElement('div');
            el.className = 'continent';
            el.style.width = s.w;
            el.style.height = s.h;
            el.style.top = s.t;
            el.style.left = s.l;
            // Losowy kształt "bloba"
            el.style.borderRadius = `${rnd(30,70)}% ${rnd(30,70)}% ${rnd(30,70)}% ${rnd(30,70)}%`;
            mapContainer.appendChild(el);
        });
    }

    function renderMapPoints() {
        // Czyścimy tylko kropki, nie tło
        const oldDots = document.querySelectorAll('.country-dot');
        oldDots.forEach(d => d.remove());

        countriesData.forEach(country => {
            const dot = document.createElement('div');
            dot.className = 'country-dot';
            if (country.visited) dot.classList.add('visited');
            
            dot.style.left = `${country.x}%`;
            dot.style.top = `${country.y}%`;
            dot.title = `Kraj #${country.id + 1}`; // Tooltip

            dot.addEventListener('click', () => toggleCountry(country.id));
            
            mapContainer.appendChild(dot);
        });
    }

    function toggleCountry(id) {
        const country = countriesData.find(c => c.id === id);
        if (country) {
            country.visited = !country.visited;
            save();
            renderMapPoints();
            updateUI();
        }
    }

    function updateUI() {
        const visitedCount = countriesData.filter(c => c.visited).length;
        
        totalEl.innerText = TOTAL_COUNTRIES;
        visitedEl.innerText = visitedCount;
        remainingEl.innerText = TOTAL_COUNTRIES - visitedCount;
    }

    function rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Reset button
    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            if(confirm("Zresetować wszystkie odwiedzone kraje?")) {
                localStorage.removeItem(STORAGE_KEY);
                generateData();
                renderMapPoints();
                updateUI();
            }
        });
    }

    init();
});