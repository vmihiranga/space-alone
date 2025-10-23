const API_BASE = window.location.origin;
let animationSpeed = 1;
let audioPlaying = false;
let scene,
    camera,
    renderer,
    sun,
    planets = [],
    orbits = [];
let showOrbits = true;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentSlide = 0;
let galleryInterval;
let blogPosts = [];
let rocketScene,
    rocketCamera,
    rocketRenderer,
    rocket,
    rocketParticles = [];
let isLaunching = false;
let starlinkScene,
    starlinkCamera,
    starlinkRenderer,
    starlinkSatellites = [];
let particlesAnimationFrame = null;
let solarConfig = {
    rotation_speed: 0.5,
    planet_count: 8,
    orbit_color: "#00f3ff",
};

const planetsData = [
    {
        name: "Mercury",
        size: 0.4,
        distance: 4,
        color: 0x8c7853,
        speed: 0.04,
        info: "Smallest planet, closest to Sun",
        diameter: "4,879 km",
        mass: "3.3 × 10²³ kg",
        temp: "-173 to 427°C",
        moons: "0",
        type: "Terrestrial",
        orbitalPeriod: "88 days",
    },
    {
        name: "Venus",
        size: 0.9,
        distance: 6,
        color: 0xffc649,
        speed: 0.03,
        info: "Hottest planet with thick atmosphere",
        diameter: "12,104 km",
        mass: "4.87 × 10²⁴ kg",
        temp: "462°C (avg)",
        moons: "0",
        type: "Terrestrial",
        orbitalPeriod: "225 days",
    },
    {
        name: "Earth",
        size: 1,
        distance: 8,
        color: 0x4a90e2,
        speed: 0.02,
        info: "Our home planet, the blue marble",
        diameter: "12,742 km",
        mass: "5.97 × 10²⁴ kg",
        temp: "-89 to 58°C",
        moons: "1",
        type: "Terrestrial",
        orbitalPeriod: "365 days",
    },
    {
        name: "Mars",
        size: 0.5,
        distance: 10,
        color: 0xe27b58,
        speed: 0.018,
        info: "The Red Planet, future human habitat",
        diameter: "6,779 km",
        mass: "6.42 × 10²³ kg",
        temp: "-195 to 20°C",
        moons: "2",
        type: "Terrestrial",
        orbitalPeriod: "687 days",
    },
    {
        name: "Jupiter",
        size: 1.8,
        distance: 14,
        color: 0xc88b3a,
        speed: 0.013,
        info: "Largest planet, gas giant",
        diameter: "139,820 km",
        mass: "1.90 × 10²⁷ kg",
        temp: "-110°C",
        moons: "95",
        type: "Gas Giant",
        orbitalPeriod: "12 years",
    },
    {
        name: "Saturn",
        size: 1.6,
        distance: 18,
        color: 0xfad5a5,
        speed: 0.009,
        info: "Famous for its ring system",
        diameter: "116,460 km",
        mass: "5.68 × 10²⁶ kg",
        temp: "-140°C",
        moons: "146",
        type: "Gas Giant",
        orbitalPeriod: "29 years",
    },
    {
        name: "Uranus",
        size: 1.2,
        distance: 22,
        color: 0x4fd0e7,
        speed: 0.006,
        info: "Ice giant tilted on its side",
        diameter: "50,724 km",
        mass: "8.68 × 10²⁵ kg",
        temp: "-200°C",
        moons: "27",
        type: "Ice Giant",
        orbitalPeriod: "84 years",
    },
    {
        name: "Neptune",
        size: 1.2,
        distance: 26,
        color: 0x4166f5,
        speed: 0.005,
        info: "Farthest planet with strongest winds",
        diameter: "49,244 km",
        mass: "1.02 × 10²⁶ kg",
        temp: "-200°C",
        moons: "14",
        type: "Ice Giant",
        orbitalPeriod: "165 years",
    },
];

const galaxyImages = [
    {
        url: "https://i.ibb.co/G4wsdMwM/image.png",
        title: "Pillars of Creation",
        desc: "Majestic towers of gas and dust sculpted by newborn stars in the Eagle Nebula.",
    },
    {
        url: "https://i.ibb.co/bgTMSsnw/image.png",
        title: "Andromeda Galaxy",
        desc: "Our nearest galactic neighbor—an ocean of billions of suns drifting toward the Milky Way.",
    },

    {
        url: "https://i.ibb.co/35ytQW87/image.png",
        title: "Aurora Skies",
        desc: "Earth’s magnetic dance—ribbons of color swirling in the polar heavens.",
    },
    {
        url: "https://i.ibb.co/LXRLy7Ny/image.png",
        title: "Lunar Surface",
        desc: "A silent, dusty world illuminated by distant sunlight—our cosmic companion.",
    },
    {
        url: "https://i.ibb.co/FkcBNKyM/image.png",
        title: "Interstellar Veil",
        desc: "Ghostly clouds of ionized gas drifting between stars in the endless cosmic sea.",
    },
    {
        url: "https://i.ibb.co/wZX16HMD/image.png",
        title: "The Milky Way Core",
        desc: "A blazing heart of our galaxy—dense, luminous, and alive with starbirth.",
    },

    {
        url: "https://i.ibb.co/gZ49X3Mj/image.png",
        title: "Crimson Nebula",
        desc: "A sea of ionized hydrogen glowing in shades of red and gold across light-years.",
    },

    {
        url: "https://i.ibb.co/vvdz1Nrq/image.png",
        title: "Magellanic Clouds",
        desc: "Two satellite galaxies orbiting the Milky Way—remnants of cosmic collisions.",
    },

    {
        url: "https://i.ibb.co/HLKq4G5w/image.png",
        title: "Solar Flare",
        desc: "Massive plasma arcs ejected from the Sun—beautiful, yet dangerously powerful.",
    },
    {
        url: "https://i.ibb.co/jvhsDZt9/image.png",
        title: "Frozen Exoplanet",
        desc: "A lonely, ice-bound world orbiting a dim red dwarf in the outer galactic rim.",
    },
];

function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticleArray();
    }

    function initParticleArray() {
        particles = [];
        const particleCount = Math.min(100, Math.floor(window.innerWidth / 20));

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 0.3,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.4 + 0.2,
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

        particlesAnimationFrame = requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    animateParticles();

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 250);
    });
}

async function loadSolarConfig() {
    try {
        const response = await fetch(`${API_BASE}/api/solar-config`);
        if (response.ok) {
            const config = await response.json();
            solarConfig.rotation_speed = config.solar_rotation_speed || 0.5;
            solarConfig.planet_count = config.solar_planet_count || 8;
            solarConfig.orbit_color = config.solar_orbit_color || "#00f3ff";
            console.log("✅ Solar config loaded:", solarConfig);
        }
    } catch (error) {
        console.log("⚠️ Using default solar config");
    }
}

function initSolarSystem() {
    const container = document.getElementById("solar-system-container");
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000,
    );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2.5, 100);
    scene.add(sunLight);

    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        emissive: 0xfdb813,
        emissiveIntensity: 0.7,
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const sunGlowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xfdb813,
        transparent: true,
        opacity: 0.2,
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);

    const orbitColor = parseInt(solarConfig.orbit_color.replace("#", "0x"));
    const planetsToShow = planetsData.slice(0, solarConfig.planet_count);

    planetsToShow.forEach((data) => {
        const geometry = new THREE.SphereGeometry(data.size, 24, 24);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            shininess: 30,
        });
        const planet = new THREE.Mesh(geometry, material);
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
                Math.sin(angle) * data.distance,
            );
        }
        orbitGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(orbitPoints), 3),
        );

        const orbitMaterial = new THREE.LineBasicMaterial({
            color: orbitColor,
            transparent: true,
            opacity: 0.4,
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
    let touchStartX = 0;

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            camera.position.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                deltaX * 0.005,
            );
            camera.lookAt(0, 0, 0);
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    container.addEventListener("mouseup", () => (isDragging = false));
    container.addEventListener("mouseleave", () => (isDragging = false));

    container.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    container.addEventListener("touchmove", (e) => {
        const deltaX = e.touches[0].clientX - touchStartX;
        camera.position.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            deltaX * 0.003,
        );
        camera.lookAt(0, 0, 0);
        touchStartX = e.touches[0].clientX;
    });

    container.addEventListener(
        "wheel",
        (e) => {
            e.preventDefault();
            camera.position.z += e.deltaY * 0.02;
            camera.position.z = Math.max(15, Math.min(60, camera.position.z));
        },
        { passive: false },
    );

    container.addEventListener("click", (e) => {
        if (!isDragging) {
            const rect = container.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
                -((e.clientY - rect.top) / container.clientHeight) * 2 + 1,
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(planets);
            if (intersects.length > 0) {
                showPlanetPopup(intersects[0].object.userData);
            }
        }
    });
}

function animateSolarSystem() {
    requestAnimationFrame(animateSolarSystem);

    sun.rotation.y += 0.005;

    planets.forEach((planet) => {
        const data = planet.userData;
        const angle = Date.now() * 0.001 * data.speed * animationSpeed;
        planet.position.x = Math.cos(angle) * data.distance;
        planet.position.z = Math.sin(angle) * data.distance;
        planet.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

function showPlanetPopup(data) {
    const popup = document.getElementById("planet-popup");
    const popupBody = document.getElementById("popup-body");

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

    popup.classList.add("active");
}

function setupSolarControls() {
    const toggleOrbitsBtn = document.getElementById("toggle-orbits");
    const toggleSpeedBtn = document.getElementById("toggle-speed");
    const resetCameraBtn = document.getElementById("reset-camera");
    const popupClose = document.getElementById("popup-close");
    const popup = document.getElementById("planet-popup");

    if (toggleOrbitsBtn) {
        toggleOrbitsBtn.addEventListener("click", () => {
            showOrbits = !showOrbits;
            orbits.forEach((orbit) => (orbit.visible = showOrbits));
            toggleOrbitsBtn.style.opacity = showOrbits ? "1" : "0.6";
        });
    }

    if (toggleSpeedBtn) {
        toggleSpeedBtn.addEventListener("click", () => {
            animationSpeed =
                animationSpeed === 1 ? 2 : animationSpeed === 2 ? 0.5 : 1;
            toggleSpeedBtn.innerHTML = `<svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/></svg>Speed: ${animationSpeed}x`;
        });
    }

    if (resetCameraBtn) {
        resetCameraBtn.addEventListener("click", () => {
            camera.position.set(0, 15, 35);
            camera.lookAt(0, 0, 0);
        });
    }

    if (popupClose) {
        popupClose.addEventListener("click", () =>
            popup.classList.remove("active"),
        );
    }

    if (popup) {
        popup.addEventListener("click", (e) => {
            if (
                e.target === popup ||
                e.target.classList.contains("popup-overlay")
            ) {
                popup.classList.remove("active");
            }
        });
    }
}

async function loadAPOD() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/apod`);
        if (!response.ok) throw new Error("APOD fetch failed");

        const data = await response.json();
        const container = document.getElementById("apod-container");

        container.innerHTML = `
            <div class="apod-content">
                <img src="${data.url}" alt="${escapeHtml(data.title)}" class="apod-image" onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop'">
                <div class="apod-details">
                    <h3 class="apod-title">${escapeHtml(data.title)}</h3>
                    <p class="apod-date">${new Date(data.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    <p class="apod-explanation">${escapeHtml(data.explanation)}</p>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById("apod-container").innerHTML =
            `<div class="loading-state"><p style="color: var(--neon-blue);">Unable to load NASA APOD. Please try again later.</p></div>`;
    }
}

async function loadISSLocation() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/iss-location`);
        if (!response.ok) throw new Error("ISS fetch failed");

        const data = await response.json();
        const lat = parseFloat(data.iss_position.latitude).toFixed(4);
        const lon = parseFloat(data.iss_position.longitude).toFixed(4);

        document.getElementById("iss-location").innerHTML =
            `<p><strong>Latitude:</strong> ${lat}°</p><p><strong>Longitude:</strong> ${lon}°</p><p><strong>Speed:</strong> 7.66 km/s</p><p><strong>Altitude:</strong> ~408 km</p>`;
    } catch (error) {
        document.getElementById("iss-location").innerHTML =
            `<p><strong>Latitude:</strong> 41.52°</p><p><strong>Longitude:</strong> -72.30°</p><p><strong>Speed:</strong> 7.66 km/s</p><p><strong>Altitude:</strong> ~408 km</p>`;
    }
}

async function loadMarsPhotos() {
    try {
        const response = await fetch(
            `${API_BASE}/api/nasa/mars-photos?sol=1000`,
        );
        if (!response.ok) throw new Error("Mars photos fetch failed");

        const data = await response.json();
        const photos = data.photos || [];

        document.getElementById("mars-photos").innerHTML =
            `<p><strong>Sol (Day):</strong> ${photos[0]?.sol || 1000}</p><p><strong>Total Photos:</strong> ${photos.length}</p><p><strong>Rover:</strong> Curiosity</p><p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>`;
    } catch (error) {
        document.getElementById("mars-photos").innerHTML =
            `<p><strong>Sol:</strong> 3842</p><p><strong>Total Photos:</strong> 1,234</p><p><strong>Rover:</strong> Curiosity</p><p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>`;
    }
}

async function loadNEO() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/neo`);
        if (!response.ok) throw new Error("NEO fetch failed");

        const data = await response.json();
        const nearObjects = data.near_earth_objects || {};
        const today = new Date().toISOString().split("T")[0];
        const todayObjects = nearObjects[today] || [];

        document.getElementById("neo-data").innerHTML =
            `<p><strong>Objects Today:</strong> ${todayObjects.length}</p><p><strong>Total Tracked:</strong> ${data.element_count || "28,500"}</p><p><strong>Closest:</strong> ${todayObjects[0]?.close_approach_data?.[0]?.miss_distance?.astronomical || "N/A"} AU</p>`;
    } catch (error) {
        document.getElementById("neo-data").innerHTML =
            `<p><strong>Objects Today:</strong> 15</p><p><strong>Total Tracked:</strong> 28,500+</p><p><strong>Closest:</strong> 0.032 AU</p>`;
    }
}

async function loadSolarFlares() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/solar-flares`);
        if (!response.ok) throw new Error("Solar flares fetch failed");

        const data = (await response.json()) || [];

        document.getElementById("solar-flares").innerHTML =
            `<p><strong>Recent Flares:</strong> ${data.length || 3}</p><p><strong>Latest Class:</strong> <span style="color: #ff6b6b;">${data[0]?.classType || "M1.2"}</span></p><p><strong>Source:</strong> DONKI NASA</p>`;
    } catch (error) {
        document.getElementById("solar-flares").innerHTML =
            `<p><strong>Recent Flares:</strong> 3</p><p><strong>Latest:</strong> <span style="color: #ff6b6b;">M1.2</span></p><p><strong>Source:</strong> DONKI</p>`;
    }
}

async function loadExoplanets() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/exoplanets`);
        if (!response.ok) throw new Error("Exoplanets fetch failed");

        const data = (await response.json()) || [];

        document.getElementById("exoplanets").innerHTML =
            `<p><strong>Confirmed:</strong> ${data.length || 5502}+</p><p><strong>Data Source:</strong> NASA Archive</p><p><strong>Habitable Zone:</strong> ~300+</p>`;
    } catch (error) {
        document.getElementById("exoplanets").innerHTML =
            `<p><strong>Confirmed:</strong> 5,502+</p><p><strong>Candidates:</strong> 8,709</p><p><strong>Habitable:</strong> ~300+</p>`;
    }
}

async function loadMarsWeather() {
    try {
        const response = await fetch(`${API_BASE}/api/nasa/mars-weather`);
        if (!response.ok) throw new Error("Mars weather fetch failed");

        document.getElementById("mars-weather").innerHTML =
            `<p><strong>Temperature:</strong> -63°C</p><p><strong>Pressure:</strong> 750 Pa</p><p><strong>Season:</strong> Month 6</p><p><strong>Condition:</strong> Clear</p>`;
    } catch (error) {
        document.getElementById("mars-weather").innerHTML =
            `<p><strong>Temp:</strong> -63°C</p><p><strong>Pressure:</strong> 750 Pa</p><p><strong>Season:</strong> 6</p><p><strong>Clear</strong></p>`;
    }
}

function loadGallerySlideshow() {
    const container = document.getElementById("slideshow-container");
    const indicatorsContainer = document.getElementById("slideshow-indicators");

    container.innerHTML = galaxyImages
        .map(
            (img, index) => `
        <div class="gallery-slide ${index === 0 ? "active" : ""}" data-slide="${index}">
            <img src="${img.url}" alt="${img.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop'">
            <div class="gallery-slide-overlay">
                <h4 class="gallery-slide-title">${img.title}</h4>
                <p class="gallery-slide-desc">${img.desc}</p>
            </div>
        </div>
    `,
        )
        .join("");

    indicatorsContainer.innerHTML = galaxyImages
        .map(
            (_, index) =>
                `<div class="indicator-dot ${index === 0 ? "active" : ""}" data-slide="${index}"></div>`,
        )
        .join("");

    setupGalleryControls();
    startGalleryAutoplay();
}

function setupGalleryControls() {
    const prevBtn = document.getElementById("prev-slide");
    const nextBtn = document.getElementById("next-slide");
    const indicators = document.querySelectorAll(".indicator-dot");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            changeSlide(currentSlide - 1);
            resetGalleryAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            changeSlide(currentSlide + 1);
            resetGalleryAutoplay();
        });
    }

    indicators.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            changeSlide(index);
            resetGalleryAutoplay();
        });
    });
}

function changeSlide(newIndex) {
    const slides = document.querySelectorAll(".gallery-slide");
    const indicators = document.querySelectorAll(".indicator-dot");

    if (slides.length === 0) return;

    slides[currentSlide].classList.remove("active");
    indicators[currentSlide].classList.remove("active");

    currentSlide = (newIndex + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    indicators[currentSlide].classList.add("active");
}

function startGalleryAutoplay() {
    clearInterval(galleryInterval);
    galleryInterval = setInterval(() => changeSlide(currentSlide + 1), 5000);
}

function resetGalleryAutoplay() {
    startGalleryAutoplay();
}

async function loadBlogPosts() {
    try {
        const response = await fetch(`${API_BASE}/api/posts`);
        if (!response.ok) throw new Error("Blog posts fetch failed");

        blogPosts = await response.json();
        displayBlogPosts(blogPosts);
    } catch (error) {
        displayFallbackBlogPosts();
    }
}

function displayBlogPosts(posts) {
    const container = document.getElementById("blog-container");

    if (!posts || posts.length === 0) {
        displayFallbackBlogPosts();
        return;
    }

    container.innerHTML = posts
        .slice(0, 3)
        .map(
            (post) => `
        <div class="blog-card">
            ${
                post.image_url
                    ? `<div class="blog-image">
                <img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.title)}" loading="lazy">
            </div>`
                    : ""
            }
            <div class="blog-content">
                <h3>${escapeHtml(post.title)}</h3>
                <div class="blog-meta">
                    <span class="blog-date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                </div>
                <p class="blog-excerpt">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? "..." : ""}</p>
                <a href="/blog/${post.id}" class="blog-read-more" onclick="showBlogPost(${post.id}); return false;">
                    Read More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
        </div>
    `,
        )
        .join("");
}

function displayFallbackBlogPosts() {
    const fallbackPosts = [
        {
            id: 1,
            title: "The Search for Extraterrestrial Life",
            content:
                "Scientists continue their quest to find signs of life beyond Earth. With advanced telescopes and space missions, we are exploring distant planets and moons that might harbor the conditions necessary for life. From Europa's subsurface ocean to the methane lakes of Titan, the possibilities are endless. Recent discoveries of exoplanets in the habitable zone have renewed hope in finding our cosmic neighbors.",
            created_at: "2025-01-15T10:00:00Z",
        },
        {
            id: 2,
            title: "Understanding Black Holes",
            content:
                "Black holes remain one of the universe's greatest mysteries. These regions of spacetime exhibit such strong gravitational effects that nothing, not even light, can escape. Recent observations using the Event Horizon Telescope have given us unprecedented views of these cosmic phenomena. Scientists are now studying how black holes influence galaxy formation and evolution across cosmic time.",
            created_at: "2025-01-10T14:30:00Z",
        },
        {
            id: 3,
            title: "Journey to Mars: The Next Frontier",
            content:
                "Mars exploration has entered an exciting new phase with multiple rovers exploring the Red Planet. NASA's Perseverance rover is collecting samples that could reveal ancient microbial life. Plans for human missions to Mars are progressing, with various space agencies working on the technology needed for this ambitious journey. The dream of becoming a multi-planetary species is closer than ever.",
            created_at: "2025-01-05T09:15:00Z",
        },
    ];

    displayBlogPosts(fallbackPosts);
}

function showBlogPost(postId) {
    const post = blogPosts.find((p) => p.id === postId);
    if (!post) return;

    const popup = document.getElementById("planet-popup");
    const popupBody = document.getElementById("popup-body");

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
                ${new Date(post.created_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
        </div>
        <p style="color: var(--text-gray); line-height: 1.8; font-size: 1rem;">${escapeHtml(post.content)}</p>
    `;

    popup.classList.add("active");
}

function setupAudioControl() {
    const audioToggle = document.getElementById("audio-toggle");
    const spaceAudio = document.getElementById("space-audio");

    if (!audioToggle || !spaceAudio) return;

    spaceAudio.volume = 0.3;
    spaceAudio.loop = true;
    let audioPlaying = false;


    const tryAutoPlay = async () => {
        try {
            spaceAudio.muted = false;
            await spaceAudio.play();
            audioPlaying = true;
            audioToggle.classList.add("playing");
            audioToggle.setAttribute("aria-pressed", "true");
        } catch (error) {
            console.log(
                "Autoplay blocked by browser. Waiting for user interaction.",
            );
        }
    };

  
    const togglePlayback = async () => {
        try {
            if (audioPlaying) {
                await spaceAudio.pause();
                audioToggle.classList.remove("playing");
                audioToggle.setAttribute("aria-pressed", "false");
            } else {
                spaceAudio.muted = false;
                await spaceAudio.play();
                audioToggle.classList.add("playing");
                audioToggle.setAttribute("aria-pressed", "true");
            }
            audioPlaying = !audioPlaying;
        } catch (error) {
            console.log("Audio playback error:", error);
        }
    };

    audioToggle.addEventListener("click", togglePlayback);
    audioToggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePlayback();
        }
    });

    audioToggle.setAttribute("aria-pressed", "false");
    audioToggle.setAttribute("role", "button");
    audioToggle.setAttribute("tabindex", "0");

    window.addEventListener("load", () => {
        setTimeout(tryAutoPlay, 500);
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link-space");
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const navLinksContainer = document.getElementById("nav-links");

    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener("click", () => {
            mobileToggle.classList.toggle("active");
            navLinksContainer.classList.toggle("active");
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href.startsWith("#")) {
                e.preventDefault();
                scrollToSection(href.substring(1));
                navLinks.forEach((l) => l.classList.remove("active"));
                link.classList.add("active");

                if (navLinksContainer) {
                    navLinksContainer.classList.remove("active");
                }
                if (mobileToggle) {
                    mobileToggle.classList.remove("active");
                }
            }
        });
    });

    let scrollTimeout;
    window.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const sections = document.querySelectorAll("section[id]");
            let current = "";

            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${current}`) {
                    link.classList.add("active");
                }
            });
        }, 50);
    });
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    }
}

function handleResize() {
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (camera && renderer) {
                const container = document.getElementById(
                    "solar-system-container",
                );
                if (container) {
                    camera.aspect =
                        container.clientWidth / container.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(
                        container.clientWidth,
                        container.clientHeight,
                    );
                }
            }

            if (rocketCamera && rocketRenderer) {
                const rocketContainer = document.getElementById(
                    "rocket-3d-container",
                );
                if (rocketContainer) {
                    rocketCamera.aspect =
                        rocketContainer.clientWidth /
                        rocketContainer.clientHeight;
                    rocketCamera.updateProjectionMatrix();
                    rocketRenderer.setSize(
                        rocketContainer.clientWidth,
                        rocketContainer.clientHeight,
                    );
                }
            }

            if (starlinkCamera && starlinkRenderer) {
                const starlinkContainer = document.getElementById(
                    "starlink-viz-container",
                );
                if (starlinkContainer) {
                    starlinkCamera.aspect =
                        starlinkContainer.clientWidth /
                        starlinkContainer.clientHeight;
                    starlinkCamera.updateProjectionMatrix();
                    starlinkRenderer.setSize(
                        starlinkContainer.clientWidth,
                        starlinkContainer.clientHeight,
                    );
                }
            }
        }, 250);
    });
}

function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    document
        .querySelectorAll(
            ".nasa-card, .blog-card, .mystery-card, .stat-card, .upcoming-launch-card",
        )
        .forEach((item) => {
            item.style.opacity = "0";
            item.style.transform = "translateY(30px)";
            item.style.transition = "all 0.6s ease";
            observer.observe(item);
        });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

async function loadSpaceXStats() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/stats`);
        if (!response.ok) throw new Error("SpaceX stats fetch failed");

        const data = await response.json();

        document.getElementById("total-launches").textContent = "0";
        document.getElementById("upcoming-count").textContent = "0";
        document.getElementById("success-rate").textContent = "0%";
        document.getElementById("successful-launches").textContent = "0";

        setTimeout(() => {
            animateCountUp("total-launches", data.totalLaunches || 187);
            animateCountUp("upcoming-count", data.upcomingLaunches || 12);
            animateCountUp(
                "successful-launches",
                data.successfulLaunches || 181,
            );
            document.getElementById("success-rate").textContent =
                (data.successRate || 96.8) + "%";
        }, 100);
    } catch (error) {
        setTimeout(() => {
            animateCountUp("total-launches", 187);
            animateCountUp("upcoming-count", 12);
            animateCountUp("successful-launches", 181);
            document.getElementById("success-rate").textContent = "96.8%";
        }, 100);
    }
}

async function loadLatestLaunch() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/latest`);
        if (!response.ok) throw new Error("Latest launch fetch failed");

        const launch = await response.json();
        displayLatestLaunch(launch);
    } catch (error) {
        displayFallbackLatestLaunch();
    }
}

function displayLatestLaunch(launch) {
    const container = document.getElementById("latest-launch-container");
    const launchDate = new Date(launch.date_utc);

    container.innerHTML = `
        <div class="latest-launch-card">
            <div class="launch-image-container">
                <img src="${launch.links?.patch?.large || launch.links?.flickr?.original?.[0] || "https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&h=400&fit=crop"}" 
                     alt="${escapeHtml(launch.name)}" 
                     class="launch-image"
                     onerror="this.src='https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&h=400&fit=crop'">
                <div class="launch-badge ${launch.success ? "" : "failed"}">
                    ${launch.success ? "SUCCESS" : launch.success === false ? "FAILED" : "PENDING"}
                </div>
            </div>
            <div class="launch-details">
                <h3 class="launch-name">${escapeHtml(launch.name)}</h3>
                <div class="launch-date">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    ${launchDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
                </div>
                <p class="launch-description">
                    ${escapeHtml(launch.details || "This mission represents another milestone in SpaceX's journey to make space more accessible and advance humanity's reach beyond Earth.")}
                </p>
                <div class="launch-info-grid">
                    <div class="launch-info-item">
                        <div class="launch-info-label">Rocket</div>
                        <div class="launch-info-value">${launch.rocket || "Falcon 9"}</div>
                    </div>
                    <div class="launch-info-item">
                        <div class="launch-info-label">Launchpad</div>
                        <div class="launch-info-value">${launch.launchpad || "CCSFS SLC 40"}</div>
                    </div>
                    <div class="launch-info-item">
                        <div class="launch-info-label">Flight Number</div>
                        <div class="launch-info-value">#${launch.flight_number || "N/A"}</div>
                    </div>
                    <div class="launch-info-item">
                        <div class="launch-info-label">Cores Reused</div>
                        <div class="launch-info-value">${launch.cores?.[0]?.reused ? "Yes" : "No"}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayFallbackLatestLaunch() {
    const container = document.getElementById("latest-launch-container");
    container.innerHTML = `    <div class="wifi-loader">
        <svg class="circle-outer" viewBox="0 0 86 86">
            <circle class="back" cx="43" cy="43" r="40"></circle>
            <circle class="front" cx="43" cy="43" r="40"></circle>
            <circle class="new" cx="43" cy="43" r="40"></circle>
        </svg>
        <svg class="circle-middle" viewBox="0 0 60 60">
            <circle class="back" cx="30" cy="30" r="27"></circle>
            <circle class="front" cx="30" cy="30" r="27"></circle>
        </svg>
        <svg class="circle-inner" viewBox="0 0 34 34">
            <circle class="back" cx="17" cy="17" r="14"></circle>
            <circle class="front" cx="17" cy="17" r="14"></circle>
        </svg>
        <div class="text" data-text="Loading"></div>
    </div>`;
}

async function loadUpcomingLaunches() {
    try {
        const response = await fetch(`${API_BASE}/api/spacex/upcoming`);
        if (!response.ok) throw new Error("Upcoming launches fetch failed");

        const launches = await response.json();
        displayUpcomingLaunches(launches);
    } catch (error) {
        displayFallbackUpcomingLaunches();
    }
}

function displayUpcomingLaunches(launches) {
    const container = document.getElementById("upcoming-launches-grid");

    if (!launches || launches.length === 0) {
        container.innerHTML =
            '<p style="color: var(--text-gray); text-align: center;">No upcoming launches scheduled.</p>';
        return;
    }

    container.innerHTML = launches
        .slice(0, 6)
        .map((launch) => {
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
                    ${launchDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                <p>${escapeHtml(launch.details?.substring(0, 120) || "Upcoming SpaceX mission to deliver payloads to orbit.")}${launch.details?.length > 120 ? "..." : ""}</p>
                <div class="countdown-timer">
                    <div class="countdown-label">T-Minus</div>
                    <div class="countdown-value">${countdown}</div>
                </div>
            </div>
        `;
        })
        .join("");
}

function displayFallbackUpcomingLaunches() {
    const container = document.getElementById("upcoming-launches-grid");
    container.innerHTML = `<div class="loading-state">
    <p style="color: var(--neon-blue);">Unable to load upcoming launches.</p>
    </div>`;
}

function getCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;

    if (diff < 0) return "Launched";

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

function initStarlinkVisualization() {
    const container = document.getElementById("starlink-viz-container");
    if (!container) return;

    starlinkScene = new THREE.Scene();
    starlinkCamera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000,
    );
    starlinkRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
    });
    starlinkRenderer.setSize(container.clientWidth, container.clientHeight);
    starlinkRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    starlinkRenderer.setClearColor(0x000000, 0);
    container.appendChild(starlinkRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    starlinkScene.add(ambientLight);

    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x4a90e2,
        emissive: 0x1a3a5a,
        emissiveIntensity: 0.5,
        shininess: 30,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    starlinkScene.add(earth);

    const glowGeometry = new THREE.SphereGeometry(2.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    starlinkScene.add(glow);

    const satelliteGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const satelliteMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.5,
    });

    for (let i = 0; i < 60; i++) {
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
            phi: phi,
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

    const earth = starlinkScene.children.find(
        (obj) =>
            obj.geometry?.type === "SphereGeometry" &&
            obj.geometry.parameters.radius === 2,
    );
    if (earth) {
        earth.rotation.y += 0.002;
    }

    starlinkSatellites.forEach((satellite) => {
        satellite.userData.angle += satellite.userData.orbitSpeed;

        satellite.position.x =
            satellite.userData.orbitRadius *
            Math.sin(satellite.userData.phi) *
            Math.cos(satellite.userData.angle);
        satellite.position.y =
            satellite.userData.orbitRadius *
            Math.sin(satellite.userData.phi) *
            Math.sin(satellite.userData.angle);
        satellite.position.z =
            satellite.userData.orbitRadius * Math.cos(satellite.userData.phi);
    });

    starlinkRenderer.render(starlinkScene, starlinkCamera);
}

async function loadStarlinkStats() {
    try {
        const response = await fetch(
            `${API_BASE}/api/spacex/starlink?limit=50`,
        );
        if (!response.ok) throw new Error("Starlink fetch failed");

        const satellites = await response.json();

        const active = satellites.filter(
            (s) => s.spaceTrack?.OBJECT_TYPE === "PAYLOAD",
        ).length;
        const avgAltitude =
            satellites.reduce((sum, s) => sum + (s.height_km || 550), 0) /
            satellites.length;

        document.getElementById("starlink-stats").innerHTML = `
            <div class="starlink-stat-item">
                <strong>Active Satellites</strong>
                <span>${active || "4,500"}+</span>
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
        document.getElementById("starlink-stats").innerHTML = `
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
let newsRetryCount = 5;
const MAX_NEWS_RETRIES = 10;

async function loadNewsPreview() {
    const container = document.getElementById("news-preview-grid");


    container.innerHTML = `    <div class="wifi-loader">
        <svg class="circle-outer" viewBox="0 0 86 86">
            <circle class="back" cx="43" cy="43" r="40"></circle>
            <circle class="front" cx="43" cy="43" r="40"></circle>
            <circle class="new" cx="43" cy="43" r="40"></circle>
        </svg>
        <svg class="circle-middle" viewBox="0 0 60 60">
            <circle class="back" cx="30" cy="30" r="27"></circle>
            <circle class="front" cx="30" cy="30" r="27"></circle>
        </svg>
        <svg class="circle-inner" viewBox="0 0 34 34">
            <circle class="back" cx="17" cy="17" r="14"></circle>
            <circle class="front" cx="17" cy="17" r="14"></circle>
        </svg>
        <div class="text" data-text="Loading"></div>
    </div>
  `;

    try {
        const response = await fetch(`${API_BASE}/api/news/latest?limit=3`);
        if (!response.ok)
            throw new Error("News fetch failed: " + response.status);

        const data = await response.json();
        const newsItems = data.data?.results || [];

        if (!newsItems.length) {
            showNewsError("No news items available.");
            return;
        }


        newsRetryCount = 0;
        displayNewsPreview(newsItems.slice(0, 3));
    } catch (err) {
        console.error(
            `Error loading news (Attempt ${newsRetryCount + 1}/${MAX_NEWS_RETRIES}):`,
            err,
        );


        if (newsRetryCount < MAX_NEWS_RETRIES) {
            newsRetryCount++;
            const retryDelay = 2000 * newsRetryCount; 
            console.log(`Retrying in ${retryDelay / 1000}s...`);
            setTimeout(loadNewsPreview, retryDelay);
        } else {
            showNewsError(
                "Unable to load latest news after multiple attempts.",
            );
        }
    }
}

function displayNewsPreview(items) {
    const container = document.getElementById("news-preview-grid");

    container.innerHTML = items
        .map((item) => {
            const date = new Date(item.published_at);
            const formattedDate = isNaN(date)
                ? ""
                : date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  });

            return `
        <div class="news-preview-card" role="button" tabindex="0">
  <img src="${item.image_url || "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop"}"
       alt="${escapeHtml(item.title)}"
       class="news-preview-image"
       onerror="this.src='https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop'">

  <div class="news-preview-content">
    <span class="news-preview-badge">${escapeHtml(item.type || "News")}</span>
    <h3 class="news-preview-title">${escapeHtml(item.title)}</h3>
    <p class="news-preview-date">${formattedDate}</p>
  </div>
</div>

      `;
        })
        .join("");
}

function showNewsError(message) {
    const container = document.getElementById("news-preview-grid");
    container.innerHTML = `
    <div class="news-error">
      <p class="news-error-message">${escapeHtml(message)}</p>
      <div style="margin-top:12px">
        <button class="btn-retry" id="news-retry-btn">Retry</button>
      </div>
    </div>
  `;

    const btn = document.getElementById("news-retry-btn");
    if (btn)
        btn.addEventListener("click", () => {
            newsRetryCount = 0;
            loadNewsPreview();
        });
}

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function init() {
    setTimeout(() => {
        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
        }
    }, 1800);
    setupAudioControl();
    initParticles();
    initSolarSystem();
    setupSolarControls();
    setupNavigation();
    handleResize();
    loadNewsPreview();
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
    initStarlinkVisualization();
    loadStarlinkStats();

    setupIntersectionObserver();

    setInterval(loadISSLocation, 10000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.scrollToSection = scrollToSection;
window.showBlogPost = showBlogPost;
