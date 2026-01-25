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
