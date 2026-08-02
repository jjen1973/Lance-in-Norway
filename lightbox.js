const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const photoFrames = document.querySelectorAll(".photo-frame:not(.video-frame)");
const videoModal = document.querySelector(".video-modal");
const videoModalClose = document.querySelector(".video-modal-close");
const videoPlayer = document.querySelector(".video-player");
const videoModalCaption = document.querySelector(".video-modal-caption");
const videoTriggers = document.querySelectorAll(".video-frame");

const AUTO_ADVANCE_MS = 4500;
let autoAdvanceId = null;
let activePhotoIndex = 0;
let lastTrigger = null;

const getPhotoCaption = (frame) => {
  return (
    frame.dataset.title || frame.querySelector("figcaption")?.textContent || ""
  );
};

const clearAutoAdvance = () => {
  if (autoAdvanceId) {
    window.clearInterval(autoAdvanceId);
    autoAdvanceId = null;
  }
};

const startAutoAdvance = () => {
  clearAutoAdvance();

  if (photoFrames.length > 1 && !lightbox.hidden) {
    autoAdvanceId = window.setInterval(() => {
      openLightboxByIndex(activePhotoIndex + 1);
    }, AUTO_ADVANCE_MS);
  }
};

function openLightboxByIndex(index) {
  if (!photoFrames.length) {
    return;
  }

  activePhotoIndex =
    ((index % photoFrames.length) + photoFrames.length) % photoFrames.length;
  const frame = photoFrames[activePhotoIndex];
  const image = frame.querySelector("img");

  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  lightboxImage.src = frame.href;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = getPhotoCaption(frame);
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
  startAutoAdvance();
}

const goToPhoto = (offset) => {
  openLightboxByIndex(activePhotoIndex + offset);
};

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
  lightboxPrev &&
  lightboxNext &&
  photoFrames.length
) {
  const closeLightbox = () => {
    clearAutoAdvance();
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

    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    lastTrigger = trigger;
    activePhotoIndex = Array.from(photoFrames).indexOf(trigger);
    if (activePhotoIndex < 0) {
      activePhotoIndex = 0;
    }
    openLightboxByIndex(activePhotoIndex);
  };

  photoFrames.forEach((frame) => {
    frame.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(frame);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightboxPrev.addEventListener("click", () => {
    goToPhoto(-1);
  });

  lightboxNext.addEventListener("click", () => {
    goToPhoto(1);
  });

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
    } else if (!lightbox.hidden && event.key === "ArrowLeft") {
      event.preventDefault();
      goToPhoto(-1);
    } else if (!lightbox.hidden && event.key === "ArrowRight") {
      event.preventDefault();
      goToPhoto(1);
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
