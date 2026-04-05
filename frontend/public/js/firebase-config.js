// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyA-Rt67cjlkXP20Quwx48-lu6WULBvr9wU",
    authDomain: "portfolyo-projesi-9f34a.firebaseapp.com",
    databaseURL: "https://portfolyo-projesi-9f34a-default-rtdb.firebaseio.com",
    projectId: "portfolyo-projesi-9f34a",
    storageBucket: "portfolyo-projesi-9f34a.firebasestorage.app",
    messagingSenderId: "861060100504",
    appId: "1:861060100504:web:1a1c4a47f8f096cf437bed"
};

// Firebase'i baslat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

/** Anasayfadaki main-footer alanını iletişim verisiyle doldurur (tüm sayfalarda kullanılır) */
function populateMainFooter(data) {
    if (!data || typeof data !== 'object') return;

    const emailRaw = data.email ?? data.eposta ?? data.ePosta ?? data.mail ?? '';
    const email = typeof emailRaw === 'string' ? emailRaw.trim() : String(emailRaw || '').trim();
    const konum = typeof data.konum === 'string' ? data.konum.trim() : String(data.konum || '').trim();
    const gh = typeof data.github === 'string' ? data.github.trim() : String(data.github || '').trim();
    const li = typeof data.linkedin === 'string' ? data.linkedin.trim() : String(data.linkedin || '').trim();
    const tw = typeof data.twitter === 'string' ? data.twitter.trim() : String(data.twitter || '').trim();
    const ig = typeof data.instagram === 'string' ? data.instagram.trim() : String(data.instagram || '').trim();

    const emailEl = document.getElementById('footer-email');
    const locEl = document.getElementById('footer-location');
    const footerSocial = document.getElementById('footer-social');

    if (emailEl && email) {
        emailEl.textContent = email;
        if (emailEl.tagName === 'A') {
            emailEl.href = 'mailto:' + email;
        }
    }
    if (locEl && konum) locEl.textContent = konum;

    if (footerSocial) {
        let html = '';
        if (gh) html += `<a href="${gh}" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>`;
        if (li) html += `<a href="${li}" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i></a>`;
        if (tw) html += `<a href="${tw}" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a>`;
        if (ig) html += `<a href="${ig}" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>`;
        if (html) footerSocial.innerHTML = html;
    }
}

// Tum projeleri cek
function getProjects(callback) {
    database.ref('projeler').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
            callback(projects);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error('Firebase error:', error);
        callback([]);
    });
}

// One cikan projeleri cek (ilk 3)
function getFeaturedProjects(callback) {
    database.ref('projeler').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
            // oneCikan: true olanlari veya ilk 3'u al
            const featured = projects.filter(p => p.oneCikan).slice(0, 3);
            if (featured.length > 0) {
                callback(featured);
            } else {
                callback(projects.slice(0, 3));
            }
        } else {
            callback([]);
        }
    });
}

// Tek proje detayi cek
function getProjectById(id, callback) {
    database.ref('projeler').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
            const project = projects.find(p => p.id == id);
            callback(project || null);
        } else {
            callback(null);
        }
    });
}
