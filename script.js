const renderUrl = "https://ugc-webapp.onrender.com";

// Var videorna hämtas ifrån.
// Om du kopplar en egen domän till din R2-bucket (t.ex. media.johannabredinger.se)
// byter du bara den här raden till: const VIDEO_BASE = "https://media.johannabredinger.se";
const VIDEO_BASE = `${renderUrl}/proxy-video`;

function videoUrl(fileName) {
    return `${VIDEO_BASE}/${encodeURIComponent(fileName)}`;
}

// =====================================================================
// MINA VIDEOR – lägg till en ny video genom att kopiera en rad.
//   file:   filnamnet i din R2-bucket (exakt, med stora/små bokstäver)
//   poster: miniatyrbild (valfri men rekommenderas – laddar mycket snabbare)
//   format: t.ex. "Paid ad", "Testimonial", "Unboxing", "GRWM", "Produktdemo"
//   niche:  "Skönhet", "Träning" eller "Lifestyle" (styr filterknapparna)
//   brand:  varumärket (visas i alt-texten)
// Den första videon i listan visas först – lägg din starkaste där.
// =====================================================================
const VIDEOS = [
    { file: "gallery-1786021265354.MP4", poster: "thumbnails/glamofsweden.jpg", format: "Kampanj", niche: "Skönhet", brand: "Glam of Sweden" },
    { file: "copy_131E8181-0CDB-42A5-8AFA-D9C017431573.MOV", poster: "thumbnails/hellomela.jpg", format: "Paid ad", niche: "Lifestyle", brand: "Hellomela" },
    { file: "video6.MP4", poster: "thumbnails/snatched.jpg", format: "Testimonial", niche: "Träning", brand: "Snatched" },
    // { file: "DITT-FILNAMN.mp4", poster: "thumbnails/DIN-BILD.jpg", format: "Unboxing", niche: "Lifestyle", brand: "Varumärke" },
];

// ---------------- LOGO-MARQUEE ----------------
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

// ---------------- POPUP-VIDEO ----------------
const overlay = document.getElementById("videoOverlay");
const popupVideo = document.getElementById("popupVideo");
const closeBtn = document.querySelector(".close-video");

function openPopup(url) {
    popupVideo.src = url;
    popupVideo.muted = false; // användaren klickade själv, så ljud är tillåtet
    popupVideo.playsInline = true;

    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("active"));

    popupVideo.play().catch(() => { /* vissa mobiler kräver ett extra tryck på play */ });
}

function closePopup() {
    overlay.classList.remove("active");
    overlay.classList.add("closing");
    popupVideo.pause();

    setTimeout(() => {
        popupVideo.removeAttribute("src");
        popupVideo.load();
        overlay.classList.remove("closing");
        overlay.style.display = "none";
    }, 300);
}

closeBtn.addEventListener("click", closePopup);
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display === "flex") closePopup();
});

// ---------------- VIDEOPORTFOLIO ----------------
const grid = document.getElementById("ugcGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

function renderVideos(filter = "Alla") {
    grid.innerHTML = "";

    VIDEOS
        .filter(v => filter === "Alla" || v.niche === filter)
        .forEach(v => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "ugc-card";
            card.setAttribute("aria-label", `Spela ${v.format} för ${v.brand}`);

            const media = v.poster
                ? `<img src="${v.poster}" alt="${v.format} för ${v.brand}" loading="lazy">`
                : `<video src="${videoUrl(v.file)}#t=0.1" preload="metadata" muted playsinline></video>`;

            card.innerHTML = `
                ${media}
                <span class="ugc-play" aria-hidden="true">▶</span>
                <span class="ugc-label">${v.format} · ${v.niche}</span>
            `;

            card.addEventListener("click", () => openPopup(videoUrl(v.file)));
            grid.appendChild(card);
        });

    if (!grid.children.length) {
        grid.innerHTML = `<p class="ugc-empty">Fler videor kommer snart.</p>`;
    }
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderVideos(btn.dataset.filter);
    });
});

renderVideos();

// ---------------- FLIP-CARD-VIDEO ----------------
let currentlyFlippedCard = null;

document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
        const video = card.querySelector('video');
        const fileName = card.dataset.video;

        // Pausa och nollställ video på tidigare flip-card
        if (currentlyFlippedCard && currentlyFlippedCard !== card) {
            const oldVideo = currentlyFlippedCard.querySelector('video');
            currentlyFlippedCard.classList.remove('flipped');
            if (oldVideo) {
                oldVideo.pause();
                oldVideo.muted = true;
                oldVideo.removeAttribute("src");
                oldVideo.load();
            }
        }

        const isFlipped = card.classList.toggle('flipped');

        if (isFlipped) {
            if (video && fileName) {
                video.src = videoUrl(fileName);
                video.muted = true;
                video.playsInline = true;
                video.play().catch(() => {});
            }
            currentlyFlippedCard = card;
        } else {
            if (video) {
                video.pause();
                video.muted = true;
                video.removeAttribute("src");
                video.load();
            }
            currentlyFlippedCard = null;
        }
    });
});

document.querySelectorAll('.sound-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const video = btn.closest('.flip-card-back').querySelector('video');
        video.muted = !video.muted;
        btn.textContent = video.muted ? "🔇" : "🔊";
    });
});

// ---------------- CALENDLY & KONTAKTFORMULÄR ----------------
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const introBtn = document.getElementById("introBtn");
    const meeting30Btn = document.getElementById("meeting30Btn");
    const modal = document.getElementById("calendlyModal");
    const iframe = document.getElementById("calendlyFrame");
    const closeModalBtn = document.querySelector(".close-modal");

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

    if (introBtn) introBtn.addEventListener("click", () => openCalendly("https://calendly.com/ugc-johannabredinger/ugc-intro-samtal"));
    if (meeting30Btn) meeting30Btn.addEventListener("click", () => openCalendly("https://calendly.com/ugc-johannabredinger/30min"));
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    function showToast(message, color = "#c58c84") {
        const toast = document.getElementById("toast");
        toast.innerText = message;
        toast.style.backgroundColor = color;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 4000);
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const templateParams = {
                name: form.name.value,
                email: form.email.value,
                message: form.message.value,
            };
            emailjs.send("service_j2jcwwd", "template_odrgb19", templateParams)
                .then(() => { showToast("Tack! Ditt meddelande har skickats och du får ett bekräftelsemail"); form.reset(); })
                .catch((err) => { console.error("EmailJS error:", err); showToast("Oj! Något gick fel. Försök igen senare"); });
        });
    }
});
