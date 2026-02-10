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

  // Prepare Hero Elements
  const splitHeader = new SplitText(".main-header", { type: "lines, words" });
  const splitPara = new SplitText(".main-paragraph", { type: "lines" });

  gsap.set(".hero-bg", { opacity: 0 });
  gsap.set(splitHeader.words, { y: 100, opacity: 0 });
  gsap.set(splitPara.lines, { y: 20, opacity: 0 });
  gsap.set(".benefit-item", { x: -30, opacity: 0 });
  gsap.set(".nav a", { y: -20, opacity: 0 });
  gsap.set(".logo", { opacity: 0, x: -20 });

  preloaderTl
    .to(".loading-text", { opacity: 0, duration: 0.2, delay: 0.2 })
    .to(".counter", { y: -50, opacity: 0, duration: 0.5, ease: "power3.in" })
    .to(".preloader", {
      yPercent: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power4.inOut",
    })
    .add(() => {
      triggerHeroReveal();
    }, "-=0.8");

  function triggerHeroReveal() {
    const heroTl = gsap.timeline();

    heroTl
      .to(".hero-bg", {
        duration: 2.5,
        scale: 1, 
        opacity: 0.8,
        ease: "expo.out",
      })
      .from(
        ".hero-container",
        {
          duration: 2,
          y: 60,
          opacity: 0,
          scale: 0.95,
          ease: "expo.out",
        },
        "-=2.0",
      )
      .from(
        ".hero-badge",
        {
          duration: 1,
          y: 20,
          opacity: 0,
          ease: "power2.out",
        },
        "-=1.5",
      )
      .to(
        splitHeader.words,
        {
          duration: 1.5,
          y: 0,
          opacity: 1,
          stagger: 0.05,
          ease: "expo.out",
        },
        "-=1.5",
      )
      .to(
        splitPara.lines,
        {
          duration: 1.2,
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=1.2",
      )
      .from(
        ".benefit-item",
        {
          duration: 1,
          y: 10,
          opacity: 0,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=1.0",
      )
      .to(
        [".logo", ".nav a"],
        {
          duration: 0.2,
          y: 0,
          x: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.8",
      );

    // Fade in floating letters
    gsap.to(".floating-letter", {
      opacity: 1,
      stagger: 0.1,
      duration: 2,
      ease: "power2.out",
      delay: 0.5,
    });

    // SMOOTH SCROLL & ACTIVE STATE
    const navItems = document.querySelectorAll(
      ".nav-item, .mobile-nav-links a",
    );
    const sections = document.querySelectorAll("section[id]");

    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const href = item.getAttribute("href");
        if (href.startsWith("#")) {
          e.preventDefault();
          const target = href === "#" ? 0 : href;
          lenis.scrollTo(target, {
            offset: -100,
            duration: 1.5,
            ease: (t) => Math.min(1, 1.001 * t * t * t), // Custom cubic lerp
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

        // GSAP Top-Down Reveal
        gsap.to(navOverlay, {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.8,
          ease: "expo.out",
        });

        gsap.fromTo(
          mobLinks,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.3,
          },
        );
      };

      const closeMenu = (callback) => {
        isMenuOpen = false;
        menuToggle.classList.remove("open");

        gsap.to(mobLinks, { y: 10, opacity: 0, duration: 0.3 });

        gsap.to(navOverlay, {
          clipPath: "inset(0 0 100% 0)",
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
              offset: -80,
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
  }
});

// SCROLL ANIMATIONS

// 1. Hero Parallax
const heroSection = document.querySelector(".hero-section");
const heroBg = document.querySelector(".hero-bg");
const heroContent = document.querySelector(".hero-container");

if (heroSection) {
  gsap.to(heroBg, {
    yPercent: 20, // Slightly reduced
    scale: 1.1,
    ease: "none",
    scrollTrigger: {
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: 1.5, // Added smoothing
    },
  });

  gsap.to(heroContent, {
    opacity: 0,
    y: -50,
    scale: 0.95,
    ease: "none",
    scrollTrigger: {
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: 1, // Added smoothing
    },
  });
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
document.addEventListener("mousemove", (e) => {
  const { clientX, clientY } = e;
  const xPos = (clientX / window.innerWidth - 0.5) * 2;
  const yPos = (clientY / window.innerHeight - 0.5) * 2;

  // Cursor Move
  gsap.to(".cursor", {
    x: clientX,
    y: clientY,
    duration: 0.2,
    ease: "power2.out",
  });
});

// MAGNETIC ELEMENTS
const magneticElements = document.querySelectorAll(
  ".nav-item, .logo, .big-link",
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

window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

