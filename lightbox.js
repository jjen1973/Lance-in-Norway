const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const photoFrames = document.querySelectorAll(".photo-frame:not(.video-frame)");
const videoModal = document.querySelector(".video-modal");
const videoModalClose = document.querySelector(".video-modal-close");
const videoPlayer = document.querySelector(".video-player");
const videoModalCaption = document.querySelector(".video-modal-caption");
const videoTriggers = document.querySelectorAll(".video-frame");

const closeVideoModal = () => {
  if (videoModal) {
    videoModal.hidden = true;
    videoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
      const source = videoPlayer.querySelector("source");
      if (source) {
        source.src = "";
      }
      videoPlayer.load();
    }
    if (videoModalCaption) {
      videoModalCaption.textContent = "";
    }
  }
};

const openVideoModal = (trigger) => {
  if (!videoModal || !videoPlayer || !videoModalCaption) {
    return;
  }

  const src = trigger.dataset.videoSrc || "";
  const title = trigger.dataset.videoTitle || "";
  const source = videoPlayer.querySelector("source");

  if (source) {
    source.src = src;
    videoPlayer.load();
    videoPlayer.muted = true;
    videoPlayer.play().catch(() => {
      // autoplay may be blocked, but the video will still be visible
    });
  }

  videoModalCaption.textContent = title;
  videoModal.hidden = false;
  videoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  setTimeout(() => {
    videoPlayer?.play().catch(() => {});
  }, 300);
  videoModalClose?.focus();
};

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
    if (event.key === "Escape") {
      if (!lightbox.hidden) {
        closeLightbox();
      } else if (videoModal && !videoModal.hidden) {
        closeVideoModal();
      }
    }
  });
}

if (videoModal && videoModalClose && videoTriggers.length) {
  videoTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openVideoModal(trigger);
    });
  });

  videoModalClose.addEventListener("click", closeVideoModal);

  videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) {
      closeVideoModal();
    }
  });
}
