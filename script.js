// Dark Mode Toggle
const toggle = document.getElementById('dark-mode-toggle');
toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

const sections = document.querySelectorAll(".fade-section");

function revealSections() {
    sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight * 0.85) {
            section.classList.add("visible");
        }
    });
}

window.addEventListener("scroll", revealSections);
revealSections(); // Run on page load

