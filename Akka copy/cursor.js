const cursor = document.querySelector(".cursor");

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

const paragraphs = document.querySelectorAll("p");

paragraphs.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(0)";
  });

  link.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });
});
const images = document.querySelectorAll("img");

images.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(0)";
  });

  link.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });
});

const links = document.querySelectorAll("a");

links.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(4)";
  });

  link.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });
});
