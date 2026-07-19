/* =========================================
   法拉第科學營 — 互動學習教室 Main JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundParticles();
    initNavigation();
    initScrollReveal();
    initElectrolysisDemo();
    initSemiconductorIntroDemo();
    initMotorDemo();
    initGeneratorDemo();
    initSemiconductorProcessDemo();
});

/* =============================================
   BACKGROUND PARTICLES
   ============================================= */
function initBackgroundParticles() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.5 ? 190 : 270; // blue or purple
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* =============================================
   NAVIGATION
   ============================================= */
function initNavigation() {
    const nav = document.getElementById('main-nav');
    const links = document.querySelectorAll('.nav-link');
    const progressBar = document.getElementById('scroll-progress');
    const sections = ['hero', 'day1', 'day2', 'day3', 'day4', 'day5'];

    window.addEventListener('scroll', () => {
        // Nav background
        nav.classList.toggle('scrolled', window.scrollY > 50);

        // Progress bar
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        progressBar.style.width = `${Math.min(scrollPercent * 100, 100)}%`;

        // Active link
        let current = 'hero';
        for (const id of sections) {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= 200) {
                current = id;
            }
        }
        links.forEach(link => {
            link.classList.toggle('active', link.dataset.section === current);
        });
    });

    // Smooth scroll for nav links
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.section);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.concept-card, .demo-section, .takeaway-card').forEach(el => {
        observer.observe(el);
    });
}

/* =============================================
   DAY 1: ELECTROLYSIS SIMULATION
   ============================================= */
function initElectrolysisDemo() {
    const canvas = document.getElementById('electrolysis-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('electrolysis-overlay');
    const toggleBtn = document.getElementById('electrolysis-toggle');
    const voltageSlider = document.getElementById('voltage-slider');
    const voltageValue = document.getElementById('voltage-value');
    const modeToggle = document.getElementById('electrolysis-mode-toggle');
    const legend = document.getElementById('electrolysis-legend');

    let running = false;
    let mode = 'electrolysis'; // 'electrolysis' or 'electroplating'
    let voltage = 5;
    let ions = [];
    let bubbles = [];
    let deposited = []; // for electroplating
    let animId;

    const W = canvas.width;
    const H = canvas.height;

    // Electrode positions
    const anodeX = W * 0.2;
    const cathodeX = W * 0.8;
    const electrodeTop = H * 0.2;
    const electrodeBottom = H * 0.8;
    const liquidTop = H * 0.25;
    const liquidBottom = H * 0.9;

    function createIons(count) {
        ions = [];
        for (let i = 0; i < count; i++) {
            const positive = i < count / 2;
            ions.push({
                x: anodeX + Math.random() * (cathodeX - anodeX),
                y: liquidTop + Math.random() * (liquidBottom - liquidTop),
                vx: 0,
                vy: 0,
                positive: positive,
                radius: positive ? 8 : 10,
                label: mode === 'electrolysis'
                    ? (positive ? 'H⁺' : 'OH⁻')
                    : (positive ? 'Cu²⁺' : 'SO₄²⁻'),
                arrived: false
            });
        }
    }

    function updateLegend() {
        if (mode === 'electrolysis') {
            legend.innerHTML = `
                <div class="legend-item"><span class="legend-dot" style="background:#ff6b6b"></span> 正離子 (H⁺)</div>
                <div class="legend-item"><span class="legend-dot" style="background:#4ecdc4"></span> 負離子 (OH⁻)</div>
                <div class="legend-item"><span class="legend-dot" style="background:#ffe66d"></span> 氣泡 (H₂/O₂)</div>
            `;
        } else {
            legend.innerHTML = `
                <div class="legend-item"><span class="legend-dot" style="background:#ff9f43"></span> 銅離子 (Cu²⁺)</div>
                <div class="legend-item"><span class="legend-dot" style="background:#4ecdc4"></span> 硫酸根 (SO₄²⁻)</div>
                <div class="legend-item"><span class="legend-dot" style="background:#ffd700"></span> 鍍上的銅</div>
            `;
        }
    }

    // Mode toggle
    modeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modeToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            updateLegend();
            deposited = [];
            createIons(30);
        });
    });

    // Voltage slider
    voltageSlider.addEventListener('input', () => {
        voltage = parseInt(voltageSlider.value);
        voltageValue.textContent = `${voltage}V`;
    });

    // Toggle button
    toggleBtn.addEventListener('click', () => {
        running = !running;
        if (running) {
            overlay.classList.add('hidden');
            toggleBtn.querySelector('.btn-icon').textContent = '⏹';
            toggleBtn.querySelector('.btn-text').textContent = '停止電源';
            toggleBtn.classList.add('active');
            createIons(30);
            bubbles = [];
            deposited = [];
            animate();
        } else {
            toggleBtn.querySelector('.btn-icon').textContent = '▶';
            toggleBtn.querySelector('.btn-text').textContent = '啟動電源';
            toggleBtn.classList.remove('active');
            cancelAnimationFrame(animId);
        }
    });

    function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        drawSetup();
        updateIons();
        drawIons();
        updateBubbles();
        drawBubbles();
        if (mode === 'electroplating') drawDeposited();
        drawLabels();
        animId = requestAnimationFrame(animate);
    }

    function drawSetup() {
        // Background - beaker
        ctx.fillStyle = 'rgba(10, 30, 60, 0.6)';
        ctx.fillRect(0, 0, W, H);

        // Liquid
        const gradient = ctx.createLinearGradient(0, liquidTop, 0, liquidBottom);
        if (mode === 'electrolysis') {
            gradient.addColorStop(0, 'rgba(60, 140, 200, 0.3)');
            gradient.addColorStop(1, 'rgba(40, 100, 160, 0.5)');
        } else {
            gradient.addColorStop(0, 'rgba(80, 160, 200, 0.3)');
            gradient.addColorStop(1, 'rgba(60, 120, 180, 0.5)');
        }
        ctx.fillStyle = gradient;
        // Beaker shape
        ctx.beginPath();
        ctx.moveTo(W * 0.08, liquidTop);
        ctx.lineTo(W * 0.92, liquidTop);
        ctx.lineTo(W * 0.9, liquidBottom);
        ctx.lineTo(W * 0.1, liquidBottom);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Beaker outline
        ctx.beginPath();
        ctx.moveTo(W * 0.08, H * 0.15);
        ctx.lineTo(W * 0.08, liquidBottom);
        ctx.lineTo(W * 0.92, liquidBottom);
        ctx.lineTo(W * 0.92, H * 0.15);
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Anode (+)
        const anodeGrad = ctx.createLinearGradient(anodeX - 8, 0, anodeX + 8, 0);
        anodeGrad.addColorStop(0, '#666');
        anodeGrad.addColorStop(0.5, '#999');
        anodeGrad.addColorStop(1, '#666');
        ctx.fillStyle = anodeGrad;
        ctx.fillRect(anodeX - 8, electrodeTop, 16, electrodeBottom - electrodeTop);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(anodeX - 8, electrodeTop, 16, electrodeBottom - electrodeTop);

        // Cathode (-)
        const cathodeGrad = ctx.createLinearGradient(cathodeX - 8, 0, cathodeX + 8, 0);
        cathodeGrad.addColorStop(0, '#555');
        cathodeGrad.addColorStop(0.5, '#888');
        cathodeGrad.addColorStop(1, '#555');
        ctx.fillStyle = cathodeGrad;
        ctx.fillRect(cathodeX - 8, electrodeTop, 16, electrodeBottom - electrodeTop);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(cathodeX - 8, electrodeTop, 16, electrodeBottom - electrodeTop);

        // Battery on top
        const battX = W * 0.5;
        const battY = H * 0.08;
        // Wire from anode to battery
        ctx.beginPath();
        ctx.moveTo(anodeX, electrodeTop);
        ctx.lineTo(anodeX, battY);
        ctx.lineTo(battX - 30, battY);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Wire from battery to cathode
        ctx.beginPath();
        ctx.moveTo(battX + 30, battY);
        ctx.lineTo(cathodeX, battY);
        ctx.lineTo(cathodeX, electrodeTop);
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Battery body
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(battX - 30, battY - 15, 60, 30);
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 2;
        ctx.strokeRect(battX - 30, battY - 15, 60, 30);
        // Battery terminal
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(battX - 30, battY - 8, 4, 16);
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(battX + 26, battY - 8, 4, 16);

        // + - labels on electrodes
        ctx.font = 'bold 20px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('+', anodeX, electrodeTop - 10);
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText('−', cathodeX, electrodeTop - 10);

        // Electrode labels
        ctx.font = '14px "Noto Sans TC"';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('陽極', anodeX, liquidBottom + 25);
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText('陰極', cathodeX, liquidBottom + 25);

        // Voltage display
        ctx.font = 'bold 14px Outfit';
        ctx.fillStyle = '#ffe66d';
        ctx.fillText(`${voltage}V`, battX, battY + 5);

        // Current flow arrows along wires
        const t = Date.now() / 500;
        const arrowCount = 5;
        ctx.fillStyle = '#ffe66d';
        for (let i = 0; i < arrowCount; i++) {
            const phase = (t + i / arrowCount) % 1;
            // Top wire - left side
            const ax1 = anodeX + (battX - 30 - anodeX) * phase;
            drawArrow(ctx, ax1, battY, 6, 0);
            // Top wire - right side
            const ax2 = battX + 30 + (cathodeX - battX - 30) * phase;
            drawArrow(ctx, ax2, battY, 6, 0);
        }
    }

    function drawArrow(ctx, x, y, size, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size / 2, -size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function updateIons() {
        const speed = voltage * 0.15;
        ions.forEach(ion => {
            if (ion.arrived) return;

            if (ion.positive) {
                // Move toward cathode (−)
                ion.vx = speed * 0.5 + Math.random() * 0.3;
                if (ion.x >= cathodeX - 20) {
                    ion.arrived = true;
                    if (mode === 'electroplating') {
                        deposited.push({ x: cathodeX - 10, y: ion.y, size: 4 });
                    } else {
                        // Create bubble
                        bubbles.push({ x: cathodeX + Math.random() * 10 - 5, y: ion.y, radius: 3, vy: -1 - Math.random() });
                    }
                    // Reset ion
                    setTimeout(() => {
                        ion.x = anodeX + 30 + Math.random() * (cathodeX - anodeX - 60);
                        ion.y = liquidTop + 20 + Math.random() * (liquidBottom - liquidTop - 40);
                        ion.arrived = false;
                    }, 500 + Math.random() * 1000);
                }
            } else {
                // Move toward anode (+)
                ion.vx = -speed * 0.5 - Math.random() * 0.3;
                if (ion.x <= anodeX + 20) {
                    ion.arrived = true;
                    bubbles.push({ x: anodeX + Math.random() * 10 - 5, y: ion.y, radius: 3, vy: -1 - Math.random() });
                    setTimeout(() => {
                        ion.x = anodeX + 30 + Math.random() * (cathodeX - anodeX - 60);
                        ion.y = liquidTop + 20 + Math.random() * (liquidBottom - liquidTop - 40);
                        ion.arrived = false;
                    }, 500 + Math.random() * 1000);
                }
            }

            ion.vy = (Math.random() - 0.5) * 0.5;
            ion.x += ion.vx;
            ion.y += ion.vy;

            // Clamp to liquid area
            ion.y = Math.max(liquidTop + 10, Math.min(liquidBottom - 10, ion.y));
        });
    }

    function drawIons() {
        ions.forEach(ion => {
            if (ion.arrived) return;
            ctx.beginPath();
            ctx.arc(ion.x, ion.y, ion.radius, 0, Math.PI * 2);
            if (ion.positive) {
                ctx.fillStyle = mode === 'electrolysis' ? '#ff6b6b' : '#ff9f43';
                ctx.shadowColor = mode === 'electrolysis' ? '#ff6b6b' : '#ff9f43';
            } else {
                ctx.fillStyle = '#4ecdc4';
                ctx.shadowColor = '#4ecdc4';
            }
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label
            ctx.font = 'bold 9px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(ion.label, ion.x, ion.y);
        });
    }

    function updateBubbles() {
        bubbles.forEach(b => {
            b.y += b.vy;
            b.x += (Math.random() - 0.5) * 0.5;
            b.radius = Math.max(1, b.radius - 0.005);
        });
        bubbles = bubbles.filter(b => b.y > liquidTop - 20);
    }

    function drawBubbles() {
        bubbles.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 230, 109, 0.5)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 230, 109, 0.8)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });
    }

    function drawDeposited() {
        deposited.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    function drawLabels() {
        // Mode label
        ctx.font = 'bold 16px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        if (mode === 'electrolysis') {
            ctx.fillText('⚗️ 電解水實驗', W / 2, H * 0.18);
        } else {
            ctx.fillText('🪙 電鍍實驗（銅鍍到陰極）', W / 2, H * 0.18);
        }

        // Info text
        ctx.font = '12px "Noto Sans TC"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        if (mode === 'electrolysis') {
            ctx.fillText('H⁺ → 陰極（產生 H₂ 氣泡）  |  OH⁻ → 陽極（產生 O₂ 氣泡）', W / 2, liquidBottom + 50);
        } else {
            ctx.fillText('Cu²⁺ 離子在陰極沉積成金屬銅（金色點點）', W / 2, liquidBottom + 50);
        }
    }
}

/* =============================================
   DAY 2: SEMICONDUCTOR INTRO (Conductor vs Semiconductor vs Insulator)
   ============================================= */
function initSemiconductorIntroDemo() {
    const canvas = document.getElementById('semiconductor-intro-canvas');
    const ctx = canvas.getContext('2d');
    const tempSlider = document.getElementById('temp-slider');
    const tempValue = document.getElementById('temp-value');
    const voltSlider = document.getElementById('semi-voltage-slider');
    const voltValue = document.getElementById('semi-voltage-value');

    const W = canvas.width;
    const H = canvas.height;

    let temp = 25;
    let volt = 0;

    // Three material columns
    const materials = [
        { name: '銅 (導體)', x: W * 0.17, color: '#ffd700', electrons: [], conductivity: 'always' },
        { name: '矽 (半導體)', x: W * 0.5, color: '#7c5cbf', electrons: [], conductivity: 'controlled' },
        { name: '橡膠 (絕緣體)', x: W * 0.83, color: '#666666', electrons: [], conductivity: 'never' }
    ];

    const colW = W * 0.25;
    const barY = H * 0.35;
    const barH = H * 0.35;

    function initElectrons() {
        materials.forEach(mat => {
            mat.electrons = [];
            const count = 15;
            for (let i = 0; i < count; i++) {
                mat.electrons.push({
                    x: mat.x - colW / 2 + 15 + Math.random() * (colW - 30),
                    y: barY + 15 + Math.random() * (barH - 30),
                    vx: 0,
                    vy: 0,
                    baseX: 0,
                    baseY: 0
                });
            }
            mat.electrons.forEach(e => { e.baseX = e.x; e.baseY = e.y; });
        });
    }
    initElectrons();

    tempSlider.addEventListener('input', () => {
        temp = parseInt(tempSlider.value);
        tempValue.textContent = `${temp}°C`;
    });

    voltSlider.addEventListener('input', () => {
        volt = parseInt(voltSlider.value);
        voltValue.textContent = `${volt}V`;
    });

    function getMovement(mat) {
        if (mat.conductivity === 'always') {
            // Conductor: always moves, more with voltage
            return { drift: Math.max(0.5, volt * 0.8), random: 1 + temp * 0.02 };
        } else if (mat.conductivity === 'controlled') {
            // Semiconductor: needs voltage or heat to conduct
            const activated = (volt > 2 || temp > 60);
            const factor = Math.max(0, (volt - 1) * 0.3 + (temp - 25) * 0.015);
            return { drift: activated ? factor : 0, random: activated ? 0.5 + factor * 0.3 : 0.1 };
        } else {
            // Insulator: barely moves
            return { drift: 0, random: 0.1 };
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
        ctx.fillRect(0, 0, W, H);

        materials.forEach((mat, mi) => {
            const movement = getMovement(mat);
            const leftX = mat.x - colW / 2;

            // Material bar background
            const grad = ctx.createLinearGradient(leftX, barY, leftX + colW, barY);
            grad.addColorStop(0, mat.color + '33');
            grad.addColorStop(0.5, mat.color + '55');
            grad.addColorStop(1, mat.color + '33');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(leftX, barY, colW, barH, 8);
            ctx.fill();
            ctx.strokeStyle = mat.color + '88';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Material name
            ctx.font = 'bold 16px "Noto Sans TC"';
            ctx.textAlign = 'center';
            ctx.fillStyle = mat.color;
            ctx.fillText(mat.name, mat.x, barY - 15);

            // Conductivity status
            let status, statusColor;
            if (mat.conductivity === 'always') {
                status = '✅ 導電中';
                statusColor = '#2ed573';
            } else if (mat.conductivity === 'controlled') {
                const on = (volt > 2 || temp > 60);
                status = on ? '✅ 導電中' : '🔒 不導電';
                statusColor = on ? '#2ed573' : '#ff6b6b';
            } else {
                status = '🔒 不導電';
                statusColor = '#ff6b6b';
            }
            ctx.font = 'bold 14px "Noto Sans TC"';
            ctx.fillStyle = statusColor;
            ctx.fillText(status, mat.x, barY + barH + 30);

            // Current flow meter
            const currentLevel = movement.drift;
            const meterY = barY + barH + 50;
            const meterW = colW * 0.7;
            const meterH = 8;
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.roundRect(mat.x - meterW / 2, meterY, meterW, meterH, 4);
            ctx.fill();
            const fillW = Math.min(currentLevel / 5 * meterW, meterW);
            if (fillW > 0) {
                const meterGrad = ctx.createLinearGradient(mat.x - meterW / 2, 0, mat.x - meterW / 2 + fillW, 0);
                meterGrad.addColorStop(0, '#00d4ff');
                meterGrad.addColorStop(1, '#a855f7');
                ctx.fillStyle = meterGrad;
                ctx.beginPath();
                ctx.roundRect(mat.x - meterW / 2, meterY, fillW, meterH, 4);
                ctx.fill();
            }
            ctx.font = '11px Outfit';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('電流強度', mat.x, meterY + 22);

            // Update and draw electrons
            mat.electrons.forEach(e => {
                e.vx = movement.drift * (volt > 0 ? 1 : 0) + (Math.random() - 0.5) * movement.random;
                e.vy = (Math.random() - 0.5) * movement.random;
                e.x += e.vx;
                e.y += e.vy;

                // Wrap horizontally within column
                if (e.x > leftX + colW - 10) e.x = leftX + 10;
                if (e.x < leftX + 10) e.x = leftX + colW - 10;
                e.y = Math.max(barY + 10, Math.min(barY + barH - 10, e.y));

                // Draw electron
                ctx.beginPath();
                ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
                const alpha = 0.5 + Math.min(movement.drift + movement.random, 3) * 0.15;
                ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
                ctx.shadowColor = '#00d4ff';
                ctx.shadowBlur = movement.drift > 0.5 ? 8 : 3;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Trail for fast electrons
                if (movement.drift > 1) {
                    ctx.beginPath();
                    ctx.moveTo(e.x, e.y);
                    ctx.lineTo(e.x - e.vx * 3, e.y - e.vy * 3);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${alpha * 0.3})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        });

        // Title
        ctx.font = 'bold 14px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('調整溫度和電壓，觀察電子在不同材料中的行為', W / 2, 25);

        // Electron legend
        ctx.font = '11px Outfit';
        ctx.fillStyle = '#00d4ff';
        ctx.textAlign = 'left';
        ctx.beginPath();
        ctx.arc(15, H - 15, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('= 電子 (e⁻)', 25, H - 12);

        requestAnimationFrame(draw);
    }
    draw();
}

/* =============================================
   DAY 3: MOTOR SIMULATION
   ============================================= */
function initMotorDemo() {
    const canvas = document.getElementById('motor-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('motor-overlay');
    const toggleBtn = document.getElementById('motor-toggle');
    const currentSlider = document.getElementById('motor-current');
    const currentValue = document.getElementById('motor-current-value');
    const magnetSlider = document.getElementById('motor-magnet');
    const magnetValue = document.getElementById('motor-magnet-value');
    const showFieldCb = document.getElementById('show-field-lines');
    const showForceCb = document.getElementById('show-force');

    const W = canvas.width;
    const H = canvas.height;
    let running = false;
    let angle = 0;
    let angularVelocity = 0;
    let current = 5;
    let magnetStrength = 5;

    currentSlider.addEventListener('input', () => {
        current = parseInt(currentSlider.value);
        currentValue.textContent = `${current}A`;
    });

    magnetSlider.addEventListener('input', () => {
        magnetStrength = parseInt(magnetSlider.value);
        magnetValue.textContent = `${magnetStrength}T`;
    });

    toggleBtn.addEventListener('click', () => {
        running = !running;
        if (running) {
            overlay.classList.add('hidden');
            toggleBtn.querySelector('.btn-icon').textContent = '⏹';
            toggleBtn.querySelector('.btn-text').textContent = '停止馬達';
            toggleBtn.classList.add('active');
            angle = 0;
            angularVelocity = 0;
            animateMotor();
        } else {
            toggleBtn.querySelector('.btn-icon').textContent = '▶';
            toggleBtn.querySelector('.btn-text').textContent = '啟動馬達';
            toggleBtn.classList.remove('active');
        }
    });

    function animateMotor() {
        if (!running) return;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
        ctx.fillRect(0, 0, W, H);

        const cx = W / 2;
        const cy = H / 2;
        const magnetWidth = 60;
        const magnetHeight = 180;

        // Torque depends on angle (sinusoidal)
        const torque = current * magnetStrength * 0.002 * Math.sin(angle * 2);
        angularVelocity += torque;
        angularVelocity *= 0.995; // friction
        // Commutator effect: flip current direction every half turn
        angle += angularVelocity;

        // Draw magnetic field lines
        if (showFieldCb.checked) {
            const lineCount = 8;
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.15)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < lineCount; i++) {
                const yOff = -magnetHeight / 2 + (magnetHeight / (lineCount + 1)) * (i + 1);
                ctx.beginPath();
                // Left magnet to right magnet
                ctx.moveTo(cx - 130, cy + yOff);

                // Curve through center
                ctx.bezierCurveTo(
                    cx - 60, cy + yOff - 10,
                    cx + 60, cy + yOff - 10,
                    cx + 130, cy + yOff
                );
                ctx.stroke();

                // Arrow in middle
                const arrowX = cx;
                const arrowY = cy + yOff - 10;
                ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
                ctx.beginPath();
                ctx.moveTo(arrowX + 6, arrowY);
                ctx.lineTo(arrowX - 3, arrowY - 4);
                ctx.lineTo(arrowX - 3, arrowY + 4);
                ctx.closePath();
                ctx.fill();
            }

            // B label
            ctx.font = 'bold italic 18px Outfit';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
            ctx.fillText('B →', cx, cy - magnetHeight / 2 - 20);
        }

        // Draw magnets
        // Left magnet (N)
        const lmGrad = ctx.createLinearGradient(cx - 160, 0, cx - 100, 0);
        lmGrad.addColorStop(0, '#cc3333');
        lmGrad.addColorStop(1, '#ff5555');
        ctx.fillStyle = lmGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 160, cy - magnetHeight / 2, magnetWidth, magnetHeight, 8);
        ctx.fill();
        ctx.font = 'bold 28px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('N', cx - 130, cy + 10);

        // Right magnet (S)
        const rmGrad = ctx.createLinearGradient(cx + 100, 0, cx + 160, 0);
        rmGrad.addColorStop(0, '#3355ff');
        rmGrad.addColorStop(1, '#3333cc');
        ctx.fillStyle = rmGrad;
        ctx.beginPath();
        ctx.roundRect(cx + 100, cy - magnetHeight / 2, magnetWidth, magnetHeight, 8);
        ctx.fill();
        ctx.font = 'bold 28px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('S', cx + 130, cy + 10);

        // Draw rotating coil (3D projection)
        const coilWidth = 70;
        const coilHeight = 120;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Coil sides
        const projW = coilWidth * cosA;

        // Front side color depends on current direction (commutator)
        const commutatorPhase = Math.floor((angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) / Math.PI);

        // Draw coil as a rectangle projected
        ctx.lineWidth = 4;

        // Top side
        ctx.beginPath();
        ctx.moveTo(cx - projW, cy - coilHeight / 2);
        ctx.lineTo(cx + projW, cy - coilHeight / 2);
        ctx.strokeStyle = '#ffa502';
        ctx.stroke();

        // Bottom side
        ctx.beginPath();
        ctx.moveTo(cx - projW, cy + coilHeight / 2);
        ctx.lineTo(cx + projW, cy + coilHeight / 2);
        ctx.strokeStyle = '#ffa502';
        ctx.stroke();

        // Left vertical
        ctx.beginPath();
        ctx.moveTo(cx - projW, cy - coilHeight / 2);
        ctx.lineTo(cx - projW, cy + coilHeight / 2);
        ctx.strokeStyle = cosA > 0 ? '#ff6348' : '#ffa502';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Right vertical
        ctx.beginPath();
        ctx.moveTo(cx + projW, cy - coilHeight / 2);
        ctx.lineTo(cx + projW, cy + coilHeight / 2);
        ctx.strokeStyle = cosA > 0 ? '#ffa502' : '#ff6348';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Current direction arrows on coil
        ctx.fillStyle = '#ffa502';
        ctx.font = '13px Outfit';
        ctx.textAlign = 'center';
        if (Math.abs(cosA) > 0.1) {
            const dir = commutatorPhase === 0 ? 1 : -1;
            // Left side arrow
            drawCurrentArrow(ctx, cx - projW, cy, dir > 0 ? -1 : 1, '#ffa502');
            // Right side arrow
            drawCurrentArrow(ctx, cx + projW, cy, dir > 0 ? 1 : -1, '#ffa502');
        }

        // Force arrows
        if (showForceCb.checked && Math.abs(cosA) > 0.1) {
            const forceScale = current * magnetStrength * 0.3 * Math.abs(sinA);
            const forceDirL = sinA > 0 ? -1 : 1;
            const forceDirR = sinA > 0 ? 1 : -1;

            // Left side force
            drawForceArrow(ctx, cx - projW - 15, cy, forceDirL * forceScale, '#2ed573');
            // Right side force
            drawForceArrow(ctx, cx + projW + 15, cy, forceDirR * forceScale, '#2ed573');

            // Force label
            ctx.font = 'bold 13px Outfit';
            ctx.fillStyle = '#2ed573';
            ctx.textAlign = 'left';
            ctx.fillText('F', cx - projW - 35, cy - 5);
            ctx.textAlign = 'right';
            ctx.fillText('F', cx + projW + 35, cy - 5);
        }

        // Axle
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#636e72';
        ctx.fill();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Commutator at bottom
        ctx.save();
        ctx.translate(cx, cy + coilHeight / 2 + 25);

        // Split ring
        ctx.beginPath();
        ctx.arc(0, 0, 15, angle, angle + Math.PI);
        ctx.strokeStyle = '#ff6348';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 15, angle + Math.PI, angle + Math.PI * 2);
        ctx.strokeStyle = '#ffa502';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Brushes
        ctx.fillStyle = '#636e72';
        ctx.fillRect(-25, 10, 12, 20);
        ctx.fillRect(13, 10, 12, 20);
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('+', -19, 38);
        ctx.fillText('−', 19, 38);
        ctx.restore();

        // RPM display
        const rpm = Math.abs(angularVelocity) * 60 / (Math.PI * 2) * 60;
        ctx.font = 'bold 16px Outfit';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffa502';
        ctx.fillText(`⚡ ${Math.round(rpm)} RPM`, W - 20, 30);

        // Info
        ctx.font = '12px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('電流在磁場中受力 (F = BIL)，推動線圈旋轉', cx, H - 15);

        requestAnimationFrame(animateMotor);
    }

    function drawCurrentArrow(ctx, x, y, dir, color) {
        const len = 20;
        ctx.beginPath();
        ctx.moveTo(x, y + dir * len);
        ctx.lineTo(x, y - dir * len);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(x, y - dir * len);
        ctx.lineTo(x - 5, y - dir * (len - 8));
        ctx.lineTo(x + 5, y - dir * (len - 8));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawForceArrow(ctx, x, y, magnitude, color) {
        const len = Math.max(10, Math.min(Math.abs(magnitude), 40));
        const dir = magnitude > 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - dir * len);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(x, y - dir * len);
        ctx.lineTo(x - 6, y - dir * (len - 10));
        ctx.lineTo(x + 6, y - dir * (len - 10));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    // Initial draw
    ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
    ctx.fillRect(0, 0, W, H);
}

/* =============================================
   DAY 4: GENERATOR / LENZ'S LAW SIMULATION
   ============================================= */
function initGeneratorDemo() {
    const canvas = document.getElementById('generator-canvas');
    const ctx = canvas.getContext('2d');
    const modeToggle = document.getElementById('generator-mode-toggle');
    const genSpeedGroup = document.getElementById('gen-speed-group');
    const genToggleBtn = document.getElementById('generator-toggle');
    const genSpeedSlider = document.getElementById('gen-speed');
    const genSpeedValue = document.getElementById('gen-speed-value');
    const hint = document.getElementById('generator-hint');

    const W = canvas.width;
    const H = canvas.height;

    let mode = 'drag'; // 'drag' or 'generator'
    let magnetX = W * 0.2;
    let magnetY = H * 0.42;
    let dragging = false;
    let prevMagnetX = magnetX;
    let inducedCurrent = 0;
    let currentHistory = [];
    let generatorRunning = false;
    let genAngle = 0;
    let genSpeed = 5;

    const coilCenterX = W * 0.5;
    const coilCenterY = H * 0.42;
    const coilWidth = 80;
    const coilHeight = 120;

    // Mode toggle
    modeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modeToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            if (mode === 'generator') {
                genSpeedGroup.style.display = '';
                genToggleBtn.style.display = '';
                hint.style.display = 'none';
            } else {
                genSpeedGroup.style.display = 'none';
                genToggleBtn.style.display = 'none';
                hint.style.display = '';
                generatorRunning = false;
                magnetX = W * 0.2;
            }
        });
    });

    genSpeedSlider.addEventListener('input', () => {
        genSpeed = parseInt(genSpeedSlider.value);
        genSpeedValue.textContent = genSpeed;
    });

    genToggleBtn.addEventListener('click', () => {
        generatorRunning = !generatorRunning;
        if (generatorRunning) {
            genToggleBtn.querySelector('.btn-icon').textContent = '⏹';
            genToggleBtn.querySelector('.btn-text').textContent = '停止發電';
            genToggleBtn.classList.add('active');
        } else {
            genToggleBtn.querySelector('.btn-icon').textContent = '▶';
            genToggleBtn.querySelector('.btn-text').textContent = '開始發電';
            genToggleBtn.classList.remove('active');
        }
    });

    // Mouse interaction for drag mode
    canvas.addEventListener('mousedown', (e) => {
        if (mode !== 'drag') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        if (Math.abs(mx - magnetX) < 50 && Math.abs(my - magnetY) < 30) {
            dragging = true;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        magnetX = (e.clientX - rect.left) * scaleX;
        magnetX = Math.max(40, Math.min(W - 40, magnetX));
    });

    canvas.addEventListener('mouseup', () => { dragging = false; });
    canvas.addEventListener('mouseleave', () => { dragging = false; });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        if (mode !== 'drag') return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const touch = e.touches[0];
        const mx = (touch.clientX - rect.left) * scaleX;
        const my = (touch.clientY - rect.top) * scaleY;
        if (Math.abs(mx - magnetX) < 60 && Math.abs(my - magnetY) < 40) {
            dragging = true;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const touch = e.touches[0];
        magnetX = (touch.clientX - rect.left) * scaleX;
        magnetX = Math.max(40, Math.min(W - 40, magnetX));
    }, { passive: false });

    canvas.addEventListener('touchend', () => { dragging = false; });

    function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
        ctx.fillRect(0, 0, W, H);

        if (mode === 'generator' && generatorRunning) {
            genAngle += genSpeed * 0.03;
            magnetX = coilCenterX + Math.cos(genAngle) * 200;
        }

        // Calculate induced current (rate of change of magnetic flux)
        const dx = magnetX - prevMagnetX;
        const distToCoil = magnetX - coilCenterX;
        const proximity = Math.max(0.01, Math.abs(distToCoil));
        inducedCurrent = -dx * 50 / (proximity * 0.5); // Lenz's law: oppose change
        inducedCurrent = Math.max(-100, Math.min(100, inducedCurrent));
        prevMagnetX = magnetX;

        currentHistory.push(inducedCurrent);
        if (currentHistory.length > 200) currentHistory.shift();

        // Draw coil (solenoid cross-section)
        drawCoil(ctx, coilCenterX, coilCenterY, coilWidth, coilHeight, inducedCurrent);

        // Draw magnet
        drawMagnet(ctx, magnetX, magnetY);

        // Draw magnetic field lines between magnet and coil
        drawFieldLines(ctx, magnetX, magnetY, coilCenterX, coilCenterY);

        // Draw galvanometer / current meter
        drawCurrentMeter(ctx, W * 0.78, H * 0.18, inducedCurrent);

        // Draw current graph
        drawCurrentGraph(ctx, W * 0.55, H * 0.72, W * 0.4, H * 0.22, currentHistory);

        // Labels
        ctx.font = 'bold 13px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('移動磁鐵 → 磁通量變化 → 感應電流（法拉第定律）', W / 2, H - 15);

        if (Math.abs(inducedCurrent) > 5) {
            ctx.font = 'bold 14px "Noto Sans TC"';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(inducedCurrent > 0 ? '⬅ 感應電流反抗磁鐵靠近' : '➡ 感應電流反抗磁鐵遠離', coilCenterX, coilCenterY + coilHeight / 2 + 30);
        }

        requestAnimationFrame(draw);
    }

    function drawMagnet(ctx, x, y) {
        const w = 80;
        const h = 40;
        // N pole (left half)
        const nGrad = ctx.createLinearGradient(x - w / 2, 0, x, 0);
        nGrad.addColorStop(0, '#cc2222');
        nGrad.addColorStop(1, '#ff4444');
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - h / 2, w / 2, h, [8, 0, 0, 8]);
        ctx.fill();

        // S pole (right half)
        const sGrad = ctx.createLinearGradient(x, 0, x + w / 2, 0);
        sGrad.addColorStop(0, '#4444ff');
        sGrad.addColorStop(1, '#2222cc');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.roundRect(x, y - h / 2, w / 2, h, [0, 8, 8, 0]);
        ctx.fill();

        // Labels
        ctx.font = 'bold 18px Outfit';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('N', x - w / 4, y + 6);
        ctx.fillText('S', x + w / 4, y + 6);

        // Glow when dragging
        if (dragging) {
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 10);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Cursor hint
        if (mode === 'drag') {
            canvas.style.cursor = dragging ? 'grabbing' : 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }

    function drawCoil(ctx, cx, cy, w, h, current) {
        const turns = 8;
        const turnSpacing = w / (turns + 1);

        // Coil wire visualization
        for (let i = 0; i < turns; i++) {
            const x = cx - w / 2 + turnSpacing * (i + 1);
            const glow = Math.abs(current) * 0.02;

            // Top part
            ctx.beginPath();
            ctx.arc(x, cy - h / 2, 6, Math.PI, 0);
            ctx.strokeStyle = `rgba(255, ${180 - glow * 50}, 50, ${0.5 + glow})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Bottom part
            ctx.beginPath();
            ctx.arc(x, cy + h / 2, 6, 0, Math.PI);
            ctx.strokeStyle = `rgba(255, ${180 - glow * 50}, 50, ${0.5 + glow})`;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Side lines
            ctx.beginPath();
            ctx.moveTo(x - 6, cy - h / 2);
            ctx.lineTo(x - 6, cy + h / 2);
            ctx.strokeStyle = `rgba(255, ${180 - glow * 50}, 50, ${0.3 + glow * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + 6, cy - h / 2);
            ctx.lineTo(x + 6, cy + h / 2);
            ctx.stroke();
        }

        // Coil frame
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - w / 2, cy - h / 2 - 6, w, h + 12);

        // Label
        ctx.font = '12px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffa502';
        ctx.fillText('線圈', cx, cy - h / 2 - 15);

        // Current flow arrows around coil
        if (Math.abs(current) > 3) {
            const arrowDir = current > 0 ? 1 : -1;
            const alpha = Math.min(1, Math.abs(current) / 30);
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;

            // Show current direction
            const arrowY = cy - h / 2 - 10;
            const arrowSize = 8;
            ctx.beginPath();
            ctx.moveTo(cx + arrowDir * 20, arrowY);
            ctx.lineTo(cx + arrowDir * 20 - arrowDir * arrowSize, arrowY - arrowSize / 2);
            ctx.lineTo(cx + arrowDir * 20 - arrowDir * arrowSize, arrowY + arrowSize / 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawFieldLines(ctx, mx, my, cx, cy) {
        const dist = Math.abs(mx - cx);
        const lineCount = 5;
        const alpha = Math.max(0.05, 0.4 - dist / 500);

        for (let i = 0; i < lineCount; i++) {
            const yOff = (i - lineCount / 2 + 0.5) * 25;
            ctx.beginPath();
            ctx.moveTo(mx + 40, my + yOff);

            // Curve toward coil if close
            const cpX = (mx + cx) / 2;
            const cpY = my + yOff + (i - lineCount / 2 + 0.5) * 5;
            ctx.quadraticCurveTo(cpX, cpY, cx - 50, cy + yOff * 0.5);

            ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawCurrentMeter(ctx, x, y, current) {
        const radius = 50;

        // Meter background
        ctx.beginPath();
        ctx.arc(x, y + radius, radius, Math.PI, 0);
        ctx.fillStyle = 'rgba(20, 30, 50, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Scale marks
        for (let i = -5; i <= 5; i++) {
            const angle = Math.PI + (i + 5) / 10 * Math.PI;
            const innerR = radius - 10;
            const outerR = radius - 4;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * innerR, y + radius + Math.sin(angle) * innerR);
            ctx.lineTo(x + Math.cos(angle) * outerR, y + radius + Math.sin(angle) * outerR);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = i === 0 ? 2 : 1;
            ctx.stroke();
        }

        // Needle
        const needleAngle = Math.PI + (Math.max(-5, Math.min(5, current / 15)) + 5) / 10 * Math.PI;
        const needleLen = radius - 15;
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(
            x + Math.cos(needleAngle) * needleLen,
            y + radius + Math.sin(needleAngle) * needleLen
        );
        ctx.strokeStyle = '#2ed573';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(x, y + radius, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#2ed573';
        ctx.fill();

        // Label
        ctx.font = '11px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('電流計', x, y + radius + 20);

        // 0 mark
        ctx.font = '10px Outfit';
        ctx.fillText('0', x, y + 8);
        ctx.fillText('−', x - radius + 15, y + radius - 5);
        ctx.fillText('+', x + radius - 15, y + radius - 5);
    }

    function drawCurrentGraph(ctx, x, y, w, h, history) {
        // Background
        ctx.fillStyle = 'rgba(20, 30, 50, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Zero line
        ctx.beginPath();
        ctx.moveTo(x + 5, y + h / 2);
        ctx.lineTo(x + w - 5, y + h / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Graph line
        if (history.length > 1) {
            ctx.beginPath();
            const step = (w - 10) / 200;
            for (let i = 0; i < history.length; i++) {
                const gx = x + 5 + i * step;
                const gy = y + h / 2 - (history[i] / 100) * (h / 2 - 5);
                if (i === 0) ctx.moveTo(gx, gy);
                else ctx.lineTo(gx, gy);
            }
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Labels
        ctx.font = '10px Outfit';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('感應電流 (EMF)', x + 10, y + 15);
        ctx.fillText('+', x + 3, y + 15);
        ctx.fillText('−', x + 3, y + h - 5);
    }

    draw();
}

/* =============================================
   DAY 5: SEMICONDUCTOR PROCESS SIMULATION
   ============================================= */
function initSemiconductorProcessDemo() {
    const canvas = document.getElementById('semiconductor-canvas');
    const ctx = canvas.getContext('2d');
    const prevBtn = document.getElementById('semi-prev');
    const nextBtn = document.getElementById('semi-next');
    const stepIndicator = document.getElementById('semi-step-indicator');
    const stepTitle = document.getElementById('semi-step-title');
    const stepText = document.getElementById('semi-step-text');
    const autoBtn = document.getElementById('semi-auto');

    const W = canvas.width;
    const H = canvas.height;
    let currentStep = 0;
    let autoPlaying = false;
    let autoInterval;
    let animProgress = 0;

    const steps = [
        {
            title: '步驟 1：矽晶圓 (Silicon Wafer)',
            text: '從高純度矽（99.9999999%！九個9）做成的薄圓片。直徑約 30 公分，厚度不到 1 毫米。這是所有電路的「畫布」！',
            draw: (progress) => drawWaferStep(ctx, W, H, progress)
        },
        {
            title: '步驟 2：氧化 (Oxidation)',
            text: '在晶圓表面生長一層極薄的二氧化矽（SiO₂）。就像麵包上的「奶油層」，是未來電路的絕緣保護層。',
            draw: (progress) => drawOxidationStep(ctx, W, H, progress)
        },
        {
            title: '步驟 3：光阻塗佈 (Photoresist Coating)',
            text: '塗上一層對光敏感的化學物質「光阻劑」。就像塗上一層「感光底片」，等待被曝光。',
            draw: (progress) => drawPhotoresistStep(ctx, W, H, progress)
        },
        {
            title: '步驟 4：黃光曝光 (Photolithography) ⭐',
            text: '🟡 這就是黃光區！透過光罩（像印章的圖案），用紫外線照射光阻。被照到的地方會「變質」，可以被沖洗掉。這一步決定了電路的圖案！',
            draw: (progress) => drawExposureStep(ctx, W, H, progress)
        },
        {
            title: '步驟 5：顯影與蝕刻 (Develop & Etch)',
            text: '先用化學液沖掉被曝光的光阻（顯影），再用蝕刻液吃掉沒有光阻保護的氧化層。就像用橡皮擦擦掉不要的部分！',
            draw: (progress) => drawEtchStep(ctx, W, H, progress)
        },
        {
            title: '步驟 6：離子植入 (Ion Implantation)',
            text: '用高速離子「射入」晶圓表面，改變矽的導電性質。就像在特定區域「施肥」，讓那裡變成可以導電的區域！',
            draw: (progress) => drawImplantStep(ctx, W, H, progress)
        },
        {
            title: '步驟 7：金屬連線 (Metallization)',
            text: '沉積金屬層（通常是銅或鋁），像畫電路圖一樣把各個電晶體連起來。一顆晶片可能有十幾層金屬線！最後切割、封裝，完成！🎉',
            draw: (progress) => drawMetalStep(ctx, W, H, progress)
        }
    ];

    function updateUI() {
        stepIndicator.textContent = `步驟 ${currentStep + 1} / ${steps.length}`;
        stepTitle.textContent = steps[currentStep].title;
        stepText.textContent = steps[currentStep].text;
        prevBtn.disabled = currentStep === 0;
        nextBtn.disabled = currentStep === steps.length - 1;
        animProgress = 0;
    }

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; updateUI(); }
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) { currentStep++; updateUI(); }
    });

    autoBtn.addEventListener('click', () => {
        autoPlaying = !autoPlaying;
        if (autoPlaying) {
            autoBtn.querySelector('.btn-icon').textContent = '⏹';
            autoBtn.querySelector('.btn-text').textContent = '停止播放';
            autoBtn.classList.add('active');
            autoInterval = setInterval(() => {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    updateUI();
                } else {
                    currentStep = 0;
                    updateUI();
                }
            }, 3000);
        } else {
            autoBtn.querySelector('.btn-icon').textContent = '▶';
            autoBtn.querySelector('.btn-text').textContent = '自動播放';
            autoBtn.classList.remove('active');
            clearInterval(autoInterval);
        }
    });

    function animate() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(10, 20, 40, 0.9)';
        ctx.fillRect(0, 0, W, H);

        animProgress = Math.min(1, animProgress + 0.02);
        steps[currentStep].draw(animProgress);

        // Step number badge
        ctx.font = 'bold 14px Outfit';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00d4ff';
        ctx.fillText(`Step ${currentStep + 1}/${steps.length}`, 15, 25);

        requestAnimationFrame(animate);
    }

    updateUI();
    animate();

    // ===== Drawing functions for each step =====

    function drawWaferBase(ctx, W, H, y, width) {
        // Silicon base
        const baseH = 50;
        const gradient = ctx.createLinearGradient(0, y, 0, y + baseH);
        gradient.addColorStop(0, '#4a5568');
        gradient.addColorStop(0.5, '#5a6a7e');
        gradient.addColorStop(1, '#3a4558');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(W / 2 - width / 2, y, width, baseH, [0, 0, 8, 8]);
        ctx.fill();

        // Label
        ctx.font = '13px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('矽 (Si)', W / 2, y + baseH / 2 + 4);

        return { top: y, height: baseH };
    }

    function drawWaferStep(ctx, W, H, progress) {
        const waferW = 500 * progress;
        const y = H * 0.5;

        // Draw wafer cross-section with animation
        drawWaferBase(ctx, W, H, y, waferW);

        // Draw wafer top view (circle)
        const circleY = H * 0.25;
        ctx.beginPath();
        ctx.arc(W / 2, circleY, 80 * progress, 0, Math.PI * 2);
        const circGrad = ctx.createRadialGradient(W / 2, circleY, 0, W / 2, circleY, 80);
        circGrad.addColorStop(0, '#6a7a8e');
        circGrad.addColorStop(0.7, '#5a6a7e');
        circGrad.addColorStop(1, '#4a5568');
        ctx.fillStyle = circGrad;
        ctx.fill();
        ctx.strokeStyle = '#7a8a9e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Flat zone
        if (progress > 0.5) {
            ctx.beginPath();
            ctx.moveTo(W / 2 - 50, circleY + 70);
            ctx.lineTo(W / 2 + 50, circleY + 70);
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Labels
        if (progress > 0.8) {
            ctx.font = '12px "Noto Sans TC"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('⬆ 俯視圖', W / 2, circleY + 100);
            ctx.fillText('⬇ 截面圖（放大數萬倍）', W / 2, y - 10);

            // Arrow to indicate cross-section
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.moveTo(W / 2, circleY + 80);
            ctx.lineTo(W / 2, y - 15);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawOxidationStep(ctx, W, H, progress) {
        const y = H * 0.5;
        const waferW = 500;

        drawWaferBase(ctx, W, H, y, waferW);

        // Oxide layer growing on top
        const oxideH = 15 * progress;
        if (oxideH > 0) {
            const oxGrad = ctx.createLinearGradient(0, y - oxideH, 0, y);
            oxGrad.addColorStop(0, '#60a5fa');
            oxGrad.addColorStop(1, '#3b82f6');
            ctx.fillStyle = oxGrad;
            ctx.fillRect(W / 2 - waferW / 2, y - oxideH, waferW, oxideH);

            ctx.font = '11px "Noto Sans TC"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText('SiO₂ 氧化層', W / 2, y - oxideH / 2 + 4);
        }

        // O₂ molecules raining down
        if (progress < 0.8) {
            ctx.font = '14px Outfit';
            ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
            for (let i = 0; i < 8; i++) {
                const ox = W / 2 - 200 + i * 55 + Math.sin(Date.now() / 500 + i) * 10;
                const oy = y - 80 - Math.random() * 100 * (1 - progress);
                ctx.fillText('O₂', ox, oy);
            }
        }

        // Furnace illustration
        ctx.font = '13px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffa502';
        ctx.fillText('🔥 高溫氧化爐 (~1000°C)', W / 2, H * 0.2);
    }

    function drawPhotoresistStep(ctx, W, H, progress) {
        const y = H * 0.5;
        const waferW = 500;

        drawWaferBase(ctx, W, H, y, waferW);

        // Oxide layer
        const oxideH = 15;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(W / 2 - waferW / 2, y - oxideH, waferW, oxideH);
        ctx.font = '10px "Noto Sans TC"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('SiO₂', W / 2, y - oxideH / 2 + 3);

        // Photoresist layer
        const prH = 12 * progress;
        if (prH > 0) {
            ctx.fillStyle = '#e879a0';
            ctx.fillRect(W / 2 - waferW / 2, y - oxideH - prH, waferW, prH);
            if (progress > 0.5) {
                ctx.font = '10px "Noto Sans TC"';
                ctx.fillStyle = '#fff';
                ctx.fillText('光阻 (Photoresist)', W / 2, y - oxideH - prH / 2 + 3);
            }
        }

        // Spinning animation
        if (progress < 0.7) {
            ctx.save();
            ctx.translate(W / 2, H * 0.22);
            ctx.rotate(Date.now() / 200);
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.strokeStyle = '#e879a0';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Droplets
            for (let i = 0; i < 4; i++) {
                const a = (Math.PI * 2 / 4) * i;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * 40, Math.sin(a) * 40, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#e879a0';
                ctx.fill();
            }
            ctx.restore();
            ctx.font = '12px "Noto Sans TC"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e879a0';
            ctx.fillText('旋轉塗佈（spin coating）', W / 2, H * 0.32);
        }
    }

    function drawExposureStep(ctx, W, H, progress) {
        const y = H * 0.55;
        const waferW = 500;
        const oxideH = 15;
        const prH = 12;

        drawWaferBase(ctx, W, H, y, waferW);

        // Oxide
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(W / 2 - waferW / 2, y - oxideH, waferW, oxideH);

        // Photoresist (some parts exposed)
        const maskPattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1]; // 1=blocked, 0=exposed
        const segW = waferW / maskPattern.length;

        for (let i = 0; i < maskPattern.length; i++) {
            const sx = W / 2 - waferW / 2 + i * segW;
            if (maskPattern[i] === 1) {
                // Protected (still pink)
                ctx.fillStyle = '#e879a0';
            } else {
                // Exposed (turns darker)
                const blend = progress;
                ctx.fillStyle = `rgba(${180 - 80 * blend}, ${100 - 60 * blend}, ${130 - 80 * blend}, 1)`;
            }
            ctx.fillRect(sx, y - oxideH - prH, segW, prH);
        }

        // Mask above
        const maskY = y - 100;
        ctx.fillStyle = 'rgba(30, 40, 60, 0.9)';
        ctx.fillRect(W / 2 - waferW / 2, maskY, waferW, 20);
        // Mask pattern (openings)
        for (let i = 0; i < maskPattern.length; i++) {
            const sx = W / 2 - waferW / 2 + i * segW;
            if (maskPattern[i] === 0) {
                ctx.fillStyle = 'rgba(200, 150, 255, 0.3)';
                ctx.fillRect(sx, maskY, segW, 20);
            }
        }
        ctx.font = '11px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('光罩 (Mask)', W / 2, maskY - 5);

        // UV light
        if (progress > 0.2) {
            for (let i = 0; i < maskPattern.length; i++) {
                if (maskPattern[i] === 0) {
                    const sx = W / 2 - waferW / 2 + i * segW + segW / 2;
                    // UV beam
                    ctx.beginPath();
                    ctx.moveTo(sx, maskY + 20);
                    ctx.lineTo(sx - 5, y - oxideH - prH);
                    ctx.lineTo(sx + segW - 5, y - oxideH - prH);
                    ctx.lineTo(sx + segW / 2, maskY + 20);
                    ctx.fillStyle = `rgba(180, 130, 255, ${0.15 * progress})`;
                    ctx.fill();
                }
            }
        }

        // UV source
        ctx.font = '14px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('☀️ 紫外線 (UV)', W / 2, maskY - 30);

        // Yellow room indicator
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 13px "Noto Sans TC"';
        ctx.fillText('🟡 黃光區', W - 80, 25);
        // Yellow ambient glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.03)';
        ctx.fillRect(0, 0, W, H);
    }

    function drawEtchStep(ctx, W, H, progress) {
        const y = H * 0.55;
        const waferW = 500;
        const oxideH = 15;
        const prH = 12;

        drawWaferBase(ctx, W, H, y, waferW);

        const maskPattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
        const segW = waferW / maskPattern.length;

        for (let i = 0; i < maskPattern.length; i++) {
            const sx = W / 2 - waferW / 2 + i * segW;

            if (maskPattern[i] === 1) {
                // Protected: oxide remains
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(sx, y - oxideH, segW, oxideH);
                // Photoresist removed in later stages
                if (progress < 0.7) {
                    ctx.fillStyle = '#e879a0';
                    ctx.fillRect(sx, y - oxideH - prH, segW, prH);
                }
            } else {
                // Exposed: oxide etched away
                const etchProgress = Math.min(1, progress * 2);
                const remainingH = oxideH * (1 - etchProgress);
                if (remainingH > 0) {
                    ctx.fillStyle = '#3b82f6';
                    ctx.fillRect(sx, y - remainingH, segW, remainingH);
                }
            }
        }

        // Etching bubbles
        if (progress < 0.5) {
            for (let i = 0; i < maskPattern.length; i++) {
                if (maskPattern[i] === 0) {
                    const sx = W / 2 - waferW / 2 + i * segW + segW / 2;
                    for (let j = 0; j < 3; j++) {
                        const bx = sx + (Math.random() - 0.5) * 20;
                        const by = y - 20 - Math.random() * 30;
                        ctx.beginPath();
                        ctx.arc(bx, by, 2 + Math.random() * 3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
                        ctx.fill();
                    }
                }
            }
        }

        // Labels
        ctx.font = '13px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        if (progress < 0.5) {
            ctx.fillText('🧪 蝕刻中... 化學液吃掉沒保護的氧化層', W / 2, H * 0.2);
        } else if (progress < 0.8) {
            ctx.fillText('✅ 蝕刻完成，圖案轉移到氧化層上', W / 2, H * 0.2);
        } else {
            ctx.fillText('🧹 去除殘餘光阻，露出乾淨圖案', W / 2, H * 0.2);
        }
    }

    function drawImplantStep(ctx, W, H, progress) {
        const y = H * 0.55;
        const waferW = 500;
        const oxideH = 15;

        drawWaferBase(ctx, W, H, y, waferW);

        const maskPattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
        const segW = waferW / maskPattern.length;

        // Oxide pattern
        for (let i = 0; i < maskPattern.length; i++) {
            const sx = W / 2 - waferW / 2 + i * segW;
            if (maskPattern[i] === 1) {
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(sx, y - oxideH, segW, oxideH);
            }
        }

        // Implanted regions (doped silicon)
        for (let i = 0; i < maskPattern.length; i++) {
            if (maskPattern[i] === 0) {
                const sx = W / 2 - waferW / 2 + i * segW;
                const dopedDepth = 20 * progress;
                ctx.fillStyle = `rgba(34, 211, 238, ${0.4 * progress})`;
                ctx.fillRect(sx, y, segW, dopedDepth);
            }
        }

        // Ion beam arrows
        if (progress < 0.8) {
            for (let i = 0; i < maskPattern.length; i++) {
                if (maskPattern[i] === 0) {
                    const sx = W / 2 - waferW / 2 + i * segW + segW / 2;
                    // Incoming ions
                    const t = Date.now() / 300;
                    for (let j = 0; j < 3; j++) {
                        const iy = y - 50 - j * 40 + ((t + j * 30) % 80);
                        if (iy < y) {
                            ctx.beginPath();
                            ctx.arc(sx + Math.sin(j * 2) * 5, iy, 3, 0, Math.PI * 2);
                            ctx.fillStyle = '#22d3ee';
                            ctx.shadowColor = '#22d3ee';
                            ctx.shadowBlur = 8;
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }
                    }
                }
            }
        }

        ctx.font = '13px "Noto Sans TC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#22d3ee';
        ctx.fillText('⚛️ 離子植入：讓特定區域變成 N型 或 P型 半導體', W / 2, H * 0.2);
    }

    function drawMetalStep(ctx, W, H, progress) {
        const y = H * 0.5;
        const waferW = 500;
        const oxideH = 15;

        drawWaferBase(ctx, W, H, y + 30, waferW);

        const maskPattern = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
        const segW = waferW / maskPattern.length;

        // Oxide pattern
        for (let i = 0; i < maskPattern.length; i++) {
            const sx = W / 2 - waferW / 2 + i * segW;
            if (maskPattern[i] === 1) {
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(sx, y + 30 - oxideH, segW, oxideH);
            }
        }

        // Doped regions
        for (let i = 0; i < maskPattern.length; i++) {
            if (maskPattern[i] === 0) {
                const sx = W / 2 - waferW / 2 + i * segW;
                ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
                ctx.fillRect(sx, y + 30, segW, 20);
            }
        }

        // Metal layer (copper lines)
        const metalY = y + 30 - oxideH - 8;
        const metalH = 8;
        if (progress > 0.2) {
            const metalProgress = Math.min(1, (progress - 0.2) / 0.5);
            const drawW = waferW * metalProgress;

            // Metal layer 1
            ctx.fillStyle = '#f59e0b';
            // Draw metal lines connecting doped regions
            const metalSegments = [];
            for (let i = 0; i < maskPattern.length; i++) {
                if (maskPattern[i] === 0) {
                    const sx = W / 2 - waferW / 2 + i * segW;
                    if (sx + segW <= W / 2 - waferW / 2 + drawW) {
                        metalSegments.push({ x: sx, w: segW });
                        // Via (vertical connection)
                        ctx.fillStyle = '#f59e0b';
                        ctx.fillRect(sx + segW / 2 - 3, metalY, 6, oxideH + metalH);
                    }
                }
            }

            // Horizontal metal lines
            if (metalSegments.length > 1) {
                ctx.fillStyle = '#f59e0b';
                const startX = metalSegments[0].x;
                const endX = metalSegments[metalSegments.length - 1].x + metalSegments[metalSegments.length - 1].w;
                ctx.fillRect(startX, metalY - metalH, endX - startX, metalH);

                ctx.font = '10px "Noto Sans TC"';
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.fillText('Cu 金屬線', (startX + endX) / 2, metalY - 2);
            }
        }

        // Final chip illustration
        if (progress > 0.8) {
            ctx.font = 'bold 20px "Noto Sans TC"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffd700';
            ctx.fillText('🎉 晶片完成！', W / 2, H * 0.15);

            ctx.font = '13px "Noto Sans TC"';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('切割 → 封裝 → 測試 → 出貨到全世界！', W / 2, H * 0.22);
        } else {
            ctx.font = '13px "Noto Sans TC"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('🔧 沉積金屬，連接各個電晶體', W / 2, H * 0.15);
        }
    }
}
