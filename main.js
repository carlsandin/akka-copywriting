gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

// Initialize Lenis with refined settings
const lenis = new Lenis({
  lerp: 0.07, // Smoother, slightly slower key scroll
  smoothWheel: true,
});

lenis.on("scroll", (e) => {
  ScrollTrigger.update();
  updateHeader(e);
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- HEADER LOGIC ---
const header = document.querySelector(".header");

function updateHeader(e) {
  const currentScroll = e.scroll;

  // Floating Header Glassmorphism
  if (currentScroll > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

// Helper function for reveal
const reveal = (elements, trigger, delay = 0) => {
  const isText = elements.includes("h2") || elements.includes(".accent-serif");

  if (isText) {
    const split = new SplitText(elements, { type: "lines,chars" });
    gsap.from(split.chars, {
      y: 100,
      skewX: 10,
      opacity: 0,
      duration: 1.5,
      stagger: 0.02,
      ease: "expo.out",
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
      },
    });
  } else {
    gsap.from(elements, {
      y: 60,
      opacity: 0,
      scale: 0.98,
      duration: 1.5,
      stagger: 0.15,
      ease: "power4.out",
      scrollTrigger: {
        trigger: trigger,
        start: "top 85%",
      },
    });
  }
};

// LOAD ANIMATIONS
window.addEventListener("load", () => {
  // --- PRELOADER SEQUENCE ---
  const preloaderTl = gsap.timeline();
  const counterElement = document.querySelector(".counter");
  const loaderLine = document.querySelector(".loader-line");
  const count = { val: 0 };

  // Initial set for Hero Elements
  const splitHeader = new SplitText(".main-header-minimal", {
    type: "lines, chars",
  });
  gsap.set(splitHeader.chars, { y: 120, opacity: 0, rotateX: -20 }); // 3D rotate effect
  gsap.set(".hero-badge-minimal", { opacity: 0, x: -30 });
  gsap.set([".hero-footer", ".main-paragraph-minimal", ".scroll-ind"], {
    opacity: 0,
    y: 30,
  });
  gsap.set([".logo-link", ".nav-item", ".menu-toggle", ".lang-switcher"], {
    opacity: 0,
    y: -20,
  });

  // 1. Counter Animation
  if (counterElement) {
    preloaderTl.to(count, {
      val: 100,
      duration: 1.0,
      ease: "power3.inOut",
      onUpdate: () => {
        counterElement.innerText = Math.floor(count.val) + "%";
      },
    });

    // Line animation sync
    if (loaderLine) {
      gsap.to(loaderLine, {
        scaleX: 1,
        duration: 2.0,
        ease: "power3.inOut",
      });
    }
  }

  // 2. Preloader Exit (Curtain Up)
  preloaderTl
    .to(".loader-content", {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: "power2.in",
    })
    .to(
      ".preloader",
      {
        height: 0, // Slide up using height or yPercent? Curtain up is usually height 0 or yPercent -100
        yPercent: -100,
        duration: 1.2,
        ease: "expo.inOut",
      },
      "-=0.2",
    )
    .add(() => {
      triggerHeroReveal();
    }, "-=0.8");

  function triggerHeroReveal() {
    const heroTl = gsap.timeline();

    heroTl
      // 1. Navbar & Logo (Top Down)
      .to([".logo-link", ".nav-item", ".menu-toggle", ".lang-switcher"], {
        duration: 1,
        y: 0,
        opacity: 1,
        stagger: 0.1,
        ease: "power3.out",
      })
      // 2. Hero Badge
      .to(
        ".hero-badge-minimal",
        {
          duration: 1,
          x: 0,
          opacity: 1,
          ease: "power3.out",
        },
        "-=0.8",
      )
      // 3. Main Header (Massive Text)
      .to(
        splitHeader.chars,
        {
          duration: 1.2,
          y: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.03,
          ease: "expo.out",
        },
        "-=1.0",
      )
      // 4. Footer Elements (Bottom)
      .to(
        [".hero-footer", ".main-paragraph-minimal", ".scroll-ind"],
        {
          duration: 1,
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=1.2",
      );
  }

  // SMOOTH SCROLL & ACTIVE STATE
  const navItems = document.querySelectorAll(".nav-item, .mobile-nav-links a");
  const sections = document.querySelectorAll("section[id]");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = href === "#" ? 0 : href;
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.5,
          ease: (t) => Math.min(1, 1.001 * t * t * t),
        });
      }
    });
  });

  // Track active section
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 200px",
      end: "bottom 200px",
      onToggle: (self) => {
        if (self.isActive) {
          navItems.forEach((item) => {
            const href = item.getAttribute("href");
            if (href === `#${section.id}`) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });
        }
      },
    });
  });

  // Special case for hero (Start)
  ScrollTrigger.create({
    trigger: ".hero-section",
    start: "top center",
    end: "bottom center",
    onToggle: (self) => {
      if (self.isActive) {
        navItems.forEach((item) => {
          if (item.getAttribute("href") === "#") {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }
    },
  });

  // REFINED MOBILE MENU
  const menuToggle = document.querySelector(".menu-toggle");
  const navOverlay = document.querySelector(".mobile-nav-overlay");
  const mobLinks = document.querySelectorAll(".mobile-nav-links a");

  if (menuToggle && navOverlay) {
    let isMenuOpen = false;

    const openMenu = () => {
      isMenuOpen = true;
      menuToggle.classList.add("open");
      navOverlay.classList.add("active");
      lenis.stop();

      // GSAP Dropdown Reveal
      gsap.to(navOverlay, {
        clipPath: "inset(0 0 0% 0)",
        autoAlpha: 1,
        duration: 0.8,
        ease: "expo.out",
      });

      // Staggered Entrance
      gsap.fromTo(
        mobLinks,
        {
          y: 50,
          x: -20,
          opacity: 0,
        },
        {
          y: 0,
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    };

    const closeMenu = (callback) => {
      isMenuOpen = false;
      menuToggle.classList.remove("open");

      gsap.to(mobLinks, {
        opacity: 0,
        y: -20,
        duration: 0.3,
      });

      gsap.to(navOverlay, {
        clipPath: "inset(0 0 100% 0)",
        autoAlpha: 0,
        duration: 0.6,
        ease: "expo.inOut",
        onComplete: () => {
          navOverlay.classList.remove("active");
          lenis.start();
          if (callback) callback();
        },
      });
    };

    menuToggle.addEventListener("click", () => {
      isMenuOpen ? closeMenu() : openMenu();
    });

    // Updated link handling for mobile
    mobLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        const target = href === "#" ? 0 : href;

        closeMenu(() => {
          lenis.scrollTo(target, {
            offset: 0,
            duration: 1.2,
            ease: (t) => Math.min(1, 1.001 * t * t * t),
          });
        });
      });
    });

    // Close on escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen) closeMenu();
    });
  }
});

// SCROLL ANIMATIONS

// 1. Hero Parallax
// 1. Hero Parallax (Refined Multi-Layer)
const heroSection = document.querySelector(".hero-section");
const parallaxLayers = {
  bg: document.querySelector(".layer-bg"),
  mountainsBack: document.querySelector(".layer-mountains-back"),
  mountainsFront: document.querySelector(".layer-mountains-front"),
};

if (heroSection && parallaxLayers.bg) {
  // Layer 1: Background Sky (Slowest)
  gsap.to(parallaxLayers.bg, {
    yPercent: 10,
    scale: 1.05,
    ease: "none",
    scrollTrigger: {
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // Layer 2: Distant Mountains (Medium)
  if (parallaxLayers.mountainsBack) {
    gsap.to(parallaxLayers.mountainsBack, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // Layer 3: Foreground Mountains (Fastest)
  if (parallaxLayers.mountainsFront) {
    gsap.to(parallaxLayers.mountainsFront, {
      yPercent: 40,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // Content Parallax (Slightly slower than mountains to sit "between" layers)
  const heroContent = document.querySelector(".hero-container");
  if (heroContent) {
    gsap.to(heroContent, {
      yPercent: 30, // Moves faster than back mountains, slower than front?
      // No, usually content is static or moves slower than extreme foreground.
      // Let's make content sink slightly.
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom 30%",
        scrub: 0.5,
      },
    });
  }
}

// 2. Global Reveal Logic
const revealItems = document.querySelectorAll(
  "h2, p, .stat-card, .service-card, .eyebrow, .image-card, li, .quote-box, .service-badge, .price-block, .disclaimer, .contact-links a, .address",
);

revealItems.forEach((item, i) => {
  // Simple Reveal - PARALLAX REMOVED TO FIX JUMPING
  gsap.from(item, {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: item,
      start: "top 95%",
      toggleActions: "play none none none",
    },
  });
});

// Large Element Parallax (Refined for smoothness)
const largeParallax = document.querySelectorAll(
  ".image-card, .stat-card, .service-card",
);
largeParallax.forEach((el, i) => {
  gsap.to(el, {
    y: i % 2 === 0 ? -30 : -15, // Reduced intensity
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2, // Smooth follow
    },
  });
});

// Added: Background Parallax Elements for "Spectacular" feel
function createBgElements() {
  const container = document.querySelector(".container");
  if (!container) return;

  const icons = ["sparkles", "star", "plus", "circle"];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement("div");
    el.className = "bg-parallax-icon";
    el.innerHTML = `<i data-lucide="${icons[i % icons.length]}"></i>`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.setProperty("--depth", Math.random() * 2 + 1);
    container.appendChild(el);
  }
  lucide.createIcons();

  gsap.utils.toArray(".bg-parallax-icon").forEach((el) => {
    const depth = parseFloat(el.style.getPropertyValue("--depth"));
    gsap.to(el, {
      y: -500 * depth,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });
  });
}
createBgElements();

// 3. Image Parallax & Reveal (Refined for smoothness)
const allImgs = document.querySelectorAll(".image-card img, .kundcase-img");
allImgs.forEach((img) => {
  // Ultra-subtle Parallax
  gsap.to(img, {
    yPercent: -5, // Reduced from -10 for more stability
    ease: "none",
    scrollTrigger: {
      trigger: img.parentElement,
      start: "top bottom",
      end: "bottom top",
      scrub: 1, // Added smoothing to the scrub
    },
  });

  // Smoother Reveal
  gsap.fromTo(
    img,
    { clipPath: "inset(5% 5% 5% 5%)", scale: 1.05 }, // Less aggressive starting state
    {
      clipPath: "inset(0% 0% 0% 0%)",
      scale: 1,
      duration: 1.5,
      ease: "power2.out", // More natural easing
      scrollTrigger: {
        trigger: img,
        start: "top 95%", // Trigger slightly later
      },
    },
  );
});

// MOUSE PARALLAX & CURSOR
const cursorX = gsap.quickTo(".cursor", "x", {
  duration: 0.1,
  ease: "power2.out",
});
const cursorY = gsap.quickTo(".cursor", "y", {
  duration: 0.1,
  ease: "power2.out",
});

document.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e;
  cursorX(clientX);
  cursorY(clientY);
});

// MAGNETIC ELEMENTS
const magneticElements = document.querySelectorAll(
  ".nav-item, .logo-link, .big-link",
);
magneticElements.forEach((item) => {
  item.addEventListener("mousemove", (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const strength = 0.3;

    gsap.to(item, {
      x: x * strength,
      y: y * strength,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  item.addEventListener("mouseleave", () => {
    gsap.to(item, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
  });
});

const hoverElements = document.querySelectorAll(
  "a, img, .stat-card, .service-card, .menu-toggle",
);
hoverElements.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    gsap.to(".cursor", {
      scale: 4,
      background: "rgba(59, 130, 246, 0.1)",
      borderColor: "var(--color-accent)",
      borderWidth: 1,
      opacity: 1,
      duration: 0.3,
    });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(".cursor", {
      scale: 0,
      opacity: 0,
      duration: 0.3,
    });
  });
});

/* Resize listener removed to prevent mobile jitter. ScrollTrigger handles this automatically. */
// window.addEventListener("resize", () => {
//   ScrollTrigger.refresh();
// });

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}
