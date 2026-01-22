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

document.addEventListener("DOMContentLoaded", function() {

   /* const form = document.getElementById("contactForm");*/

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
            modal.style.display = "none"
            iframe.src = "";
            document.body.style.overflow = "";
        }
        
    if (introBtn) {
        introBtn.addEventListener("click", ()=> {
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

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

      /*document.body.style.overflow = "hidden";*/

        //Calendly.initPopupWidget({ url });

    }

   
        /*onst observer = new MutationObserver(() => {
            const overlay = document.querySelector(".calendly-overlay");
            if (!overlay) {
                document.body.style.overflow = "";
                observer.disconnect();
            }
        });*/
    

    );

    function showToast(message, color = "#c58c84") {
        const toast = document.getElementById("toast");
        toast.innerText = message;
        toast.style.backgroundColor = color;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 4000);
    

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();

            const templateParams = {
                name: form.name.value,
                email: form.email.value,
                message: form.message.value,
            };

            emailjs.send("service_j2jcwwd", "template_odrgb19", templateParams)
                .then(() => {
                    showToast("Tack! Ditt meddelande har skickats och du får ett bekräftelsemail", "#c58c84");
                    form.reset();
                })
                .catch((err) => {
                    console.log("EmailJS error:", err);
                    showToast("Oj! Något gick fel. Försök igen senare", "#c58c84");
                });
        });
    }
};

