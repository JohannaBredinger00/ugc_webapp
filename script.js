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
    item.addEventListener("click", async () => {
        const fileName = item.dataset.video;

        // Hämta signed URL från backend
        const response = await fetch(`/signed-url/${fileName}`);
        const data = await response.json();
        popupVideo.src = data.url;

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

let currentlyFlippedCard = null;

// Flip-card med dynamisk signed URL
document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', async () => {
        const video = card.querySelector('video');
        const fileName = card.dataset.video;

        // Pausa och reset video på tidigare flip-card
        if(currentlyFlippedCard && currentlyFlippedCard !== card) {
            currentlyFlippedCard.classList.remove('flipped');
            const oldVideo = currentlyFlippedCard.querySelector('video');
            if (oldVideo) {
                oldVideo.pause();
                oldVideo.currentTime = 0;
                oldVideo.muted = true;
                oldVideo.removeAttribute("src");
            }
        }

        const isFlipped = card.classList.toggle('flipped');

        if(isFlipped) {
            if(video && fileName) {
                // Hämta signed URL från backend
                const response = await fetch(`/signed-url/${fileName}`);
                const data = await response.json();
                video.src = data.url;

                video.currentTime = 0;
                video.muted = false;
                video.play();
            }
            currentlyFlippedCard = card;
        } else {
            if(video) {
                video.pause();
                video.currentTime = 0;
                video.muted = true;
                video.removeAttribute("src"); // rensa URL
            }
            currentlyFlippedCard = null;
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const introBtn = document.getElementById("introBtn");
    const meeting30Btn = document.getElementById("meeting30Btn");
    const modal = document.getElementById("calendlyModal");
    const iframe = document.getElementById("calendlyFrame");
    const closeBtn = document.querySelector(".close-modal");

    function openCalendly(url) {
        iframe.src = url;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.style.display = "none";
        iframe.src = "";
        document.body.style.overflow = "";
    }

    if (introBtn) {
        introBtn.addEventListener("click", () => {
            openCalendly("https://calendly.com/ugc-johannabredinger/ugc-intro-samtal");
        });
    }

    if (meeting30Btn) {
        meeting30Btn.addEventListener("click", () => {
            openCalendly("https://calendly.com/ugc-johannabredinger/30min");
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function showToast(message, color = "#c58c84") {
        const toast = document.getElementById("toast");
        toast.innerText = message;
        toast.style.backgroundColor = color;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const templateParams = {
                name: form.name.value,
                email: form.email.value,
                message: form.message.value,
            };

            emailjs
                .send("service_j2jcwwd", "template_odrgb19", templateParams)
                .then(() => {
                    showToast(
                        "Tack! Ditt meddelande har skickats och du får ett bekräftelsemail",
                        "#c58c84"
                    );
                    form.reset();
                })
                .catch((err) => {
                    console.error("EmailJS error:", err);
                    showToast("Oj! Något gick fel. Försök igen senare", "#c58c84");
                });
        });
    }
});
