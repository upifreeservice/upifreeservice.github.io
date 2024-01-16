const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const scratchCardCover = document.querySelector('.scratch-card-cover');
const scratchCardCanvasRender = document.querySelector('.scratch-card-canvas-render');
const scratchCardCoverContainer = document.querySelector('.scratch-card-cover-container');
const scratchCardText = document.querySelector('.scratch-card-text');
const scratchCardImage = document.querySelector('.scratch-card-image');

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
let isPointerDown = false;
let positionX;
let positionY;
let clearDetectionTimeout = null;

const devicePixelRatio = window.devicePixelRatio || 1;

const canvasWidth = canvas.offsetWidth * devicePixelRatio;
const canvasHeight = canvas.offsetHeight * devicePixelRatio;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

context.scale(devicePixelRatio, devicePixelRatio);

if (isSafari) {
  canvas.classList.add('hidden');
}

canvas.addEventListener('pointerdown', (e) => {
  scratchCardCover.classList.remove('shine');
  ({ x: positionX, y: positionY } = getPosition(e));
  clearTimeout(clearDetectionTimeout);
  
  canvas.addEventListener('pointermove', plot);
  
  window.addEventListener('pointerup', (e) => {
    canvas.removeEventListener('pointermove', plot);
    clearDetectionTimeout = setTimeout(() => {
      checkBlackFillPercentage();
    }, 500);
  }, { once: true });
});

const checkBlackFillPercentage = () => {
  const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixelData = imageData.data;

  let blackPixelCount = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    const red = pixelData[i];
    const green = pixelData[i + 1];
    const blue = pixelData[i + 2];
    const alpha = pixelData[i + 3];

    if (red === 0 && green === 0 && blue === 0 && alpha === 255) {
      blackPixelCount++;
    }
  }

  const blackFillPercentage = blackPixelCount * 100 / (canvasWidth * canvasHeight);

if (blackFillPercentage >= 45) {
  scratchCardCoverContainer.classList.add('clear');
  confetti({
    particleCount: 100,
    spread: 90,
    origin: {
       y: (scratchCardText.getBoundingClientRect().bottom + 60) / window.innerHeight,
    },
  });

  // Change textContent to innerHTML afte show scratch complete 
  scratchCardText.innerHTML = '<button id="claim-button" onclick="makePayment()">Make UPI Payment</button><p id="randomAmount"></p>';

  scratchCardImage.classList.add('animate');
  scratchCardCoverContainer.addEventListener('transitionend', () => {
    scratchCardCoverContainer.classList.add('hidden');
  }, { once: true });
}

}

const getPosition = ({ clientX, clientY }) => {
  const { left, top } = canvas.getBoundingClientRect();
  return {
    x: clientX - left,
    y: clientY - top,
  };
}

const plotLine = (context, x1, y1, x2, y2) => {
  var diffX = Math.abs(x2 - x1);
  var diffY = Math.abs(y2 - y1);
  var dist = Math.sqrt(diffX * diffX + diffY * diffY);
  var step = dist / 50;
  var i = 0;
  var t;
  var x;
  var y;

  while (i < dist) {
    t = Math.min(1, i / dist);

    x = x1 + (x2 - x1) * t;
    y = y1 + (y2 - y1) * t;

    context.beginPath();
    context.arc(x, y, 16, 0, Math.PI * 2);
    context.fill();

    i += step;
  }
}

const setImageFromCanvas = () => {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    previousUrl = scratchCardCanvasRender.src;
    scratchCardCanvasRender.src = url;
    if (!previousUrl) {
      scratchCardCanvasRender.classList.remove('hidden');
    } else {
      URL.revokeObjectURL(previousUrl);
    }
    previousUrl = url;
  });
}

let setImageTimeout = null;

const plot = (e) => {
  const { x, y } = getPosition(e);
  plotLine(context, positionX, positionY, x, y);
  positionX = x;
  positionY = y;
  if (isSafari) {
    clearTimeout(setImageTimeout);

    setImageTimeout = setTimeout(() => {
      setImageFromCanvas();
    }, 5);
  }
};


//image slider js tag script 
let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    const slider = document.querySelector('.slider');
    const indicatorsContainer = document.querySelector('.indicators');

    function createIndicators() {
        const totalSlides = document.querySelectorAll('.slider img').length;
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
        updateIndicators();
    }

    function goToSlide(index) {
        currentIndex = index;
        showSlide();
        updateIndicators();
        resetTimer();
    }

    function showNextSlide() {
        currentIndex = (currentIndex + 1) % document.querySelectorAll('.slider img').length;
        showSlide();
        updateIndicators();
    }

    function showSlide() {
        slider.style.transform = `translateX(${-currentIndex * 100}%)`;
    }

    function updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function resetTimer() {
        clearInterval(slideInterval);
        slideInterval = setInterval(showNextSlide, 3000); // Adjust the time interval for the slide change
    }

    createIndicators();
    let slideInterval = setInterval(showNextSlide, 3000); // Adjust the time interval for the slide change

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slider.addEventListener('mouseleave', resetTimer);

    // Swipe gestures for mobile devices
    slider.addEventListener('mousedown', handleDragStart);
    slider.addEventListener('mousemove', handleDragMove);
    slider.addEventListener('mouseup', handleDragEnd);
    slider.addEventListener('touchstart', handleDragStart);
    slider.addEventListener('touchmove', handleDragMove);
    slider.addEventListener('touchend', handleDragEnd);

    function handleDragStart(e) {
        if (e.type.startsWith('touch')) {
            startX = e.touches[0].clientX;
        } else {
            startX = e.clientX;
        }
        isDragging = true;
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        const currentX = (e.type.startsWith('touch')) ? e.touches[0].clientX : e.clientX;
        const diffX = currentX - startX;
        const threshold = 50; // Adjust the threshold for swipe detection
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                currentIndex = Math.max(0, currentIndex - 1);
            } else {
                currentIndex = Math.min(document.querySelectorAll('.slider img').length - 1, currentIndex + 1);
            }
            showSlide();
            updateIndicators();
            resetTimer();
            isDragging = false;
        }
    }

    function handleDragEnd() {
        isDragging = false;
    }
    
    