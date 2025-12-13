document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('hero-map-container');
    const activeCountSpan = document.getElementById('active-count');
    const energyUsageSpan = document.getElementById('energy-usage');
    const resetBtn = document.getElementById('reset-demo');
    
    const STORAGE_KEY = 'lumina_city_v2_data';
    const NUM_LIGHTS = 20; 
    
    let lightsData = [];

    function initDemo() {
        // Dodaj dekoracyjne "lądy" w tle raz przy starcie
        addDecorativeLands();

        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            lightsData = JSON.parse(storedData);
        } else {
            generateRandomLights();
        }
        renderPins();
        updateStats();
    }

    function addDecorativeLands() {
        // Generuje losowe kształty "kontynentów" w tle
        const positions = [
            { t: '10%', l: '10%', w: '40%', h: '30%' },
            { t: '50%', l: '60%', w: '30%', h: '40%' },
            { t: '60%', l: '15%', w: '25%', h: '25%' }
        ];

        positions.forEach(pos => {
            const land = document.createElement('div');
            land.className = 'map-land';
            land.style.top = pos.t;
            land.style.left = pos.l;
            land.style.width = pos.w;
            land.style.height = pos.h;
            mapContainer.appendChild(land);
        });
    }

    function generateRandomLights() {
        lightsData = [];
        for (let i = 0; i < NUM_LIGHTS; i++) {
            lightsData.push({
                id: i,
                // Marginesy, żeby piny nie były przy samej krawędzi
                x: Math.floor(Math.random() * 80) + 10, 
                y: Math.floor(Math.random() * 80) + 10,
                active: Math.random() < 0.3 // 30% szans, że włączone na start
            });
        }
        saveData();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightsData));
    }

    function renderPins() {
        // Usuń stare piny (zachowaj tło lądu)
        const oldPins = document.querySelectorAll('.map-pin');
        oldPins.forEach(p => p.remove());

        lightsData.forEach(light => {
            const pin = document.createElement('div');
            pin.classList.add('map-pin');
            if (light.active) pin.classList.add('active');
            else pin.classList.add('inactive');
            
            pin.style.left = `${light.x}%`;
            pin.style.top = `${light.y}%`;
            
            pin.addEventListener('click', () => toggleLight(light.id));
            
            mapContainer.appendChild(pin);
        });
    }

    function toggleLight(id) {
        const lightIndex = lightsData.findIndex(l => l.id === id);
        if (lightIndex !== -1) {
            lightsData[lightIndex].active = !lightsData[lightIndex].active;
            saveData();
            renderPins();
            updateStats();
        }
    }

    function updateStats() {
        const activeCount = lightsData.filter(l => l.active).length;
        if(activeCountSpan) activeCountSpan.innerText = activeCount;
        
        const energy = (activeCount * 0.45).toFixed(1); // Większe zużycie dla przykładu
        if(energyUsageSpan) energyUsageSpan.innerText = `${energy} kW`;
    }

    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem(STORAGE_KEY);
            generateRandomLights();
            renderPins();
            updateStats();
        });
    }

    initDemo();
});