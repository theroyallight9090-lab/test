// ==========================================
// PAGE LOADER
// ==========================================
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);
    }, 800);
  }
});

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================
window.addEventListener('scroll', () => {
  const progress = document.getElementById('scroll-progress');
  if (progress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    progress.style.width = (scrolled / scrollable) * 100 + '%';
  }
});

// ==========================================
// CURSOR GLOW EFFECT (Desktop only)
// ==========================================
if (window.innerWidth > 768) {
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }
}

// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================
document.documentElement.classList.add('js-enabled');

const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .stagger');

const revealOnScroll = () => {
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const elementBottom = el.getBoundingClientRect().bottom;
    const isVisible = elementTop < window.innerHeight * 0.85 && elementBottom > 0;
    
    if (isVisible) {
      el.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ==========================================
// SMOOTH NAVIGATION
// ==========================================
const navLinks = document.querySelectorAll('.nav a');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
});

// ==========================================
// ACTIVE NAV ON SCROLL
// ==========================================
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 120;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav a[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      if (navLink) navLink.classList.add('active');
    }
  });
});

// ==========================================
// PROJECT MODAL
// ==========================================
const projectCards = document.querySelectorAll('.project-card');
const modal = document.getElementById('projectModal');
const closeModal = document.querySelector('.close-modal');

projectCards.forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img').src;
    const title = card.querySelector('h3').textContent;
    const tag = card.querySelector('.project-tag').textContent;
    const tagClass = card.querySelector('.project-tag').className;

    if (modal) {
      document.getElementById('modalImg').src = img;
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalTag').textContent = tag;
      document.getElementById('modalTag').className = tagClass;
      modal.style.display = 'block';
    }
  });
});

if (closeModal) {
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

if (modal) {
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// ==========================================
// CONTACT FORM HANDLING
// ==========================================
const contactForm = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');
const submitBtn = document.getElementById('submit-btn');

// Same Worker that powers the AI chat also exposes a /contact endpoint
// (see worker.js). Keeping it on one Worker avoids standing up a second
// backend just for this form.
const CONTACT_API_URL = "https://royal-light-chat.theroyallight9090.workers.dev/contact";

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      company: document.getElementById('company').value.trim(),
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value.trim(),
    };

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const errorBox = document.getElementById('contact-error');

    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;
    if (errorBox) errorBox.style.display = 'none';

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Message could not be sent');

      // Hide form, show success
      contactForm.style.display = 'none';
      successMessage.style.display = 'block';

      // Reset form after 5 seconds
      setTimeout(() => {
        contactForm.reset();
        contactForm.style.display = 'block';
        successMessage.style.display = 'none';
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }, 5000);
    } catch (error) {
      btnText.style.display = 'flex';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
      if (errorBox) {
        errorBox.textContent = `Sorry, your message could not be sent (${error.message}). Please WhatsApp us at +974 5557 7303 or email info@theroyallights.com instead.`;
        errorBox.style.display = 'block';
      } else {
        alert(`Sorry, your message could not be sent. Please WhatsApp us at +974 5557 7303 or email info@theroyallights.com instead.`);
      }
    }
  });
}

// ==========================================
// PRODUCTS - DYNAMIC LOADING (if CSV exists)
// ==========================================
let allProducts = [];

// Proper CSV parser: handles quoted fields that themselves contain commas
// or line breaks (e.g. a product description with "dimmable, IP65").
// A naive text.split(",") silently misaligns every column after such a
// field, so this is used everywhere products.csv is read.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; }
      else { field += c; }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

// Only load CSV if products-container exists (for product pages)
const productsContainer = document.getElementById('products-container');
if (productsContainer) {
  fetch("products.csv")
    .then(res => {
      if (!res.ok) throw new Error("CSV file not found");
      return res.text();
    })
    .then(text => {
      const rows = parseCSV(text.trim());
      const headers = rows.shift().map(h => h.trim());

      allProducts = rows
        .map(values => {
          const product = {};
          headers.forEach((header, i) => { product[header] = (values[i] || "").trim(); });
          return product;
        })
        .filter(p => p.name);

      renderProducts(allProducts);
    })
    .catch(err => {
      console.error("CSV Load Error:", err);
      productsContainer.innerHTML = "<p style='color:red; text-align:center;'>Failed to load products. Please check if products.csv exists.</p>";
    });
}

function renderProducts(products) {
  if (!productsContainer) return;
  productsContainer.innerHTML = "";

  products.forEach(p => {
    const name = escapeHTML(p.name);
    const description = escapeHTML(p.description);
    const image = escapeHTML(p.image);
    const category = escapeHTML(p.category);

    productsContainer.innerHTML += `
      <div class="product-card" data-category="${category}">
        <img src="${image}" alt="${name}">
        <div class="product-details">
          <h3>${name}</h3>
          <p>${description}</p>
        </div>
      </div>
    `;
  });
}

function filterProducts(category) {
  if (category === "all") {
    renderProducts(allProducts);
  } else {
    renderProducts(allProducts.filter(p => p.category === category));
  }
}