const fs = require('fs');
const path = require('path');

const categories = [
  { name: 'Wedding Albums', sourceFolder: path.join(__dirname, '../Wedding'), targetFolder: 'Wedding', filename: 'wedding-albums.html' },
  { name: 'Destination Wedding', sourceFolder: path.join(__dirname, '../Destination Wedding'), targetFolder: 'Destination Wedding', filename: 'destination-wedding.html' },
  { name: 'Corporate Events', sourceFolder: path.join(__dirname, '../Corparate Events'), targetFolder: 'Corporate Events', filename: 'corporate-events.html' },
  { name: 'House Opening Ceremony', sourceFolder: path.join(__dirname, '../House Opening'), targetFolder: 'House Opening', filename: 'house-opening-ceremony.html' },
  { name: 'Private Parties', sourceFolder: path.join(__dirname, '../private Parties'), targetFolder: 'Private Parties', filename: 'private-parties.html' }
];

const templateHeader = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} - 5 Star Event Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body style="padding-top: 80px;">

  <!-- Header -->
  <header id="site-header" class="scrolled">
    <div class="header-inner">
      <a href="index.html" class="logo">
        <img src="assets/images/logo.png" alt="5 Star Event Management Logo">
      </a>
      <nav class="desktop-nav">
        <a href="index.html#home" class="nav-link">Home</a>
        <a href="index.html#about" class="nav-link">About</a>
        <div class="dropdown">
          <a href="index.html#services" class="nav-link">Services <i class="fas fa-caret-down" style="font-size:0.7rem;"></i></a>
          <div class="dropdown-menu">
            <a href="index.html#services">Wedding Planners</a>
            <a href="index.html#services">Destination Wedding</a>
            <a href="index.html#services">Corporate Events</a>
            <a href="index.html#services">Beach Wedding</a>
            <a href="index.html#services">Music &amp; Entertainment</a>
            <a href="index.html#services">Private Parties</a>
          </div>
        </div>
        <a href="index.html#venues" class="nav-link">Venues</a>
        <div class="dropdown">
          <a href="#" class="nav-link active">Gallery <i class="fas fa-caret-down" style="font-size:0.7rem;"></i></a>
          <div class="dropdown-menu">
            <div class="dropdown-submenu">
              <a href="#photos" style="display: flex; justify-content: space-between; align-items: center;">
                Photos Gallery <i class="fas fa-caret-right" style="font-size:0.7rem;"></i>
              </a>
              <div class="dropdown-menu-nested">
                <a href="wedding-albums.html">Wedding Albums</a>
                <a href="destination-wedding.html">Destination Wedding</a>
                <a href="corporate-events.html">Corporate Events</a>
                <a href="house-opening-ceremony.html">House Opening Ceremony</a>
                <a href="private-parties.html">Private Parties</a>
              </div>
            </div>
            <a href="#our-work">Our work</a>
            <a href="#our-clients">Our clients</a>
          </div>
        </div>
        <a href="index.html#contact" class="nav-link">Contact Us</a>
      </nav>
      <a href="tel:+917996605557" class="btn-cta">
        <i class="fas fa-phone-alt" style="font-size:0.75rem;"></i> +91-799-660-5557
      </a>
      <!-- Hamburger (mobile only) -->
      <button id="mobile-menu-btn" aria-label="Open menu">
        <i class="fas fa-bars"></i>
      </button>
    </div>
  </header>
  
  <!-- Mobile Menu -->
  <div id="mobile-menu">
    <nav>
      <a href="index.html#home"    class="mobile-link">Home</a>
      <a href="index.html#about"   class="mobile-link">About</a>
      <a href="index.html#services" class="mobile-link">Services</a>
      <a href="index.html#venues"  class="mobile-link">Venues</a>
      <a href="#" class="mobile-link">Gallery</a>
      <a href="index.html#contact" class="mobile-link">Contact Us</a>
      <a href="tel:+917996605557" class="mobile-link" style="color:var(--primary); margin-top:16px;">
        <i class="fas fa-phone-alt"></i> Call Now
      </a>
    </nav>
  </div>

  <!-- Gallery Section -->
  <section class="page-gallery-section" style="padding: 60px 24px; background: #fff; min-height: 70vh;">
    <div class="section-container">
      <div class="text-center" style="margin-bottom: 48px;">
        <p class="section-label">Gallery</p>
        <h2 class="section-title" style="text-transform:none;">{{TITLE}}</h2>
      </div>
      <div class="masonry-gallery">`;

const templateFooter = `      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer style="margin-top:0;">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="assets/images/logo.png" alt="5 Star Event Management">
        <p>Tamilnadu's premier ISO 9001:2015 certified event management company.</p>
        <div class="social-links">
          <a href="#" target="_blank" class="social-btn"><i class="fab fa-instagram"></i></a>
          <a href="#" target="_blank" class="social-btn"><i class="fab fa-youtube"></i></a>
          <a href="#" target="_blank" class="social-btn"><i class="fab fa-facebook-f"></i></a>
          <a href="#" target="_blank" class="social-btn"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h6>Quick Links</h6>
        <ul>
          <li><a href="index.html#home">Home</a></li>
          <li><a href="index.html#about">About</a></li>
          <li><a href="index.html#services">Services</a></li>
          <li><a href="index.html#venues">Venues</a></li>
          <li><a href="wedding-albums.html">Gallery</a></li>
          <li><a href="index.html#contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h6>Contact Info</h6>
        <div class="footer-contact-item">
          <i class="fas fa-phone-alt"></i> <a href="tel:+917996605557" style="color:#9ca3af; text-decoration:none;">+91-799-660-5557</a>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-envelope"></i> <span>info@5stareventmanagement.com</span>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-map-marker-alt"></i> <span>Mathigiri, Hosur, Tamilnadu – 635 110</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2008–2026 5 Star Event Management. All Rights Reserved.</span>
      <span>Powered by <strong style="color:#fff;">Pindiyan Software &amp; Digital Solutions</strong></span>
    </div>
  </footer>
  
  <a href="https://wa.me/918592877733?text=Hi" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Chat on WhatsApp">
    <i class="fab fa-whatsapp" style="color:#fff; font-size:1.6rem;"></i>
  </a>
  <script src="script.js"></script>
</body>
</html>`;

// Ensure images directory exists
const baseImagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(baseImagesDir)) fs.mkdirSync(baseImagesDir);

categories.forEach(cat => {
  let imagesHtml = '';
  const srcDir = cat.sourceFolder;
  const destDir = path.join(__dirname, cat.targetFolder);

  // Create target dir if not exists
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    // filter image files
    const imgs = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    imgs.forEach(img => {
      const srcPath = path.join(srcDir, img);
      const destPath = path.join(destDir, img);

      // Copy file if it doesn't already exist to save time
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }

      // Construct relative URL for the HTML file
      // encodeURI encodes spaces to %20 which is required
      const htmlImgPath = encodeURI(cat.targetFolder + '/' + img);
      imagesHtml += `        <div class="gallery-item"><img src="${htmlImgPath}" alt="${cat.name} Image" loading="lazy"></div>\n`;
    });
  } else {
    imagesHtml += `        <p style="text-align:center;width:100%;color:#666;">Images not found in ${srcDir}</p>\n`;
  }

  const html = templateHeader.replace(/{{TITLE}}/g, cat.name) + "\n" + imagesHtml + templateFooter;
  fs.writeFileSync(path.join(__dirname, cat.filename), html);
  console.log('Created ' + cat.filename + ' with images saved in ' + cat.targetFolder);
});
