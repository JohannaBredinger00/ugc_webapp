const track = document.getElementById('logoTrack');

track.innerHTML += track.innerHTML;

let speed = 0.5;
let x = 0;


function animateMarquee() {
    x -= speed;
    if (x <= -track.scrollWidth / 2) {
        x = 0;
    }
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(animateMarquee);
}

animateMarquee();


const overlay = document.getElementById("videoOverlay");
const popupVideo = document.getElementById("popupVideo");
const closeBtn = document.querySelector(".close-video");

document.querySelectorAll(".video-trigger").forEach(item => {
    item.addEventListener("click", () => {
        const videoSrc = item.dataset.video;
        popupVideo.src = videoSrc;
        overlay.style.display = "flex";

        requestAnimationFrame(() => {
            overlay.classList.add("active");
        });

        setTimeout(() => popupVideo.play(), 150);
    });
});


function closePopup() {
    overlay.classList.remove("active");
    overlay.classList.add("closing");
    popupVideo.pause();

    setTimeout(() => {
        popupVideo.removeAttribute("src");
        overlay.classList.remove("closing");
        overlay.style.display = "none";
    }, 300);
}

closeBtn.addEventListener("click", closePopup);

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
});

// --- FLIP CARD FUNKTIONALITET: ett kort åt gången ---

let currentlyFlippedCard = null;

document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
        const video = card.querySelector('video');

        if(currentlyFlippedCard && currentlyFlippedCard !== card) {
            currentlyFlippedCard.classList.remove('flipped');
            const oldVideo = currentlyFlippedCard.querySelector('video');
            if(oldVideo) oldVideo.pause();
        }

        const isFlipped = card.classList.toggle('flipped');

        if(isFlipped) {
            video.currentTime = 0;
            video.play();
            currentlyFlippedCard = card;
        } else {
            video.pause();
            currentlyFlippedCard = null;
        }
    });
});

