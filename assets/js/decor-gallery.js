/**
 * Decor gallery — loads decor-gallery-data.json, category nav,
 * horizontal rows for "All", full grid when a category is selected, lightbox on image click.
 */
(function () {
  const mount = document.getElementById('decor-sections-mount');
  if (!mount) return;

  /** Sliding rows use this many photos, repeated in two halves for the infinite marquee. */
  const MARQUEE_ROW_IMAGE_COUNT = 8;

  /** Encode path segments so spaces/special chars work in local + production (avoids double-encoding). */
  function resolveImageUrl(url) {
    if (!url || /^https?:\/\//i.test(url)) return url;
    const parts = String(url).split('/').filter(Boolean);
    return parts
      .map((p) => {
        try {
          return encodeURIComponent(decodeURIComponent(p));
        } catch {
          return encodeURIComponent(p);
        }
      })
      .join('/');
  }

  function dedupeImageUrls(urls) {
    const seen = new Set();
    return urls.filter((u) => {
      const base = u.replace(/\.(jpe?g|png|webp|gif)(\?.*)?$/i, '').toLowerCase();
      if (seen.has(base)) return false;
      seen.add(base);
      return true;
    });
  }

  function buildLightbox() {
    let urls = [];
    let idx = 0;
    let title = '';

    const overlay = document.createElement('div');
    overlay.id = 'decor-lightbox';
    overlay.className = 'decor-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <button type="button" class="decor-lightbox-close" aria-label="Close">&times;</button>
      <button type="button" class="decor-lightbox-nav decor-lightbox-prev" aria-label="Previous photo"><i class="fas fa-chevron-left"></i></button>
      <button type="button" class="decor-lightbox-nav decor-lightbox-next" aria-label="Next photo"><i class="fas fa-chevron-right"></i></button>
      <div class="decor-lightbox-inner">
        <p class="decor-lightbox-caption"></p>
        <img src="" alt="">
      </div>
    `;
    document.body.appendChild(overlay);

    const img = overlay.querySelector('.decor-lightbox-inner img');
    const cap = overlay.querySelector('.decor-lightbox-caption');
    const btnClose = overlay.querySelector('.decor-lightbox-close');
    const btnPrev = overlay.querySelector('.decor-lightbox-prev');
    const btnNext = overlay.querySelector('.decor-lightbox-next');

    function showAt(i) {
      idx = (i + urls.length) % urls.length;
      img.src = resolveImageUrl(urls[idx]);
      img.alt = title ? `${title} — photo ${idx + 1} of ${urls.length}` : `Photo ${idx + 1} of ${urls.length}`;
      cap.textContent = title ? `${title} (${idx + 1} / ${urls.length})` : `${idx + 1} / ${urls.length}`;
    }

    function open(list, startIndex, captionTitle) {
      urls = list.slice();
      title = captionTitle || '';
      showAt(startIndex);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      img.src = '';
    }

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => showAt(idx - 1));
    btnNext.addEventListener('click', () => showAt(idx + 1));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showAt(idx - 1);
      if (e.key === 'ArrowRight') showAt(idx + 1);
    });

    return { open, close };
  }

  /**
   * @param {string[]} images — thumbnails shown in the row (e.g. first 8 for marquee)
   * @param {string[]} [lightboxImages] — full list for lightbox; defaults to `images`
   */
  function buildSlideButtons(images, sec, lightbox, lightboxImages) {
    const openList = lightboxImages && lightboxImages.length ? lightboxImages : images;
    const frag = document.createDocumentFragment();
    images.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'decor-slide-link';
      btn.setAttribute('aria-label', `Open ${sec.title} image ${i + 1}`);
      const slide = document.createElement('span');
      slide.className = 'decor-slide';
      const im = document.createElement('img');
      im.src = resolveImageUrl(src);
      im.alt = '';
      im.loading = 'lazy';
      im.decoding = 'async';
      slide.appendChild(im);
      btn.appendChild(slide);
      btn.addEventListener('click', () => lightbox.open(openList, i, sec.title));
      frag.appendChild(btn);
    });
    return frag;
  }

  /** Infinite horizontal marquee; strip is two identical halves (scrollWidth / 2). */
  function attachInfiniteRowMarquee(wrapEl, stripEl, opts) {
    const pxPerSec = opts.pxPerSec ?? 42;
    const getNudge = opts.getNudgeAmount;
    let pos = 0;
    let half = 1;
    let paused = false;
    let last = 0;
    let raf = 0;

    const api = {
      nudge(delta) {
        half = Math.max(stripEl.scrollWidth / 2, 1);
        pos = ((pos + delta) % half + half) % half;
      },
    };

    function measure() {
      half = Math.max(stripEl.scrollWidth / 2, 1);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(stripEl);

    function pause() {
      paused = true;
    }
    function resume() {
      paused = false;
      last = 0;
    }

    wrapEl.addEventListener('mouseenter', pause);
    wrapEl.addEventListener('mouseleave', resume);
    wrapEl.addEventListener('focusin', pause);
    wrapEl.addEventListener('focusout', resume);

    stripEl.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });

    measure();

    function frame(now) {
      if (!stripEl.isConnected) return;
      if (!last) last = now;
      const dt = Math.min(now - last, 64);
      last = now;
      if (!paused && half > 0) {
        pos += (pxPerSec * dt) / 1000;
        if (pos >= half) pos %= half;
      }
      stripEl.style.transform = `translate3d(${-pos}px,0,0)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      cleanup() {
        cancelAnimationFrame(raf);
        ro.disconnect();
        wrapEl.removeEventListener('mouseenter', pause);
        wrapEl.removeEventListener('mouseleave', resume);
        wrapEl.removeEventListener('focusin', pause);
        wrapEl.removeEventListener('focusout', resume);
        stripEl.style.transform = '';
      },
      api,
      bindArrows(prevBtn, nextBtn) {
        const step = () => (getNudge ? getNudge() : 280);
        prevBtn.addEventListener('click', () => api.nudge(-step()));
        nextBtn.addEventListener('click', () => api.nudge(step()));
      },
    };
  }

  function renderRowSection(sec, lightbox, onOpenCategory) {
    const allImages = dedupeImageUrls(sec.images);
    const rowImages =
      allImages.length <= MARQUEE_ROW_IMAGE_COUNT
        ? allImages
        : allImages.slice(0, MARQUEE_ROW_IMAGE_COUNT);
    const block = document.createElement('section');
    block.className = 'decor-row-block';
    block.id = sec.id;

    const header = document.createElement('div');
    header.className = 'decor-row-header';

    const titleBtn = document.createElement('button');
    titleBtn.type = 'button';
    titleBtn.className = 'decor-row-title-btn';
    titleBtn.setAttribute('aria-label', `Show all ${sec.title} photos`);
    const chevron = document.createElement('span');
    chevron.className = 'decor-row-title-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    const titleText = document.createElement('span');
    titleText.className = 'decor-row-title-text';
    titleText.textContent = sec.title;
    titleBtn.appendChild(chevron);
    titleBtn.appendChild(titleText);
    titleBtn.addEventListener('click', () => onOpenCategory(sec.id));

    header.appendChild(titleBtn);

    const outer = document.createElement('div');
    outer.className = 'decor-row-outer';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'decor-row-arrow prev';
    prev.setAttribute('aria-label', 'Scroll left');
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const wrap = document.createElement('div');
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'decor-row-arrow next';
    next.setAttribute('aria-label', 'Scroll right');
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let startMarquee = null;

    if (reducedMotion) {
      wrap.className = 'decor-row-track-wrap decor-row-track-wrap--static';
      const track = document.createElement('div');
      track.className = 'decor-row-track';
      track.appendChild(buildSlideButtons(rowImages, sec, lightbox, allImages));
      wrap.appendChild(track);
      const scrollAmount = () => Math.min(track.clientWidth * 0.85, 420);
      prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
      next.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
    } else {
      wrap.className = 'decor-row-track-wrap decor-row-track-wrap--marquee';
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('aria-label', `${sec.title} photo strip`);
      const strip = document.createElement('div');
      strip.className = 'decor-row-marquee-strip';
      strip.setAttribute('role', 'presentation');

      const g1 = document.createElement('div');
      g1.className = 'decor-row-marquee-group';
      g1.appendChild(buildSlideButtons(rowImages, sec, lightbox, allImages));

      const g2 = document.createElement('div');
      g2.className = 'decor-row-marquee-group';
      g2.setAttribute('aria-hidden', 'true');
      g2.appendChild(buildSlideButtons(rowImages, sec, lightbox, allImages));

      strip.appendChild(g1);
      strip.appendChild(g2);
      wrap.appendChild(strip);

      startMarquee = () => {
        const { cleanup, bindArrows, api } = attachInfiniteRowMarquee(wrap, strip, {
          pxPerSec: 250,
          getNudgeAmount: () => Math.min(wrap.clientWidth * 0.85, 420),
        });
        bindArrows(prev, next);
        const onKey = (e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            api.nudge(-Math.min(wrap.clientWidth * 0.85, 420));
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            api.nudge(Math.min(wrap.clientWidth * 0.85, 420));
          }
        };
        wrap.addEventListener('keydown', onKey);
        return () => {
          cleanup();
          wrap.removeEventListener('keydown', onKey);
        };
      };
    }

    outer.appendChild(prev);
    outer.appendChild(wrap);
    outer.appendChild(next);

    block.appendChild(header);
    block.appendChild(outer);

    return { block, startMarquee };
  }

  function renderGrid(sec, container, lightbox, onBackToAll) {
    const images = dedupeImageUrls(sec.images);
    const wrap = document.createElement('div');
    wrap.className = 'decor-grid-view';

    if (typeof onBackToAll === 'function') {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'decor-grid-back';
      back.textContent = 'All categories';
      back.setAttribute('aria-label', 'Back to all categories');
      back.addEventListener('click', () => onBackToAll());
      wrap.appendChild(back);
    }

    const head = document.createElement('div');
    head.className = 'decor-grid-head';
    const h2 = document.createElement('h2');
    h2.textContent = sec.title;
    const count = document.createElement('span');
    count.className = 'decor-grid-count';
    count.textContent = `${images.length} photos`;
    head.appendChild(h2);
    head.appendChild(count);
    wrap.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'decor-grid';

    images.forEach((src, i) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'decor-grid-cell';
      cell.setAttribute('aria-label', `Open ${sec.title} image ${i + 1}`);
      const im = document.createElement('img');
      im.src = resolveImageUrl(src);
      im.alt = '';
      im.loading = 'lazy';
      im.decoding = 'async';
      cell.appendChild(im);
      cell.addEventListener('click', () => lightbox.open(images, i, sec.title));
      grid.appendChild(cell);
    });

    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  async function load() {
    const lightbox = buildLightbox();

    try {
      let sections = [];
      
      // Try fetching the JSON first
      try {
        const res = await fetch('decor-gallery-data.json');
        if (res.ok) {
          sections = await res.json();
        }
      } catch (e) {
        console.warn('JSON fetch failed, checking for global fallback');
      }

      // If fetch failed or returned empty, use the global variable from decor-gallery-data.js
      if (!sections || sections.length === 0) {
        if (window.DECOR_GALLERY_DATA) {
          sections = window.DECOR_GALLERY_DATA;
        } else {
          throw new Error('No gallery data available');
        }
      }

      const content = document.createElement('div');
      content.className = 'decor-gallery-content';

      let activeId = null;
      const marqueeCleanups = [];

      function readHash() {
        const h = (location.hash || '').replace(/^#/, '');
        if (!h) return null;
        return sections.some((s) => s.id === h) ? h : null;
      }

      function scrollGalleryIntoView() {
        requestAnimationFrame(() => {
          if (activeId) {
            const grid = content.querySelector('.decor-grid-view');
            if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
          const top = mount.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
      }

      function setActive(id) {
        activeId = id;
        if (id) {
          if (location.hash !== `#${id}`) location.hash = id;
        } else if (location.hash) {
          history.replaceState(null, '', `${location.pathname}${location.search}`);
        }
        render();
        scrollGalleryIntoView();
      }

      function syncFromHash() {
        const next = readHash();
        if (next === activeId) return;
        activeId = next;
        render();
        scrollGalleryIntoView();
      }

      function render() {
        while (marqueeCleanups.length) {
          const fn = marqueeCleanups.pop();
          try {
            fn();
          } catch (e) {
            /* ignore */
          }
        }
        content.innerHTML = '';
        if (activeId === null) {
          sections.forEach((sec) => {
            const { block, startMarquee } = renderRowSection(sec, lightbox, (catId) => setActive(catId));
            content.appendChild(block);
            if (typeof startMarquee === 'function') {
              const stop = startMarquee();
              if (typeof stop === 'function') marqueeCleanups.push(stop);
            }
          });
        } else {
          const sec = sections.find((s) => s.id === activeId);
          if (sec) renderGrid(sec, content, lightbox, () => setActive(null));
        }
      }

      mount.innerHTML = '';
      mount.appendChild(content);

      activeId = readHash();
      render();
      mount.removeAttribute('aria-busy');

      window.addEventListener('hashchange', syncFromHash);
    } catch (err) {
      mount.innerHTML =
        '<p class="decor-gallery-error">Could not load the decor gallery. Please refresh the page or try again later.</p>';
      mount.removeAttribute('aria-busy');
      console.error(err);
    }
  }

  load();
})();
