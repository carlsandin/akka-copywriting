class ParticleNetwork {
  constructor(canvas, text) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.text = text;
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 100 };

    this.init();
  }

  init() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none"; // Allow clicks to pass through
    this.canvas.style.zIndex = "1";

    // Event listeners
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.createParticles();
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });

    this.createParticles();
    this.animate();
  }

  createParticles() {
    this.particles = [];
    // Draw text to canvas to get pixel data
    this.ctx.font = 'bold 10vw "Roboto", sans-serif';
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Draw text centered
    this.ctx.fillText(this.text, this.width / 2, this.height / 2);

    const textCoordinates = this.ctx.getImageData(
      0,
      0,
      this.width,
      this.height,
    );

    // Scan pixel data
    for (let y = 0, y2 = textCoordinates.height; y < y2; y += 10) {
      // Density control (skip pixels)
      for (let x = 0, x2 = textCoordinates.width; x < x2; x += 10) {
        // Check transparency of pixel (128 is approx 50% opacity threshold)
        if (
          textCoordinates.data[y * 4 * textCoordinates.width + x * 4 + 3] > 128
        ) {
          let positionX = x;
          let positionY = y;
          this.particles.push(
            new Particle(positionX, positionY, this.width, this.height),
          );
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(this.ctx);
      this.particles[i].update(this.mouse);
    }
    requestAnimationFrame(this.animate.bind(this));
  }
}

class Particle {
  constructor(x, y, canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.originX = x;
    this.originY = y;
    this.size = 4; // Particle size
    this.color = "#312222ff";
    this.vx = 0;
    this.vy = 0;
    this.ease = 0.08; // Return speed
    this.friction = 0.9; // Slow down
    this.dx = 0;
    this.dy = 0;
    this.distance = 0;
    this.force = 0;
    this.angle = 0;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update(mouse) {
    this.dx = mouse.x - this.x;
    this.dy = mouse.y - this.y;
    this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

    // Mouse interaction logic
    // If mouse is close, push particle away
    if (this.distance < mouse.radius) {
      this.force = -mouse.radius / this.distance; // negative force pushes away
      if (this.distance < mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += this.force * Math.cos(this.angle);
        this.vy += this.force * Math.sin(this.angle);
      }
    }

    // Add return to origin force
    this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
  }
}
