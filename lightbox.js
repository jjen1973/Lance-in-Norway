const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const photoFrames = document.querySelectorAll(".photo-frame");

if (
  lightbox &&
  lightboxImage &&
  lightboxCaption &&
  lightboxClose &&
  photoFrames.length
) {
  let lastTrigger = null;

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";

    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  const openLightbox = (trigger) => {
    const image = trigger.querySelector("img");
    const caption = trigger.dataset.title || "";

    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    lastTrigger = trigger;
    lightboxImage.src = trigger.href;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightboxClose.focus();
  };

  photoFrames.forEach((frame) => {
    frame.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(frame);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}
