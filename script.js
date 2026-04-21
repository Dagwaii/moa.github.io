const modal = document.getElementById("video-modal");
const frame = document.getElementById("video-frame");
const closeButton = document.getElementById("modal-close");
const gridStage = document.getElementById("grid-stage");
const videoButtons = document.querySelectorAll(".line-item");
const thumbCards = document.querySelectorAll(".thumb-card");

const openVideo = (videoId) => {
  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.showModal();
};

const closeVideo = () => {
  frame.src = "";
  modal.close();
};

videoButtons.forEach((button) => {
  button.addEventListener("click", () => openVideo(button.dataset.videoId));
});

closeButton.addEventListener("click", closeVideo);

modal.addEventListener("click", (event) => {
  const bounds = modal.getBoundingClientRect();
  const clickedBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedBackdrop) {
    closeVideo();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.open) {
    closeVideo();
  }
});

thumbCards.forEach((card) => {
  let dragState = null;

  card.addEventListener("click", (event) => {
    if (card.dataset.dragged === "true") {
      event.preventDefault();
      card.dataset.dragged = "false";
      return;
    }

    openVideo(card.dataset.videoId);
  });

  card.addEventListener("pointerdown", (event) => {
    const stageRect = gridStage.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    dragState = {
      pointerId: event.pointerId,
      stageRect,
      offsetX: event.clientX - cardRect.left,
      offsetY: event.clientY - cardRect.top,
      moved: false,
    };

    card.dataset.dragged = "false";
    card.classList.add("is-dragging");
    card.style.transform = "";
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextLeft = event.clientX - dragState.stageRect.left - dragState.offsetX;
    const nextTop = event.clientY - dragState.stageRect.top - dragState.offsetY;
    const maxLeft = dragState.stageRect.width - card.offsetWidth;
    const maxTop = dragState.stageRect.height - card.offsetHeight;
    const clampedLeft = Math.min(Math.max(nextLeft, 0), maxLeft);
    const clampedTop = Math.min(Math.max(nextTop, 0), maxTop);

    if (
      !dragState.moved &&
      (Math.abs(clampedLeft - card.offsetLeft) > 3 || Math.abs(clampedTop - card.offsetTop) > 3)
    ) {
      dragState.moved = true;
      card.dataset.dragged = "true";
    }

    card.style.left = `${clampedLeft}px`;
    card.style.top = `${clampedTop}px`;
  });

  const clearDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    card.classList.remove("is-dragging");

    if (card.hasPointerCapture(event.pointerId)) {
      card.releasePointerCapture(event.pointerId);
    }

    dragState = null;
  };

  card.addEventListener("pointerup", clearDrag);
  card.addEventListener("pointercancel", clearDrag);

  card.addEventListener("mousemove", (event) => {
    if (dragState) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * -10;

    card.style.transform = `translateY(-8px) rotateX(${offsetY}deg) rotateY(${offsetX}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    if (dragState) {
      return;
    }

    card.style.transform = "";
  });
});
