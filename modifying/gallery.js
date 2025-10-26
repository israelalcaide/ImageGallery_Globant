
let currentCardIndex = 0;
let isMobileView = false;
let currentPhotos = [];
let isLoading = false;
let autoSlideInterval = null;

const FAV_KEY = 'favs';

function getFavs() { 
    try { 
        return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); 
    } catch { 
        return new Set(); } 
}

function setFavs(set) {
     localStorage.setItem(FAV_KEY, JSON.stringify([...set])); }


function checkMobileView() {
    return window.innerWidth <= 768;
}

function createPhotoCard(photo) {
    const favs = getFavs();
    const isFav = favs.has(photo.id);

    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.id = photo.id;

    card.innerHTML = `
        <div class="card-image">
            <img src="${photo.small}" alt="${photo.alt}" loading="lazy" />
        </div>
        <div class="card-info">
            <h3 class="card-title">${photo.alt || 'Sin título'}</h3>
            <p class="card-category">by ${photo.authorName}</p>
            <div class="card-actions">
                <button class="like-btn ${isFav ? 'liked' : ''}" type="button" data-id="${photo.id}" aria-label="Marcar como favorito">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${photo.likes}
                </button>
                <button class="download-btn" type="button" data-id="${photo.id}" data-download="${photo.downloadLocation}" aria-label="Descargar">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>
        </div>
    `;
    return card;
}


function displayPhotosInCards(photos) {
    const cardsContainer = document.getElementById('cardsContainer');
    cardsContainer.innerHTML = '';
    
    photos.forEach(photo => {
        const card = createPhotoCard(photo);
        cardsContainer.appendChild(card);
    });
    
    currentCardIndex = 0;

    translateX = 0;
    updateCardDisplay();
}

function displayPhotosInGrid(photos) {
    const imageGrid = document.getElementById('imageGrid');
    
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.thumb;
        img.alt = photo.alt;
        img.loading = 'lazy';
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            window.open(photo.regular, '_blank');
        });
        imageGrid.appendChild(img);
    });
}

async function loadDefaultPhotos() {
    if (isLoading)
        return;
    
    isLoading = true;
    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('error');
    
    try {
        if (loader)
            loader.hidden = false;
        if (errorDiv)
            errorDiv.hidden = true;
        
        console.log('Cargando fotos populares...');
        const result = await window.UnsplashAPI.listPhotos({ orderBy: 'popular', reset: true });
        currentPhotos = result.photos;
        
        console.log('Fotos cargadas:', currentPhotos.length);
        
        const cardPhotos = currentPhotos.slice(0, 6);
        displayPhotosInCards(cardPhotos);
        
        displayPhotosInGrid(currentPhotos);
        
    } catch (error) {
        console.error('Error loading photos:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Error al cargar las imágenes. Verifica tu conexión a internet.';
            errorDiv.hidden = false;
        }
    } finally {
        if (loader)
            loader.hidden = true;
        isLoading = false;
    }
}

async function searchPhotos(query) {
    if (!query.trim() || isLoading)
        return;
    
    isLoading = true;
    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('error');
    const imageGrid = document.getElementById('imageGrid');
    
    try {
        if (loader)
            loader.hidden = false;
        if (errorDiv)
            errorDiv.hidden = true;
        if (imageGrid)
            imageGrid.innerHTML = '';
        
        console.log('Buscando fotos para:', query);
        const result = await window.UnsplashAPI.searchPhotos(query, { reset: true });
        currentPhotos = result.photos;
        
        if (currentPhotos.length === 0) {
            if (errorDiv) {
                errorDiv.textContent = 'No se encontraron imágenes para esa búsqueda.';
                errorDiv.hidden = false;
            }
            return;
        }
        
        console.log('Fotos encontradas:', currentPhotos.length);

        const cardPhotos = currentPhotos.slice(0, 6);
        displayPhotosInCards(cardPhotos);

        displayPhotosInGrid(currentPhotos);
        
    } catch (error) {
        console.error('Error searching photos:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Error en la búsqueda. Por favor, intenta de nuevo.';
            errorDiv.hidden = false;
        }
    } finally {
        if (loader)
            loader.hidden = true;
        isLoading = false;
    }
}

function updateCardDisplay() {
    const cards = document.querySelectorAll('.photo-card');
    const navArrows = document.querySelectorAll('.nav-arrow');
    isMobileView = checkMobileView();
    
    if (isMobileView) {
        cards.forEach((card, index) => {
            card.classList.remove('active');
            card.style.display = 'none';
            if (index === currentCardIndex) {
                card.classList.add('active');
                card.style.display = 'block';
            }
        });
        

        navArrows.forEach(arrow => {
            arrow.style.display = 'flex';
        });
        

        stopAutoSlide();
        

        const cardsContainer = document.getElementById('cardsContainer');
        if (cardsContainer) {
            cardsContainer.style.transform = 'translateX(0)';
        }

        
    } else {

        const cardsContainer = document.getElementById('cardsContainer');
        
        cards.forEach(card => {
            card.classList.add('active');
            card.style.display = 'block';
        });
        

        navArrows.forEach(arrow => {
            arrow.style.display = 'none';
        });
        
  
        if (cardsContainer) {
            cardsContainer.style.transform = `translateX(${translateX}px)`;
        }
        

        const wasAlreadyRunning = animationId !== null;
        startHorizontalCarousel(wasAlreadyRunning);
    }
}



function nextCard() {
    const cards = document.querySelectorAll('.photo-card');
    if (cards.length === 0)
        return;
    
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    updateCardDisplay();
}


function prevCard() {
    const cards = document.querySelectorAll('.photo-card');
    if (cards.length === 0)
        return;
    
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    updateCardDisplay();
}


let translateX = 0;
let animationId = null;


function startHorizontalCarousel(isResume = false) {
    stopAutoSlide();
    
    const cardsContainer = document.getElementById('cardsContainer');
    const originalCards = document.querySelectorAll('.photo-card:not(.duplicate)');
    
    if (!cardsContainer || originalCards.length === 0)
        return;
    

    const existingDuplicates = document.querySelectorAll('.photo-card.duplicate');
    if (existingDuplicates.length === 0) {
        duplicateCardsForInfiniteScroll();
    }
    

    if (!isResume) {
        translateX = 0;
    }
    
    function animate() {
        if (!isMobileView) {
            translateX -= 1.5;
            
 
            const firstCard = originalCards[0];
            if (firstCard) {
                const cardRect = firstCard.getBoundingClientRect();
                const cardWidth = cardRect.width;
                const gap = 32;
                const totalCardWidth = cardWidth + gap;
                const totalOriginalWidth = originalCards.length * totalCardWidth;
                
  
                if (Math.abs(translateX) >= totalOriginalWidth) {
                    translateX = 0;
                }
            }
            
            cardsContainer.style.transform = `translateX(${translateX}px)`;
            animationId = requestAnimationFrame(animate);
        }
    }
    

    setTimeout(() => {
        animationId = requestAnimationFrame(animate);
    }, isResume ? 0 : 100);
}

function stopAutoSlide() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}


function duplicateCardsForInfiniteScroll() {
    const cardsContainer = document.getElementById('cardsContainer');
    const originalCards = document.querySelectorAll('.photo-card:not(.duplicate)');
    
    if (originalCards.length === 0)
        return;
    

    const existingDuplicates = document.querySelectorAll('.photo-card.duplicate');
    existingDuplicates.forEach(card => card.remove());
    

    for (let i = 0; i < 2; i++) {
        originalCards.forEach(card => {
            const duplicate = card.cloneNode(true);
            duplicate.classList.add('duplicate');
            cardsContainer.appendChild(duplicate);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search-button');
    

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (isMobileView) {
                nextCard();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (isMobileView) {
                prevCard();
            }
        });
    }
    

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchPhotos(query);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchPhotos(query);
                }
            }
        });
    }


    document.getElementById('cardsContainer')?.addEventListener('click', async (e) => {
        const likeBtn = e.target.closest('.like-btn');
        const dlBtn   = e.target.closest('.download-btn');
        if (!likeBtn && !dlBtn)
            return;

        if (likeBtn) {
            const id = likeBtn.dataset.id;
            const favs = getFavs();
            const wasFav = favs.has(id);

            if (wasFav)
                favs.delete(id);
            else 
                favs.add(id);
            setFavs(favs);

            likeBtn.classList.toggle('liked', !wasFav);
            const icon = likeBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-regular', wasFav);
                icon.classList.toggle('fa-solid', !wasFav);
            }
            return;
        }


        if (dlBtn) {
            const id  = dlBtn.dataset.id;
            const loc = dlBtn.dataset.download;

            try { 
                await window.UnsplashAPI.registerDownload(loc);
            }
            catch {}

            const p = currentPhotos.find(p => p.id === id);
            if (p?.regular)
                window.open(p.regular, '_blank');
        }
    });


    updateCardDisplay();
  
    window.addEventListener('resize', function() {
        updateCardDisplay();
    });

    const cardsContainer = document.getElementById('cardsContainer');
    if (cardsContainer) {
        cardsContainer.addEventListener('mouseenter', () => {
            if (!isMobileView) {
                stopAutoSlide();
            }
        });
        
        cardsContainer.addEventListener('mouseleave', () => {
            if (!isMobileView) {
                startHorizontalCarousel(true);
            }
        });
    }

    console.log('Página cargada, iniciando carga de fotos...');
    loadDefaultPhotos();
});
