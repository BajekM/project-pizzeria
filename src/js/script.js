/*Constans*/
const dots = document.querySelectorAll('.carousel-indicator');

const slide1 = document.querySelector('.slide-1');
slide1.classList.add('animated-slide');


/*Functions*/
function clearSlides() {
  const activeSlide = document.querySelector('.placed-slide');
  //console.log('activeSlide',activeSlide);
  activeSlide.classList.remove('animated-slide');
  activeSlide.classList.remove('placed-slide');
}


function updateDots() {
  for (const dot of dots) {
    dot.classList.remove('current-slide');
  }
}

function showSlide() {
  const activeDot = document.querySelector('.current-slide');
  //console.log('activeDot', activeDot);
  const activeDotTarget = activeDot.getAttribute('target');
  //console.log('activeDotTarget', activeDotTarget);
  const shownSlide = document.querySelector('.' + activeDotTarget);
  //console.log('shownSlide', shownSlide);
  shownSlide.classList.add('placed-slide');
  shownSlide.classList.add('animated-slide');
}

function skipDot() {
  const activeDot = document.querySelector('.current-slide');
  let activeDotTarget  = activeDot.getAttribute('target');
  //console.log('activeDotTarget', activeDotTarget);
  if(activeDotTarget == 'slide-1') {
    activeDotTarget = 'slide-2';
  }else if(activeDotTarget == 'slide-2') {
    activeDotTarget = 'slide-3';
  } else if (activeDotTarget == 'slide-3') {
    activeDotTarget = 'slide-1';
  }
  //console.log('changedActiveDotTarget', activeDotTarget);
  activeDot.classList.remove('current-slide');
  const nextDot = document.querySelector('[target=' + activeDotTarget + ']');
  //console.log('nextDot', nextDot);
  nextDot.classList.add('current-slide');
  clearSlides();
  showSlide();
  setTimeout(function() {
    skipDot();
  }, 3000);
}

/*Script*/
for (const dot of dots) {
  dot.addEventListener('click', function(){
    const thisDot = this;
    updateDots();
    thisDot.classList.add('current-slide');
    clearSlides();
    showSlide();
  });
}

setTimeout(function() {
  skipDot();
}, 3000);

