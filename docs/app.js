(function () {
  "use strict";

  const THUMB_DIR = "assets/img/thumb/";
  const FULL_DIR = "assets/img/full/";

  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightboxContent");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentIndex = -1;

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Build gallery grid ----------
  PIECES.forEach(function (piece, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "piece-card";
    card.setAttribute("aria-label", "View " + piece.name);

    const img = document.createElement("img");
    img.src = THUMB_DIR + piece.clean;
    img.alt = piece.name;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", function () {
      img.classList.add("loaded");
    });

    const label = document.createElement("div");
    label.className = "piece-card-label theme-" + (piece.labelTheme || "dark");
    label.innerHTML =
      '<span class="piece-card-number">' + piece.number + "</span>" +
      "<span>" + piece.name + "</span>";

    card.appendChild(img);
    card.appendChild(label);
    card.addEventListener("click", function () {
      openLightbox(index);
    });

    gallery.appendChild(card);
  });

  // ---------- Lightbox ----------
  function renderLightbox(piece) {
    let html = '<div class="lightbox-images">';

    html +=
      '<div class="lightbox-image-block">' +
      '<img src="' + FULL_DIR + piece.clean + '" alt="' + piece.name + '">' +
      (piece.framed
        ? '<div class="lightbox-image-caption">Original</div>'
        : "") +
      "</div>";

    if (piece.framed) {
      html +=
        '<div class="lightbox-image-block">' +
        '<img src="' + FULL_DIR + piece.framed + '" alt="' + piece.name + ' (framed)">' +
        '<div class="lightbox-image-caption">Framed</div>' +
        "</div>";
    }

    html += "</div>";

    html +=
      '<div class="lightbox-info">' +
      '<div class="lightbox-number">No. ' + piece.number + "</div>" +
      '<h2 class="lightbox-name">' + piece.name + "</h2>" +
      '<a class="lightbox-order-link" href="https://m.me/jody.plank" target="_blank" rel="noopener">Message me on Messenger to order</a>' +
      "</div>";

    lightboxContent.innerHTML = html;
  }

  function openLightbox(index) {
    currentIndex = index;
    renderLightbox(PIECES[index]);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lightboxContent.innerHTML = "";
    currentIndex = -1;
  }

  function showNext(delta) {
    if (currentIndex < 0) return;
    currentIndex = (currentIndex + delta + PIECES.length) % PIECES.length;
    renderLightbox(PIECES[currentIndex]);
    lightboxContent.scrollTop = 0;
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", function () { showNext(-1); });
  lightboxNext.addEventListener("click", function () { showNext(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showNext(-1);
    if (e.key === "ArrowRight") showNext(1);
  });
})();
