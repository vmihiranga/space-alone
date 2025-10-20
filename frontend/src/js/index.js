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
