// ============================================================
//  5 Star Event Management — script.js
//  All JavaScript for the website in one clean file
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── 1. HEADER SCROLL BEHAVIOUR ──────────────────────────────
  // Adds 'scrolled' class to header when user scrolls past 60px.
  // This switches the header from transparent to white.

  const header = document.getElementById('site-header');

  if (header) {
    const forceScrolled = header.dataset.forceScrolled === 'true';
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else if (!forceScrolled) {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  // ── 2. MOBILE MENU TOGGLE ───────────────────────────────────
  // Opens/closes the full-screen mobile nav overlay.

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    // Toggle menu open/close when hamburger button is clicked
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    // Close menu automatically when any mobile nav link is clicked
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }


  // ── MOBILE DROPDOWN TOGGLE ──────────────────────────────────
  // Toggles the expandable submenus for Services and Gallery on mobile.
  // This function is called inline from the HTML.

  window.toggleMobileDropdown = function (menuId) {
    const menu = document.getElementById(menuId);
    const parent = menu ? menu.closest('.mobile-dropdown') : null;

    // Close all other open dropdowns
    document.querySelectorAll('.mobile-dropdown.open').forEach(dropdown => {
      if (dropdown !== parent) {
        dropdown.classList.remove('open');
      }
    });

    // Toggle the clicked dropdown
    if (parent) {
      parent.classList.toggle('open');
    }
  };

  // Also close dropdowns when clicking a sublink
  document.querySelectorAll('.mobile-sublink').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
      }
      // Close all dropdowns
      document.querySelectorAll('.mobile-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
      });
    });
  });


  // ── 3. HERO SLIDESHOW ───────────────────────────────────────
  // Cycles through .hero-slide elements every 5 seconds.

  const slides = document.querySelectorAll('.hero-slide');

  if (slides.length > 0) {
    let currentSlide = 0;

    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }


  // ── 4. COUNTER ANIMATION ────────────────────────────────────
  // Animates numbers from 0 to their target value using ease-out.
  // Triggered when the stats section scrolls into view.
  // Uses data-counter="VALUE" attribute on each counter element.

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = eased * target;

      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Set exact final value when animation completes
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    }

    requestAnimationFrame(step);
  }

  // Only animate when stats section is visible on screen
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target); // run only once
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-counter]').forEach(el => {
      counterObserver.observe(el);
    });
  }


  // ── 5. FAQ ACCORDION ────────────────────────────────────────
  // Clicking a question toggles that faq-item open/closed.
  // Only one FAQ can be open at a time.

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all open FAQs first
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
      });

      // If the clicked item was closed, open it now
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });


  // ── 6. VIDEO — CLICK TO PLAY ────────────────────────────────
  // Replaces the video thumbnail with a YouTube iframe on click.

  const videoWrapper = document.getElementById('video-wrapper');

  if (videoWrapper) {
    videoWrapper.addEventListener('click', () => {
      videoWrapper.innerHTML = `
        <iframe
          class="w-full h-full"
          style="width:100%; height:100%; border-radius:20px;"
          src="https://www.youtube.com/embed/hTor-Ed8e50?autoplay=1"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen>
        </iframe>`;
    });
  }


  // ── 7. ACTIVE NAV LINK ON SCROLL ────────────────────────────
  // Highlights the correct nav link based on which section is visible.

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (sections.length && navLinks.length) {
    function setActiveLink() {
      let currentId = '';

      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
          currentId = section.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });
  }


  // ── 8. CONTACT FORM SUBMIT ───────────────────────────────────
  // Validates the form and shows a success message.
  // Replace the body of this function with a real fetch/API call
  // when you are ready to go live.

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const phoneField = this.querySelector('[name="phone"]');
      const successMsg = document.getElementById('form-success');

      // Basic validation — phone number is required
      if (!phoneField || !phoneField.value.trim()) {
        if (phoneField) phoneField.focus();
        return;
      }

      // Show success message and reset form
      if (successMsg) {
        successMsg.style.display = 'block';
      }
      this.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
      }, 5000);
    });
  }


}); // end DOMContentLoaded

// ============================================================
//  5 Star Event Management — script.js
//  All JavaScript for the website in one clean file
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── 1. HEADER SCROLL BEHAVIOUR ──────────────────────────────
  // Adds 'scrolled' class to header when user scrolls past 60px.
  // This switches the header from transparent to white.

  const header = document.getElementById('site-header');

  if (header) {
    const forceScrolled = header.dataset.forceScrolled === 'true';
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else if (!forceScrolled) {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  // ── 2. MOBILE MENU TOGGLE ───────────────────────────────────
  // Opens/closes the full-screen mobile nav overlay.

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    // Toggle menu open/close when hamburger button is clicked
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    // Close menu automatically when any mobile nav link is clicked
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

    // ── MOBILE DROPDOWN TOGGLE ──────────────────────────────────
  // Toggles the expandable submenus for Services and Gallery on mobile.
  // This function is called inline from the HTML.

  window.toggleMobileDropdown = function (menuId) {
    const menu = document.getElementById(menuId);
    const parent = menu ? menu.closest('.mobile-dropdown') : null;

    // Close all other open dropdowns
    document.querySelectorAll('.mobile-dropdown.open').forEach(dropdown => {
      if (dropdown !== parent) {
        dropdown.classList.remove('open');
      }
    });

    // Toggle the clicked dropdown
    if (parent) {
      parent.classList.toggle('open');
    }
  };

  // Also close dropdowns when clicking a sublink
  document.querySelectorAll('.mobile-sublink').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
      }
      // Close all dropdowns
      document.querySelectorAll('.mobile-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
      });
    });
  });

  // ── 3. HERO SLIDESHOW ───────────────────────────────────────
  // Cycles through .hero-slide elements every 5 seconds.

  const slides = document.querySelectorAll('.hero-slide');

  if (slides.length > 0) {
    let currentSlide = 0;

    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }


  // ── 4. COUNTER ANIMATION ────────────────────────────────────
  // Animates numbers from 0 to their target value using ease-out.
  // Triggered when the stats section scrolls into view.
  // Uses data-counter="VALUE" attribute on each counter element.

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = eased * target;

      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Set exact final value when animation completes
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    }

    requestAnimationFrame(step);
  }

  // Only animate when stats section is visible on screen
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target); // run only once
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-counter]').forEach(el => {
      counterObserver.observe(el);
    });
  }


  // ── 5. FAQ ACCORDION ────────────────────────────────────────
  // Clicking a question toggles that faq-item open/closed.
  // Only one FAQ can be open at a time.

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all open FAQs first
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
      });

      // If the clicked item was closed, open it now
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });


  // ── 6. VIDEO — CLICK TO PLAY ────────────────────────────────
  // Replaces the video thumbnail with a YouTube iframe on click.

  const videoWrapper = document.getElementById('video-wrapper');

  if (videoWrapper) {
    videoWrapper.addEventListener('click', () => {
      videoWrapper.innerHTML = `
        <iframe
          class="w-full h-full"
          style="width:100%; height:100%; border-radius:20px;"
          src="https://www.youtube.com/embed/hTor-Ed8e50?autoplay=1"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen>
        </iframe>`;
    });
  }


  // ── 7. ACTIVE NAV LINK ON SCROLL ────────────────────────────
  // Highlights the correct nav link based on which section is visible.

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (sections.length && navLinks.length) {
    function setActiveLink() {
      let currentId = '';

      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
          currentId = section.id;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });
  }


  // ── 8. CONTACT FORM SUBMIT ───────────────────────────────────
  // Validates the form and shows a success message.
  // Replace the body of this function with a real fetch/API call
  // when you are ready to go live.

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const phoneField = this.querySelector('[name="phone"]');
      const successMsg = document.getElementById('form-success');

      // Basic validation — phone number is required
      if (!phoneField || !phoneField.value.trim()) {
        if (phoneField) phoneField.focus();
        return;
      }

      // Show success message and reset form
      if (successMsg) {
        successMsg.style.display = 'block';
      }
      this.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
      }, 5000);
    });
  }


}); // end DOMContentLoaded