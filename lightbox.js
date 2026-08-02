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
const GORGE_PHOTOS = [
  {
    src: "assets/images-gorge/the super gorge pic.jpg",
    alt: "A dramatic gorge landscape with steep rock and open sky",
    title: "The Super Gorge Pic",
  },
  {
    src: "assets/images-gorge/gorge Lance and Seth.jpg",
    alt: "Lance and Seth near the edge of the gorge",
    title: "Gorge Lance and Seth",
  },
  {
    src: "assets/images-gorge/gorgeant seth.jpg",
    alt: "Seth standing in the gorge scenery",
    title: "Gorgeant Seth",
  },
  {
    src: "assets/images-gorge/more gorge and ant seth.jpg",
    alt: "Another gorge moment with Seth in the frame",
    title: "More Gorge and Ant Seth",
  },
];

const AUTO_ADVANCE_MS = 4500;
let autoAdvanceId = null;
let activePhotoIndex = 0;
let lastTrigger = null;
let activeGallery = "page";

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

const getGalleryItems = () => {
  if (activeGallery === "gorge") {
    return GORGE_PHOTOS;
  }

  return Array.from(photoFrames).map((frame) => ({
    src: frame.href,
    alt: frame.querySelector("img")?.alt || "",
    title: getPhotoCaption(frame),
  }));
};

const startAutoAdvance = () => {
  clearAutoAdvance();

  const galleryItems = getGalleryItems();

  if (galleryItems.length > 1 && !lightbox.hidden) {
    autoAdvanceId = window.setInterval(() => {
      openLightboxByIndex(activePhotoIndex + 1);
    }, AUTO_ADVANCE_MS);
  }
};

function openLightboxByIndex(index) {
  const galleryItems = getGalleryItems();

  if (!galleryItems.length) {
    return;
  }

  activePhotoIndex =
    ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activePhotoIndex];

  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.title;
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
  const triggerImage = trigger.querySelector("img");
  const posterSrc =
    trigger.dataset.videoPoster ||
    (triggerImage instanceof HTMLImageElement ? triggerImage.src : "");

  // Reset old media first so previous frames do not flash.
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
  videoPlayer.removeAttribute("poster");

  if (source) {
    source.src = "";
    videoPlayer.load();
    source.src = src;
    if (posterSrc) {
      videoPlayer.setAttribute("poster", posterSrc);
    }
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
    activeGallery = "page";
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
    activeGallery = trigger.dataset.gallery === "gorge" ? "gorge" : "page";

    if (activeGallery === "gorge") {
      activePhotoIndex = 0;
      openLightboxByIndex(0);
      return;
    }

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
