document.addEventListener("DOMContentLoaded", function () {
    // ✅ Sidebar Toggle for Subcategories
    document.querySelectorAll(".parent-item").forEach((item) => {
        item.addEventListener("click", function () {
            this.classList.toggle("open");
        });
    });

    // ✅ Ensure sections fade in when scrolled
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.2 }
    );

    document.querySelectorAll(".fade-in").forEach((section) => {
        observer.observe(section);
    });
});
