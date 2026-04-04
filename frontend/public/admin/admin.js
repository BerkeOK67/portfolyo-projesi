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
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Global variables
let currentUser = null;
let projectImages = [];
let coverImageIndex = 0;
let editingProjectId = null;
let selectedCVFile = null;

// ==================== AUTH ====================

// Login form
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        errorEl.textContent = '';
    } catch (error) {
        errorEl.textContent = 'Giris basarisiz: ' + error.message;
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
});

// Auth state listener
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        loadDashboard();
        loadProjects();
        loadAbout();
        loadContact();
        loadCV();
        loadSettings();
    } else {
        currentUser = null;
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-panel').style.display = 'none';
    }
});

// ==================== NAVIGATION ====================

document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        showSection(section);
    });
});

function showSection(sectionName) {
    // Update nav
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + '-section').classList.add('active');
}

// ==================== DASHBOARD ====================

function loadDashboard() {
    database.ref('projeler').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
            document.getElementById('total-projects').textContent = projects.length;
            document.getElementById('featured-projects').textContent = projects.filter(p => p.oneCikan).length;
            
            let totalImages = 0;
            projects.forEach(p => {
                if (p.gorseller) totalImages += p.gorseller.length;
                else if (p.kapakFotografi) totalImages += 1;
            });
            document.getElementById('total-images').textContent = totalImages;
        }
    });
}

// ==================== PROJECTS ====================

function loadProjects() {
    const container = document.getElementById('projects-list');
    
    database.ref('projeler').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<p class="loading">Henuz proje yok. Yeni proje ekleyin.</p>';
            return;
        }
        
        const projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
        
        container.innerHTML = projects.map((project, index) => `
            <div class="project-item">
                <img src="${project.kapakFotografi || 'https://via.placeholder.com/100x70/667eea/ffffff?text=P'}" 
                     alt="${project.isim}" class="project-item-image">
                <div class="project-item-info">
                    <h3>
                        ${project.isim}
                        ${project.oneCikan ? '<span class="project-item-badge">One Cikan</span>' : ''}
                    </h3>
                    <p>${project.aciklama ? project.aciklama.substring(0, 80) + '...' : ''}</p>
                </div>
                <div class="project-item-actions">
                    <button class="btn-edit" onclick="editProject(${project.id})" title="Duzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProject(${project.id})" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    });
}

function openProjectModal(projectId = null) {
    editingProjectId = projectId;
    projectImages = [];
    coverImageIndex = 0;
    
    document.getElementById('project-form').reset();
    document.getElementById('image-preview-container').innerHTML = '';
    document.getElementById('project-modal-title').textContent = projectId ? 'Proje Duzenle' : 'Yeni Proje';
    document.getElementById('project-id').value = projectId || '';
    
    if (projectId) {
        // Load project data
        database.ref('projeler').once('value', (snapshot) => {
            const data = snapshot.val();
            const projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
            const project = projects.find(p => p.id == projectId);
            
            if (project) {
                document.getElementById('project-name').value = project.isim || '';
                document.getElementById('project-description').value = project.aciklama || '';
                document.getElementById('project-details').value = project.detaylar || '';
                document.getElementById('project-features').value = (project.ozellikler || []).join('\n');
                document.getElementById('project-technologies').value = (project.teknolojiler || []).join(', ');
                document.getElementById('project-github').value = project.githubLink || '';
                document.getElementById('project-live').value = project.canliLink || '';
                document.getElementById('project-featured').checked = project.oneCikan || false;
                
                // Load images
                if (project.gorseller && project.gorseller.length > 0) {
                    projectImages = project.gorseller.map(url => ({ url, file: null }));
                    coverImageIndex = project.kapakIndex || 0;
                } else if (project.kapakFotografi) {
                    projectImages = [{ url: project.kapakFotografi, file: null }];
                    coverImageIndex = 0;
                }
                renderImagePreviews();
            }
        });
    }
    
    document.getElementById('project-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.remove('active');
    document.body.style.overflow = '';
    editingProjectId = null;
    projectImages = [];
}

function editProject(id) {
    openProjectModal(id);
}

async function deleteProject(id) {
    if (!confirm('Bu projeyi silmek istediginizden emin misiniz?')) return;
    
    try {
        const snapshot = await database.ref('projeler').once('value');
        const data = snapshot.val();
        let projects = Array.isArray(data) ? data.filter(p => p) : Object.values(data);
        
        projects = projects.filter(p => p.id != id);
        
        await database.ref('projeler').set(projects);
        showToast('Proje silindi', 'success');
        loadDashboard();
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

// Image handling
function handleImageUpload(input) {
    const files = Array.from(input.files);
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            projectImages.push({
                url: e.target.result,
                file: file
            });
            renderImagePreviews();
        };
        reader.readAsDataURL(file);
    });
    
    input.value = '';
}

function renderImagePreviews() {
    const container = document.getElementById('image-preview-container');
    
    container.innerHTML = projectImages.map((img, index) => `
        <div class="image-preview-item ${index === coverImageIndex ? 'cover' : ''}" onclick="setCoverImage(${index})">
            <img src="${img.url}" alt="Preview">
            <button type="button" class="remove-image" onclick="event.stopPropagation(); removeImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function setCoverImage(index) {
    coverImageIndex = index;
    renderImagePreviews();
}

function removeImage(index) {
    projectImages.splice(index, 1);
    if (coverImageIndex >= projectImages.length) {
        coverImageIndex = Math.max(0, projectImages.length - 1);
    }
    renderImagePreviews();
}

// Project form submit
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
    
    try {
        // Upload new images
        const uploadedUrls = [];
        for (const img of projectImages) {
            if (img.file) {
                const fileName = `projects/${Date.now()}_${img.file.name}`;
                const ref = storage.ref(fileName);
                await ref.put(img.file);
                const url = await ref.getDownloadURL();
                uploadedUrls.push(url);
            } else {
                uploadedUrls.push(img.url);
            }
        }
        
        // Get form data
        const projectData = {
            isim: document.getElementById('project-name').value,
            aciklama: document.getElementById('project-description').value,
            detaylar: document.getElementById('project-details').value,
            ozellikler: document.getElementById('project-features').value.split('\n').filter(f => f.trim()),
            teknolojiler: document.getElementById('project-technologies').value.split(',').map(t => t.trim()).filter(t => t),
            githubLink: document.getElementById('project-github').value,
            canliLink: document.getElementById('project-live').value,
            oneCikan: document.getElementById('project-featured').checked,
            gorseller: uploadedUrls,
            kapakFotografi: uploadedUrls[coverImageIndex] || '',
            kapakIndex: coverImageIndex
        };
        
        // Get existing projects
        const snapshot = await database.ref('projeler').once('value');
        const data = snapshot.val();
        let projects = data ? (Array.isArray(data) ? data.filter(p => p) : Object.values(data)) : [];
        
        if (editingProjectId) {
            // Update existing
            const index = projects.findIndex(p => p.id == editingProjectId);
            if (index !== -1) {
                projectData.id = editingProjectId;
                projects[index] = projectData;
            }
        } else {
            // Add new
            const maxId = projects.reduce((max, p) => Math.max(max, p.id || 0), 0);
            projectData.id = maxId + 1;
            projects.push(projectData);
        }
        
        await database.ref('projeler').set(projects);
        
        closeProjectModal();
        showToast('Proje kaydedildi', 'success');
        loadDashboard();
        
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Kaydet';
    }
});

// ==================== ABOUT ====================

function loadAbout() {
    database.ref('hakkimda').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('about-title').value = data.baslik || '';
            document.getElementById('about-bio').value = data.biyografi || '';
            document.getElementById('about-bio2').value = data.biyografi2 || '';
            document.getElementById('about-education').value = data.egitim || '';
            document.getElementById('about-education-years').value = data.egitimYillari || '';
            
            if (data.profilFoto) {
                document.getElementById('profile-preview').src = data.profilFoto;
            }
            
            // Load skills
            if (data.yetenekler) {
                const container = document.getElementById('skills-container');
                container.innerHTML = '';
                data.yetenekler.forEach((skill, index) => {
                    addSkillField(skill.baslik, skill.aciklama, skill.ikon || 'fa-code');
                });
            }
        }
    });
}

// Populer Font Awesome ikonlari
const availableIcons = [
    { icon: 'fa-code', label: 'Kod' },
    { icon: 'fa-server', label: 'Server' },
    { icon: 'fa-database', label: 'Database' },
    { icon: 'fa-cloud', label: 'Cloud' },
    { icon: 'fa-mobile-alt', label: 'Mobile' },
    { icon: 'fa-desktop', label: 'Desktop' },
    { icon: 'fa-laptop-code', label: 'Laptop' },
    { icon: 'fa-cogs', label: 'Ayarlar' },
    { icon: 'fa-terminal', label: 'Terminal' },
    { icon: 'fa-git-alt', label: 'Git' },
    { icon: 'fa-docker', label: 'Docker' },
    { icon: 'fa-aws', label: 'AWS' },
    { icon: 'fa-react', label: 'React' },
    { icon: 'fa-node-js', label: 'Node.js' },
    { icon: 'fa-python', label: 'Python' },
    { icon: 'fa-js', label: 'JavaScript' },
    { icon: 'fa-html5', label: 'HTML5' },
    { icon: 'fa-css3-alt', label: 'CSS3' },
    { icon: 'fa-palette', label: 'Tasarim' },
    { icon: 'fa-paint-brush', label: 'UI/UX' },
    { icon: 'fa-layer-group', label: 'Katmanlar' },
    { icon: 'fa-network-wired', label: 'Network' },
    { icon: 'fa-shield-alt', label: 'Guvenlik' },
    { icon: 'fa-chart-line', label: 'Analitik' },
    { icon: 'fa-brain', label: 'AI/ML' },
    { icon: 'fa-robot', label: 'Robot' },
    { icon: 'fa-microchip', label: 'Hardware' },
    { icon: 'fa-globe', label: 'Web' },
    { icon: 'fa-tools', label: 'Araclar' },
    { icon: 'fa-cube', label: '3D' }
];

function addSkillField(title = '', description = '', icon = 'fa-code') {
    const container = document.getElementById('skills-container');
    const index = container.children.length;
    
    const iconOptions = availableIcons.map(i => 
        `<option value="${i.icon}" ${i.icon === icon ? 'selected' : ''}>${i.label}</option>`
    ).join('');
    
    const skillHTML = `
        <div class="skill-item">
            <div class="skill-icon-select">
                <div class="icon-preview">
                    <i class="fas ${icon}"></i>
                </div>
                <select class="skill-icon" onchange="updateIconPreview(this)">
                    ${iconOptions}
                </select>
            </div>
            <input type="text" placeholder="Yetenek adi (orn: Frontend)" value="${title}" class="skill-title">
            <textarea placeholder="Aciklama (orn: HTML, CSS, JavaScript, React)" rows="2" class="skill-desc">${description}</textarea>
            <button type="button" class="btn-delete" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', skillHTML);
}

function updateIconPreview(select) {
    const preview = select.parentElement.querySelector('.icon-preview i');
    preview.className = 'fas ' + select.value;
}

function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-preview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function saveAbout() {
    try {
        // Upload profile image if changed
        let profileUrl = document.getElementById('profile-preview').src;
        const profileInput = document.getElementById('profile-image');
        
        if (profileInput.files && profileInput.files[0]) {
            const file = profileInput.files[0];
            const ref = storage.ref('profil.' + file.name.split('.').pop());
            await ref.put(file);
            profileUrl = await ref.getDownloadURL();
        }
        
        // Collect skills
        const skills = [];
        document.querySelectorAll('.skill-item').forEach(item => {
            const icon = item.querySelector('.skill-icon').value;
            const title = item.querySelector('.skill-title').value;
            const desc = item.querySelector('.skill-desc').value;
            if (title) {
                skills.push({ ikon: icon, baslik: title, aciklama: desc });
            }
        });
        
        const aboutData = {
            baslik: document.getElementById('about-title').value,
            biyografi: document.getElementById('about-bio').value,
            biyografi2: document.getElementById('about-bio2').value,
            egitim: document.getElementById('about-education').value,
            egitimYillari: document.getElementById('about-education-years').value,
            profilFoto: profileUrl,
            yetenekler: skills
        };
        
        await database.ref('hakkimda').set(aboutData);
        showToast('Hakkimda kaydedildi', 'success');
        
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

// ==================== MESSAGES ====================

function loadMessages() {
    const container = document.getElementById('messages-list');
    const badge = document.getElementById('unread-badge');
    
    database.ref('mesajlar').orderByChild('tarih').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<p class="loading" style="text-align: center; color: #a1a1aa;">Henuz mesaj yok.</p>';
            badge.style.display = 'none';
            return;
        }
        
        // Mesajlari array'e cevir ve tarihe gore sirala (yeniden eskiye)
        const messages = Object.entries(data).map(([key, val]) => ({...val, key}));
        messages.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
        
        // Okunmamis mesaj sayisi
        const unreadCount = messages.filter(m => !m.okundu).length;
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
        
        container.innerHTML = messages.map(msg => `
            <div class="message-item ${msg.okundu ? '' : 'unread'}" onclick="toggleMessage('${msg.key}', this)">
                <div class="message-header">
                    <div class="message-sender">
                        <i class="fas fa-user-circle"></i>
                        <div>
                            <strong>${msg.isim}</strong>
                            <span>${msg.email}</span>
                        </div>
                    </div>
                    <div class="message-meta">
                        <span class="message-date">${formatDate(msg.tarih)}</span>
                        ${!msg.okundu ? '<span class="unread-dot"></span>' : ''}
                    </div>
                </div>
                <div class="message-subject">${msg.konu}</div>
                <div class="message-body" style="display: none;">
                    <p>${msg.mesaj}</p>
                    <div class="message-actions">
                        <a href="mailto:${msg.email}?subject=Re: ${msg.konu}" class="btn">
                            <i class="fas fa-reply"></i> Yanitla
                        </a>
                        <button class="btn btn-outline" onclick="event.stopPropagation(); deleteMessage('${msg.key}')">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

function toggleMessage(key, element) {
    const body = element.querySelector('.message-body');
    const isOpen = body.style.display === 'block';
    
    // Diger acik mesajlari kapat
    document.querySelectorAll('.message-body').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.message-item').forEach(el => el.classList.remove('expanded'));
    
    if (!isOpen) {
        body.style.display = 'block';
        element.classList.add('expanded');
        
        // Okundu olarak isaretle
        if (element.classList.contains('unread')) {
            database.ref('mesajlar/' + key + '/okundu').set(true);
            element.classList.remove('unread');
        }
    }
}

async function deleteMessage(key) {
    if (!confirm('Bu mesaji silmek istediginizden emin misiniz?')) return;
    
    try {
        await database.ref('mesajlar/' + key).remove();
        showToast('Mesaj silindi', 'success');
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

async function markAllAsRead() {
    try {
        const snapshot = await database.ref('mesajlar').once('value');
        const data = snapshot.val();
        
        if (data) {
            const updates = {};
            Object.keys(data).forEach(key => {
                updates[key + '/okundu'] = true;
            });
            await database.ref('mesajlar').update(updates);
            showToast('Tum mesajlar okundu olarak isaretlendi', 'success');
        }
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Bugun
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    // Dun
    if (diff < 48 * 60 * 60 * 1000) {
        return 'Dun';
    }
    // Bu yil
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
    // Diger
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ==================== CONTACT ====================

function loadContact() {
    database.ref('iletisim').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('contact-email-info').value = data.email || '';
            document.getElementById('contact-phone').value = data.telefon || '';
            document.getElementById('contact-location').value = data.konum || '';
            document.getElementById('contact-github').value = data.github || '';
            document.getElementById('contact-linkedin').value = data.linkedin || '';
            document.getElementById('contact-twitter').value = data.twitter || '';
            document.getElementById('contact-instagram').value = data.instagram || '';
            document.getElementById('contact-website').value = data.website || '';
        }
    });
}

async function saveContact() {
    try {
        const contactData = {
            email: document.getElementById('contact-email-info').value,
            telefon: document.getElementById('contact-phone').value,
            konum: document.getElementById('contact-location').value,
            github: document.getElementById('contact-github').value,
            linkedin: document.getElementById('contact-linkedin').value,
            twitter: document.getElementById('contact-twitter').value,
            instagram: document.getElementById('contact-instagram').value,
            website: document.getElementById('contact-website').value
        };
        
        await database.ref('iletisim').set(contactData);
        showToast('Iletisim bilgileri kaydedildi', 'success');
        
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

// ==================== CV ====================

function loadCV() {
    database.ref('cv').once('value', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('current-cv-display');
        
        if (data && data.url) {
            const uploadDate = data.yuklemeTarihi ? new Date(data.yuklemeTarihi).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Bilinmiyor';
            container.innerHTML = `
                <div class="cv-info-card">
                    <div class="cv-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="cv-details">
                        <p class="cv-filename">${data.dosyaAdi || 'CV.pdf'}</p>
                        <p class="cv-date"><i class="fas fa-clock"></i> ${uploadDate}</p>
                    </div>
                    <div class="cv-actions">
                        <a href="${data.url}" target="_blank" class="btn btn-outline">
                            <i class="fas fa-external-link-alt"></i> Görüntüle
                        </a>
                        <button class="btn-delete" onclick="deleteCV()" title="CV'yi Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="no-cv">
                    <i class="fas fa-file-upload" style="font-size: 3rem; color: #3f3f46; margin-bottom: 1rem; display: block;"></i>
                    <p>Henüz CV yüklenmemiş</p>
                    <small style="color: #52525b;">Sağ taraftan PDF dosyanızı yükleyebilirsiniz</small>
                </div>
            `;
        }
    });
}

function previewCV(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.type !== 'application/pdf') {
            showToast('Sadece PDF dosyası yükleyebilirsiniz', 'error');
            input.value = '';
            return;
        }
        
        selectedCVFile = file;
        document.getElementById('cv-file-name').textContent = file.name;
        document.getElementById('cv-preview').style.display = 'flex';
        document.getElementById('upload-cv-btn').disabled = false;
    }
}

function clearCVPreview() {
    selectedCVFile = null;
    document.getElementById('cv-file').value = '';
    document.getElementById('cv-preview').style.display = 'none';
    document.getElementById('upload-cv-btn').disabled = true;
}

async function uploadCV() {
    if (!selectedCVFile) {
        showToast('Lütfen bir PDF dosyası seçin', 'error');
        return;
    }
    
    const btn = document.getElementById('upload-cv-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
    
    try {
        const fileName = `cv/CV_${Date.now()}.pdf`;
        const ref = storage.ref(fileName);
        await ref.put(selectedCVFile);
        const url = await ref.getDownloadURL();
        
        await database.ref('cv').set({
            url: url,
            dosyaAdi: selectedCVFile.name,
            yuklemeTarihi: new Date().toISOString()
        });
        
        showToast('CV başarıyla yüklendi', 'success');
        clearCVPreview();
        loadCV();
        
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-upload"></i> CV\'yi Yükle';
    }
}

async function deleteCV() {
    if (!confirm('CV\'yi silmek istediğinizden emin misiniz?')) return;
    
    try {
        await database.ref('cv').remove();
        showToast('CV silindi', 'success');
        loadCV();
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

// ==================== SETTINGS ====================

function loadSettings() {
    database.ref('ayarlar').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('site-title').value = data.siteBasligi || '';
            document.getElementById('github-url').value = data.github || '';
            document.getElementById('linkedin-url').value = data.linkedin || '';
            document.getElementById('contact-email').value = data.email || '';
        }
    });
}

async function saveSettings() {
    try {
        const settingsData = {
            siteBasligi: document.getElementById('site-title').value,
            github: document.getElementById('github-url').value,
            linkedin: document.getElementById('linkedin-url').value,
            email: document.getElementById('contact-email').value
        };
        
        await database.ref('ayarlar').set(settingsData);
        showToast('Ayarlar kaydedildi', 'success');
        
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    }
}

// ==================== UTILITIES ====================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Close modal on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
});
