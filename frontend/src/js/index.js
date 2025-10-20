const API_BASE = window.location.origin;
let animationSpeed = 1;
let audioPlaying = false;
let scene, camera, renderer, sun, planets = [], orbits = [];
let showOrbits = true;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentSlide = 0;
let galleryInterval;
let blogPosts = [];

const planetsData = [
    { 
        name: 'Mercury', size: 0.4, distance: 4, color: 0x8c7853, speed: 0.04, 
        info: 'Smallest planet, closest to Sun', diameter: '4,879 km',
        mass: '3.3 × 10²³ kg', temp: '-173 to 427°C', moons: '0',
        type: 'Terrestrial', orbitalPeriod: '88 days'
    },
    { 
        name: 'Venus', size: 0.9, distance: 6, color: 0xffc649, speed: 0.03, 
        info: 'Hottest planet with thick atmosphere', diameter: '12,104 km',
        mass: '4.87 × 10²⁴ kg', temp: '462°C (avg)', moons: '0',
        type: 'Terrestrial', orbitalPeriod: '225 days'
    },
    { 
        name: 'Earth', size: 1, distance: 8, color: 0x4a90e2, speed: 0.02, 
        info: 'Our home planet, the blue marble', diameter: '12,742 km',
        mass: '5.97 × 10²⁴ kg', temp: '-89 to 58°C', moons: '1',
        type: 'Terrestrial', orbitalPeriod: '365 days'
    },
    { 
        name: 'Mars', size: 0.5, distance: 10, color: 0xe27b58, speed: 0.018, 
        info: 'The Red Planet, future human habitat', diameter: '6,779 km',
        mass: '6.42 × 10²³ kg', temp: '-195 to 20°C', moons: '2',
        type: 'Terrestrial', orbitalPeriod: '687 days'
    },
    { 
        name: 'Jupiter', size: 1.8, distance: 14, color: 0xc88b3a, speed: 0.013, 
        info: 'Largest planet, gas giant', diameter: '139,820 km',
        mass: '1.90 × 10²⁷ kg', temp: '-110°C', moons: '95',
        type: 'Gas Giant', orbitalPeriod: '12 years'
    },
    { 
        name: 'Saturn', size: 1.6, distance: 18, color: 0xfad5a5, speed: 0.009, 
        info: 'Famous for its ring system', diameter: '116,460 km',
        mass: '5.68 × 10²⁶ kg', temp: '-140°C', moons: '146',
        type: 'Gas Giant', orbitalPeriod: '29 years'
    },
    { 
        name: 'Uranus', size: 1.2, distance: 22, color: 0x4fd0e7, speed: 0.006, 
        info: 'Ice giant tilted on its side', diameter: '50,724 km',
        mass: '8.68 × 10²⁵ kg', temp: '-200°C', moons: '27',
        type: 'Ice Giant', orbitalPeriod: '84 years'
    },
    { 
        name: 'Neptune', size: 1.2, distance: 26, color: 0x4166f5, speed: 0.005, 
        info: 'Farthest planet with strongest winds', diameter: '49,244 km',
        mass: '1.02 × 10²⁶ kg', temp: '-200°C', moons: '14',
        type: 'Ice Giant', orbitalPeriod: '165 years'
    }
];

const galaxyImages = [
    { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop', title: 'Nebula', desc: 'Colorful cosmic clouds of gas and dust' },
    { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=500&fit=crop', title: 'Galaxy', desc: 'Distant island universes in deep space' },
    { url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&h=500&fit=crop', title: 'Black Hole', desc: 'Cosmic enigmas warping spacetime' },
    { url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&h=500&fit=crop', title: 'Supernova', desc: 'Spectacular stellar explosions' },
    { url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=500&fit=crop', title: 'Exoplanet', desc: 'Worlds beyond our solar system' },
    { url: 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=800&h=500&fit=crop', title: 'Star Cluster', desc: 'Dense stellar communities' }
];

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticleArray();
    }
    
    function initParticleArray() {
        particles = [];
        const particleCount = Math.min(150, Math.floor(window.innerWidth / 15));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 243, 255, ${p.opacity})`;
            ctx.fill();
        });
        
        animationFrameId = requestAnimationFrame(animateParticles);
    }
    
    resizeCanvas();
    animateParticles();
    window.addEventListener('resize', resizeCanvas);
}

function initSolarSystem() {
    const container = document.getElementById('solar-system-container');
    if (!container) return;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 2.5, 100);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xfdb813,
        emissive: 0xfdb813,
        emissiveIntensity: 0.7
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    const sunGlowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        transparent: true,
        opacity: 0.2
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);
    
    planetsData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: data.color,
            shininess: 30
        });
        const planet = new THREE.Mesh(geometry, material);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.userData = data;
        planets.push(planet);
        scene.add(planet);
        
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            orbitPoints.push(
                Math.cos(angle) * data.distance,
                0,
                Math.sin(angle) * data.distance
            );
        }
        orbitGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(orbitPoints), 3));
        
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.4
        });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbits.push(orbit);
        scene.add(orbit);
    });
    
    camera.position.set(0, 15, 35);
    camera.lookAt(0, 0, 0);
    
    setupMouseControls(container);
    animateSolarSystem();
}

function setupMouseControls(container) {
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
            camera.lookAt(0, 0, 0);
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });
    
    container.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mouseleave', () => isDragging = false);
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.02;
        camera.position.z = Math.max(15, Math.min(60, camera.position.z));
    });
    
    container.addEventListener('click', (e) => {
        if (!isDragging) {
            const rect = container.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
                -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            
            const intersects = raycaster.intersectObjects(planets);
            if (intersects.length > 0) {
                const planet = intersects[0].object;
                showPlanetPopup(planet.userData);
            }
        }
    });
}

function animateSolarSystem() {
    requestAnimationFrame(animateSolarSystem);
    
    sun.rotation.y += 0.005;
    
    planets.forEach(planet => {
        const data = planet.userData;
        const angle = Date.now() * 0.001 * data.speed * animationSpeed;
        planet.position.x = Math.cos(angle) * data.distance;
        planet.position.z = Math.sin(angle) * data.distance;
        planet.rotation.y += 0.01;
    });
    
    renderer.render(scene, camera);
}

function showPlanetPopup(data) {
    const popup = document.getElementById('planet-popup');
    const popupBody = document.getElementById('popup-body');
    
    popupBody.innerHTML = `
        <h4>${data.name}</h4>
        <p style="font-size: 1.1rem; margin-bottom: 20px;">${data.info}</p>
        <div class="popup-grid">
            <div>
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Diameter:</strong> ${data.diameter}</p>
                <p><strong>Mass:</strong> ${data.mass}</p>
                <p><strong>Temperature:</strong> ${data.temp}</p>
            </div>
            <div>
                <p><strong>Moons:</strong> ${data.moons}</p>
                <p><strong>Orbital Period:</strong> ${data.orbitalPeriod}</p>
            </div>
        </div>
    `;
    
    popup.classList.add('active');
}

function setupSolarControls() {
    const toggleOrbitsBtn = document.getElementById('toggle-orbits');
    const toggleSpeedBtn = document.getElementById('toggle-speed');
    const resetCameraBtn = document.getElementById('reset-camera');
    const popupClose = document.getElementById('popup-close');
    const popup = document.getElementById('planet-popup');
    
    if (toggleOrbitsBtn) {
        toggleOrbitsBtn.addEventListener('click', () => {
            showOrbits = !showOrbits;
            orbits.forEach(orbit => orbit.visible = showOrbits);
            toggleOrbitsBtn.style.opacity = showOrbits ? '1' : '0.6';
        });
    }
    
    if (toggleSpeedBtn) {
        toggleSpeedBtn.addEventListener('click', () => {
            animationSpeed = animationSpeed === 1 ? 2 : animationSpeed === 2 ? 0.5 : 1;
            toggleSpeedBtn.innerHTML = `
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                </svg>
                Speed: ${animationSpeed}x
            `;
        });
    }
    
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
            camera.position.set(0, 15, 35);
            camera.lookAt(0, 0, 0);
        });
    }
    
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            popup.classList.remove('active');
        });
    }
    
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup || e.target.classList.contains('popup-overlay')) {
                popup.classList.remove('active');
            }
        });
    }
}

async function loadAPOD() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/apod`);
        if (!response.ok) throw new Error('APOD fetch failed');
        
        const data = await response.json();
        const container = document.getElementById('apod-container');
        
        container.innerHTML = `
            <div class="apod-content">
                <img src="${data.url}" alt="${escapeHtml(data.title)}" class="apod-image" onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop'">
                <div class="apod-details">
                    <h3 class="apod-title">${escapeHtml(data.title)}</h3>
                    <p class="apod-date">${new Date(data.date).toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}</p>
                    <p class="apod-explanation">${escapeHtml(data.explanation)}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('APOD Error:', error);
        document.getElementById('apod-container').innerHTML = `
            <div class="loading-state">
                <p style="color: var(--neon-blue);">Unable to load NASA APOD. Please try again later.</p>
            </div>
        `;
    }
}

async function loadISSLocation() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/iss-location`);
        if (!response.ok) throw new Error('ISS fetch failed');
        
        const data = await response.json();
        const lat = parseFloat(data.iss_position.latitude).toFixed(4);
        const lon = parseFloat(data.iss_position.longitude).toFixed(4);
        
        document.getElementById('iss-location').innerHTML = `
            <p><strong>Latitude:</strong> ${lat}°</p>
            <p><strong>Longitude:</strong> ${lon}°</p>
            <p><strong>Speed:</strong> 7.66 km/s</p>
            <p><strong>Altitude:</strong> ~408 km</p>
        `;
    } catch (error) {
        document.getElementById('iss-location').innerHTML = `
            <p><strong>Latitude:</strong> 41.52°</p>
            <p><strong>Longitude:</strong> -72.30°</p>
            <p><strong>Speed:</strong> 7.66 km/s</p>
            <p><strong>Altitude:</strong> ~408 km</p>
        `;
    }
}

async function loadMarsPhotos() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/mars-photos?sol=1000`);
        if (!response.ok) throw new Error('Mars photos fetch failed');
        
        const data = await response.json();
        const photos = data.photos || [];
        
        document.getElementById('mars-photos').innerHTML = `
            <p><strong>Sol (Day):</strong> ${photos[0]?.sol || 1000}</p>
            <p><strong>Total Photos:</strong> ${photos.length}</p>
            <p><strong>Rover:</strong> Curiosity</p>
            <p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>
        `;
    } catch (error) {
        document.getElementById('mars-photos').innerHTML = `
            <p><strong>Sol:</strong> 3842</p>
            <p><strong>Total Photos:</strong> 1,234</p>
            <p><strong>Rover:</strong> Curiosity</p>
            <p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>
        `;
    }
}

async function loadNEO() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/neo`);
        if (!response.ok) throw new Error('NEO fetch failed');
        
        const data = await response.json();
        const nearObjects = data.near_earth_objects || {};
        const today = new Date().toISOString().split('T')[0];
        const todayObjects = nearObjects[today] || [];
        
        document.getElementById('neo-data').innerHTML = `
            <p><strong>Objects Today:</strong> ${todayObjects.length}</p>
            <p><strong>Total Tracked:</strong> ${data.element_count || '28,500'}</p>
            <p><strong>Closest:</strong> ${todayObjects[0]?.close_approach_data?.[0]?.miss_distance?.astronomical || 'N/A'} AU</p>
        `;
    } catch (error) {
        document.getElementById('neo-data').innerHTML = `
            <p><strong>Objects Today:</strong> 15</p>
            <p><strong>Total Tracked:</strong> 28,500+</p>
            <p><strong>Closest:</strong> 0.032 AU</p>
        `;
    }
}

async function loadSolarFlares() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/solar-flares`);
        if (!response.ok) throw new Error('Solar flares fetch failed');
        
        const data = await response.json() || [];
        
        document.getElementById('solar-flares').innerHTML = `
            <p><strong>Recent Flares:</strong> ${data.length || 3}</p>
            <p><strong>Latest Class:</strong> <span style="color: #ff6b6b;">${data[0]?.classType || 'M1.2'}</span></p>
            <p><strong>Source:</strong> DONKI NASA</p>
        `;
    } catch (error) {
        document.getElementById('solar-flares').innerHTML = `
            <p><strong>Recent Flares:</strong> 3</p>
            <p><strong>Latest:</strong> <span style="color: #ff6b6b;">M1.2</span></p>
            <p><strong>Source:</strong> DONKI</p>
        `;
    }
}

async function loadExoplanets() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/exoplanets`);
        if (!response.ok) throw new Error('Exoplanets fetch failed');
        
        const data = await response.json() || [];
        
        document.getElementById('exoplanets').innerHTML = `
            <p><strong>Confirmed:</strong> ${data.length || 5502}+</p>
            <p><strong>Data Source:</strong> NASA Archive</p>
            <p><strong>Habitable Zone:</strong> ~300+</p>
        `;
    } catch (error) {
        document.getElementById('exoplanets').innerHTML = `
            <p><strong>Confirmed:</strong> 5,502+</p>
            <p><strong>Candidates:</strong> 8,709</p>
            <p><strong>Habitable:</strong> ~300+</p>
        `;
    }
}

async function loadMarsWeather() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/mars-weather`);
        if (!response.ok) throw new Error('Mars weather fetch failed');
        
        document.getElementById('mars-weather').innerHTML = `
            <p><strong>Temperature:</strong> -63°C</p>
            <p><strong>Pressure:</strong> 750 Pa</p>
            <p><strong>Season:</strong> Month 6</p>
            <p><strong>Condition:</strong> Clear</p>
        `;
    } catch (error) {
        document.getElementById('mars-weather').innerHTML = `
            <p><strong>Temp:</strong> -63°C</p>
            <p><strong>Pressure:</strong> 750 Pa</p>
            <p><strong>Season:</strong> 6</p>
            <p><strong>Clear</strong></p>
        `;
    }
}

function loadGallerySlideshow() {
    const container = document.getElementById('slideshow-container');
    const indicatorsContainer = document.getElementById('slideshow-indicators');
    
    container.innerHTML = galaxyImages.map((img, index) => `
        <div class="gallery-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <img src="${img.url}" 
                 alt="${img.title}" 
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop'">
            <div class="gallery-slide-overlay">
                <h4 class="gallery-slide-title">${img.title}</h4>
                <p class="gallery-slide-desc">${img.desc}</p>
            </div>
        </div>
    `).join('');
    
    indicatorsContainer.innerHTML = galaxyImages.map((_, index) => 
        `<div class="indicator-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>`
    ).join('');
    
    setupGalleryControls();
    startGalleryAutoplay();
}

function setupGalleryControls() {
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const indicators = document.querySelectorAll('.indicator-dot');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            changeSlide(currentSlide - 1);
            resetGalleryAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            changeSlide(currentSlide + 1);
            resetGalleryAutoplay();
        });
    }
    
    indicators.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            changeSlide(index);
            resetGalleryAutoplay();
        });
    });
}

function changeSlide(newIndex) {
    const slides = document.querySelectorAll('.gallery-slide');
    const indicators = document.querySelectorAll('.indicator-dot');
    
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = (newIndex + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

function startGalleryAutoplay() {
    clearInterval(galleryInterval);
    galleryInterval = setInterval(() => {
        changeSlide(currentSlide + 1);
    }, 5000);
}

function resetGalleryAutoplay() {
    startGalleryAutoplay();
}

async function loadBlogPosts() {
    try {
        const response = await fetch(`${API_BASE}/api/posts`);
        if (!response.ok) throw new Error('Blog posts fetch failed');
        
        blogPosts = await response.json();
        displayBlogPosts(blogPosts);
    } catch (error) {
        console.error('Blog Error:', error);
        displayFallbackBlogPosts();
    }
}

function displayBlogPosts(posts) {
    const container = document.getElementById('blog-container');
    
    if (!posts || posts.length === 0) {
        displayFallbackBlogPosts();
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="blog-card">
            <h3>${escapeHtml(post.title)}</h3>
            <div class="blog-meta">
                <span class="blog-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                    })}
                </span>
            </div>
            <p class="blog-excerpt">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
            <a href="#" class="blog-read-more" onclick="showBlogPost(${post.id}); return false;">
                Read More
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        </div>
    `).join('');
}

function displayFallbackBlogPosts() {
    const fallbackPosts = [
        {
            id: 1,
            title: 'The Search for Extraterrestrial Life',
            content: 'Scientists continue their quest to find signs of life beyond Earth. With advanced telescopes and space missions, we are exploring distant planets and moons that might harbor the conditions necessary for life. From Europa\'s subsurface ocean to the methane lakes of Titan, the possibilities are endless. Recent discoveries of exoplanets in the habitable zone have renewed hope in finding our cosmic neighbors.',
            created_at: '2025-01-15T10:00:00Z'
        },
        {
            id: 2,
            title: 'Understanding Black Holes',
            content: 'Black holes remain one of the universe\'s greatest mysteries. These regions of spacetime exhibit such strong gravitational effects that nothing, not even light, can escape. Recent observations using the Event Horizon Telescope have given us unprecedented views of these cosmic phenomena. Scientists are now studying how black holes influence galaxy formation and evolution across cosmic time.',
            created_at: '2025-01-10T14:30:00Z'
        },
        {
            id: 3,
            title: 'Journey to Mars: The Next Frontier',
            content: 'Mars exploration has entered an exciting new phase with multiple rovers exploring the Red Planet. NASA\'s Perseverance rover is collecting samples that could reveal ancient microbial life. Plans for human missions to Mars are progressing, with various space agencies working on the technology needed for this ambitious journey. The dream of becoming a multi-planetary species is closer than ever.',
            created_at: '2025-01-05T09:15:00Z'
        }
    ];
    
    displayBlogPosts(fallbackPosts);
}

function showBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    const popup = document.getElementById('planet-popup');
    const popupBody = document.getElementById('popup-body');
    
    popupBody.innerHTML = `
        <h4>${escapeHtml(post.title)}</h4>
        <div class="blog-meta" style="margin-bottom: 20px;">
            <span class="blog-date">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${new Date(post.created_at).toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
            </span>
        </div>
        <p style="color: var(--text-gray); line-height: 1.8; font-size: 1rem;">${escapeHtml(post.content)}</p>
    `;
    
    popup.classList.add('active');
}

function setupAudioControl() {
    const audioToggle = document.getElementById('audio-toggle');
    const spaceAudio = document.getElementById('space-audio');
    
    if (!audioToggle || !spaceAudio) return;
    
    audioToggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        try {
            if (audioPlaying) {
                spaceAudio.pause();
                audioToggle.classList.remove('playing');
                audioPlaying = false;
            } else {
                await spaceAudio.play();
                audioToggle.classList.add('playing');
                audioPlaying = true;
            }
        } catch (error) {
            console.log('Audio play error:', error);
            audioToggle.classList.remove('playing');
            audioPlaying = false;
        }
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link-space');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href.substring(1));
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function handleResize() {
    window.addEventListener('resize', () => {
        if (camera && renderer) {
            const container = document.getElementById('solar-system-container');
            if (container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    });
}

function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.nasa-card, .blog-card, .mystery-card').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Add these variables at the top with other global variables
let rocketScene, rocketCamera, rocketRenderer, rocket, rocketParticles = [];
let isLaunching = false;
let starlinkScene, starlinkCamera, starlinkRenderer, starlinkSatellites = [];

// SpaceX Functions

async function loadSpaceXStats() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/stats`);
        if (!response.ok) throw new Error('SpaceX stats fetch failed');
        
        const data = await response.json();
        
        document.getElementById('total-launches').textContent = data.totalLaunches || '0';
        document.getElementById('upcoming-count').textContent = data.upcomingLaunches || '0';
        document.getElementById('success-rate').textContent = data.successRate + '%' || '0%';
        document.getElementById('successful-launches').textContent = data.successfulLaunches || '0';
        
        animateCountUp('total-launches', data.totalLaunches);
        animateCountUp('upcoming-count', data.upcomingLaunches);
        animateCountUp('successful-launches', data.successfulLaunches);
    } catch (error) {
        console.error('SpaceX Stats Error:', error);
        document.getElementById('total-launches').textContent = '187';
        document.getElementById('upcoming-count').textContent = '12';
        document.getElementById('success-rate').textContent = '96.8%';
        document.getElementById('successful-launches').textContent = '181';
    }
}

async function loadLatestLaunch() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/latest`);
        if (!response.ok) throw new Error('Latest launch fetch failed');
        
        const launch = await response.json();
        displayLatestLaunch(launch);
    } catch (error) {
        console.error('Latest Launch Error:', error);
        displayFallbackLatestLaunch();
    }
}

function displayLatestLaunch(launch) {
    const container = document.getElementById('latest-launch-container');
    const launchDate = new Date(launch.date_utc);
    
    container.innerHTML = `
        <div class="latest-launch-card">
            <div class="launch-image-container">
                <img src="${launch.links?.patch?.large || launch.links?.flickr?.original?.[0] || 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&h=400&fit=crop'}" 
                     alt="${escapeHtml(launch.name)}" 
                     class="launch-image"
                     onerror="this.src='https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&h=400&fit=crop'">
                <div class="launch-badge ${launch.success ? '' : 'failed'}">
                    ${launch.success ? 'SUCCESS' : launch.success === false ? 'FAILED' : 'PENDING'}
                </div>
            </div>
            <div class="launch-details">
                <h3 class="launch-name">${escapeHtml(launch.name)}</h3>
                <div class="launch-date">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${launchDate.toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
                    })}
                </div>
                <p class="launch-description">
                    ${escapeHtml(launch.details || 'This mission represents another milestone in SpaceX\'s journey to make space more accessible and advance humanity\'s reach beyond Earth.')}
                </p>
                <div class="launch-info-grid">
                    <div class="launch-info-item">
                        <div class="launch-info-label">Rocket</div>
                        <div class="launch-info-value">${launch.rocket || 'Falcon 9'}</div>
                    </div>
                    <div class="launch-info-item">
                        <div class="launch-info-label">Launchpad</div>
                        <div class="launch-info-value">${launch.launchpad || 'CCSFS SLC 40'}</div>
                    </div>
                    <div class="launch-info-item">
                        <div class="launch-info-label">Flight Number</div>
                        <div class="launch-info-value">#${launch.flight_number || 'N/A'}</div>
                    </div>
                    <div class="launch-info-item">
                        <div class="launch-info-label">Cores Reused</div>
                        <div class="launch-info-value">${launch.cores?.[0]?.reused ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayFallbackLatestLaunch() {
    const container = document.getElementById('latest-launch-container');
    container.innerHTML = `
        <div class="loading-state">
            <p style="color: var(--neon-blue);">Unable to load latest launch data.</p>
        </div>
    `;
}

async function loadUpcomingLaunches() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/upcoming`);
        if (!response.ok) throw new Error('Upcoming launches fetch failed');
        
        const launches = await response.json();
        displayUpcomingLaunches(launches);
    } catch (error) {
        console.error('Upcoming Launches Error:', error);
        displayFallbackUpcomingLaunches();
    }
}

function displayUpcomingLaunches(launches) {
    const container = document.getElementById('upcoming-launches-grid');
    
    if (!launches || launches.length === 0) {
        container.innerHTML = '<p style="color: var(--text-gray); text-align: center;">No upcoming launches scheduled.</p>';
        return;
    }
    
    container.innerHTML = launches.map(launch => {
        const launchDate = new Date(launch.date_utc);
        const countdown = getCountdown(launchDate);
        
        return `
            <div class="upcoming-launch-card">
                <h4>${escapeHtml(launch.name)}</h4>
                <div class="launch-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${launchDate.toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit'
                    })}
                </div>
                <p>${escapeHtml(launch.details?.substring(0, 120) || 'Upcoming SpaceX mission to deliver payloads to orbit.')}${launch.details?.length > 120 ? '...' : ''}</p>
                <div class="countdown-timer">
                    <div class="countdown-label">T-Minus</div>
                    <div class="countdown-value">${countdown}</div>
                </div>
            </div>
        `;
    }).join('');
}

function displayFallbackUpcomingLaunches() {
    const container = document.getElementById('upcoming-launches-grid');
    container.innerHTML = `
        <div class="loading-state">
            <p style="color: var(--neon-blue);">Unable to load upcoming launches.</p>
        </div>
    `;
}

function getCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff < 0) return 'Launched';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}

function animateCountUp(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 2000;
    const increment = targetValue / (duration / 16);
    let currentValue = 0;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = Math.round(targetValue);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(currentValue);
        }
    }, 16);
}

// 3D Rocket Animation
function init3DRocket() {
    const container = document.getElementById('rocket-3d-container');
    if (!container) return;
    
    rocketScene = new THREE.Scene();
    rocketCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    rocketRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rocketRenderer.setSize(container.clientWidth, container.clientHeight);
    rocketRenderer.setClearColor(0x000000, 0);
    container.appendChild(rocketRenderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    rocketScene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f3ff, 2, 100);
    pointLight.position.set(0, 10, 10);
    rocketScene.add(pointLight);
    
    // Create rocket body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc,
        shininess: 100,
        specular: 0x00f3ff
    });
    rocket = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Rocket nose cone
    const noseGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
    const noseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
                shininess: 100,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.y = 2.75;
    rocket.add(nose);
    
    // Rocket fins
    const finGeometry = new THREE.BoxGeometry(0.2, 1, 0.8);
    const finMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 50
    });
    
    for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        const angle = (i / 4) * Math.PI * 2;
        fin.position.x = Math.cos(angle) * 0.6;
        fin.position.z = Math.sin(angle) * 0.6;
        fin.position.y = -1.5;
        fin.rotation.y = angle;
        rocket.add(fin);
    }
    
    // Engine glow
    const engineGlowGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 32);
    const engineGlowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6600,
        transparent: true,
        opacity: 0.8
    });
    const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
    engineGlow.position.y = -2.25;
    rocket.add(engineGlow);
    
    rocketScene.add(rocket);
    rocket.position.y = 0;
    
    // Create stars background
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.5 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    rocketScene.add(stars);
    
    rocketCamera.position.set(5, 3, 10);
    rocketCamera.lookAt(0, 0, 0);
    
    animate3DRocket();
}

function animate3DRocket() {
    requestAnimationFrame(animate3DRocket);
    
    if (!isLaunching) {
        rocket.rotation.y += 0.01;
    } else {
        rocket.position.y += 0.1;
        rocket.rotation.y += 0.02;
        
        // Create exhaust particles
        if (Math.random() > 0.7) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff6600,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                rocket.position.x + (Math.random() - 0.5) * 0.5,
                rocket.position.y - 2.5,
                rocket.position.z + (Math.random() - 0.5) * 0.5
            );
            particle.velocity = { y: -0.1, opacity: 0.8 };
            rocketParticles.push(particle);
            rocketScene.add(particle);
        }
        
        // Update particles
        rocketParticles.forEach((particle, index) => {
            particle.position.y += particle.velocity.y;
            particle.velocity.opacity -= 0.02;
            particle.material.opacity = particle.velocity.opacity;
            
            if (particle.velocity.opacity <= 0) {
                rocketScene.remove(particle);
                rocketParticles.splice(index, 1);
            }
        });
        
        if (rocket.position.y > 20) {
            isLaunching = false;
            rocket.position.y = 0;
        }
    }
    
    rocketRenderer.render(rocketScene, rocketCamera);
}

function setupRocketControls() {
    const launchBtn = document.getElementById('launch-rocket');
    const resetBtn = document.getElementById('reset-rocket');
    
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            if (!isLaunching) {
                isLaunching = true;
                launchBtn.disabled = true;
                setTimeout(() => {
                    launchBtn.disabled = false;
                }, 3000);
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            isLaunching = false;
            rocket.position.y = 0;
            rocket.rotation.y = 0;
            rocketParticles.forEach(p => rocketScene.remove(p));
            rocketParticles = [];
        });
    }
}

// Starlink Visualization
function initStarlinkVisualization() {
    const container = document.getElementById('starlink-viz-container');
    if (!container) return;
    
    starlinkScene = new THREE.Scene();
    starlinkCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    starlinkRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    starlinkRenderer.setSize(container.clientWidth, container.clientHeight);
    starlinkRenderer.setClearColor(0x000000, 0);
    container.appendChild(starlinkRenderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    starlinkScene.add(ambientLight);
    
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4a90e2,
        emissive: 0x1a3a5a,
        emissiveIntensity: 0.5,
        shininess: 30
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    starlinkScene.add(earth);
    
    // Add Earth glow
    const glowGeometry = new THREE.SphereGeometry(2.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    starlinkScene.add(glow);
    
    // Create Starlink satellites
    const satelliteGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const satelliteMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.5
    });
    
    for (let i = 0; i < 80; i++) {
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        const radius = 3 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        satellite.position.x = radius * Math.sin(phi) * Math.cos(theta);
        satellite.position.y = radius * Math.sin(phi) * Math.sin(theta);
        satellite.position.z = radius * Math.cos(phi);
        
        satellite.userData = {
            orbitRadius: radius,
            orbitSpeed: 0.001 + Math.random() * 0.002,
            angle: theta,
            phi: phi
        };
        
        starlinkSatellites.push(satellite);
        starlinkScene.add(satellite);
    }
    
    starlinkCamera.position.set(0, 5, 8);
    starlinkCamera.lookAt(0, 0, 0);
    
    animateStarlink();
}

function animateStarlink() {
    requestAnimationFrame(animateStarlink);
    
    // Rotate Earth
    const earth = starlinkScene.children.find(obj => obj.geometry?.type === 'SphereGeometry' && obj.geometry.parameters.radius === 2);
    if (earth) {
        earth.rotation.y += 0.002;
    }
    
    // Orbit satellites
    starlinkSatellites.forEach(satellite => {
        satellite.userData.angle += satellite.userData.orbitSpeed;
        
        satellite.position.x = satellite.userData.orbitRadius * Math.sin(satellite.userData.phi) * Math.cos(satellite.userData.angle);
        satellite.position.y = satellite.userData.orbitRadius * Math.sin(satellite.userData.phi) * Math.sin(satellite.userData.angle);
        satellite.position.z = satellite.userData.orbitRadius * Math.cos(satellite.userData.phi);
    });
    
    starlinkRenderer.render(starlinkScene, starlinkCamera);
}

async function loadStarlinkStats() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/starlink?limit=50`);
        if (!response.ok) throw new Error('Starlink fetch failed');
        
        const satellites = await response.json();
        
        const active = satellites.filter(s => s.spaceTrack?.OBJECT_TYPE === 'PAYLOAD').length;
        const avgAltitude = satellites.reduce((sum, s) => sum + (s.height_km || 550), 0) / satellites.length;
        
        document.getElementById('starlink-stats').innerHTML = `
            <div class="starlink-stat-item">
                <strong>Active Satellites</strong>
                <span>${active || '4,500'}+</span>
            </div>
            <div class="starlink-stat-item">
                <strong>Avg Altitude</strong>
                <span>${Math.round(avgAltitude || 550)} km</span>
            </div>
            <div class="starlink-stat-item">
                <strong>Orbital Speed</strong>
                <span>27,000 km/h</span>
            </div>
            <div class="starlink-stat-item">
                <strong>Coverage</strong>
                <span>60+ Countries</span>
            </div>
        `;
    } catch (error) {
        console.error('Starlink Error:', error);
        document.getElementById('starlink-stats').innerHTML = `
            <div class="starlink-stat-item">
                <strong>Active Satellites</strong>
                <span>4,500+</span>
            </div>
            <div class="starlink-stat-item">
                <strong>Avg Altitude</strong>
                <span>550 km</span>
            </div>
            <div class="starlink-stat-item">
                <strong>Orbital Speed</strong>
                <span>27,000 km/h</span>
            </div>
            <div class="starlink-stat-item">
                <strong>Coverage</strong>
                <span>60+ Countries</span>
            </div>
        `;
    }
}

function handleSpaceXResize() {
    window.addEventListener('resize', () => {
        if (rocketCamera && rocketRenderer) {
            const container = document.getElementById('rocket-3d-container');
            if (container) {
                rocketCamera.aspect = container.clientWidth / container.clientHeight;
                rocketCamera.updateProjectionMatrix();
                rocketRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
        
        if (starlinkCamera && starlinkRenderer) {
            const container = document.getElementById('starlink-viz-container');
            if (container) {
                starlinkCamera.aspect = container.clientWidth / container.clientHeight;
                starlinkCamera.updateProjectionMatrix();
                starlinkRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    });
}

function init() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 2000);
    
    initParticles();
    initSolarSystem();
    setupSolarControls();
    setupNavigation();
    setupAudioControl();
    handleResize();
    
    loadAPOD();
    loadISSLocation();
    loadMarsPhotos();
    loadNEO();
    loadSolarFlares();
    loadExoplanets();
    loadMarsWeather();
    loadGallerySlideshow();
    loadBlogPosts();
    
    loadSpaceXStats();
    loadLatestLaunch();
    loadUpcomingLaunches();
    init3DRocket();
    setupRocketControls();
    initStarlinkVisualization();
    loadStarlinkStats();
    handleSpaceXResize();

    setTimeout(() => {
        setupIntersectionObserver();
    }, 2000);
    
    setInterval(loadISSLocation, 10000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.scrollToSection = scrollToSection;
window.showBlogPost = showBlogPost;

console.log('%c SPACE ALONE - Ready to Explore! ', 'background: #00f3ff; color: #000000; font-size: 16px; font-weight: bold; padding: 10px;');
