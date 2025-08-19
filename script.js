// Slider Functionality with fade effect
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    slideIndex = n;
    slides[slideIndex].classList.add('active');
}

// Initialize first slide
showSlide(slideIndex);

function nextSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
}

function prevSlide() {
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    showSlide(slideIndex);
}

// Auto slide every 5 seconds
setInterval(nextSlide, 5000);

// Match Filtering
function filterMatches() {
    const inputInterest = document.getElementById('interest').value.toLowerCase();
    const cards = document.querySelectorAll('.match-card');
    cards.forEach(card => {
        const interests = card.getAttribute('data-interests').toLowerCase();
        card.style.display = interests.includes(inputInterest) ? 'block' : 'none';
    });
}
