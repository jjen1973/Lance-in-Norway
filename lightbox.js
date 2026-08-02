const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const lightboxVideoTrigger = document.querySelector(".lightbox-video-trigger");
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

const NORSMAN_PHOTOS = [
  {
    src: "assets/images extri/rainbow Norsmen clean.jpg",
    alt: "Rainbow Norsmen clean image",
    title: "Rainbow",
  },
  {
    src: "assets/images extri/Norsman race map itinerary.jpg",
    alt: "Norsman race map itinerary",
    title: "Norsman Race Map Itinerary",
  },
  {
    src: "assets/images extri/Lance-pro-pic-Norsman.jpeg",
    alt: "Lance pro picture for Norsman",
    title: "Lance Pro Pic Norsman",
  },
  {
    src: "assets/images extri/lance on bike .jpg",
    alt: "Lance on bike",
    title: "Lance On Bike",
  },
  {
    src: "assets/images extri/lance bike 2.jpg",
    alt: "Lance bike 2",
    title: "Lance Bike 2",
  },
  {
    src: "assets/images extri/lance on the run.jpg",
    alt: "Lance on the run",
    title: "Lance On The Run",
  },
  {
    src: "assets/images extri/Seth suport lanceon run.jpg",
    alt: "Seth supporting Lance on the run",
    title: "Seth Suport Lance On Run",
  },
  {
    src: "assets/images extri/lance on the run.jpg",
    alt: "Lance on the run duplicate",
    title: "Lance On The Run Duplicate",
  },
  {
    src: "assets/images extri/feed of race trackers.jpg",
    alt: "Feed of race trackers",
    title: "Feed Of Race Trackers",
  },
  {
    src: "assets/images extri/Lance finish stats 1.jpg",
    alt: "Lance finish stats 1",
    title: "Lance Finish Stats 1",
  },
  {
    src: "assets/images extri/Lance stats 2.jpg",
    alt: "Lance stats 2",
    title: "Lance Stats 2",
  },
  {
    src: "assets/images extri/lance stats 3.jpg",
    alt: "Lance stats 3",
    title: "Lance Stats 3",
  },
  {
    src: "assets/images extri/lance stats 4.jpg",
    alt: "Lance stats 4",
    title: "Lance Stats 4",
  },
  {
    src: "assets/images extri/lance stats 5.jpg",
    alt: "Lance stats 5",
    title: "Lance Stats 5",
  },
  {
    src: "assets/images extri/race placements.jpg",
    alt: "Race placements",
    title: "Race Placements",
  },
  {
    type: "video",
    src: "assets/images extri/race placements.jpg",
    alt: "Race placements image for Norsman finish video 1",
    title: "Norsman Finish Video 1",
    videoSrc: "assets/images extri/Screen_Recording_20260801_193453_Strava.mp4",
    poster: "assets/images extri/race placements.jpg",
  },
  {
    type: "video",
    src: "assets/images extri/race placements.jpg",
    alt: "Race placements image for Norsman finish video 2",
    title: "Norsman Finish Video 2",
    videoSrc: "assets/images extri/Screen_Recording_20260801_194202_Strava.mp4",
    poster: "assets/images extri/race placements.jpg",
  },
];

const AUTO_ADVANCE_MS = 4500;
let autoAdvanceId = null;
let activePhotoIndex = 0;
let lastTrigger = null;
let activeGallery = "page";
let activeGalleryItem = null;

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

const openVideoModalWithSource = (src, title, posterSrc = "") => {
  if (!videoModal || !videoPlayer || !videoModalCaption) {
    return;
  }

  const source = videoPlayer.querySelector("source");

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

const getGalleryItems = () => {
  if (activeGallery === "gorge") {
    return GORGE_PHOTOS;
  }

  if (activeGallery === "norsman") {
    return NORSMAN_PHOTOS;
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
  activeGalleryItem = item;

  lightboxImage.src = item.poster || item.src;
  lightboxImage.alt = item.alt;
  lightboxImage.style.cursor = item.type === "video" ? "pointer" : "";
  if (lightboxVideoTrigger) {
    lightboxVideoTrigger.hidden = item.type !== "video";
    lightbox.classList.toggle("lightbox-video", item.type === "video");
  }
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
  const src = trigger.dataset.videoSrc || "";
  const title = trigger.dataset.videoTitle || "";
  const triggerImage = trigger.querySelector("img");
  const posterSrc =
    trigger.dataset.videoPoster ||
    (triggerImage instanceof HTMLImageElement ? triggerImage.src : "");
  openVideoModalWithSource(src, title, posterSrc);
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
    activeGalleryItem = null;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.style.cursor = "";
    if (lightboxVideoTrigger) {
      lightboxVideoTrigger.hidden = true;
    }
    lightbox.classList.remove("lightbox-video");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";

    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  const openLightbox = (trigger) => {
    activeGallery =
      trigger.dataset.gallery === "gorge"
        ? "gorge"
        : trigger.dataset.gallery === "norsman"
          ? "norsman"
          : "page";

    if (activeGallery === "gorge") {
      activePhotoIndex = 0;
      openLightboxByIndex(0);
      return;
    }

    if (activeGallery === "norsman") {
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

  lightboxVideoTrigger?.addEventListener("click", () => {
    if (activeGalleryItem && activeGalleryItem.type === "video") {
      openVideoModalWithSource(
        activeGalleryItem.videoSrc || "",
        activeGalleryItem.title || "",
        activeGalleryItem.poster || activeGalleryItem.src || "",
      );
    }
  });

  lightboxImage.addEventListener("click", () => {
    if (activeGalleryItem && activeGalleryItem.type === "video") {
      openVideoModalWithSource(
        activeGalleryItem.videoSrc || "",
        activeGalleryItem.title || "",
        activeGalleryItem.poster || activeGalleryItem.src || "",
      );
    }
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
