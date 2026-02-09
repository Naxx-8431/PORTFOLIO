document.getElementById("year").textContent = new Date().getFullYear();

// EmailJS Contact Form Handler
(function () {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            formStatus.innerHTML = '';

            // Get form data
            const formData = {
                user_name: document.getElementById('user_name').value,
                user_email: document.getElementById('user_email').value,
                message: document.getElementById('message').value
            };

            // Send email using EmailJS
            emailjs.send('service_68ip7uq', 'template_mttqm7v', formData)
                .then(function (response) {
                    // Success
                    formStatus.innerHTML = `
                        <div class="alert alert-success" role="alert">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            Message sent successfully! I'll get back to you soon.
                        </div>
                    `;
                    contactForm.reset();

                    // Auto-hide success message after 5 seconds
                    setTimeout(function () {
                        formStatus.innerHTML = '';
                    }, 5000);

                    // Re-enable button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Send Message';
                }, function (error) {
                    // Error
                    formStatus.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Oops! Something went wrong. Please try again or email me directly.
                        </div>
                    `;

                    // Re-enable button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Send Message';
                });
        });
    }
})();

// ========================================
// THEME TOGGLE FUNCTIONALITY
// ========================================
(function () {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme on page load
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-theme');

        // Update icon
        if (body.classList.contains('dark-theme')) {
            themeIcon.classList.remove('bi-moon-fill');
            themeIcon.classList.add('bi-sun-fill');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('bi-sun-fill');
            themeIcon.classList.add('bi-moon-fill');
            localStorage.setItem('theme', 'light');
        }
    });
})();

// ========================================
// CUSTOM SCROLL INDICATOR FUNCTIONALITY
// ========================================
(function () {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const scrollThumb = document.getElementById('scroll-thumb');

    if (!scrollIndicator || !scrollThumb) return;

    let isDragging = false;

    // Update thumb position based on scroll
    function updateThumbPosition() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Calculate scroll percentage
        const scrollPercentage = scrollTop / (documentHeight - windowHeight);

        // Calculate thumb position within the track (not indicator)
        const scrollTrack = document.querySelector('.scroll-track');
        if (!scrollTrack) return;

        const trackHeight = scrollTrack.offsetHeight;
        const thumbHeight = scrollThumb.offsetHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = scrollPercentage * maxThumbTop;

        scrollThumb.style.top = `${thumbTop}px`;

        // Update fill height
        const scrollFill = document.getElementById('scroll-fill');
        if (scrollFill) {
            scrollFill.style.height = `${scrollPercentage * 100}%`;
        }
    }

    // Scroll page based on thumb position
    function scrollToPosition(clientY) {
        const scrollTrack = document.querySelector('.scroll-track');
        if (!scrollTrack) return;

        const trackRect = scrollTrack.getBoundingClientRect();
        const trackHeight = scrollTrack.offsetHeight;
        const thumbHeight = scrollThumb.offsetHeight;

        // Calculate click position relative to track
        const clickY = clientY - trackRect.top;

        // Calculate scroll percentage
        const maxThumbTop = trackHeight - thumbHeight;
        let thumbTop = Math.max(0, Math.min(clickY, maxThumbTop));
        const scrollPercentage = thumbTop / maxThumbTop;

        // Calculate and set scroll position
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = scrollPercentage * (documentHeight - windowHeight);

        window.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }

    // Update on scroll
    window.addEventListener('scroll', updateThumbPosition);
    window.addEventListener('resize', updateThumbPosition);

    // Click on indicator to jump
    scrollIndicator.addEventListener('click', function (e) {
        if (e.target === scrollIndicator) {
            scrollToPosition(e.clientY);
        }
    });

    // Drag functionality
    scrollThumb.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            scrollToPosition(e.clientY);
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    // Touch support for mobile
    scrollThumb.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('touchmove', function (e) {
        if (isDragging && e.touches.length > 0) {
            scrollToPosition(e.touches[0].clientY);
        }
    });

    document.addEventListener('touchend', function () {
        isDragging = false;
    });

    // Initial position
    updateThumbPosition();
})();
