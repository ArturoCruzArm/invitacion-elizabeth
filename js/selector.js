// ========================================
// SELECTOR DE FOTOS - XV AÑOS ALISSON EMIRETH
// ========================================

const TOTAL_PHOTOS = 246;
const STORAGE_KEY = 'alisson_xv_photo_selections';

// Generate photo paths (foto0001.webp to foto00246.webp)
let photos = [];
for (let i = 1; i <= TOTAL_PHOTOS; i++) {
    photos.push(`photos/foto_${String(i).padStart(4, '0')}.webp`);
}

// YouTube Videos
const videos = [
    {
        id: 'video_001',
        title: 'De Niña a Grande',
        youtubeId: 'mwaeWjgDrpg',
        thumbnail: `https://img.youtube.com/vi/mwaeWjgDrpg/maxresdefault.jpg`
    },
    {
        id: 'video_002',
        title: 'Video de la Fiesta',
        youtubeId: 'NsH0Y0w4DM8',
        thumbnail: `https://img.youtube.com/vi/NsH0Y0w4DM8/maxresdefault.jpg`
    }
];

// Combined items array (photos + videos)
let items = [...photos, ...videos];

// LIMITS FOR ALEXA'S XV AÑOS
const LIMITS = {
    impresion: 100,    // Máximo 100 fotos para impresión
    ampliacion: 1     // Máximo 1 foto para ampliación
    // redes_sociales: sin límite
};
let photoSelections = {};
let currentPhotoIndex = null;
let currentFilter = 'all';

// ========================================
// LOCAL STORAGE FUNCTIONS
// ========================================
function loadSelections() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            photoSelections = JSON.parse(saved);
            console.log('Selecciones cargadas desde localStorage:', photoSelections);
        }
    } catch (error) {
        console.error('Error cargando selecciones:', error);
        photoSelections = {};
    }
}

function saveSelections() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photoSelections));
        console.log('Selecciones guardadas en localStorage');
    } catch (error) {
        console.error('Error guardando selecciones:', error);
        showToast('Error al guardar. Verifica el espacio del navegador.', 'error');
    }
}

function clearAllSelections() {
    if (confirm('¿Estás segura de que quieres borrar TODAS las selecciones? Esta acción no se puede deshacer.')) {
        photoSelections = {};
        saveSelections();
        renderGallery();
        updateStats();
        updateFilterButtons();
        showToast('Todas las selecciones han sido eliminadas', 'success');
    }
}

// ========================================
// STATS FUNCTIONS
// ========================================
function getStats() {
    const stats = {
        ampliacion: 0,
        impresion: 0,
        redes_sociales: 0,
        invitaciones_web: 0,
        descartada: 0,
        sinClasificar: items.length
    };

    Object.values(photoSelections).forEach(selection => {
        if (selection.ampliacion) stats.ampliacion++;
        if (selection.impresion) stats.impresion++;
        if (selection.redes_sociales) stats.redes_sociales++;
        if (selection.invitaciones_web) stats.invitaciones_web++;
        if (selection.descartada) stats.descartada++;
    });

    stats.sinClasificar = items.length - Object.keys(photoSelections).length;

    return stats;
}

function updateStats() {
    const stats = getStats();

    // Update counters
    document.getElementById('countAmpliacion').textContent = stats.ampliacion;
    document.getElementById('countImpresion').textContent = stats.impresion;
    document.getElementById('countRedesSociales').textContent = stats.redes_sociales;
    document.getElementById('countInvitacionesWeb').textContent = stats.invitaciones_web;
    document.getElementById('countDescartada').textContent = stats.descartada;
    document.getElementById('countSinClasificar').textContent = stats.sinClasificar;

    // Add warning class if limits exceeded
    const ampliacionCard = document.querySelector('.stat-card.ampliacion');
    const impresionCard = document.querySelector('.stat-card.impresion');

    if (ampliacionCard) {
        if (stats.ampliacion > LIMITS.ampliacion) {
            ampliacionCard.classList.add('exceeded');
        } else {
            ampliacionCard.classList.remove('exceeded');
        }
    }

    if (impresionCard) {
        if (stats.impresion > LIMITS.impresion) {
            impresionCard.classList.add('exceeded');
        } else {
            impresionCard.classList.remove('exceeded');
        }
    }

    // Update featured photo section
    updateFeaturedPhoto();
}

// ========================================
// FEATURED PHOTO FUNCTIONS
// ========================================
function updateFeaturedPhoto() {
    // Sección de fotografía destacada removida
    // Esta función ya no hace nada
}

// ========================================
// CANVAS PROTECTION FUNCTIONS
// ========================================
function loadImageToCanvas(imageSrc, canvas, photoNumber) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // For CORS if needed

        img.onload = function() {
            const ctx = canvas.getContext('2d');

            // Get the container size
            const container = canvas.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Calculate scale to fit image in container
            const scale = Math.min(
                containerWidth / img.width,
                containerHeight / img.height
            );

            // Set canvas display size (CSS)
            canvas.style.width = containerWidth + 'px';
            canvas.style.height = containerHeight + 'px';

            // Set canvas buffer size (actual pixels)
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // Draw the image scaled
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            // Add watermark
            addWatermark(ctx, scaledWidth, scaledHeight, photoNumber);

            resolve();
        };

        img.onerror = function(err) {
            console.error('Error loading image:', imageSrc, err);
            reject(new Error(`Failed to load image: ${imageSrc}`));
        };

        img.src = imageSrc;
    });
}

function addWatermark(ctx, width, height, photoNumber) {
    // Semi-transparent watermark
    ctx.save();

    // Configure watermark style
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = `${Math.floor(width / 20)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add watermark text
    const watermarkText = 'Alisson Emireth';
    ctx.fillText(watermarkText, width / 2, height / 2);

    // Add smaller photo number in corner
    ctx.font = `${Math.floor(width / 30)}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.textAlign = 'left';
    ctx.fillText(`#${photoNumber}`, 20, height - 20);

    ctx.restore();
}

function disableCanvasInteraction(canvas) {
    // Disable right-click
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Disable drag
    canvas.addEventListener('dragstart', e => e.preventDefault());

    // Disable selection
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.mozUserSelect = 'none';
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function isVideo(item) {
    return typeof item === 'object' && item.youtubeId;
}

function getItemKey(index) {
    const item = items[index];
    if (isVideo(item)) {
        return item.id;
    }
    return index;
}

function getItemDisplay(index) {
    const item = items[index];
    if (isVideo(item)) {
        return `Video: ${item.title}`;
    }
    return `Foto ${index + 1}`;
}

// ========================================
// GALLERY FUNCTIONS
// ========================================
function renderGallery() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';

    items.forEach((item, index) => {
        const itemKey = getItemKey(index);
        const selection = photoSelections[itemKey] || {};
        const hasAny = selection.ampliacion || selection.impresion || selection.redes_sociales || selection.invitaciones_web || selection.descartada;

        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.index = index;

        // Add category classes
        if (selection.descartada) {
            card.classList.add('has-descartada');
        } else {
            const categories = [];
            if (selection.ampliacion) categories.push('ampliacion');
            if (selection.impresion) categories.push('impresion');
            if (selection.redes_sociales) categories.push('redes_sociales');
            if (selection.invitaciones_web) categories.push('invitaciones_web');

            if (categories.length > 1) {
                card.classList.add('has-multiple');
            } else if (categories.length === 1) {
                card.classList.add(`has-${categories[0]}`);
            }
        }

        // Build badges HTML
        let badgesHTML = '';
        if (hasAny) {
            badgesHTML = '<div class="photo-badges">';
            if (selection.ampliacion) badgesHTML += '<span class="badge badge-ampliacion"><i class="fas fa-image"></i> Ampliación</span>';
            if (selection.impresion) badgesHTML += '<span class="badge badge-impresion"><i class="fas fa-camera"></i> Impresión</span>';
            if (selection.redes_sociales) badgesHTML += '<span class="badge badge-redes-sociales"><i class="fas fa-share-alt"></i> Redes Sociales</span>';
            if (selection.invitaciones_web) badgesHTML += '<span class="badge badge-invitaciones-web"><i class="fas fa-globe"></i> Invitaciones Web</span>';
            if (selection.descartada) badgesHTML += '<span class="badge badge-descartada"><i class="fas fa-times-circle"></i> Descartada</span>';
            badgesHTML += '</div>';
        }

        // Determine content based on item type
        let contentHTML = '';
        let labelHTML = '';

        if (isVideo(item)) {
            // Video item
            contentHTML = `
                <div class="photo-image-container" style="position: relative;">
                    <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4rem; color: rgba(255, 255, 255, 0.9); text-shadow: 0 0 20px rgba(0,0,0,0.8);">
                        <i class="fab fa-youtube"></i>
                    </div>
                </div>
            `;
            labelHTML = `<div class="photo-number" style="background: #ff0000;"><i class="fab fa-youtube"></i> ${item.title}</div>`;
        } else {
            // Photo item
            contentHTML = `
                <div class="photo-image-container">
                    <img src="${item}" alt="Foto ${index + 1}" loading="lazy">
                </div>
            `;
            labelHTML = `<div class="photo-number">Foto ${index + 1}</div>`;
        }

        card.innerHTML = `
            ${contentHTML}
            ${labelHTML}
            ${badgesHTML}
        `;

        card.addEventListener('click', () => openModal(index));
        grid.appendChild(card);
    });

    applyFilter();
}

// ========================================
// FILTER FUNCTIONS
// ========================================
function isPhotoVisible(index) {
    const itemKey = getItemKey(index);
    const selection = photoSelections[itemKey] || {};
    let show = false;

    switch (currentFilter) {
        case 'all':
            show = true;
            break;
        case 'ampliacion':
            show = selection.ampliacion === true;
            break;
        case 'impresion':
            show = selection.impresion === true;
            break;
        case 'redes-sociales':
            show = selection.redes_sociales === true;
            break;
        case 'invitaciones-web':
            show = selection.invitaciones_web === true;
            break;
        case 'descartada':
            show = selection.descartada === true;
            break;
        case 'sin-clasificar':
            show = !selection.ampliacion && !selection.impresion && !selection.redes_sociales && !selection.invitaciones_web && !selection.descartada;
            break;
    }
    return show;
}

function applyFilter() {
    const cards = document.querySelectorAll('.photo-card');

    cards.forEach(card => {
        const index = parseInt(card.dataset.index);
        card.classList.toggle('hidden', !isPhotoVisible(index));
    });
}

function setFilter(filter) {
    console.log('Setting filter to:', filter);
    currentFilter = filter;
    applyFilter();

    // Update button states
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function updateFilterButtons() {
    const stats = getStats();

    document.getElementById('btnFilterAll').textContent = `Todas (${items.length})`;
    document.getElementById('btnFilterAmpliacion').textContent = `Ampliación (${stats.ampliacion})`;
    document.getElementById('btnFilterImpresion').textContent = `Impresión (${stats.impresion})`;
    document.getElementById('btnFilterRedesSociales').textContent = `Redes Sociales (${stats.redes_sociales})`;
    document.getElementById('btnFilterInvitacionesWeb').textContent = `Invitaciones Web (${stats.invitaciones_web})`;
    document.getElementById('btnFilterDescartada').textContent = `Descartadas (${stats.descartada})`;
    document.getElementById('btnFilterSinClasificar').textContent = `Sin Clasificar (${stats.sinClasificar})`;
}

function findNextVisiblePhoto(startIndex, direction) {
    let newIndex = startIndex;
    const totalItems = items.length;

    if (direction === 'next') {
        for (let i = startIndex + 1; i < totalItems; i++) {
            if (isPhotoVisible(i)) {
                return i;
            }
        }
    } else { // 'prev'
        for (let i = startIndex - 1; i >= 0; i--) {
            if (isPhotoVisible(i)) {
                return i;
            }
        }
    }

    return null; // No next/prev visible photo found
}

// ========================================
// MODAL FUNCTIONS
// ========================================
function openModal(index) {
    console.log(`Opening modal for index: ${index}, currentFilter: ${currentFilter}`);
    currentPhotoIndex = index;
    const modal = document.getElementById('photoModal');
    const modalImageContainer = document.querySelector('.modal-image-container');
    const modalPhotoNumber = document.getElementById('modalPhotoNumber');
    const item = items[index];
    const itemKey = getItemKey(index);

    // Clear previous content
    modalImageContainer.innerHTML = '';

    // Create content based on item type
    if (isVideo(item)) {
        // Video item - create YouTube iframe
        const videoContainer = document.createElement('div');
        videoContainer.style.position = 'relative';
        videoContainer.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
        videoContainer.style.height = '0';
        videoContainer.style.overflow = 'hidden';
        videoContainer.style.borderRadius = '10px';

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.src = `https://www.youtube.com/embed/${item.youtubeId}`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        videoContainer.appendChild(iframe);
        modalImageContainer.appendChild(videoContainer);

        const numberDiv = document.createElement('div');
        numberDiv.className = 'modal-photo-number';
        numberDiv.style.background = '#ff0000';
        numberDiv.innerHTML = `<i class="fab fa-youtube"></i> ${item.title}`;
        modalImageContainer.appendChild(numberDiv);
    } else {
        // Photo item
        const img = document.createElement('img');
        img.id = 'modalImage';
        img.src = item;
        img.alt = `Foto ${index + 1}`;
        img.style.width = '100%';
        img.style.maxHeight = '70vh';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '10px';

        modalImageContainer.appendChild(img);

        const numberDiv = document.createElement('div');
        numberDiv.className = 'modal-photo-number';
        numberDiv.textContent = `Foto ${index + 1}`;
        modalImageContainer.appendChild(numberDiv);
    }

    // Load current selections
    const selection = photoSelections[itemKey] || {};

    document.querySelectorAll('.option-btn').forEach(btn => {
        const category = btn.dataset.category;
        btn.classList.toggle('selected', selection[category] === true);
    });

    // Update navigation button states
    updateNavigationButtons();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateNavigationButtons() {
    const btnPrev = document.getElementById('btnPrevPhoto');
    const btnNext = document.getElementById('btnNextPhoto');

    if (btnPrev && btnNext) {
        const prevIndex = findNextVisiblePhoto(currentPhotoIndex, 'prev');
        const nextIndex = findNextVisiblePhoto(currentPhotoIndex, 'next');

        btnPrev.disabled = prevIndex === null;
        btnPrev.style.opacity = prevIndex === null ? '0.3' : '1';
        btnPrev.style.cursor = prevIndex === null ? 'not-allowed' : 'pointer';

        btnNext.disabled = nextIndex === null;
        btnNext.style.opacity = nextIndex === null ? '0.3' : '1';
        btnNext.style.cursor = nextIndex === null ? 'not-allowed' : 'pointer';
    }
}

function hasUnsavedChanges() {
    if (currentPhotoIndex === null) return false;

    const itemKey = getItemKey(currentPhotoIndex);
    const savedSelection = photoSelections[itemKey] || {};
    const currentSelection = {};
    document.querySelectorAll('.option-btn.selected').forEach(btn => {
        currentSelection[btn.dataset.category] = true;
    });

    const savedKeys = Object.keys(savedSelection).filter(k => savedSelection[k]);
    const currentKeys = Object.keys(currentSelection);

    if (savedKeys.length !== currentKeys.length) return true;

    const allKeys = new Set([...savedKeys, ...currentKeys]);

    for (const key of allKeys) {
        if (!!savedSelection[key] !== !!currentSelection[key]) {
            return true;
        }
    }

    return false;
}

function navigatePhoto(direction) {
    console.log(`Navigating photo: ${direction}`);
    if (currentPhotoIndex === null) return;

    const proceed = () => {
        const newIndex = findNextVisiblePhoto(currentPhotoIndex, direction);
        console.log(`findNextVisiblePhoto returned: ${newIndex}`);

        if (newIndex !== null) {
            // Simply re-open modal with new index
            openModal(newIndex);
        }
    };

    if (hasUnsavedChanges()) {
        if (confirm('¿Deseas guardar los cambios antes de continuar?')) {
            saveModalSelection(proceed);
        } else {
            proceed();
        }
    } else {
        proceed();
    }
}

function closeModal() {
    const doClose = () => {
        const modal = document.getElementById('photoModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentPhotoIndex = null;
    };

    if (hasUnsavedChanges()) {
        if (confirm('¿Deseas guardar los cambios antes de salir?')) {
            saveModalSelection(doClose);
        } else {
            doClose();
        }
    } else {
        doClose();
    }
}

function saveModalSelection(callback) {
    if (currentPhotoIndex === null) return;

    const itemKey = getItemKey(currentPhotoIndex);
    const selectedCategories = {};
    let hasAnySelection = false;

    document.querySelectorAll('.option-btn').forEach(btn => {
        const category = btn.dataset.category;
        const isSelected = btn.classList.contains('selected');
        selectedCategories[category] = isSelected;
        if (isSelected) hasAnySelection = true;
    });

    // Only save if there's at least one selection
    if (hasAnySelection) {
        photoSelections[itemKey] = selectedCategories;
    } else {
        // Remove from selections if nothing is selected
        delete photoSelections[itemKey];
    }

    saveSelections();
    renderGallery();
    updateStats();
    updateFilterButtons();
    showToast('Selección guardada correctamente', 'success');

    if (callback && typeof callback === 'function') {
        callback();
    } else {
        closeModal();
    }
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
function exportToJSON() {
    const exportData = {
        fecha_exportacion: new Date().toISOString(),
        evento: 'XV Años - Alisson Emireth',
        total_fotos: photos.length,
        total_videos: videos.length,
        estadisticas: getStats(),
        selecciones: [],
        sugerencias_de_cambios: {
            fotos: feedbackData.photos.length > 0 ? feedbackData.photos : 'Sin cambios sugeridos',
            videos: feedbackData.videos && feedbackData.videos.length > 0 ? feedbackData.videos : 'Sin comentarios sobre videos'
        }
    };

    items.forEach((item, index) => {
        const itemKey = getItemKey(index);
        const selection = photoSelections[itemKey];
        if (selection && (selection.ampliacion || selection.impresion || selection.redes_sociales || selection.invitaciones_web || selection.descartada)) {
            const itemData = {
                ampliacion: selection.ampliacion || false,
                impresion: selection.impresion || false,
                redes_sociales: selection.redes_sociales || false,
                invitaciones_web: selection.invitaciones_web || false,
                descartada: selection.descartada || false
            };

            if (isVideo(item)) {
                itemData.tipo = 'video';
                itemData.titulo = item.title;
                itemData.youtube_id = item.youtubeId;
                itemData.url = `https://youtu.be/${item.youtubeId}`;
            } else {
                itemData.tipo = 'foto';
                itemData.numero_foto = index + 1;
                itemData.archivo = item;
            }

            exportData.selecciones.push(itemData);
        }
    });

    // Convertir el JSON a texto formateado
    const jsonText = JSON.stringify(exportData, null, 2);

    // Crear mensaje para WhatsApp
    const message = `👑 SELECCIÓN DE FOTOS Y VIDEOS - XV AÑOS ALISSON EMIRETH\n\n${jsonText}`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Crear URL de WhatsApp
    const whatsappURL = `https://wa.me/524779203776?text=${encodedMessage}`;

    // Abrir WhatsApp en nueva ventana
    window.open(whatsappURL, '_blank');

    showToast('Abriendo WhatsApp para enviar reporte...', 'success');
}

function generateTextSummary() {
    const stats = getStats();
    let summary = '👑 SELECCIÓN DE FOTOS Y VIDEOS - XV AÑOS ALISSON EMIRETH\n';
    summary += '═══════════════════════════════════════\n\n';
    summary += `📊 RESUMEN GENERAL:\n`;
    summary += `   Total de fotos: ${photos.length}\n`;
    summary += `   Total de videos: ${videos.length}\n`;
    summary += `   🖼️  Para ampliación: ${stats.ampliacion}\n`;
    summary += `   📸 Para impresión: ${stats.impresion}\n`;
    summary += `   📱 Para redes sociales: ${stats.redes_sociales}\n`;
    summary += `   🌐 Para invitaciones web: ${stats.invitaciones_web}\n`;
    summary += `   ❌ Descartadas: ${stats.descartada}\n`;
    summary += `   ⭕ Sin clasificar: ${stats.sinClasificar}\n\n`;

    const categories = ['ampliacion', 'impresion', 'redes_sociales', 'invitaciones_web', 'descartada'];
    const categoryNames = {
        ampliacion: '🖼️  AMPLIACIÓN',
        impresion: '📸 IMPRESIÓN',
        redes_sociales: '📱 REDES SOCIALES',
        invitaciones_web: '🌐 INVITACIONES WEB',
        descartada: '❌ DESCARTADAS'
    };

    categories.forEach(category => {
        const itemsInCategory = [];
        items.forEach((item, index) => {
            const itemKey = getItemKey(index);
            const selection = photoSelections[itemKey];
            if (selection && selection[category]) {
                if (isVideo(item)) {
                    itemsInCategory.push(`VIDEO: ${item.title} (https://youtu.be/${item.youtubeId})`);
                } else {
                    itemsInCategory.push(`Foto #${index + 1}`);
                }
            }
        });

        if (itemsInCategory.length > 0) {
            summary += `${categoryNames[category]}:\n`;
            itemsInCategory.forEach(item => {
                summary += `   - ${item}\n`;
            });
            summary += `   Total: ${itemsInCategory.length}\n\n`;
        }
    });

    // Add feedback section for photos
    if (feedbackData.photos.length > 0) {
        summary += `\n💬 SUGERENCIAS DE CAMBIOS EN FOTOS:\n`;
        feedbackData.photos.forEach(item => {
            summary += `   📸 Foto #${item.photoNumber}: ${item.change}\n`;
        });
        summary += '\n';
    }

    // Add feedback section for videos
    if (feedbackData.videos && feedbackData.videos.length > 0) {
        summary += `\n🎥 COMENTARIOS SOBRE VIDEOS:\n`;
        feedbackData.videos.forEach(item => {
            const timestamp = item.timestamp ? ` [${item.timestamp}]` : '';
            summary += `   📹 ${item.videoTitle}${timestamp}: ${item.comment}\n`;
        });
        summary += '\n';
    }

    summary += `\n📅 Generado el: ${new Date().toLocaleString('es-MX')}\n`;

    return summary;
}

function copyToClipboard() {
    const summary = generateTextSummary();

    navigator.clipboard.writeText(summary).then(() => {
        showToast('Resumen copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Resumen copiado al portapapeles', 'success');
    });
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Iniciando selector de fotos - Alisson Emireth XV Años');
    console.log(`📸 Total de fotos: ${TOTAL_PHOTOS}`);

    // Load saved selections
    loadSelections();
    console.log('✅ Selecciones cargadas:', Object.keys(photoSelections).length);

    // Render gallery
    renderGallery();

    // Update stats
    updateStats();

    // Update filter buttons
    updateFilterButtons();

    // Filter buttons
    document.getElementById('btnFilterAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('btnFilterAmpliacion').addEventListener('click', () => setFilter('ampliacion'));
    document.getElementById('btnFilterImpresion').addEventListener('click', () => setFilter('impresion'));
    document.getElementById('btnFilterRedesSociales').addEventListener('click', () => setFilter('redes-sociales'));
    document.getElementById('btnFilterInvitacionesWeb').addEventListener('click', () => setFilter('invitaciones-web'));
    document.getElementById('btnFilterDescartada').addEventListener('click', () => setFilter('descartada'));
    document.getElementById('btnFilterSinClasificar').addEventListener('click', () => setFilter('sin-clasificar'));

    // Set data-filter attributes
    document.getElementById('btnFilterAll').dataset.filter = 'all';
    document.getElementById('btnFilterAmpliacion').dataset.filter = 'ampliacion';
    document.getElementById('btnFilterImpresion').dataset.filter = 'impresion';
    document.getElementById('btnFilterRedesSociales').dataset.filter = 'redes-sociales';
    document.getElementById('btnFilterInvitacionesWeb').dataset.filter = 'invitaciones-web';
    document.getElementById('btnFilterDescartada').dataset.filter = 'descartada';
    document.getElementById('btnFilterSinClasificar').dataset.filter = 'sin-clasificar';

    // Set initial active filter
    document.getElementById('btnFilterAll').classList.add('active');

    // Action buttons
    document.getElementById('btnExport').addEventListener('click', exportToJSON);
    document.getElementById('btnShare').addEventListener('click', copyToClipboard);
    document.getElementById('btnClear').addEventListener('click', clearAllSelections);

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancelSelection').addEventListener('click', closeModal);
    document.getElementById('btnSaveSelection').addEventListener('click', saveModalSelection);

    // Option buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const isCurrentlySelected = btn.classList.contains('selected');

            // If selecting descartada, deselect all others
            if (category === 'descartada' && !isCurrentlySelected) {
                document.querySelectorAll('.option-btn').forEach(b => {
                    if (b !== btn) b.classList.remove('selected');
                });
            }

            // If selecting any other, deselect descartada
            if (category !== 'descartada' && !isCurrentlySelected) {
                const descartadaBtn = document.querySelector('.option-btn[data-category="descartada"]');
                if (descartadaBtn) descartadaBtn.classList.remove('selected');
            }

            btn.classList.toggle('selected');

            // Show warning if exceeding recommended limit (but allow it)
            if (!isCurrentlySelected && LIMITS[category]) {
                const stats = getStats();
                const futureCount = stats[category] + 1;
                if (futureCount > LIMITS[category]) {
                    const messages = {
                        impresion: `⚠️ Nota: Has seleccionado ${futureCount} fotos para impresión (se recomiendan ${LIMITS.impresion})`,
                        ampliacion: `⚠️ Nota: Has seleccionado ${futureCount} fotos para ampliación (se recomienda ${LIMITS.ampliacion})`
                    };
                    showToast(messages[category], 'warning');
                }
            }
        });
    });

    // Close modal on outside click
    document.getElementById('photoModal').addEventListener('click', (e) => {
        if (e.target.id === 'photoModal') {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('photoModal');
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'Enter') {
                saveModalSelection();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigatePhoto('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigatePhoto('next');
            }
        }
    });

    // Navigation button click handlers
    document.getElementById('btnPrevPhoto').addEventListener('click', (e) => {
        e.stopPropagation();
        navigatePhoto('prev');
    });

    document.getElementById('btnNextPhoto').addEventListener('click', (e) => {
        e.stopPropagation();
        navigatePhoto('next');
    });

    console.log('✅ ¡Selector de fotos inicializado correctamente!');
});

// ========================================
// AUTO-SAVE ON VISIBILITY CHANGE
// ========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Página oculta - guardando selecciones...');
        saveSelections();
    }
});

// ========================================
// BEFORE UNLOAD WARNING
// ========================================
window.addEventListener('beforeunload', (e) => {
    saveSelections();
});

// ========================================
// FEEDBACK MANAGEMENT
// ========================================
const FEEDBACK_KEY = 'alisson_xv_feedback';
let feedbackData = {
    photos: [],
    videos: []
};

// Load feedback from localStorage
function loadFeedback() {
    try {
        const saved = localStorage.getItem(FEEDBACK_KEY);
        if (saved) {
            feedbackData = JSON.parse(saved);
            // Ensure videos array exists for backward compatibility
            if (!feedbackData.videos) {
                feedbackData.videos = [];
            }
            renderFeedbackLists();
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

// Save feedback to localStorage
function saveFeedback() {
    try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackData));
    } catch (error) {
        console.error('Error saving feedback:', error);
    }
}

// Add photo feedback
function addPhotoFeedback() {
    const photoNumber = document.getElementById('photoNumber').value.trim();
    const change = document.getElementById('photoChange').value.trim();

    if (!photoNumber || !change) {
        showToast('Por favor completa ambos campos', 'error');
        return;
    }

    if (photoNumber < 1 || photoNumber > TOTAL_PHOTOS) {
        showToast(`El número de foto debe estar entre 1 y ${TOTAL_PHOTOS}`, 'error');
        return;
    }

    feedbackData.photos.push({ photoNumber: parseInt(photoNumber), change });
    saveFeedback();
    renderFeedbackLists();

    // Clear inputs
    document.getElementById('photoNumber').value = '';
    document.getElementById('photoChange').value = '';

    showToast('Sugerencia de foto agregada', 'success');
}

// Remove photo feedback
function removePhotoFeedback(index) {
    feedbackData.photos.splice(index, 1);
    saveFeedback();
    renderFeedbackLists();
    showToast('Sugerencia eliminada', 'success');
}

// Render feedback lists
function renderFeedbackLists() {
    const photoList = document.getElementById('photoFeedbackList');
    const videoList = document.getElementById('videoFeedbackList');

    if (photoList) {
        // Render photo feedback
        if (feedbackData.photos.length === 0) {
            photoList.innerHTML = '<p style="color: rgba(250, 248, 243, 0.5); font-style: italic; margin: 10px 0; text-align: center;">No hay sugerencias de cambios</p>';
        } else {
            photoList.innerHTML = feedbackData.photos.map((item, index) => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(212, 175, 55, 0.3);">
                    <span style="font-weight: 600; color: var(--gold); min-width: 70px; font-size: 1rem;"><i class="fas fa-camera"></i> #${item.photoNumber}</span>
                    <span style="flex: 1; color: var(--cream); font-size: 0.95rem;">${item.change}</span>
                    <button onclick="removePhotoFeedback(${index})" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s ease;" onmouseover="this.style.background='#d32f2f'" onmouseout="this.style.background='#f44336'"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('');
        }
    }

    if (videoList) {
        // Render video feedback
        if (!feedbackData.videos || feedbackData.videos.length === 0) {
            videoList.innerHTML = '<p style="color: rgba(250, 248, 243, 0.5); font-style: italic; margin: 10px 0; text-align: center;">No hay comentarios sobre videos</p>';
        } else {
            videoList.innerHTML = feedbackData.videos.map((item, index) => `
                <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255, 0, 0, 0.08); border-radius: 10px; margin-bottom: 10px; border: 1px solid rgba(255, 0, 0, 0.3);">
                    <span style="font-weight: 600; color: #ff0000; min-width: 150px; font-size: 1rem;"><i class="fab fa-youtube"></i> ${item.videoTitle}</span>
                    ${item.timestamp ? `<span style="color: var(--gold); font-weight: 600; min-width: 60px;"><i class="far fa-clock"></i> ${item.timestamp}</span>` : ''}
                    <span style="flex: 1; color: var(--cream); font-size: 0.95rem;">${item.comment}</span>
                    <button onclick="removeVideoFeedback(${index})" style="padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s ease;" onmouseover="this.style.background='#d32f2f'" onmouseout="this.style.background='#f44336'"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('');
        }
    }
}

// Add video feedback
function addVideoFeedback() {
    const videoSelect = document.getElementById('videoSelect');
    const videoTimestamp = document.getElementById('videoTimestamp').value.trim();
    const videoComment = document.getElementById('videoComment').value.trim();

    if (!videoSelect.value) {
        showToast('Por favor selecciona un video', 'error');
        return;
    }

    if (!videoComment) {
        showToast('Por favor agrega un comentario', 'error');
        return;
    }

    if (!feedbackData.videos) {
        feedbackData.videos = [];
    }

    feedbackData.videos.push({
        videoTitle: videoSelect.value,
        timestamp: videoTimestamp || null,
        comment: videoComment
    });

    saveFeedback();
    renderFeedbackLists();

    // Clear inputs
    videoSelect.value = '';
    document.getElementById('videoTimestamp').value = '';
    document.getElementById('videoComment').value = '';

    showToast('Comentario de video agregado', 'success');
}

// Add video delivery preference
function addVideoDeliveryPreference(videoTitle, delivery) {
    if (!feedbackData.videos) {
        feedbackData.videos = [];
    }

    feedbackData.videos.push({
        videoTitle: videoTitle,
        timestamp: null,
        comment: `Solicito recibir este video en formato ${delivery} (DVD/USB)`
    });

    saveFeedback();
    renderFeedbackLists();
    showToast(`Preferencia de entrega agregada para "${videoTitle}"`, 'success');
}

// Remove video feedback
function removeVideoFeedback(index) {
    if (!feedbackData.videos) {
        feedbackData.videos = [];
    }
    feedbackData.videos.splice(index, 1);
    saveFeedback();
    renderFeedbackLists();
    showToast('Comentario eliminado', 'success');
}

// Load feedback on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFeedback();
});

// Intersection Observer for Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .fade-in, .scale-in');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

// Initialize scroll animations on page load
window.addEventListener('load', initScrollAnimations);

// ========================================
// FEATURED IMPROVEMENT ACTIONS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Accept Changes Button
    const btnAcceptChanges = document.getElementById('btnAcceptChanges');
    if (btnAcceptChanges) {
        btnAcceptChanges.addEventListener('click', () => {
            if (confirm('¿Confirmas que deseas conservar estas mejoras en la Foto #49?\n\nLa foto mejorada será marcada automáticamente para AMPLIACIÓN.')) {
                // Mark photo 49 (index 48) for ampliacion
                const photoIndex = 48; // foto0049 es índice 48 (0-based)

                photoSelections[photoIndex] = {
                    ampliacion: true,
                    impresion: false,
                    redes_sociales: false,
                    invitaciones_web: false,
                    descartada: false
                };

                saveSelections();
                renderGallery();
                updateStats();
                updateFilterButtons();

                showToast('✅ Cambios conservados. Foto #49 marcada para AMPLIACIÓN', 'success');

                // Scroll to gallery
                setTimeout(() => {
                    document.querySelector('.photos-grid').scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        });
    }

    // Suggest More Changes Button
    const btnSuggestMoreChanges = document.getElementById('btnSuggestMoreChanges');
    if (btnSuggestMoreChanges) {
        btnSuggestMoreChanges.addEventListener('click', () => {
            const changes = prompt('¿Qué cambios adicionales te gustaría que se realicen en la Foto #49?\n\nDescribe las mejoras que necesitas:');

            if (changes && changes.trim() !== '') {
                // Add to feedback
                feedbackData.photos.push({
                    photoNumber: 49,
                    change: `[MEJORA ADICIONAL] ${changes.trim()}`
                });

                saveFeedback();
                renderFeedbackLists();

                showToast('✅ Sugerencia de cambios adicionales agregada para Foto #49', 'success');

                // Show confirmation
                alert('📝 Tu sugerencia ha sido registrada:\n\n"' + changes.trim() + '"\n\nSe enviará junto con el reporte al fotógrafo para aplicar los cambios adicionales.');
            }
        });
    }

    // Undo Changes Button
    const btnUndoChanges = document.getElementById('btnUndoChanges');
    if (btnUndoChanges) {
        btnUndoChanges.addEventListener('click', () => {
            if (confirm('¿Estás segura de que quieres DESHACER las mejoras aplicadas?\n\nSe volverá a usar la foto ORIGINAL sin editar.')) {
                // Add feedback to use original
                feedbackData.photos.push({
                    photoNumber: 49,
                    change: '[USAR ORIGINAL] Prefiero la foto original sin las mejoras aplicadas'
                });

                // Mark as descartada the improved version
                const photoIndex = 48;
                photoSelections[photoIndex] = {
                    ampliacion: false,
                    impresion: false,
                    redes_sociales: false,
                    invitaciones_web: false,
                    descartada: true
                };

                saveFeedback();
                saveSelections();
                renderFeedbackLists();
                renderGallery();
                updateStats();
                updateFilterButtons();

                showToast('↩️ Cambios deshachos. Se usará la foto ORIGINAL', 'success');

                alert('✅ Las mejoras han sido descartadas.\n\nSe usará la foto ORIGINAL sin editar para la ampliación.\n\nEsta preferencia se enviará al fotógrafo en el reporte.');
            }
        });
    }
});
