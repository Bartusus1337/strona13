document.addEventListener('DOMContentLoaded', () => {
    // 1. ROUTER - Sprawdzamy, na której jesteśmy stronie
    
    // Strona główna (Index)
    if (document.querySelector('.scroll-animation-container')) {
        initIndexPage();
    }

    // Symulacja (Demo)
    if (document.getElementById('sim-container')) {
        initDemoPage();
    }

    // Oceny (Rating)
    if (document.getElementById('area')) { // ID kontenera ocen
        initRatingPage();
    }

    // Gra (Game)
    if (document.querySelector('.game-container')) {
        initGamePage();
    }
});

/* =========================================
   LOGIKA: INDEX PAGE (Scroll)
   ========================================= */
function initIndexPage() {
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        const maxScroll = scrollHeight - clientHeight;
        const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;

        document.documentElement.style.setProperty('--scroll-pos', scrollPercent);
    });
}

/* =========================================
   LOGIKA: RATING PAGE (Chaotyczne Oceny)
   ========================================= */
function initRatingPage() {
    const MOUSE_REPULSION_DIST = 180;
    const PEER_REPULSION_DIST = 150;  
    const BASE_SPEED = 4;             
    const MAX_SPEED = 14;             
    const WALL_PADDING = 10;          

    const area = document.getElementById('area');
    const btn5 = document.getElementById('btn-5');
    
    let movers = [];
    let mouseX = -1000, mouseY = -1000;
    let scale5 = 1.0;
    let growDir = 1;

    class Mover {
        constructor(id, startX, startY) {
            this.el = document.getElementById(id);
            this.width = 80;
            this.height = 80;
            this.x = startX;
            this.y = startY;
            this.active = false;
            this.vx = 0;
            this.vy = 0;
        }

        update() {
            const centerX = this.x + this.width/2;
            const centerY = this.y + this.height/2;
            const rect = area.getBoundingClientRect();
            const localMouseX = mouseX - rect.left;
            const localMouseY = mouseY - rect.top;
            const dx = centerX - localMouseX;
            const dy = centerY - localMouseY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (!this.active) {
                this.el.style.left = this.x + 'px';
                this.el.style.top = this.y + 'px';
                if (dist < MOUSE_REPULSION_DIST) {
                    this.active = true;
                    this.vx = (Math.random() - 0.5) * 20; 
                    this.vy = (Math.random() - 0.5) * 20; 
                }
                return;
            }

            const maxX = area.offsetWidth - this.width - WALL_PADDING;
            const maxY = area.offsetHeight - this.height - WALL_PADDING;

            if (this.x <= WALL_PADDING) { this.x = WALL_PADDING; this.vx *= -1; }
            if (this.x >= maxX) { this.x = maxX; this.vx *= -1; }
            if (this.y <= WALL_PADDING) { this.y = WALL_PADDING; this.vy *= -1; }
            if (this.y >= maxY) { this.y = maxY; this.vy *= -1; }

            if (dist < MOUSE_REPULSION_DIST) {
                const force = (MOUSE_REPULSION_DIST - dist) / MOUSE_REPULSION_DIST; 
                this.vx += (dx / dist) * force * 2.5; 
                this.vy += (dy / dist) * force * 2.5;
            }

            movers.forEach(other => {
                if (other === this) return;
                const odx = this.x - other.x;
                const ody = this.y - other.y;
                const odist = Math.sqrt(odx*odx + ody*ody);

                if (odist < PEER_REPULSION_DIST) {
                    const push = (PEER_REPULSION_DIST - odist) / PEER_REPULSION_DIST;
                    this.vx += (odx / odist) * push * 1.5;
                    this.vy += (ody / odist) * push * 1.5;
                    
                    if (!other.active && this.active) {
                        other.active = true;
                        other.vx = this.vx * 0.8;
                        other.vy = this.vy * 0.8;
                    }
                }
            });

            if (Math.random() < 0.05) {
                this.vx += (Math.random() - 0.5) * 4;
                this.vy += (Math.random() - 0.5) * 4;
            }

            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (speed > MAX_SPEED) {
                this.vx = (this.vx / speed) * MAX_SPEED;
                this.vy = (this.vy / speed) * MAX_SPEED;
            }
            if (speed < BASE_SPEED) {
                this.vx *= 1.1;
                this.vy *= 1.1;
            }

            this.x += this.vx;
            this.y += this.vy;

            this.el.style.left = this.x + 'px';
            this.el.style.top = this.y + 'px';
        }
    }

    function animate() {
        movers.forEach(m => m.update());
        scale5 += (0.002 * growDir);
        if (scale5 > 1.3) growDir = -1;
        if (scale5 < 0.9) growDir = 1;
        btn5.style.transform = `translate(-50%, -50%) scale(${scale5})`;
        requestAnimationFrame(animate);
    }

    // Start Rating
    const centerY = window.innerHeight * 0.45; 
    const centerX = window.innerWidth / 2;
    const gap = 120; 

    movers = [
        new Mover('btn-2', centerX - gap - 40, centerY - 40), 
        new Mover('btn-3', centerX - 40, centerY - 40),
        new Mover('btn-4', centerX + gap - 40, centerY - 40)
    ];

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.submitRating = function() {
        document.getElementById('success-modal').classList.add('show');
    }
    
    // Reset przy zmianie rozmiaru
    window.addEventListener('resize', () => {
        // Opcjonalnie: reset pozycji
    });

    animate();
}

/* =========================================
   LOGIKA: DEMO PAGE (Symulacja Magazynu)
   ========================================= */
function initDemoPage() {
    const AISLES = ['A', 'B', 'C', 'D', 'E'];
    const SLOTS_PER_ROW = 10; 
    const DOCK_COUNT = 4;
    const FORKLIFT_COUNT = 4;
    const TICK_RATE = 500; 
    const HIGHWAY_LANE_OFFSET = 20; 
    const AISLE_LANE_OFFSET = 10;   
    const SAFE_DISTANCE = 60;       
    const DOCK_OFFSET_X = 70;       

    const state = {
        running: false,
        interval: null,
        slots: {}, docks: [], forklifts: [],
        stats: { in: 0, out: 0, trucks: 0, currentCargo: 0 },
        totalSlots: AISLES.length * SLOTS_PER_ROW * 2
    };

    // --- SETUP ---
    function buildWarehouse() {
        const container = document.getElementById('warehouse');
        container.innerHTML = '';
        AISLES.forEach((aisleId, idx) => {
            const block = document.createElement('div');
            block.className = 'aisle-block';
            
            const createRackRow = (pos) => {
                const row = document.createElement('div');
                row.className = 'rack-row';
                const startNum = pos === 'top' ? 1 : 11;
                for(let i=0; i<SLOTS_PER_ROW; i++) {
                    const num = startNum + i;
                    const id = `${aisleId}${num}`;
                    const div = document.createElement('div');
                    div.className = 'slot';
                    div.id = `slot-${id}`;
                    div.innerText = id;
                    row.appendChild(div);
                    state.slots[id] = { id, aisle: aisleId, col: i, side: pos, cargo: null, dom: div, reserved: false };
                }
                return row;
            };

            const topRow = createRackRow('top');
            const road = document.createElement('div');
            road.className = 'rack-road';
            road.id = `road-${aisleId}`;
            road.innerHTML = `<span class="road-label">${aisleId}</span>`;
            const botRow = createRackRow('bottom');

            block.appendChild(topRow);
            block.appendChild(road);
            block.appendChild(botRow);
            container.appendChild(block);
        });
    }

    function buildDocks() {
        const container = document.getElementById('docks');
        for(let i=0; i<DOCK_COUNT; i++) {
            const d = document.createElement('div');
            d.className = 'dock';
            d.id = `dock-${i}`;
            d.innerText = `DOK ${i+1}`;
            container.appendChild(d);
            state.docks.push({ id: i, dom: d, truck: null });
        }
    }

    function spawnForklifts() {
        const layer = document.getElementById('vehicle-layer');
        const highway = document.getElementById('highway');
        setTimeout(() => {
            const highwayRect = highway.getBoundingClientRect();
            const containerRect = document.getElementById('sim-container').getBoundingClientRect();
            const highwayCenterX = (highwayRect.left - containerRect.left) + (highwayRect.width / 2);

            for(let i=0; i<FORKLIFT_COUNT; i++) {
                const div = document.createElement('div');
                div.className = 'forklift';
                div.innerHTML = `W${i+1}<div class="forks"></div><div class="forklift-cargo"></div>`;
                layer.appendChild(div);
                const dockDom = document.getElementById(`dock-${i}`);
                const startY = (dockDom.offsetTop + dockDom.offsetHeight/2);
                const startX = highwayCenterX + DOCK_OFFSET_X;

                state.forklifts.push({
                    id: i, dom: div,
                    x: startX, y: startY, rotation: 180,
                    targetX: startX, targetY: startY,
                    state: 'idle', cargo: null, job: null, assignedDock: i,
                    collisionStart: 0, immuneUntil: 0
                });
                updateVisuals(state.forklifts[i]);
            }
        }, 100);
    }

    // --- LOGIC ---
    function loop() {
        if (!state.running) return;
        manageTrucks();
        manageForklifts();
    }

    function manageTrucks() {
        const occupancy = state.stats.currentCargo / state.totalSlots;
        state.docks.forEach(dock => {
            if (!dock.truck && Math.random() > 0.96) {
                let type = 'in';
                if (occupancy > 0.8) type = 'out';
                else if (occupancy > 0.2 && Math.random() > 0.5) type = 'out';
                
                const amount = Math.floor(Math.random() * 15) + 1; 
                const div = document.createElement('div');
                div.className = 'truck'; 
                div.innerHTML = `<div>${type==='in'?'IN':'OUT'}</div><div style="font-size:0.4rem; margin:2px 0;">${amount}szt</div><div class="truck-bar-container"><div class="truck-bar" style="width:0%"></div></div>`;
                dock.dom.appendChild(div);
                setTimeout(() => div.classList.add('docked'), 50);
                dock.truck = { type, targetLoad: amount, currentLoad: 0, dom: div, queue: amount };
                state.stats.trucks++;
                updateStatsUI();
            }
            if (dock.truck && dock.truck.currentLoad === dock.truck.targetLoad) {
                const forklift = state.forklifts[dock.id];
                if (forklift.state === 'idle') {
                    const t = dock.truck;
                    t.dom.classList.remove('docked');
                    setTimeout(() => { if(t.dom.parentNode) t.dom.parentNode.removeChild(t.dom); dock.truck = null; }, 1000);
                }
            }
        });
    }

    function manageForklifts() {
        const highwayDom = document.getElementById('highway');
        if(!highwayDom) return;
        const highwayRect = highwayDom.getBoundingClientRect();
        const containerRect = document.getElementById('sim-container').getBoundingClientRect();
        const highwayCenterX = (highwayRect.left - containerRect.left) + (highwayRect.width / 2);

        state.forklifts.forEach(f => {
            const now = Date.now();
            const isImmune = (now < f.immuneUntil);
            
            if (isImmune) { f.dom.classList.add('ghost'); f.dom.classList.remove('braking'); }
            else { f.dom.classList.remove('ghost'); }

            let collisionDetected = false;
            if (!isImmune) collisionDetected = checkCollision(f);

            if (collisionDetected) {
                if (f.collisionStart === 0) f.collisionStart = now;
                if (now - f.collisionStart > 2000) { 
                    f.immuneUntil = now + 3000; f.collisionStart = 0; f.dom.classList.remove('braking');
                } else {
                    f.dom.classList.add('braking'); return;
                }
            } else {
                f.collisionStart = 0; f.dom.classList.remove('braking');
            }

            const dock = state.docks[f.assignedDock];
            const dockY = (dock.dom.offsetTop + dock.dom.offsetHeight/2);
            const safeDockX = highwayCenterX + DOCK_OFFSET_X;

            if (f.state === 'idle') {
                if (dock.truck && dock.truck.queue > 0) {
                    if (dock.truck.type === 'in') {
                        const slot = findFreeSlot();
                        if (slot) {
                            slot.reserved = true;
                            f.job = { type: 'in', slotId: slot.id, code: Math.floor(1000 + Math.random()*9000) };
                            f.state = 'moving_to_dock'; dock.truck.queue--;
                        }
                    } else {
                        const slot = findOccupiedSlot();
                        if (slot) {
                            slot.reserved = true;
                            f.job = { type: 'out', slotId: slot.id, code: slot.cargo.code };
                            f.state = 'moving_to_slot'; dock.truck.queue--;
                        }
                    }
                } else if (dist(f, safeDockX, dockY) > 5) {
                    f.state = 'returning';
                }
            }
            processMovement(f, highwayCenterX, dock, dockY, safeDockX);
        });
    }

    function checkCollision(me) {
        for (let other of state.forklifts) {
            if (me === other) continue;
            const distance = dist(me, other.x, other.y);
            if (distance < SAFE_DISTANCE) {
                const isVertical = Math.abs(me.y - me.targetY) > Math.abs(me.x - me.targetX);
                if (isVertical) {
                    if (Math.abs(me.x - other.x) < 20) {
                        if ((me.targetY > me.y && other.y > me.y) || (me.targetY < me.y && other.y < me.y)) return true;
                    }
                } else {
                    if (Math.abs(me.y - other.y) < 20) {
                        if ((me.targetX > me.x && other.x > me.x) || (me.targetX < me.x && other.x < me.x)) return true;
                    }
                }
            }
        }
        return false;
    }

    function processMovement(f, highwayCenterX, dock, dockY, safeDockX) {
        if (f.state === 'idle') return;
        const laneDownX = highwayCenterX + HIGHWAY_LANE_OFFSET;
        const laneUpX = highwayCenterX - HIGHWAY_LANE_OFFSET;
        let destX = f.x, destY = f.y;

        if (['moving_to_dock', 'delivering_to_dock', 'returning'].includes(f.state)) {
            const finalDestX = safeDockX, finalDestY = dockY;
            const inWarehouseDeep = f.x < (highwayCenterX - HIGHWAY_LANE_OFFSET - 5);
            if (inWarehouseDeep) { destX = laneDownX; destY = f.y; } 
            else {
                if (Math.abs(f.y - finalDestY) > 10 && f.x < safeDockX - 10) {
                    destX = (finalDestY > f.y) ? laneDownX : laneUpX; destY = finalDestY;
                } else { destX = finalDestX; destY = finalDestY; }
            }
            if (dist(f, finalDestX, finalDestY) < 5) {
                if (f.state === 'moving_to_dock') {
                    f.cargo = f.job.code; f.state = 'delivering_to_slot';
                    dock.truck.currentLoad++; updateTruckBar(dock.truck);
                } else if (f.state === 'delivering_to_dock') {
                    f.cargo = null; state.stats.out++; dock.truck.currentLoad++;
                    updateTruckBar(dock.truck); f.job = null; f.state = 'idle'; updateStatsUI();
                } else if (f.state === 'returning') { f.state = 'idle'; }
            }
        } else if (['moving_to_slot', 'delivering_to_slot'].includes(f.state)) {
            const slot = state.slots[f.job.slotId];
            const roadDom = document.getElementById(`road-${slot.aisle}`);
            const aisleCenterY = (roadDom.parentNode.offsetTop + roadDom.offsetTop + roadDom.offsetHeight/2);
            const aisleLaneIn = aisleCenterY - AISLE_LANE_OFFSET; 
            const aisleLaneOut = aisleCenterY + AISLE_LANE_OFFSET; 
            const slotDom = document.getElementById(`slot-${slot.id}`);
            const slotX = slotDom.offsetLeft + (slotDom.offsetWidth/2);

            if (f.x > highwayCenterX - 30) { 
                if (Math.abs(f.y - aisleCenterY) > 10) {
                    destX = (aisleCenterY > f.y) ? laneDownX : laneUpX; destY = aisleCenterY;
                } else { destX = slotX; destY = aisleLaneIn; }
            } else {
                destX = slotX; destY = (f.state === 'delivering_to_slot' || f.state === 'moving_to_slot') ? aisleLaneIn : aisleLaneOut;
            }
            if (dist(f, slotX, destY) < 5) {
                if (f.state === 'delivering_to_slot') {
                    f.cargo = null; fillSlot(slot.id, f.job.code); state.stats.in++;
                    f.job = null; f.state = 'idle'; updateStatsUI();
                } else {
                    emptySlot(slot.id); f.cargo = f.job.code; f.state = 'delivering_to_dock'; f.y = aisleLaneOut; 
                }
            }
        }
        moveTo(f, destX, destY);
    }

    function moveTo(f, targetX, targetY) {
        f.targetX = targetX; f.targetY = targetY;
        const dx = targetX - f.x, dy = targetY - f.y;
        const distVal = Math.sqrt(dx*dx + dy*dy);
        if (distVal > 0) {
            const speed = 250 / (1000/TICK_RATE); 
            const moveX = (dx / distVal) * speed;
            const moveY = (dy / distVal) * speed;
            if (Math.abs(moveX) > Math.abs(dx)) f.x = targetX; else f.x += moveX;
            if (Math.abs(moveY) > Math.abs(dy)) f.y = targetY; else f.y += moveY;
            if (Math.abs(dx) > Math.abs(dy)) f.rotation = dx > 0 ? 0 : 180;
            else f.rotation = dy > 0 ? 90 : 270;
        }
        updateVisuals(f);
    }

    // Helpers
    function updateVisuals(f) {
        f.dom.style.left = f.x + 'px'; f.dom.style.top = f.y + 'px';
        f.dom.style.transform = `translate(-50%, -50%) rotate(${f.rotation}deg)`;
        if (f.cargo) f.dom.classList.add('has-cargo'); else f.dom.classList.remove('has-cargo');
    }
    function fillSlot(id, code) {
        const s = state.slots[id]; s.cargo = { code }; s.reserved = false;
        s.dom.innerHTML = `<div class="cargo">${code}</div>`; state.stats.currentCargo++;
    }
    function emptySlot(id) {
        const s = state.slots[id]; s.cargo = null; s.reserved = false;
        s.dom.innerHTML = id; state.stats.currentCargo--;
    }
    function findFreeSlot() {
        const keys = Object.keys(state.slots).sort(() => Math.random() - 0.5);
        for(let k of keys) if(!state.slots[k].cargo && !state.slots[k].reserved) return state.slots[k];
        return null;
    }
    function findOccupiedSlot() {
        const keys = Object.keys(state.slots).sort(() => Math.random() - 0.5);
        for(let k of keys) if(state.slots[k].cargo && !state.slots[k].reserved) return state.slots[k];
        return null;
    }
    function fillRandom(n) { for(let i=0; i<n; i++) { const s = findFreeSlot(); if(s) fillSlot(s.id, Math.floor(1000 + Math.random()*9000)); } updateStatsUI(); }
    function dist(f, x, y) { return Math.sqrt(Math.pow(x-f.x,2) + Math.pow(y-f.y,2)); }
    function updateTruckBar(t) { if(!t) return; const pct = (t.currentLoad / t.targetLoad) * 100; t.dom.querySelector('.truck-bar').style.width = pct + '%'; }
    function updateStatsUI() {
        const pct = Math.round((state.stats.currentCargo / state.totalSlots) * 100);
        const capEl = document.getElementById('stat-capacity');
        capEl.innerText = pct + '%';
        if (pct > 80) capEl.classList.add('alert'); else capEl.classList.remove('alert');
        document.getElementById('stat-cargo-count').innerText = state.stats.currentCargo;
        document.getElementById('stat-in').innerText = state.stats.in;
        document.getElementById('stat-out').innerText = state.stats.out;
        document.getElementById('stat-trucks').innerText = state.stats.trucks;
    }

    // Export toggle to global scope for buttons
    window.toggleSim = function(run) {
        state.running = run;
        const btnStart = document.getElementById('btn-start');
        const btnPause = document.getElementById('btn-pause');
        if (run) {
            if (!state.interval) state.interval = setInterval(loop, TICK_RATE);
            btnStart.classList.add('btn-disabled'); btnPause.classList.remove('btn-disabled');
        } else {
            clearInterval(state.interval); state.interval = null;
            btnStart.classList.remove('btn-disabled'); btnPause.classList.add('btn-disabled');
        }
    }

    // Init
    buildWarehouse();
    buildDocks();
    spawnForklifts();
    updateStatsUI();
    fillRandom(30);
}

/* =========================================
   LOGIKA: GAME PAGE (Placeholder)
   ========================================= */
function initGamePage() {
    // Tutaj możesz wkleić logikę gry z pliku game.html
    // Jeśli jej nie masz, skrypt zadziała (pusta funkcja), ale gra nie ruszy.
    console.log("Gra zainicjalizowana");
}
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    const maxScroll = scrollHeight - clientHeight;
    const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;

    document.documentElement.style.setProperty('--scroll-pos', scrollPercent);

    // Dynamiczne sprawdzanie pozycji
    const dzik = document.getElementById('easter-egg-link');
    if (scrollPercent > 0.95) {
        dzik.classList.add('visible');
    } else {
        dzik.classList.remove('visible');
    }
});