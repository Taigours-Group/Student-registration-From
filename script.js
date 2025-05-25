// Tesla Cybertruck-inspired Student Registration JavaScript

// Global variables
let selectedFile = null;
let isFormSubmitting = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupFileUpload();
    setupFormValidation();
    setupFormSubmission();
    setupScrollEffects();
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// File upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('photoInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    const fileUpload = document.getElementById('fileUpload');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileUpload.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileUpload.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        fileUpload.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
}

// Handle file selection
function handleFileSelect(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
        showNotification('Please upload a valid image file (JPG, PNG, or WEBP)', 'error');
        return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('uploadPreview').style.display = 'flex';
    };
    reader.readAsDataURL(file);

    showNotification('Photo uploaded successfully!', 'success');
}

// Remove photo
function removePhoto() {
    selectedFile = null;
    document.getElementById('photoInput').value = '';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
}

// Form validation
function setupFormValidation() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    clearFieldError(e);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }

    return true;
}

// Show field error
function showFieldError(field, message) {
    field.style.borderColor = 'var(--secondary-color)';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--secondary-color)';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Form submission
function setupFormSubmission() {
    const form = document.getElementById('registrationForm');
    form.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    if (isFormSubmitting) return;

    const form = e.target;
    const submitButton = document.querySelector('.submit-button');
    
    // Validate form
    if (!validateForm(form)) {
        showNotification('Please fix the errors before submitting', 'error');
        return;
    }

    // Check terms agreement
    if (!document.getElementById('terms').checked) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }

    isFormSubmitting = true;
    
    // Update submit button
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Submitting...';
    submitButton.disabled = true;

    try {
        // Collect form data
        const formData = collectFormData(form);
        
        // Generate student ID if not provided
        if (!formData.studentId) {
            formData.studentId = generateStudentId();
        }

        // Simulate form submission (in a real app, you'd send to a server)
        await simulateFormSubmission(formData);
        
        // Show success modal
        showSuccessModal(formData);
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        isFormSubmitting = false;
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Validate entire form
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        const event = { target: input };
        if (!validateField(event)) {
            isValid = false;
        }
    });

    return isValid;
}

// Collect form data
function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Add checkbox values
    data.terms = document.getElementById('terms').checked;
    data.communications = document.getElementById('communications').checked;

    // Add selected file info
    if (selectedFile) {
        data.photoName = selectedFile.name;
        data.photoSize = selectedFile.size;
    }

    return data;
}

// Generate student ID
function generateStudentId() {
    const timestamp = Date.now().toString().slice(-6);
    return `NS${timestamp}`;
}

// Save form submission to storage for admin panel
function simulateFormSubmission(formData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Save to localStorage for admin panel access
            saveStudentApplication(formData);
            console.log('Registration data:', formData);
            resolve();
        }, 2000);
    });
}

// Save student application to localStorage
function saveStudentApplication(formData) {
    // Get existing applications
    const existingApplications = JSON.parse(localStorage.getItem('neoStudentApplications') || '[]');
    
    // Create student record
    const studentRecord = {
        ...formData,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        photoName: selectedFile ? selectedFile.name : null,
        photoSize: selectedFile ? selectedFile.size : null
    };
    
    // Add to applications array
    existingApplications.push(studentRecord);
    
    // Save back to localStorage
    localStorage.setItem('neoStudentApplications', JSON.stringify(existingApplications));
    
    // Trigger storage event to notify admin panel
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'neoStudentApplications',
        newValue: JSON.stringify(existingApplications)
    }));
}

// Show success modal
function showSuccessModal(formData) {
    const modal = document.getElementById('successModal');
    const generatedId = document.getElementById('generatedStudentId');
    
    if (generatedId) {
        generatedId.textContent = formData.studentId;
    }
    
    modal.classList.add('show');
    
    // Setup WhatsApp button
    setupWhatsAppIntegration(formData);
}

// Setup WhatsApp integration
function setupWhatsAppIntegration(formData) {
    const whatsappButton = document.getElementById('whatsappButton');
    
    if (whatsappButton) {
        whatsappButton.addEventListener('click', function() {
            sendToWhatsApp(formData);
        });
    }
}

// Send registration data to WhatsApp
function sendToWhatsApp(formData) {
    const message = createWhatsAppMessage(formData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Create WhatsApp message
function createWhatsAppMessage(formData) {
    return `🎓 *NeoStudent Registration*

*Student Information:*
• Name: ${formData.firstName} ${formData.lastName}
• Email: ${formData.email}
• Phone: ${formData.phone}
• Student ID: ${formData.studentId}

*Parents Details:*
• Father's Name: ${formData.fatherName}
• Mother's Name: ${formData.motherName}
${formData.guardianName ? `• Guardian's Name: ${formData.guardianName}` : ''}
• Parents' Contact: ${formData.parentsContact}

*Program Details:*
• Program: ${formData.program}
• Level: ${formData.level}
• Start Date: ${formData.startDate}

*Contact Information:*
• Address: ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}
• Country: ${formData.country}
• Emergency Contact: ${formData.emergencyContact}

*Additional Information:*
${formData.education ? `• Education: ${formData.education}` : ''}
${formData.accommodations ? `• Accommodations: ${formData.accommodations}` : ''}

Registration completed successfully! ✨`;
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    
    // Reset form
    document.getElementById('registrationForm').reset();
    removePhoto();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--secondary-color)' : 'var(--primary-color)'};
        color: var(--background-dark);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Setup scroll effects
function setupScrollEffects() {
    // Update navigation on scroll
    window.addEventListener('scroll', updateNavigationOnScroll);
    
    // Smooth reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe form sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Update navigation active state on scroll
function updateNavigationOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Utility function to format phone numbers
function formatPhoneNumber(value) {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

// Add phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;
        });
    });
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.removePhoto = removePhoto;
window.closeModal = closeModal;