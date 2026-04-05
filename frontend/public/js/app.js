// Proje karti HTML olustur
function createProjectCard(project, showDetailButton = true) {
    return `
        <div class="project-card" ${showDetailButton ? `onclick="window.location.href='proje-detay.html?id=${project.id}'"` : ''}>
            <div class="project-image-wrapper">
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                </div>
                <img src="${project.kapakFotografi || 'https://via.placeholder.com/400x250/667eea/ffffff?text=Proje'}" 
                     alt="${project.isim}" 
                     class="project-image"
                     loading="lazy"
                     onload="this.classList.add('loaded')"
                     onerror="this.src='https://via.placeholder.com/400x250/667eea/ffffff?text=Gorsel+Yok'; this.classList.add('loaded')">
                ${showDetailButton ? `
                <div class="project-hover-overlay">
                    <span><i class="fas fa-eye"></i> Detaylar için tıklayın</span>
                </div>
                ` : ''}
            </div>
            <div class="project-content">
                <h3>${project.isim}</h3>
                <p>${project.aciklama || ''}</p>
                ${project.teknolojiler ? `
                    <div class="project-technologies">
                        ${project.teknolojiler.map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-links" onclick="event.stopPropagation()">
                    ${project.githubLink ? `
                        <a href="${project.githubLink}" target="_blank">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    ` : ''}
                    ${project.canliLink ? `
                        <a href="${project.canliLink}" target="_blank">
                            <i class="fas fa-external-link-alt"></i> Canli Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Modal HTML olustur
function createModal() {
    const modalHTML = `
        <div class="modal-overlay" id="modal-overlay" onclick="closeModal(event)">
            <div class="modal" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeModal(event)">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Image Gallery -->
                <div class="modal-gallery" id="modal-gallery">
                    <img src="" alt="" class="modal-image" id="modal-image">
                    <button class="gallery-nav gallery-prev" id="gallery-prev" onclick="changeGalleryImage(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-nav gallery-next" id="gallery-next" onclick="changeGalleryImage(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="gallery-thumbnails" id="gallery-thumbnails"></div>
                </div>
                
                <div class="modal-content">
                    <h2 id="modal-title"></h2>
                    <p class="description" id="modal-description"></p>
                    
                    <div class="detail-section" id="modal-details-section">
                        <h4>Proje Detaylari</h4>
                        <p id="modal-details"></p>
                    </div>
                    
                    <div class="detail-section" id="modal-features-section">
                        <h4>Ozellikler</h4>
                        <p id="modal-features"></p>
                    </div>
                    
                    <div class="modal-technologies" id="modal-technologies"></div>
                    
                    <div class="modal-links" id="modal-links"></div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Gallery variables
let currentGalleryImages = [];
let currentGalleryIndex = 0;

function initGallery(images) {
    currentGalleryImages = images || [];
    currentGalleryIndex = 0;
    
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const thumbnails = document.getElementById('gallery-thumbnails');
    
    if (currentGalleryImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        thumbnails.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        thumbnails.style.display = 'flex';
        
        thumbnails.innerHTML = currentGalleryImages.map((img, index) => `
            <div class="gallery-thumb ${index === 0 ? 'active' : ''}" onclick="goToGalleryImage(${index})">
                <img src="${img}" alt="Thumbnail ${index + 1}">
            </div>
        `).join('');
    }
    
    updateGalleryImage();
}

function changeGalleryImage(direction) {
    currentGalleryIndex += direction;
    if (currentGalleryIndex < 0) currentGalleryIndex = currentGalleryImages.length - 1;
    if (currentGalleryIndex >= currentGalleryImages.length) currentGalleryIndex = 0;
    updateGalleryImage();
}

function goToGalleryImage(index) {
    currentGalleryIndex = index;
    updateGalleryImage();
}

function updateGalleryImage() {
    if (currentGalleryImages.length === 0) return;
    
    document.getElementById('modal-image').src = currentGalleryImages[currentGalleryIndex];
    
    document.querySelectorAll('.gallery-thumb').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentGalleryIndex);
    });
}

// Modal ac
function openModal(projectId) {
    getProjectById(projectId, (project) => {
        if (!project) return;
        
        // Initialize gallery
        let images = [];
        if (project.gorseller && project.gorseller.length > 0) {
            images = project.gorseller;
        } else if (project.kapakFotografi) {
            images = [project.kapakFotografi];
        } else {
            images = ['https://via.placeholder.com/800x300/667eea/ffffff?text=Proje'];
        }
        initGallery(images);
        
        document.getElementById('modal-title').textContent = project.isim;
        document.getElementById('modal-description').textContent = project.aciklama || '';
        
        // Detaylar
        const detailsSection = document.getElementById('modal-details-section');
        const detailsEl = document.getElementById('modal-details');
        if (project.detaylar) {
            detailsEl.textContent = project.detaylar;
            detailsSection.style.display = 'block';
        } else {
            detailsSection.style.display = 'none';
        }
        
        // Ozellikler
        const featuresSection = document.getElementById('modal-features-section');
        const featuresEl = document.getElementById('modal-features');
        if (project.ozellikler && project.ozellikler.length > 0) {
            featuresEl.innerHTML = project.ozellikler.map(f => `• ${f}`).join('<br>');
            featuresSection.style.display = 'block';
        } else {
            featuresSection.style.display = 'none';
        }
        
        // Teknolojiler
        const techEl = document.getElementById('modal-technologies');
        if (project.teknolojiler) {
            techEl.innerHTML = project.teknolojiler.map(tech => `<span>${tech}</span>`).join('');
        } else {
            techEl.innerHTML = '';
        }
        
        // Linkler
        const linksEl = document.getElementById('modal-links');
        let linksHTML = '';
        if (project.canliLink) {
            linksHTML += `<a href="${project.canliLink}" target="_blank" class="btn"><i class="fas fa-external-link-alt"></i> Canli Demo</a>`;
        }
        if (project.githubLink) {
            linksHTML += `<a href="${project.githubLink}" target="_blank" class="btn btn-outline"><i class="fab fa-github"></i> GitHub</a>`;
        }
        linksEl.innerHTML = linksHTML;
        
        // Modal'i goster
        document.getElementById('modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Modal kapat
function closeModal(event) {
    if (event) event.preventDefault();
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ESC tusu ile modal kapat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Sayfa yuklendiginde modal olustur
document.addEventListener('DOMContentLoaded', () => {
    createModal();
});
