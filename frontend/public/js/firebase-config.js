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
