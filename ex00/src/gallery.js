
let currentCardIndex = 0;
let isMobileView = false;

function checkMobileView() {
    return window.innerWidth <= 768;
}

function updateCardDisplay() {
    const cards = document.querySelectorAll('.photo-card');
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
    } else {

        cards.forEach(card => {
            card.classList.add('active');
            card.style.display = 'block';
        });
    }
}


function nextCard() {
    if (!isMobileView) return;
    
    const cards = document.querySelectorAll('.photo-card');
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    updateCardDisplay();
}

function prevCard() {
    if (!isMobileView) return;
    
    const cards = document.querySelectorAll('.photo-card');
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    updateCardDisplay();
}

document.addEventListener('DOMContentLoaded', function() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextCard);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevCard);
    }

    updateCardDisplay();
  
    window.addEventListener('resize', function() {
        updateCardDisplay();
    });
});