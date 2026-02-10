// ═══════════════════════════════════════════════════════
// MatrixJupiter — Premium Web Design Studio
// ═══════════════════════════════════════════════════════

// ═══════════════ NAVBAR SCROLL EFFECT ═══════════════
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ═══════════════ MOBILE NAVIGATION TOGGLE ═══════════════
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
  });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// ═══════════════ SMOOTH SCROLL ═══════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ═══════════════ SCROLL REVEAL ANIMATIONS ═══════════════
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};


const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('animated');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-animate]').forEach(el => {
  observer.observe(el);
});

// ═══════════════ COUNTER ANIMATION ═══════════════
const counters = document.querySelectorAll('[data-count]');

const animateCounter = (counter) => {
  const target = parseInt(counter.dataset.count);
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      counter.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target;
    }
  };
  
  updateCounter();
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => {
  counterObserver.observe(counter);
});

// ═══════════════ CONTACT FORM HANDLING ═══════════════
const contactForm = document.getElementById('contact-form');
const formSubmit = document.getElementById('form-submit');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('form-name').value,
      email: document.getElementById('form-email').value,
      company: document.getElementById('form-company').value,
      message: document.getElementById('form-message').value
    };

    
    // Change button text
    const originalText = formSubmit.innerHTML;
    formSubmit.innerHTML = 'Sending...';
    formSubmit.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      formSubmit.innerHTML = '✓ Message Sent!';
      contactForm.reset();
      
      setTimeout(() => {
        formSubmit.innerHTML = originalText;
        formSubmit.disabled = false;
      }, 3000);
    }, 1500);
    
    // In production, replace the setTimeout above with actual form submission:
    /*
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        formSubmit.innerHTML = '✓ Message Sent!';
        contactForm.reset();
      } else {
        formSubmit.innerHTML = '✗ Error. Try again.';
      }
    } catch (error) {
      formSubmit.innerHTML = '✗ Error. Try again.';
    }
    
    setTimeout(() => {
      formSubmit.innerHTML = originalText;
      formSubmit.disabled = false;
    }, 3000);
    */
  });
}

// ═══════════════ CURSOR EFFECT (OPTIONAL) ═══════════════
// Uncomment to enable custom cursor effect
/*
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});
*/

console.log('MatrixJupiter — Website loaded successfully ✨');
