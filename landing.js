const slides = document.querySelectorAll('.slide');
let current = 0;

function nextSlide(){
  slides[current].classList.remove('active');
  current = (current +1) % slides.length;
  slides[current].classList.add('active');
}

setInterval(nextSlide, 3000); // Change slide every 3s
