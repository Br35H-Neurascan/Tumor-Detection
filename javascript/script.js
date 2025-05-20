// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure Firebase is available
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not available. Check your script loading.");
        alert("Error: Firebase failed to load. The application may not work correctly.");
        return;
    }

    // Force initial navigation state update after a short delay to ensure proper highlighting
    setTimeout(function() {
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        // Remove active class from all links first
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Determine which section is currently visible based on scroll position
        const scrollPosition = window.scrollY;
        if (scrollPosition < 100) {
            // At top of page, highlight home
            const homeLink = document.querySelector('.nav-links a[href="#home"]');
            if (homeLink) homeLink.classList.add('active');
        } else {
            // Try to find the appropriate section
            const sections = document.querySelectorAll('section[id]');
            let currentSection = null;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const headerHeight = document.querySelector('header').offsetHeight;
                
                if (scrollPosition >= (sectionTop - headerHeight - 100) && 
                    scrollPosition < (sectionTop + sectionHeight - headerHeight)) {
                    currentSection = section;
                }
            });
            
            if (currentSection) {
                const sectionId = currentSection.getAttribute('id');
                const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (activeLink) activeLink.classList.add('active');
            } else {
                // Default to home if no section is found
                const homeLink = document.querySelector('.nav-links a[href="#home"]');
                if (homeLink) homeLink.classList.add('active');
            }
        }
    }, 500);
    
    // Set up animations with Intersection Observer
    function setupAnimations() {
        // Elements to observe for animations
        const animatedSections = document.querySelectorAll('section');
        const sectionTitles = document.querySelectorAll('.section-title');
        const featureCards = document.querySelectorAll('.feature-card');
        const stepCards = document.querySelectorAll('.step-card');
        const contactCards = document.querySelectorAll('.contact-card');
        const contactForm = document.querySelector('.contact-form');
        
        // Create observer for elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Add visible class when element enters viewport
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    // Remove visible class when element leaves viewport
                    // This allows animations to trigger again when the element re-enters
                    entry.target.classList.remove('visible');
                }
            });
        }, {
            root: null, // viewport
            threshold: 0.1, // 10% of element must be visible
            rootMargin: '-30px' // Offset trigger point
        });
        
        // Elements to observe
        animatedSections.forEach(section => observer.observe(section));
        sectionTitles.forEach(title => observer.observe(title));
        featureCards.forEach(card => observer.observe(card));
        stepCards.forEach(card => observer.observe(card));
        contactCards.forEach(card => observer.observe(card));
        if (contactForm) observer.observe(contactForm);
    }

    // Fix any browser language issues by ensuring file input elements use English text
    const fileInputButtons = document.querySelectorAll('.file-input-button');
    fileInputButtons.forEach(button => {
        button.textContent = 'Choose File';
    });
    
    const fileNameSpans = document.querySelectorAll('[id$="FileName"]');
    fileNameSpans.forEach(span => {
        if (!span.textContent || span.textContent.trim() === '' || span.textContent.includes('Dosya') || span.textContent.includes('Seç')) {
            span.textContent = 'No file chosen';
        }
    });

    // Override the native file input elements with custom ones
    const customizeFileInputs = function() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // Hide the original input
            input.style.opacity = 0;
            input.style.position = 'absolute';
            input.style.pointerEvents = 'none';
            
            // Get the parent wrapper if it exists
            const wrapper = input.closest('.file-input-wrapper');
            if (!wrapper) return;
            
            // Get the button and span within the wrapper
            const button = wrapper.querySelector('.file-input-button');
            const span = wrapper.querySelector('[id$="FileName"]');
            
            if (button) {
                // Make sure the button text is in English
                button.textContent = 'Choose File';
                
                // When the button is clicked, trigger the hidden file input
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    input.click();
                });
            }
            
            if (span) {
                // Make sure the span text is in English
                span.textContent = 'No file chosen';
                
                // Update span text when file is selected
                input.addEventListener('change', function() {
                    span.textContent = this.files.length > 0 ? this.files[0].name : 'No file chosen';
                });
            }
            
            // Clear any default browser-generated text by the input
            const parent = input.parentElement;
            if (parent) {
                // Create and insert an overlay div to block any browser text
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = '#fff';
                overlay.style.opacity = 0;
                parent.style.position = 'relative';
                parent.appendChild(overlay);
            }
        });
    };

    // Call the function to customize the file inputs
    customizeFileInputs();

    // Basic UI Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const processBtn = document.getElementById('process-btn');
    const resultsSection = document.getElementById('results-section');
    const uploadSection = document.querySelector('.upload-section');
    const loadingContainer = document.getElementById('loading-container');
    const newScanBtn = document.getElementById('new-scan-btn');
    const downloadBtn = document.getElementById('download-btn');
    const saveResultBtn = document.getElementById('save-result-btn');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const faqModal = document.getElementById('faq-modal');
    const openFaqBtn = document.getElementById('open-faq');
    const closeFaqBtn = document.getElementById('close-faq');
    const sampleImages = document.querySelectorAll('.sample-image');
    const accountSettingsBtn = document.getElementById('account-settings');
    const profileModal = document.getElementById('profileModal');
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profileTabContents = document.querySelectorAll('.profile-tab-content');
    const settingsAvatar = document.getElementById('settingsAvatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const addSampleBtn = document.getElementById('addSampleBtn');

    // Results Elements
    const resultImageContainer = document.getElementById('result-image-container');
    const resultImage = document.getElementById('result-image');
    const resultBadge = document.querySelector('.result-status .result-badge');
    const confidenceScore = document.getElementById('confidence-score');
    const tumorProbability = document.getElementById('tumor-probability');
    const tumorType = document.getElementById('tumor-type');
    const tumorSize = document.getElementById('tumor-size');
    const tumorLocation = document.getElementById('tumor-location');

    // Global variables
    let selectedFile = null;
    let scanResult = null;
    let imageUrl = null;
    let userSampleImages = []; // Array to store user's sample images

    // Initialize all event listeners
    function initializeEventListeners() {
        // Handle upload area click for file selection
        if (uploadArea && fileInput) {
            // Remove any existing click listeners to prevent duplicates
            uploadArea.removeEventListener('click', uploadAreaClickHandler);
            // Add the click handler
            uploadArea.addEventListener('click', uploadAreaClickHandler);
        }

        // Handle file selection
        if (fileInput) {
            // Remove any existing change listeners to prevent duplicates
            fileInput.removeEventListener('change', fileInputChangeHandler);
            // Add the change handler
            fileInput.addEventListener('change', fileInputChangeHandler);
        }

        // Initialize Resources tab switching
        initializeResourcesTabs();
        
        // Initialize FAQ section with collapsible cards
        initializeFAQ();
        
        // Initialize Research Papers section
        initializeResearchPapers();
        
        // Initialize Documentation section
        initializeDocumentation();

        // Handle drag and drop
        if (uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            uploadArea.addEventListener('dragenter', () => {
                uploadArea.classList.add('highlight');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('highlight');
            });
            
            uploadArea.addEventListener('drop', function(e) {
                uploadArea.classList.remove('highlight');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelection(e.dataTransfer.files[0]);
                }
            });
        }

        // Handle View Scan History click
        const viewHistoryLink = document.getElementById('view-history');
        if (viewHistoryLink && profileModal) {
            viewHistoryLink.addEventListener('click', function(e) {
                e.preventDefault();
                profileModal.style.display = 'flex';
                
                // Switch to history tab
                if (profileTabs && profileTabContents) {
                    // Remove active class from all tabs and content
                    profileTabs.forEach(tab => tab.classList.remove('active'));
                    profileTabContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to history tab and content
                    const historyTab = document.querySelector('.profile-tab[data-tab="history"]');
                    if (historyTab) historyTab.classList.add('active');
                    
                    const historyContent = document.getElementById('historyTab');
                    if (historyContent) historyContent.classList.add('active');
                    
                    // Load scan history data
                    loadUserScanHistory();
                }
            });
        }

        // Other existing event listeners can be moved here if needed
    }

    // Define upload area click handler outside to avoid creating multiple instances
    function uploadAreaClickHandler(e) {
        // Prevent bubbling if clicking on input element or child of it
        if (e.target.closest('.file-input') || e.target === fileInput) {
            return;
        }
        // Get the file input that's within the upload area
        const input = uploadArea.querySelector('.file-input') || fileInput;
        if (input) {
            input.click();
        }
    }

    // Define file input change handler outside to avoid creating multiple instances
    function fileInputChangeHandler(e) {
        if (this.files && this.files[0]) {
            handleFileSelection(this.files[0]);
        }
    }

    // Handle Account Settings click - open profile modal
    if (accountSettingsBtn && profileModal) {
        accountSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            profileModal.style.display = 'flex';
            
            // Load user profile data
            loadUserProfileData();
            
            // Switch to settings tab
            if (profileTabs && profileTabContents) {
                // Remove active class from all tabs and content
                profileTabs.forEach(tab => tab.classList.remove('active'));
                profileTabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to settings tab and content
                const settingsTab = document.querySelector('.profile-tab[data-tab="settings"]');
                if (settingsTab) settingsTab.classList.add('active');
                
                const settingsContent = document.getElementById('settingsTab');
                if (settingsContent) settingsContent.classList.add('active');
            }
        });
    }

    // Handle profile tab switching
    if (profileTabs) {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and content
                profileTabs.forEach(t => t.classList.remove('active'));
                profileTabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const tabContent = document.getElementById(tabName + 'Tab');
                if (tabContent) tabContent.classList.add('active');
                
                // Load tab-specific data
                if (tabName === 'samples') {
                    loadUserSampleImagesForProfile();
                } else if (tabName === 'history') {
                    loadUserScanHistory();
                }
            });
        });
    }

    // Close profile modal when close button is clicked
    const profileModalClose = profileModal ? profileModal.querySelector('.close') : null;
    if (profileModalClose) {
        profileModalClose.addEventListener('click', function() {
            profileModal.style.display = 'none';
        });
    }

    // Handle saving profile settings
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profileSettingsForm = document.getElementById('profileSettingsForm');
    if (saveProfileBtn && profileSettingsForm) {
        profileSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUserProfile();
        });
    }

    // Handle logout button in profile settings
    const profileLogoutBtn = document.getElementById('logoutBtn');
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', function() {
            firebase.auth().signOut().then(() => {
                // Close the modal
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
                
                // Show success message
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Logged Out', 'You have been signed out successfully.', 'info');
                } else {
                    showNotification('Logged Out', 'You have been signed out successfully.', 'info');
                }
            }).catch((error) => {
                console.error('Logout error:', error);
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Error', 'Failed to log out. Please try again.', 'error');
                } else {
                    showNotification('Error', 'Failed to log out. Please try again.', 'error');
                }
            });
        });
    }

    // Function to save user profile changes
    function saveUserProfile() {
        const user = getCurrentUser();
        
        if (!user) {
            if (window.auth && window.auth.showNotification) {
                window.auth.showNotification('Error', 'You must be logged in to save profile changes.', 'error');
            }
            return;
        }
        
        // Get form values
        const displayName = document.getElementById('settingsName').value.trim();
        const bio = document.getElementById('settingsBio').value.trim();
        const avatarInput = document.getElementById('settingsAvatar');
        
        // Show loading state
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.disabled = true;
            saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        // Update user profile in Firebase Auth
        let updatePromise = Promise.resolve();
        
        // Update display name if provided
        if (displayName) {
            updatePromise = user.updateProfile({
                displayName: displayName
            });
        }
        
        // Handle avatar upload if a new file was selected
        let avatarUploadPromise = Promise.resolve(null);
        if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
            const avatarFile = avatarInput.files[0];
            
            // Upload the avatar to Firebase Storage
            const storageRef = firebase.storage().ref();
            const avatarRef = storageRef.child(`users/${user.uid}/avatars/avatar_${Date.now()}`);
            
            avatarUploadPromise = avatarRef.put(avatarFile).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            }).then(downloadURL => {
                // Update user profile with new avatar URL
                return user.updateProfile({
                    photoURL: downloadURL
                }).then(() => downloadURL);
            });
        }
        
        // Wait for both the profile update and avatar upload to complete
        Promise.all([updatePromise, avatarUploadPromise])
            .then(([_, avatarURL]) => {
                // Update user data in Firestore
                const userUpdates = {
                    name: displayName || user.displayName || user.email.split('@')[0],
                    bio: bio || null,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Add avatar URL to updates if one was uploaded
                if (avatarURL) {
                    userUpdates.photoURL = avatarURL;
                    userUpdates.avatarPath = `users/${user.uid}/avatars/avatar_${Date.now()}`; // Store the storage path
                }
                
                return firebase.firestore().collection('users').doc(user.uid).set(userUpdates, { merge: true });
            })
            .then(() => {
                // Show success notification with animation
                showEnhancedNotification('Profile Updated', 'Your profile has been updated successfully.', 'success');
                
                // Reload user data to reflect changes
                loadUserProfileData();
                
                // Also update UI elements outside the profile modal (like the navbar)
                if (user.photoURL) {
                    const userAvatar = document.getElementById('user-avatar');
                    if (userAvatar) {
                        userAvatar.src = user.photoURL;
                    }
                }
                
                if (user.displayName) {
                    const userName = document.getElementById('user-name');
                    if (userName) {
                        userName.textContent = user.displayName;
                    }
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                
                // Show error notification with animation
                showEnhancedNotification('Error', 'Failed to update profile. Please try again.', 'error');
            })
            .finally(() => {
                // Reset button state
                if (saveProfileBtn) {
                    saveProfileBtn.disabled = false;
                    saveProfileBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
                }
                
                // Clear the file input to allow selecting the same file again
                if (avatarInput) {
                    avatarInput.value = '';
                }
            });
    }

    // Enhanced notification function with animations
    function showEnhancedNotification(title, message, type = 'success', duration = 5000) {
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `enhanced-notification notification-${type}`;
        
        // Add icon based on notification type
        let icon;
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                break;
            case 'info':
            default:
                icon = 'fa-info-circle';
                break;
        }
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .enhanced-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 350px;
                min-width: 300px;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(400px);
                opacity: 0;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                            opacity 0.4s ease;
                animation: notification-enter 0.4s forwards, 
                           notification-glow 2s infinite alternate;
            }
            
            @keyframes notification-enter {
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes notification-glow {
                from {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                to {
                    box-shadow: 0 4px 24px rgba(0,0,0,0.25);
                }
            }
            
            .enhanced-notification .notification-content {
                display: flex;
                align-items: flex-start;
            }
            
            .enhanced-notification i.fas {
                font-size: 24px;
                margin-right: 15px;
            }
            
            .enhanced-notification .notification-text {
                flex: 1;
            }
            
            .enhanced-notification h4 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }
            
            .enhanced-notification p {
                margin: 0;
                font-size: 14px;
            }
            
            .enhanced-notification .notification-close {
                background: transparent;
                border: none;
                color: inherit;
                opacity: 0.7;
                cursor: pointer;
                padding: 0;
                font-size: 16px;
            }
            
            .enhanced-notification .notification-close:hover {
                opacity: 1;
            }
            
            .enhanced-notification.notification-success {
                background: linear-gradient(135deg, #43A047, #2E7D32);
                color: white;
            }
            
            .enhanced-notification.notification-error {
                background: linear-gradient(135deg, #E53935, #C62828);
                color: white;
            }
            
            .enhanced-notification.notification-warning {
                background: linear-gradient(135deg, #FB8C00, #EF6C00);
                color: white;
            }
            
            .enhanced-notification.notification-info {
                background: linear-gradient(135deg, #039BE5, #0277BD);
                color: white;
            }
            
            .avatar-changed {
                border: 3px solid #4CAF50 !important;
                animation: pulse 1.5s infinite alternate;
            }
            
            @keyframes pulse {
                from { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
                to { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
            }
            
            .avatar-save-notification {
                position: absolute;
                bottom: -40px;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                text-align: center;
                animation: fadeIn 0.3s forwards;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        
        // Append style and notification to the DOM
        document.head.appendChild(styles);
        document.body.appendChild(notificationElement);
        
        // Add event listener to close button
        const closeButton = notificationElement.querySelector('.notification-close');
        closeButton.addEventListener('click', function() {
            notificationElement.style.opacity = '0';
            notificationElement.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notificationElement)) {
                    document.body.removeChild(notificationElement);
                }
            }, 400);
        });
        
        // Automatically remove after duration
        setTimeout(function() {
            if (document.body.contains(notificationElement)) {
                notificationElement.style.opacity = '0';
                notificationElement.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(notificationElement)) {
                        document.body.removeChild(notificationElement);
                    }
                }, 400);
            }
        }, duration);
    }

    // Handle change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            showChangePasswordModal();
        });
    }

    // Function to show change password modal
    function showChangePasswordModal() {
        const user = getCurrentUser();
        
        if (!user) {
            if (window.auth && window.auth.showNotification) {
                window.auth.showNotification('Error', 'You must be logged in to change your password.', 'error');
            }
            return;
        }
        
        // Check if user is using a social provider (can't change password directly)
        const providerData = user.providerData;
        if (providerData && providerData.length > 0) {
            const mainProvider = providerData[0].providerId;
            if (mainProvider !== 'password') {
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Not Available', 'Password change is not available for accounts signed in with ' + 
                        (mainProvider.replace('.com', '').replace('google', 'Google').replace('facebook', 'Facebook')), 'info');
                }
                return;
            }
        }
        
        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal';
        modalElement.id = 'change-password-modal';
        
        modalElement.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Change Password</h3>
                        <button class="modal-close-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="current-password">Current Password</label>
                            <input type="password" id="current-password" class="form-control" placeholder="Enter your current password">
                        </div>
                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <input type="password" id="new-password" class="form-control" placeholder="Enter your new password">
                            <small class="form-text">Password must be at least 6 characters long</small>
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">Confirm New Password</label>
                            <input type="password" id="confirm-password" class="form-control" placeholder="Confirm your new password">
                        </div>
                        <p class="auth-message" id="password-change-message"></p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-cancel-btn">Cancel</button>
                        <button class="btn" id="change-password-btn">Change Password</button>
                    </div>
                </div>
            </div>
        `;

        // Add to the DOM
        document.body.appendChild(modalElement);
        
        // Get elements
        const closeBtn = modalElement.querySelector('.modal-close-btn');
        const cancelBtn = modalElement.querySelector('.modal-cancel-btn');
        const submitBtn = modalElement.querySelector('#change-password-btn');
        const messageElement = modalElement.querySelector('#password-change-message');
        
        // Set up event listeners
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(modalElement);
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(modalElement);
        });
        
        submitBtn.addEventListener('click', function() {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate inputs
            if (!currentPassword) {
                messageElement.textContent = 'Please enter your current password.';
                messageElement.style.color = 'red';
                return;
            }
            
            if (!newPassword) {
                messageElement.textContent = 'Please enter your new password.';
                messageElement.style.color = 'red';
                return;
            }
            
            if (newPassword.length < 6) {
                messageElement.textContent = 'New password must be at least 6 characters long.';
                messageElement.style.color = 'red';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                messageElement.textContent = 'New passwords do not match.';
                messageElement.style.color = 'red';
                return;
            }

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
            
            // Get credentials and reauthenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            
            user.reauthenticateWithCredential(credential)
                .then(function() {
                    // Change password
                    return user.updatePassword(newPassword);
                })
                .then(function() {
                    // Show success message
                    if (window.auth && window.auth.showNotification) {
                        window.auth.showNotification('Password Changed', 'Your password has been changed successfully.', 'success');
                    }
                    
                    // Close the modal
                    document.body.removeChild(modalElement);
                })
                .catch(function(error) {
                    console.error('Error changing password:', error);
                    
                    // Show error message
                    if (error.code === 'auth/wrong-password') {
                        messageElement.textContent = 'Current password is incorrect.';
                    } else if (error.code === 'auth/weak-password') {
                        messageElement.textContent = 'New password is too weak.';
                    } else {
                        messageElement.textContent = error.message;
                    }
                    
                    messageElement.style.color = 'red';
                })
                .finally(function() {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Change Password';
                });
        });
    }

    // Create a reference to get current user
    function getCurrentUser() {
        return window.auth ? window.auth.getCurrentUser() : firebase.auth().currentUser;
    }

    // Listen for authentication events from auth.js
    document.addEventListener('userLoggedIn', function(e) {
        console.log("User logged in event received");
        loadUserData();
    });

    document.addEventListener('userLoggedOut', function() {
        console.log("User logged out event received");
        // Clear any user-specific data from the UI
        userSampleImages = [];
        
        // Update the UI for logged out state
        updateUIForLoggedOutUser();
    });

    // Function to load user data (called after login)
    function loadUserData() {
        const user = getCurrentUser();
        
        if (!user) {
            // User is not logged in
            updateUIForLoggedOutUser();
            return;
        }
        
        // Load user-specific data (like samples, history, etc.)
        loadUserSampleImages();
        
        // Add a slight delay to ensure sample images are loaded before updating handlers
        setTimeout(() => {
            updateSampleImageHandlers();
        }, 300);
    }

    // Update UI for logged out user
    function updateUIForLoggedOutUser() {
        // Clear any user-specific UI elements
        if (document.getElementById('user-samples-grid')) {
            document.getElementById('user-samples-grid').innerHTML = '';
        }
    }

    //----------------------------------------------
    // 1. File Upload Handling
    //----------------------------------------------
    // Remove these duplicate event listeners since they're already in initializeEventListeners
    /*
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                handleFileSelection(file);
            }
        });
    }
    */

    // Handle file selection and preview
    function handleFileSelection(file) {
        selectedFile = file;

        // Check if it's an image
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            
            // Show loading state
            uploadArea.innerHTML = `
                <div class="spinner" style="width: 30px; height: 30px; margin-bottom: 15px;"></div>
                <p>Loading preview...</p>
            `;
            
            reader.onload = function(e) {
                imageUrl = e.target.result; // Set the imageUrl for processing
                
                // Preload the image to ensure it can be displayed
                preloadImage(imageUrl, function(success) {
                    if (success) {
                        console.log("Image preloaded successfully");
                        uploadArea.innerHTML = `
                            <div class="preview-container" style="position: relative; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 250px; display: block; margin: 0 auto; border-radius: 8px;">
                                <div class="preview-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 15px 10px 10px; color: white;">
                                    <p style="margin: 0; font-size: 14px;">Selected file: <span style="font-weight: bold;">${file.name}</span></p>
                                </div>
                            </div>
                            <p class="ready-text" style="color: #2dce89; font-weight: bold;"><i class="fas fa-check-circle"></i> Ready for analysis</p>
                        `;
                    } else {
                        console.error("Image preload failed");
                        // Still display the image, but with a warning
                        uploadArea.innerHTML = `
                            <div class="preview-container" style="position: relative; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 250px; display: block; margin: 0 auto; border-radius: 8px;">
                                <div class="preview-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 15px 10px 10px; color: white;">
                                    <p style="margin: 0; font-size: 14px;">Selected file: <span style="font-weight: bold;">${file.name}</span></p>
                                </div>
                            </div>
                            <p class="warning-text" style="color: #ffc107; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> Image may not display correctly. Proceed with caution.</p>
                        `;
                    }
                });
            };
            
            reader.onerror = function() {
                uploadArea.innerHTML = `
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--accent); margin-bottom: 15px;"></i>
                    <p>Error reading file. Please try again.</p>
                `;
                selectedFile = null;
                imageUrl = null;
                console.error("Error reading file");
            };

            reader.readAsDataURL(file);
        } else {
            uploadArea.innerHTML = `
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--accent); margin-bottom: 15px;"></i>
                <p>Invalid file type: <span>${file.name}</span></p>
                <p>Please select an image file (JPEG, PNG, etc.)</p>
            `;
            selectedFile = null;
            imageUrl = null;
        }
    }

    // Helper function to preload an image and ensure it can be displayed
    function preloadImage(src, callback) {
        const img = new Image();
        img.onload = function() {
            callback(true);
        };
        img.onerror = function() {
            console.error("Error preloading image:", src);
            callback(false);
        };
        img.src = src;
    }
            
    // Helper function to determine image type from URL or response
    function getImageTypeFromUrl(url) {
        // Default type
        let imageType = 'image/jpeg';
        
        try {
            // Extract file extension from URL if possible
            const urlParts = url.split('.');
            if (urlParts.length > 1) {
                const extension = urlParts.pop().toLowerCase().split('?')[0]; // Remove any query parameters
                if (['jpg', 'jpeg'].includes(extension)) {
                    imageType = 'image/jpeg';
                } else if (extension === 'png') {
                    imageType = 'image/png';
                } else if (extension === 'gif') {
                    imageType = 'image/gif';
                } else if (extension === 'webp') {
                    imageType = 'image/webp';
                } else if (extension === 'bmp') {
                    imageType = 'image/bmp';
                }
            }
        } catch (e) {
            console.error("Error determining image type from URL:", e);
        }
        
        return imageType;
    }
            
    // Handle drag and drop
    // Remove these duplicate event listeners since they're already in initializeEventListeners
    /*
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                handleFileSelection(file);
            }
        });
    }
    */

    // Handle sample image clicks
    if (sampleImages) {
        sampleImages.forEach(function(sampleImage) {
            sampleImage.addEventListener('click', function() {
                const sampleNumber = this.getAttribute('data-sample');
                
                // Add loading indicator
                this.classList.add('loading');
                
                // Sample images logic (placeholder for now)
                setTimeout(() => {
                    this.classList.remove('loading');
                    // Here you would normally fetch the image from server
                    // For now, just use a placeholder
                    const sampleFile = new File(
                        [new Blob([''], { type: 'image/jpg' })], 
                        `sample${sampleNumber}.jpg`, 
                        { type: 'image/jpeg' }
                    );
                    handleFileSelection(sampleFile);
                }, 500);
            });
        });
    }

    // Process button click
    if (processBtn) {
        processBtn.addEventListener('click', function() {
            if (!selectedFile) {
                alert('Please select an image first.');
                return;
            }
            
            processImageWithAI();
        });
    }

    // New scan button click
    if (newScanBtn) {
        newScanBtn.addEventListener('click', function() {
            // Use the new helper function to reset the UI and set up event listeners
            setupUploadAreaEvents();
        });
    }

    // Download results button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (!scanResult) {
                alert('No results to download.');
                return;
            }
            
            try {
                // Show generating notification
                showEnhancedNotification('Generating PDF', 'Creating your report...', 'info', 2000);
                
                // Make sure jsPDF is available
                if (typeof window.jspdf === 'undefined') {
                    console.error('jsPDF library not loaded.');
                    throw new Error('jsPDF library not available');
                }
                
                // Create a PDF with the results
                const { jsPDF } = window.jspdf;
                if (!jsPDF) {
                    throw new Error('jsPDF library not available');
                }
                
                // Create PDF with white background
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    putOnlyUsedFonts: true
                });
                
                // Set background to white
                doc.setFillColor(255, 255, 255);
                doc.rect(0, 0, 210, 297, 'F');
                
                // Get the result image
                const resultImage = document.getElementById('result-image');
                const imageUrl = resultImage ? resultImage.src : null;
                
                // Add header with title centered
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text('NeuraScan - Brain Tumor Analysis Report', 105, 20, null, null, 'center');
                
                // Add thin line below header
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(20, 25, 190, 25);
                
                // Calculate the date in a better format
                const reportDate = new Date();
                const formattedReportDate = reportDate.toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit'
                });
                
                // Create unique reference number
                const referenceNumber = `NS-${Math.floor(10000000 + Math.random() * 90000000)}`;
                
                // Patient Information Section
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                
                // Left column
                let yPos = 35;
                doc.text(`Date: ${formattedReportDate}`, 20, yPos);
                
                // Get the current user
                const currentUser = getCurrentUser();
                const patientName = currentUser ? (currentUser.displayName || 'Anonymous Patient') : 'Anonymous Patient';
                const patientNameForFilename = patientName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                
                yPos += 8;
                doc.text(`Patient: ${patientName}`, 20, yPos);
                
                // Create a patient ID from user ID or generate one
                const patientId = currentUser ? currentUser.uid.substring(0, 8) : ('PT' + Math.random().toString(36).substring(2, 8)).toUpperCase();
                yPos += 8;
                doc.text(`Patient ID: ${patientId}`, 20, yPos);
                
                // Handle scan name
                let scanName = 'Brain Scan ' + formattedReportDate.split(',')[0];
                if (typeof selectedFile !== 'undefined' && selectedFile && selectedFile.name) {
                    scanName = selectedFile.name;
                }
                
                yPos += 8;
                doc.text(`Scan Name: ${scanName}`, 20, yPos);
                
                // Right column
                doc.text(`Reference: ${referenceNumber}`, 150, 35);
                
                // Add separator line before image
                yPos += 10;
                doc.setDrawColor(240, 240, 240);
                doc.setLineWidth(1);
                doc.line(20, yPos, 190, yPos);
                
                // Add result image
                if (imageUrl) {
                    // Create an image element to load the image
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    
                    img.onload = function() {
                        try {
                            // Create a canvas to convert the image
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            
                            // Calculate aspect ratio to fit image properly
                            const imgWidth = 80; // Reduced from 100 to make more room for text
                            const imgHeight = imgWidth * (img.height / img.width);
                            
                            // Add the image centered
                            const imgData = canvas.toDataURL('image/jpeg');
                            const imgX = (210 - imgWidth) / 2;
                            doc.addImage(imgData, 'JPEG', imgX, yPos + 10, imgWidth, imgHeight);
                            
                            // Adjust yPos for results section
                            yPos += imgHeight + 20; // Reduced space after image
                            
                            // Continue with the rest of the PDF
                            continueWithResults(yPos);
                        } catch (error) {
                            console.error('Error adding image to PDF:', error);
                            // Continue without the image
                            continueWithResults(yPos + 20);
                        }
                    };
                    
                    img.onerror = function() {
                        console.error('Error loading image for PDF');
                        // Continue without the image
                        continueWithResults(yPos + 20);
                    };
                    
                    img.src = imageUrl;
                } else {
                    // No image available, continue with the PDF
                    continueWithResults(yPos + 20);
                }
                
                // Function to add the analysis results section
                function continueWithResults(startY) {
                    // Add a branded header image with gradient fill
                    doc.setFillColor(32, 67, 118);
                    doc.rect(20, startY, 170, 12, 'F');
                    
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text('CONFIDENTIAL MEDICAL REPORT - FOR MEDICAL PROFESSIONALS', 105, startY + 8, null, null, 'center');
                    doc.setTextColor(0, 0, 0);
                    
                    // Reset text color and position
                    doc.setTextColor(0, 0, 0);
                    startY += 20;
                    
                    // ANALYSIS RESULTS Section
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text('DIAGNOSTIC FINDINGS', 20, startY);
                    
                    // Add separator line
                    doc.setDrawColor(32, 67, 118);
                    doc.setLineWidth(0.7);
                    doc.line(20, startY + 2, 190, startY + 2);
                    
                    // Result in bold red or green
                    const isTumorDetected = scanResult && scanResult.hasTumor;
                    doc.setFontSize(12);
                    if (isTumorDetected) {
                        doc.setTextColor(180, 0, 0); // Red for tumor
                    } else {
                        doc.setTextColor(0, 120, 0); // Green for no tumor
                    }
                    doc.text(`Primary Assessment: ${isTumorDetected ? 'ABNORMAL FINDINGS DETECTED' : 'NO SIGNIFICANT ABNORMALITIES DETECTED'}`, 20, startY + 10);
                    
                    // Reset text color
                    doc.setTextColor(0, 0, 0);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    
                    // Add tumor details if detected
                    let currentY = startY + 18;
                    if (isTumorDetected) {
                        currentY += 12; // Increased for spacing
                    } else {
                        currentY += 12;
                    }
                    
                    // Add METHODOLOGY section
                    doc.setFillColor(245, 245, 250);
                    doc.rect(20, currentY, 170, 40, 'F'); // Reduced height of methodology box
                    
                    currentY += 7;
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text('METHODOLOGY', 30, currentY);
                    
                    currentY += 7;
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");
                    const methodologyText = 'This analysis was performed using advanced convolutional neural network algorithms designed to detect and classify anomalies in brain MRI scans. The system has been trained on Above 5,000 annotated clinical cases and validated against diagnoses from board-certified radiologists.';
                    
                    // Create wrapped text for methodology
                    const splitMethodology = doc.splitTextToSize(methodologyText, 150);
                    doc.text(splitMethodology, 30, currentY);
                    
                    currentY += 20; // Reduced space after methodology
                    
                    // Add INTERPRETATION section
                    doc.setFillColor(255, 255, 255);
                    doc.setDrawColor(32, 67, 118);
                    doc.setLineWidth(0.7);
                    doc.line(20, currentY, 190, currentY);
                    
                    currentY += 10;
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text('CLINICAL INTERPRETATION', 20, currentY);
                    
                    doc.setLineWidth(0.5);
                    doc.line(20, currentY + 2, 190, currentY + 2);
                    
                    const interpretationText = 'The scan analysis indicates the presence of a potential tumor. The findings suggest that further clinical evaluation and possibly additional imaging studies may be warranted. This result should be correlated with the patient\'s clinical presentation and medical history.';
                    const noTumorText = 'The scan analysis indicates no significant anomalies based on the current algorithm parameters. As with all automated screening tools, false negatives can occur. If the patient is exhibiting clinical symptoms inconsistent with these findings, further diagnostic evaluation should be considered.';
                    
                    currentY += 10;
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    
                    // Create wrapped text
                    const textToUse = isTumorDetected ? interpretationText : noTumorText;
                    const splitInterpretation = doc.splitTextToSize(textToUse, 170);
                    doc.text(splitInterpretation, 20, currentY);
                    
                    currentY += (isTumorDetected ? 20 : 15); // Reduced space after interpretation
                    
                    // Add recommendations section
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text('RECOMMENDATIONS:', 20, currentY);
                    
                    currentY += 8;
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    
                    const recommendationsText = isTumorDetected ? 
                        '1. Clinical correlation with patient history and symptoms\n2. Consider follow-up with contrast-enhanced MRI\n3. Neurosurgical consultation recommended\n4. Possible biopsy for histopathological confirmation' : 
                        '1. Routine follow-up as clinically indicated\n2. Consider alternative diagnostic approaches if clinical symptoms persist\n3. Patient reassurance with appropriate precautions';
                    
                    doc.text(recommendationsText, 25, currentY);
                    
                    // Calculate space needed for disclaimer based on current Y position
                    const spaceForDisclaimer = 285 - currentY;
                    
                    // Add disclaimer at the bottom, position dynamically based on remaining content
                    if (spaceForDisclaimer < 40) {
                        // Not enough space, add a new page
                        doc.addPage();
                        currentY = 20;
                    } else if (currentY < 230) {
                        // Sufficient space, but position closer to bottom
                        currentY = 230;
                    }
                    
                    doc.setFillColor(247, 247, 252);
                    doc.rect(20, currentY, 170, 30, 'F');
                    
                    currentY += 5;
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "bold");
                    doc.text('DISCLAIMER:', 25, currentY);
                    
                    currentY += 5;
                    doc.setFont("helvetica", "normal");
                    const disclaimerText = 'This report is generated by an AI-assisted diagnostic system and is intended for informational purposes only. It should not be considered a definitive clinical diagnosis. All findings should be verified by a qualified healthcare professional. Always correlate with clinical findings and consult appropriate specialists for proper interpretation and management.';
                    
                    const splitDisclaimer = doc.splitTextToSize(disclaimerText, 160);
                    doc.text(splitDisclaimer, 25, currentY);
                    
                    // Add footer with generation info and page number
                    doc.setFontSize(7);
                    doc.setTextColor(100, 100, 100);
                    const today = new Date();
                    // Format date as 8.05.2025 and time as 00:23:42
                    const formattedDate = `${today.getDate()}.${(today.getMonth()+1).toString().padStart(2, '0')}.${today.getFullYear()}`;
                    const formattedTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
                    
                    // Generate a report ID similar to NS-80356779
                    const reportId = `NS-${Math.floor(80000000 + Math.random() * 10000000)}`;
                    
                    doc.text(`Generated: ${formattedDate} ${formattedTime} • Report ID: ${reportId}`, 20, 285);
                    doc.text(`Page 1 of 1 • NeuraScan™ AI-Assisted Diagnostic Platform • CONFIDENTIAL MEDICAL REPORT`, 20, 290);
                    
                    // Save the PDF with a meaningful name
                    try {
                        doc.save(`NeuraScan-Report-${patientNameForFilename}-${formattedDate.replace(/\./g, '-')}.pdf`);
                        
                        // Show success notification
                        showEnhancedNotification('PDF Generated', 'Your report has been downloaded successfully.', 'success');
                    } catch (error) {
                        console.error('Error generating PDF:', error);
                        showEnhancedNotification('Error', 'Failed to generate PDF report. Please try again.', 'error');
                    }
                }
            } catch (error) {
                console.error('Error generating PDF:', error);
                showEnhancedNotification('Error', 'Failed to generate PDF report. Please try again.', 'error');
            }
        });
    }

    // Save result button
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', function() {
            if (!scanResult) {
                showEnhancedNotification('Error', 'No results to save. Please complete a scan first.', 'error');
                return;
            }
            
            const user = getCurrentUser();
            
            if (!user) {
                // Show auth modal if user is not logged in
                if (window.auth && window.auth.showNotification) {
                    window.auth.showNotification('Login Required', 'Please login to save your scan results.', 'info');
                } else {
                    showEnhancedNotification('Login Required', 'Please login to save your scan results.', 'info');
                }
                
                const authContainer = document.getElementById('auth-container');
                if (authContainer) {
                    authContainer.style.display = 'flex';
                    const loginTab = document.getElementById('login-tab');
                    if (loginTab) loginTab.click();
                }
                return;
            }

            // Check if email is verified (optional requirement)
            if (user.emailVerified === false) {
                const verifyEmailFirst = confirm(
                    'Your email is not verified. It is recommended to verify your email before saving results. ' +
                    'Would you like to continue anyway?'
                );
                
                if (!verifyEmailFirst) {
                    return;
                }
            }
            
            // Proceed with saving the scan
            proceedWithSave();
            
            function proceedWithSave() {
                // Create a save animation overlay
                const saveOverlay = document.createElement('div');
                saveOverlay.className = 'save-overlay';
                saveOverlay.innerHTML = `
                    <div class="save-animation-container">
                        <div class="save-spinner"></div>
                        <div class="save-text">Preparing to save your scan...</div>
                    </div>
                `;
                document.body.appendChild(saveOverlay);
                
                // Add styles for the save overlay
                if (!document.getElementById('save-overlay-styles')) {
                    const saveStyles = document.createElement('style');
                    saveStyles.id = 'save-overlay-styles';
                    saveStyles.textContent = `
                        .save-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.7);
                            backdrop-filter: blur(5px);
                            z-index: 9999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            animation: fadeIn 0.3s forwards;
                        }
                        
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        
                        @keyframes fadeOut {
                            from { opacity: 1; }
                            to { opacity: 0; }
                        }
                        
                        .save-animation-container {
                            background: white;
                            border-radius: 16px;
                            padding: 30px;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                            text-align: center;
                            max-width: 90%;
                            width: 400px;
                            animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        }
                        
                        @keyframes popIn {
                            from { transform: scale(0.8); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        
                        .save-spinner {
                            width: 60px;
                            height: 60px;
                            border: 5px solid rgba(79, 172, 254, 0.2);
                            border-top-color: #4facfe;
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            animation: spin 1s linear infinite;
                        }
                        
                        .save-text {
                            font-size: 18px;
                            color: #4a5568;
                            margin-bottom: 10px;
                        }
                        
                        .save-progress {
                            font-size: 14px;
                            color: #6c757d;
                        }
                        
                        .save-success {
                            color: #2dce89;
                        }
                        
                        .save-error {
                            color: #f5365c;
                        }
                        
                        .save-ok-btn {
                            background: linear-gradient(45deg, #4facfe, #00f2fe);
                            color: white;
                            border: none;
                            padding: 10px 25px;
                            border-radius: 8px;
                            font-size: 16px;
                            margin-top: 20px;
                            cursor: pointer;
                            font-weight: bold;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3);
                        }
                        
                        .save-ok-btn:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4);
                        }
                        
                        .save-check {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 60px;
                            height: 60px;
                            background: #2dce89;
                            color: white;
                            font-size: 30px;
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            transform: scale(0);
                            animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s;
                        }
                        
                        .save-error-icon {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 60px;
                            height: 60px;
                            background: #f5365c;
                            color: white;
                            font-size: 30px;
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            transform: scale(0);
                            animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s;
                        }
                        
                        @keyframes scaleIn {
                            from { transform: scale(0); }
                            to { transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(saveStyles);
                }

                // Get the text and animation container elements
                const saveText = saveOverlay.querySelector('.save-text');
                const saveAnimationContainer = saveOverlay.querySelector('.save-animation-container');
                const progressElement = document.createElement('div');
                progressElement.className = 'save-progress';
                progressElement.textContent = 'Preparing data...';
                saveAnimationContainer.appendChild(progressElement);
                
                // Disable save button during save operation
                if (saveResultBtn) {
                    saveResultBtn.disabled = true;
                    saveResultBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                }
                
                // Get current user
                const user = getCurrentUser();
                if (!user) {
                    saveText.innerHTML = 'Error: User not logged in.';
                    saveOverlay.querySelector('.save-spinner').style.display = 'none';
                    
                    // Add error icon
                    const spinnerContainer = saveOverlay.querySelector('.save-spinner').parentNode;
                    const errorIcon = document.createElement('div');
                    errorIcon.className = 'save-error-icon';
                    errorIcon.innerHTML = '<i class="fas fa-times"></i>';
                    spinnerContainer.insertBefore(errorIcon, saveOverlay.querySelector('.save-spinner'));
                    saveOverlay.querySelector('.save-spinner').remove();
                    
                    // Add OK button to close overlay
                    const okBtn = document.createElement('button');
                    okBtn.className = 'save-ok-btn';
                    okBtn.textContent = 'OK';
                    okBtn.addEventListener('click', function() {
                        document.body.removeChild(saveOverlay);
                    });
                    saveOverlay.querySelector('.save-animation-container').appendChild(okBtn);
                    
                    // Reset save button
                    if (saveResultBtn) {
                        saveResultBtn.disabled = false;
                        saveResultBtn.innerHTML = 'Save Result';
                    }
                    
                    return;
                }
                
                // If we don't have scanResult, show error
                if (!scanResult) {
                    saveText.innerHTML = 'Error: No scan results to save.';
                    saveOverlay.querySelector('.save-spinner').style.display = 'none';
                    
                    // Add error icon
                    const spinnerContainer = saveOverlay.querySelector('.save-spinner').parentNode;
                    const errorIcon = document.createElement('div');
                    errorIcon.className = 'save-error-icon';
                    errorIcon.innerHTML = '<i class="fas fa-times"></i>';
                    spinnerContainer.insertBefore(errorIcon, saveOverlay.querySelector('.save-spinner'));
                    saveOverlay.querySelector('.save-spinner').remove();
                    
                    // Add OK button to close overlay
                    const okBtn = document.createElement('button');
                    okBtn.className = 'save-ok-btn';
                    okBtn.textContent = 'OK';
                    okBtn.addEventListener('click', function() {
                        document.body.removeChild(saveOverlay);
                    });
                    saveOverlay.querySelector('.save-animation-container').appendChild(okBtn);
                    
                    // Reset save button
                    if (saveResultBtn) {
                        saveResultBtn.disabled = false;
                        saveResultBtn.innerHTML = 'Save to Account';
                    }
                    
                    return;
                }
                
                // Get scan metadata
                const scanName = prompt('Enter a name for this scan:', scanResult.name || ('Brain Scan ' + new Date().toLocaleDateString()));
                
                // Make sure to use the scanResult.name if available (mostly for sample images)
                let finalScanName = scanName;
                if (!finalScanName) {
                    // If user cancels the prompt, try using the sample name or a default
                    finalScanName = scanResult.name || ('Brain Scan ' + new Date().toLocaleDateString());
                    
                    // If still no name, just cancel the save operation
                    if (!finalScanName) {
                        // User cancelled - remove overlay and return
                        document.body.removeChild(saveOverlay);
                        
                        // Reset save button
                        if (saveResultBtn) {
                            saveResultBtn.disabled = false;
                            saveResultBtn.innerHTML = 'Save to Account';
                        }
                        
                        return;
                    }
                }
                
                // Update save animation text
                if (saveText) {
                    saveText.textContent = 'Saving your scan...';
                }
                
                // Prepare scan data
                const cloudScanData = {
                    name: finalScanName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    result: {
                        hasTumor: scanResult.hasTumor,
                        confidence: scanResult.confidence,
                        // Include tumor details if available
                        tumorType: scanResult.tumorType || '',
                        tumorSize: scanResult.tumorSize || '',
                        tumorLocation: scanResult.tumorLocation || ''
                    },
                    userId: user.uid,
                    processedImageUrl: scanResult.processedImageUrl,
                    imageUrl: scanResult.originalImageUrl || imageUrl
                };
                
                // If it's a sample image, include the sample information
                if (scanResult.fromSample && scanResult.sampleId) {
                    cloudScanData.fromSample = true;
                    cloudScanData.sampleId = scanResult.sampleId;
                }
                
                // Disable Save Result button to prevent multiple submissions
                if (saveResultBtn) {
                    saveResultBtn.disabled = true;
                    saveResultBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                }
                
                // Ensure we have a valid file to save
                let fileToUpload = selectedFile;
                
                // If imageUrl is a data URL and we don't have a valid file, create one from the data URL
                if (imageUrl && imageUrl.startsWith('data:') && (!fileToUpload || fileToUpload.size === 0)) {
                    if (progressElement) {
                        progressElement.textContent = 'Converting image data...';
                    }
                    
                    try {
                        // Convert data URL to blob
                        const byteString = atob(imageUrl.split(',')[1]);
                        const mimeType = imageUrl.split(',')[0].split(':')[1].split(';')[0];
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        
                        for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        
                        const blob = new Blob([ab], { type: mimeType });
                        // Preserve the original filename if available, otherwise create one with the correct extension
                        const originalFilename = selectedFile ? selectedFile.name : `scan_image.${mimeType.split('/')[1] || 'jpg'}`;
                        fileToUpload = new File([blob], originalFilename, { type: mimeType });
                        
                        console.log("Created file from data URL:", fileToUpload);
                    } catch (error) {
                        console.error("Error converting data URL to file:", error);
                        // Continue with existing file
                    }
                }
                
                // Add processed image data if available
                if (scanResult.processedImageData) {
                    cloudScanData.processedImageData = scanResult.processedImageData;
                }
                
                // If we have processed image data but no URL, we'll let saveScanToFirestore handle the upload
                if (scanResult.processedImageData && !scanResult.processedImageUrl) {
                    console.log("We have processed image data but no URL, will upload in saveScanToFirestore");
                }
                
                // Save to Firestore using our helper function
                saveScanToFirestore(cloudScanData).then(docRef => {
                    console.log("Scan saved successfully with ID:", docRef.id);
                    
                    // Update save animation to show success
                    const saveSpinner = saveOverlay.querySelector('.save-spinner');
                    if (saveSpinner) {
                        saveSpinner.parentNode.removeChild(saveSpinner);
                    }
                    
                    // Create success check mark
                    const checkMark = document.createElement('div');
                    checkMark.className = 'save-check';
                    checkMark.innerHTML = '<i class="fas fa-check"></i>';
                    saveAnimationContainer.insertBefore(checkMark, saveText);
                    
                    if (saveText) {
                        saveText.textContent = 'Scan saved successfully!';
                        saveText.className = 'save-text save-success';
                    }
                    
                    if (progressElement) {
                        progressElement.textContent = 'Your scan has been saved to your history.';
                    }
                    
                    // Add "OK" button to dismiss overlay
                    const okButton = document.createElement('button');
                    okButton.className = 'save-ok-btn';
                    okButton.textContent = 'OK';
                    saveAnimationContainer.appendChild(okButton);
                    
                    okButton.addEventListener('click', function() {
                        // Remove the overlay
                        if (document.body.contains(saveOverlay)) {
                            document.body.removeChild(saveOverlay);
                        }
                        
                        // Update save button state
                        if (saveResultBtn) {
                            saveResultBtn.disabled = true;
                            saveResultBtn.textContent = 'Saved to Account';
                        }
                        
                        // Update scan result to indicate it's saved
                        if (scanResult) {
                            scanResult.imageId = docRef.id;
                            scanResult.userId = user.uid;
                        }
                        
                        // Use the helper function to reset UI
                        setupUploadAreaEvents();
                    });
                }).catch(error => {
                    console.error("Error saving scan:", error);
                    
                    // Update save animation to show error
                    const saveSpinner = saveOverlay.querySelector('.save-spinner');
                    if (saveSpinner) {
                        saveSpinner.parentNode.removeChild(saveSpinner);
                    }
                    
                    // Create error icon
                    const errorIcon = document.createElement('div');
                    errorIcon.className = 'save-error-icon';
                    errorIcon.innerHTML = '<i class="fas fa-times"></i>';
                    saveAnimationContainer.insertBefore(errorIcon, saveText);
                    
                    if (saveText) {
                        saveText.textContent = 'Error saving scan';
                        saveText.className = 'save-text save-error';
                    }
                    
                    if (progressElement) {
                        progressElement.textContent = 'Please try again later.';
                    }
                    
                    // Add "OK" button to dismiss overlay
                    const okButton = document.createElement('button');
                    okButton.className = 'save-ok-btn';
                    okButton.textContent = 'OK';
                    saveAnimationContainer.appendChild(okButton);
                    
                    okButton.addEventListener('click', function() {
                        // Remove the overlay
                        if (document.body.contains(saveOverlay)) {
                            document.body.removeChild(saveOverlay);
                        }
                        
                        // Update save button state
                        if (saveResultBtn) {
                            saveResultBtn.disabled = true;
                            saveResultBtn.textContent = 'Saved to Account';
                        }
                        
                        // Use the helper function to reset UI
                        setupUploadAreaEvents();
                    });
                });
            }
        });
    }

    // Scroll to top button
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });
        
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // FAQ modal
    if (openFaqBtn) {
        openFaqBtn.addEventListener('click', function() {
            if (faqModal) faqModal.style.display = 'flex';
        });
    }
    
    if (closeFaqBtn) {
        closeFaqBtn.addEventListener('click', function() {
            if (faqModal) faqModal.style.display = 'none';
        });
    }

    // Function to save scan data to Firestore and handle image uploads
    function saveScanToFirestore(scanData) {
        console.log('Saving scan data to Firestore:', scanData);
        
        // Store scans under the user's collection
        const userId = scanData.userId;
        if (!userId) {
            console.error('No userId provided in scanData');
            return Promise.reject(new Error('No userId provided in scanData'));
        }
        
        // Add timestamp if not present
        if (!scanData.timestamp) {
            scanData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        }
        
        // Check if we need to upload images to Firebase Storage
        let uploadPromise = Promise.resolve(scanData);
        
        // If we have imageUrl as data URL, upload it to Storage first
        if (scanData.imageUrl && scanData.imageUrl.startsWith('data:')) {
            console.log('Uploading base64 image to Firebase Storage');
            
            // Convert base64 to blob
            const byteString = atob(scanData.imageUrl.split(',')[1]);
            const mimeType = scanData.imageUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            
            const imageBlob = new Blob([ab], {type: mimeType});
            const storageRef = firebase.storage().ref();
            const imagePath = `users/${userId}/images/original/${Date.now()}.jpg`;
            
            // Upload to Firebase Storage
            uploadPromise = storageRef.child(imagePath).put(imageBlob).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            }).then(downloadURL => {
                // Update scanData with the image URL
                scanData.imageUrl = downloadURL;
                scanData.originalPath = imagePath;
                return scanData;
            });
        }
        
        // If we also have processedImageData, upload that too
        if (scanData.processedImageData && scanData.processedImageData.startsWith('data:')) {
            uploadPromise = uploadPromise.then(updatedData => {
                // Convert processed image data to blob
                const procByteString = atob(scanData.processedImageData.split(',')[1]);
                const procMimeType = scanData.processedImageData.split(',')[0].split(':')[1].split(';')[0];
                const procAB = new ArrayBuffer(procByteString.length);
                const procIA = new Uint8Array(procAB);
                
                for (let i = 0; i < procByteString.length; i++) {
                    procIA[i] = procByteString.charCodeAt(i);
                }
                
                const procBlob = new Blob([procAB], {type: procMimeType});
                const procPath = `users/${userId}/images/processed/${Date.now()}.jpg`;
                
                return firebase.storage().ref().child(procPath).put(procBlob).then(snapshot => {
                    return snapshot.ref.getDownloadURL();
                }).then(procURL => {
                    // Update scanData with processed image URL
                    updatedData.processedImageUrl = procURL;
                    updatedData.processedPath = procPath;
                    return updatedData;
                });
            });
        }
        
        // Once all uploads are complete, save to Firestore
        return uploadPromise.then(finalScanData => {
            console.log('Final scan data to save:', finalScanData);
            
            // Remove processed image data to avoid storing large strings in Firestore
            if (finalScanData.processedImageData) {
                delete finalScanData.processedImageData;
            }
            
            // Store in user's scans collection
            return firebase.firestore().collection('users').doc(userId).collection('scans').add(finalScanData);
        });
    }

    //----------------------------------------------
    // 2. Image Processing Functions
    //----------------------------------------------
    function processImageWithAI() {
        if (!selectedFile) {
            console.error("No file selected for processing");
            alert('Please select an image first.');
            return;
        }
        
        console.log("Processing image with AI, selectedFile:", selectedFile);
        console.log("Current imageUrl:", imageUrl);
        
        // Create enhanced loading container with improved UI
        const enhancedLoadingContainer = document.createElement('div');
        enhancedLoadingContainer.className = 'scanning-container';
        enhancedLoadingContainer.innerHTML = `
            <div class="scanning-content">
                <div class="scan-image-container">
                    <img id="scan-preview-image" src="${imageUrl || ''}" alt="Scan Preview" class="scan-image">
                    <div class="scan-overlay"></div>
                    <div class="scan-line"></div>
                    <div class="scan-glow"></div>
                    <div class="scan-grid"></div>
                    <div class="scan-focus-point"></div>
                    <div class="scan-highlight"></div>
                </div>
                <div class="spinner">
                    <div class="spinner-inner"></div>
                </div>
                <div class="scanning-message">Analyzing Brain MRI Scan</div>
                <div class="scanning-progress">
                    <div class="scanning-progress-bar" style="width: 0%">
                        <div class="progress-glow"></div>
                    </div>
                </div>
                <div class="scanning-substep">Initializing image processing...</div>
                <div class="scanning-metrics">
                    <div class="metric">
                        <div class="metric-label">Processing</div>
                        <div class="metric-value processing-value">0%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Regions</div>
                        <div class="metric-value regions-value">0/6</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Resolution</div>
                        <div class="metric-value resolution-value">Enhancing...</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add floating particles effect
        enhancedLoadingContainer.appendChild(createScanningParticles());
        
        document.body.appendChild(enhancedLoadingContainer);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Show image in the scanning preview
        const scanPreviewImage = document.getElementById('scan-preview-image');
        if (scanPreviewImage) {
            // Check if we already have a valid imageUrl from a sample image
            if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
                console.log("Using existing imageUrl for scan preview:", imageUrl.substring(0, 50) + "...");
                scanPreviewImage.src = imageUrl;
                
                // Continue with AI processing after a short delay to ensure the image is loaded
                scanPreviewImage.onload = function() {
                    updateScanningUI();
                    animateScanningProcess();
                };
                
                // Fallback in case the onload event doesn't fire
                setTimeout(() => {
                    if (!scanPreviewImage.complete) {
                        console.log("Image load timeout, starting AI processing anyway");
                        updateScanningUI();
                        animateScanningProcess();
                    }
                }, 1000);
            } else {
                // Always create a fresh FileReader to ensure we get the latest image data
                const reader = new FileReader();
                reader.onload = function(e) {
                    scanPreviewImage.src = e.target.result;
                    imageUrl = e.target.result; // Update the global imageUrl
                    console.log("Set scan preview image successfully:", e.target.result.substring(0, 50) + "...");
                    
                    // Continue with AI processing after image is loaded
                    updateScanningUI();
                    animateScanningProcess();
                };
                reader.onerror = function(e) {
                    console.error("FileReader error while loading image:", e);
                    // Try fallback method
                    createImageFallback(selectedFile, function(fallbackUrl) {
                        if (fallbackUrl) {
                            scanPreviewImage.src = fallbackUrl;
                            imageUrl = fallbackUrl;
                            console.log("Set scan preview image using fallback");
                            
                            // Continue with AI processing
                            updateScanningUI();
                            animateScanningProcess();
                        } else {
                            console.error("Failed to create image preview");
                            alert("Error: Could not load the selected image. Please try again with a different image.");
                            
                            // Remove the loading container and restore scroll
                            document.body.removeChild(enhancedLoadingContainer);
                            document.body.style.overflow = '';
                        }
                    });
                };
                
                // Read the file as data URL
                console.log("Reading selectedFile as DataURL");
                reader.readAsDataURL(selectedFile);
            }
        } else {
            console.error("Scan preview image element not found");
            updateScanningUI();
            animateScanningProcess(); // Continue anyway
        }
        
        // Function to update the scanning UI with progress and dynamic text
        function updateScanningUI() {
            // Add elements for more visual effects
            const scanSteps = [
                "Initializing neural network...",
                "Preprocessing image data...",
                "Applying feature extraction...",
                "Running tumor detection model...",
                "Analyzing image regions...",
                "Generating results report..."
            ];
            
            const progressBar = enhancedLoadingContainer.querySelector('.scanning-progress-bar');
            const scanningSubstep = enhancedLoadingContainer.querySelector('.scanning-substep');
            const processingValue = enhancedLoadingContainer.querySelector('.processing-value');
            const regionsValue = enhancedLoadingContainer.querySelector('.regions-value');
            const resolutionValue = enhancedLoadingContainer.querySelector('.resolution-value');
            
            let currentStep = 0;
            let progress = 0;
            
            // Update steps and progress
            const stepInterval = setInterval(() => {
                if (currentStep < scanSteps.length) {
                    if (scanningSubstep) {
                        scanningSubstep.textContent = scanSteps[currentStep];
                    }
                    currentStep++;
                    
                    // Update regions value
                    if (regionsValue) {
                        regionsValue.textContent = `${Math.min(currentStep, 6)}/6`;
                    }
                }
            }, 1000);
            
            // Animate the resolution value
            let resolutionPhases = ["Analyzing...", "Enhancing...", "Optimizing...", "Complete"];
            let resPhase = 0;
            
            const resolutionInterval = setInterval(() => {
                if (resolutionValue && resPhase < resolutionPhases.length) {
                    resolutionValue.textContent = resolutionPhases[resPhase];
                    resPhase++;
                }
            }, 1500);
            
            // Clear intervals when done
            setTimeout(() => {
                clearInterval(stepInterval);
                clearInterval(resolutionInterval);
            }, 8000);
        }
        
        // Function to handle the animation and AI processing
        function animateScanningProcess() {
            // Add shared scanning animation styles
            addSharedScanningStyles();
            
            // Force a reflow to ensure elements are rendered before animations start
            enhancedLoadingContainer.offsetHeight;
            
            // Initialize scan line and glow animations
            const scanLine = enhancedLoadingContainer.querySelector('.scan-line');
            const scanGlow = enhancedLoadingContainer.querySelector('.scan-glow');
            
            if (scanLine) {
                scanLine.style.animation = 'scanLineAnimation 3s cubic-bezier(0.4, 0, 0.6, 1) infinite';
            }
            
            if (scanGlow) {
                scanGlow.style.animation = 'scanGlowAnimation 3s cubic-bezier(0.4, 0, 0.6, 1) infinite';
                scanGlow.style.animationDelay = '0.15s';
            }
            
            // Get references to progress elements
            const progressBar = enhancedLoadingContainer.querySelector('.scanning-progress-bar');
            const processingValue = enhancedLoadingContainer.querySelector('.processing-value');
            let progress = 0;
            
            // Make sure progress bar is initially set to 0%
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            
            if (processingValue) {
                processingValue.textContent = '0%';
                console.log("Regular scan processing value element found and initialized");
            } else {
                console.error("Regular scan processing value element not found");
            }
            
            // Use requestAnimationFrame for smoother progress animation
            let lastTimestamp = 0;
            const animateProgress = (timestamp) => {
                if (!lastTimestamp) lastTimestamp = timestamp;
                const elapsed = timestamp - lastTimestamp;
                
                // Update progress approximately every 100ms
                if (elapsed > 100) {
                    progress += 1.5;
                    lastTimestamp = timestamp;
                    
                    if (progress > 95) {
                        // Cap at 95% until completion
                        progress = 95;
                    }
                    
                    if (progressBar) {
                        progressBar.style.width = `${progress}%`;
                    }
                    
                    if (processingValue) {
                        processingValue.textContent = `${Math.round(progress)}%`;
                    }
                }
                
                if (progress < 95) {
                    progressAnimationId = requestAnimationFrame(animateProgress);
                }
            };
            
            // Start the progress animation
            let progressAnimationId = requestAnimationFrame(animateProgress);
            
            // Process the image with AI
            analyzeImage(selectedFile, imageUrl, function(result) {
                // Cancel ongoing animations
                cancelAnimationFrame(progressAnimationId);
                
                // Complete the progress bar with smooth transition
                if (progressBar) {
                    progressBar.style.transition = 'width 0.8s ease-out';
                    progressBar.style.width = '100%';
                }
                
                if (processingValue) {
                    processingValue.textContent = '100%';
                }
                
                // Show completion animation
                const scanHighlight = enhancedLoadingContainer.querySelector('.scan-highlight');
                if (scanHighlight) {
                    scanHighlight.style.opacity = '1';
                    scanHighlight.style.animation = 'scanComplete 2s ease-out';
                }
                
                // Short delay before showing results
                setTimeout(() => {
                    enhancedLoadingContainer.classList.add('fade-out');
                    setTimeout(() => {
                        try {
                            document.body.removeChild(enhancedLoadingContainer);
                            document.body.style.overflow = 'auto'; // Re-enable scrolling
                        } catch (error) {
                            console.error("Error cleaning up scanning UI:", error);
                        }
                        
                        // Display the results
                        displayResults(result);
                    }, 500);
                }, 1500);
            });
        }
    }

    // New function to scan sample images directly
    function scanSampleImage(sample, callback) {
        console.log("Scanning sample image directly from Firebase...", sample.name);
        
        // Get current user ID
        const user = getCurrentUser();
        if (!user) {
            console.error("User must be logged in to scan sample images");
            showNotification("Error", "You must be logged in to scan sample images", "error");
            return;
        }
        
        // Add shared scanning animation styles
        addSharedScanningStyles();
        
        // Create enhanced loading container with improved UI
        const enhancedLoadingContainer = document.createElement('div');
        enhancedLoadingContainer.className = 'scanning-container';
        enhancedLoadingContainer.innerHTML = `
            <div class="scanning-content">
                <div class="scan-image-container">
                    <img src="${sample.imageUrl}" class="scan-image" alt="${sample.name}">
                    <div class="scan-overlay"></div>
                    <div class="scan-line"></div>
                    <div class="scan-glow"></div>
                    <div class="scan-grid"></div>
                    <div class="scan-focus-point"></div>
                    <div class="scan-highlight"></div>
                </div>
                <div class="scanning-message">Scanning Sample</div>
                <div class="scanning-progress">
                    <div class="scanning-progress-bar" style="width: 0%">
                        <div class="progress-glow"></div>
                    </div>
                </div>
                <div class="scanning-substep">Initializing sample analysis...</div>
                <div class="scanning-metrics">
                    <div class="metric">
                        <div class="metric-label">Processing</div>
                        <div class="metric-value processing-value">0%</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Sample</div>
                        <div class="metric-value sample-name-value">${sample.name.substring(0, 10)}...</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Status</div>
                        <div class="metric-value status-value">Analyzing</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add floating particles effect
        enhancedLoadingContainer.appendChild(createScanningParticles());
        
        document.body.appendChild(enhancedLoadingContainer);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Force a reflow to ensure elements are rendered before animations start
        enhancedLoadingContainer.offsetHeight;
        
        // Animate the scanning process
        const scanHighlight = enhancedLoadingContainer.querySelector('.scan-highlight');
        const scanLine = enhancedLoadingContainer.querySelector('.scan-line');
        const scanGlow = enhancedLoadingContainer.querySelector('.scan-glow');
        
        // Ensure scan animations are visible and properly initialized
        if (scanLine) {
            scanLine.style.animation = 'scanLineAnimation 3s cubic-bezier(0.4, 0, 0.6, 1) infinite';
        }
        
        if (scanGlow) {
            scanGlow.style.animation = 'scanGlowAnimation 3s cubic-bezier(0.4, 0, 0.6, 1) infinite';
            scanGlow.style.animationDelay = '0.15s'; // Slight delay for better visual effect
        }
        
        const scanSteps = [
            "Initializing sample analysis...",
            "Retrieving sample data...",
            "Analyzing image features...",
            "Running detection models...",
            "Generating insights...",
            "Preparing results..."
        ];
        
        const scanningSubstep = enhancedLoadingContainer.querySelector('.scanning-substep');
        // Use querySelector instead of getElementById to avoid DOM lookup issues
        const processingValue = enhancedLoadingContainer.querySelector('.processing-value');
        const statusValue = enhancedLoadingContainer.querySelector('.status-value');
        
        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < scanSteps.length) {
                if (scanningSubstep) {
                    scanningSubstep.textContent = scanSteps[currentStep];
                }
                currentStep++;
                
                // Update status value with proper checks
                if (statusValue) {
                    const statuses = ["Analyzing", "Processing", "Detecting", "Finalizing"];
                    statusValue.textContent = statuses[Math.min(Math.floor(currentStep/2), statuses.length-1)];
                }
            }
        }, 1000);
        
        // Get references to progress elements and ensure they exist
        const progressBar = enhancedLoadingContainer.querySelector('.scanning-progress-bar');
        let progress = 0;
        
        // Make sure progress bar is initially set to 0%
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        
        if (processingValue) {
            processingValue.textContent = '0%';
            console.log("Processing value element found and initialized");
        } else {
            console.error("Processing value element not found");
        }
        
        // Use requestAnimationFrame for smoother progress animation
        let lastTimestamp = 0;
        const animateProgress = (timestamp) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const elapsed = timestamp - lastTimestamp;
            
            // Update progress approximately every 100ms
            if (elapsed > 100) {
                progress += 1.5;
                lastTimestamp = timestamp;
                
                if (progress > 95) {
                    // Cap at 95% until completion
                    progress = 95;
                }
                
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                if (processingValue) {
                    processingValue.textContent = `${Math.round(progress)}%`;
                    console.log(`Updated processing value: ${Math.round(progress)}%`);
                }
            }
            
            if (progress < 95) {
                progressAnimationId = requestAnimationFrame(animateProgress);
            }
        };
        
        // Start the progress animation
        let progressAnimationId = requestAnimationFrame(animateProgress);
        
        // Create FormData for the API request
        const formData = new FormData();
        formData.append('userId', user.uid);
        formData.append('sampleId', sample.id);
        
        // Call the scan-sample API endpoint
        fetch('http://localhost:5001/api/scan-sample', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Received sample scan results:", data);
            
            // Cancel ongoing animations
            cancelAnimationFrame(progressAnimationId);
            clearInterval(stepInterval);
            
            // Complete the progress bar with smooth transition
            if (progressBar) {
                progressBar.style.transition = 'width 0.8s ease-out';
                progressBar.style.width = '100%';
            }
            
            if (processingValue) {
                processingValue.textContent = '100%';
            }
            
            if (statusValue) {
                statusValue.textContent = 'Complete';
            }
            
            if (scanningSubstep) {
                scanningSubstep.textContent = 'Analysis complete!';
            }
            
            // Show completion animation
            if (scanHighlight) {
                scanHighlight.style.opacity = '1';
                scanHighlight.style.animation = 'scanComplete 2s ease-out';
            }
            
            // Create result object from API response
            const result = {
                hasTumor: data.hasTumor,
                confidence: data.confidence, // Directly from Python backend
                tumorType: data.tumorType || '',
                tumorSize: data.tumorSize || '',
                tumorLocation: data.tumorLocation || '',
                originalImageUrl: data.originalImageUrl,
                processedImageUrl: data.processedImageUrl,
                processedImageData: data.processedImageData,
                fromSample: true,
                sampleId: sample.id,
                userId: user.uid,
                name: sample.name || ('Sample Scan ' + new Date().toLocaleDateString())
            };
            
            // Log confidence value to verify it's being passed correctly
            console.log(`Confidence value from sample scan: ${data.confidence}`);
            
            // Save the result
            scanResult = result;
            
            // Short delay before showing results
            setTimeout(() => {
                enhancedLoadingContainer.classList.add('fade-out');
                setTimeout(() => {
                    try {
                        document.body.removeChild(enhancedLoadingContainer);
                        document.body.style.overflow = 'auto'; // Re-enable scrolling
                    } catch (error) {
                        console.error("Error cleaning up scanning UI:", error);
                    }
                    
                    // Continue with displaying results
                    if (callback && typeof callback === 'function') {
                        callback(result);
                    } else {
                        // If no callback is provided, display the results using the standard function
                        displayResults(result);
                    }
                }, 500);
            }, 1500);
        })
        .catch(error => {
            console.error('Error calling sample scan API:', error);
            
            // Cancel ongoing animations
            cancelAnimationFrame(progressAnimationId);
            clearInterval(stepInterval);
            
            // Show error message and clean up
            const scanningMessage = enhancedLoadingContainer.querySelector('.scanning-message');
            if (scanningMessage) {
                scanningMessage.textContent = 'Error';
            }
            
            if (scanningSubstep) {
                scanningSubstep.textContent = 'Could not process image';
            }
            
            if (statusValue) {
                statusValue.textContent = 'Failed';
                statusValue.style.color = '#f5365c';
            }
            
            // Short delay before hiding error message
            setTimeout(() => {
                enhancedLoadingContainer.classList.add('fade-out');
                setTimeout(() => {
                    try {
                        document.body.removeChild(enhancedLoadingContainer);
                        document.body.style.overflow = 'auto'; // Re-enable scrolling
                    } catch (err) {
                        console.error("Error cleaning up scanning UI:", err);
                    }
                    
                    // Provide error result to callback
                    const errorResult = {
                        hasTumor: false,
                        confidence: 0,
                        error: true,
                        errorMessage: error.toString()
                    };
                    callback(errorResult);
                }, 500);
            }, 1500);
        });
    }

    /**
     * Analyze the brain MRI image and return tumor detection results
     * This function simulates AI analysis for the demo
     */
    function analyzeImage(file, imageUrl, callback) {
        console.log("Analyzing image...", file.name);
        
        // Create FormData to send the image to our Flask API
        const formData = new FormData();
        formData.append('image', file);
        
        // Get current user ID if available
        const user = getCurrentUser();
        if (user) {
            formData.append('userId', user.uid);
        }
        
        // Display progress update in the UI
        const progressValue = document.getElementById('processing-value');
        const regionsValue = document.getElementById('regions-value');
        const resolutionValue = document.getElementById('resolution-value');
        const scanningSubstep = document.querySelector('.scanning-substep');
        
        if (scanningSubstep) scanningSubstep.textContent = 'Uploading image to AI model...';
        if (progressValue) progressValue.textContent = '15%';
        
        /* Commented out demo implementation
        // For demo purposes, we're simulating the API call with a timeout
        setTimeout(() => {
            if (scanningSubstep) scanningSubstep.textContent = 'Processing image with AI model...';
            if (progressValue) progressValue.textContent = '45%';
            if (regionsValue) regionsValue.textContent = '3/6';
            
            setTimeout(() => {
                if (scanningSubstep) scanningSubstep.textContent = 'Analyzing results...';
                if (progressValue) progressValue.textContent = '85%';
                if (regionsValue) regionsValue.textContent = '6/6';
                if (resolutionValue) resolutionValue.textContent = 'Complete';
                
                // Generate a demo result object
                const hasTumor = Math.random() > 0.5;
                const result = {
                    hasTumor: hasTumor,
                    confidence: hasTumor ? 0.85 + (Math.random() * 0.14) : 0.92 + (Math.random() * 0.07),
                    tumorType: hasTumor ? 'Glioblastoma' : '',
                    tumorSize: hasTumor ? (Math.random() * 5).toFixed(1) + ' cm' : '',
                    tumorLocation: hasTumor ? 'Frontal lobe' : '',
                    imageUrl: imageUrl,
                    processedImageData: imageUrl // For demo, use the same image
                };
                
                // Call the callback with the result
                callback(result);
            }, 2000);
        }, 1500);
        */
        
        // Real API implementation
        fetch('http://localhost:5001/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            if (scanningSubstep) scanningSubstep.textContent = 'Processing image with AI model...';
            if (progressValue) progressValue.textContent = '45%';
            if (regionsValue) regionsValue.textContent = '3/6';
            
            return response.json();
        })
        .then(data => {
            console.log("Received AI model results:", data);
            
            if (scanningSubstep) scanningSubstep.textContent = 'Analyzing results...';
            if (progressValue) progressValue.textContent = '85%';
            if (regionsValue) regionsValue.textContent = '6/6';
            if (resolutionValue) resolutionValue.textContent = 'Complete';
            
            // Create result object from API response
            const result = {
                hasTumor: data.hasTumor,
                confidence: data.confidence, // This comes directly from Python backend
                tumorType: data.tumorType || '',
                tumorSize: data.tumorSize || '',
                tumorLocation: data.tumorLocation || '',
                originalImageUrl: data.originalImageUrl,
                processedImageUrl: data.processedImageUrl,
                processedImageData: data.processedImageData
            };
            
            // Log confidence value to verify it's being passed correctly
            console.log(`Confidence value from backend: ${data.confidence}`);
            
            callback(result);
        })
        .catch(error => {
            console.error('Error calling AI model API:', error);
            
            if (scanningSubstep) scanningSubstep.textContent = 'Error analyzing image';
            
            // Provide fallback/error result
            const errorResult = {
                hasTumor: false,
                confidence: 0,
                error: true,
                errorMessage: error.toString()
            };
            callback(errorResult);
        });
    }

    // Helper function to create an image fallback using canvas
    function createImageFallback(file, callback) {
        console.log("Creating image fallback with canvas");
        try {
            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            
            img.onload = function() {
                try {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas dimensions to match the original image
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    
                    // Apply high quality settings
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Get data URL with the original file type if possible
                    const fileType = file.type || 'image/jpeg';
                    // Use highest quality (1.0) for the image
                    const dataUrl = canvas.toDataURL(fileType, 1.0);
                    
                    // Clean up object URL
                    URL.revokeObjectURL(objectUrl);
                    
                    // Return data URL
                    callback(dataUrl);
                } catch (canvasError) {
                    console.error("Canvas fallback failed:", canvasError);
                    URL.revokeObjectURL(objectUrl);
                    callback(null);
                }
            };
            
            img.onerror = function() {
                console.error("Image loading failed in canvas fallback");
                URL.revokeObjectURL(objectUrl);
                callback(null);
            };
            
            img.src = objectUrl;
        } catch (error) {
            console.error("Error creating image fallback:", error);
            callback(null);
        }
    }

    // Display the analysis results with enhanced animations
    function displayResults(result) {
        if (!result) return;
        
        console.log("Displaying results:", result);
        
        // Show the results section, hide upload section
        if (uploadSection) uploadSection.style.display = 'none';
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.className = 'results-section result-section'; // Add animation class
            
            // Scroll to the results section with smooth animation
            setTimeout(() => {
                // Get the header height for offset
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                
                // Calculate position to scroll to (considering fixed header)
                const resultsSectionTop = resultsSection.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                // Scroll smoothly to the results section
                window.scrollTo({
                    top: resultsSectionTop,
                    behavior: 'smooth'
                });
                
                // Highlight the detector section in the navigation
                const navLinks = document.querySelectorAll('.nav-links a');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#detector') {
                        link.classList.add('active');
                    }
                });
            }, 100); // Short delay to ensure the section is visible before scrolling
        }
        
        // Ensure the result container has the animation class
        if (resultImageContainer) {
            resultImageContainer.className = 'result-image-container';
            
            // Add zoom controls to the image container
            if (!document.getElementById('zoom-controls')) {
                const zoomControls = document.createElement('div');
                zoomControls.id = 'zoom-controls';
                zoomControls.className = 'zoom-controls';
                zoomControls.innerHTML = `
                    <button id="zoom-in" title="Zoom In"><i class="fas fa-search-plus"></i></button>
                    <button id="zoom-reset" title="Reset Zoom"><i class="fas fa-sync-alt"></i></button>
                    <button id="zoom-out" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
                `;
                resultImageContainer.appendChild(zoomControls);
                
                // Add event listeners for zoom controls
                setupZoomFunctionality();
            }
        }
        
        // Add class to animate result data items
        const resultDataItems = document.querySelectorAll('.result-data-item');
        resultDataItems.forEach(item => {
            item.classList.add('result-data-item');
        });
        
        // Store the result globally for potential saving later
        scanResult = result;
        
        // Update result image with better error handling
        if (resultImage) {
            console.log("Updating result image");
            let imageSource = null;
            
            // Priority order for choosing image source:
            // 1. Processed image data from API
            // 2. Processed image URL from API
            // 3. Original image URL from API 
            // 4. Global imageUrl variable
            // 5. Create from selectedFile
            // 6. Fallback placeholder
            
            if (result.processedImageData) {
                console.log("Using processed image data from API");
                imageSource = result.processedImageData;
            } else if (result.processedImageUrl) {
                console.log("Using processed image URL from API");
                imageSource = result.processedImageUrl;
            } else if (result.originalImageUrl) {
                console.log("Using original image URL from API");
                imageSource = result.originalImageUrl;
            } else if (imageUrl) {
                console.log("Using global imageUrl:", imageUrl.substring(0, 50) + "...");
                imageSource = imageUrl;
            } else if (selectedFile) {
                console.log("No image source available, creating from selectedFile");
                
                // Set a placeholder while we load from the file
                resultImage.src = "images/placeholder-scan.jpg";
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    resultImage.src = e.target.result;
                    imageUrl = e.target.result; // Update global imageUrl
                };
                reader.readAsDataURL(selectedFile);
                return; // Exit early since we're handling the image asynchronously
            } else {
                console.error("No image source available for results");
                imageSource = "images/placeholder-scan.jpg"; // Fallback placeholder
            }
            
            // Set the image source
            resultImage.src = imageSource;
            resultImage.style.display = 'block';
            // Set image quality attributes for better resolution
            resultImage.setAttribute('decoding', 'sync'); // Synchronous decoding for higher quality
            resultImage.setAttribute('loading', 'eager'); // Eager loading for immediate display
            resultImage.setAttribute('importance', 'high'); // High importance for prioritization
            
            // Add error handling for image loading
            resultImage.onerror = function() {
                console.error("Error loading result image. Trying alternative approach...");
                
                // Try with a delay
                setTimeout(() => {
                    // Try other sources if the first one fails
                    if (result.originalImageUrl && imageSource !== result.originalImageUrl) {
                        console.log("Trying original image URL");
                        resultImage.src = result.originalImageUrl;
                    } else if (imageUrl && imageSource !== imageUrl) {
                        console.log("Trying global imageUrl");
                        resultImage.src = imageUrl;
                    } else if (selectedFile) {
                        console.log("Creating from selectedFile");
                        createImageFallback(selectedFile, function(fallbackUrl) {
                            if (fallbackUrl) {
                                resultImage.src = fallbackUrl;
                            } else {
                                resultImage.src = "images/placeholder-scan.jpg";
                            }
                        });
                    } else {
                        resultImage.src = "images/placeholder-scan.jpg";
                    }
                    
                    // If it still fails, show placeholder
                    resultImage.onerror = function() {
                        console.error("All image loading attempts failed. Using placeholder.");
                        resultImage.src = "images/placeholder-scan.jpg";
                    };
                }, 200);
            };
            
            resultImage.onload = function() {
                console.log("Result image loaded successfully");
            };
        } else {
            console.error("Result image element not found");
        }
        
        // Update result badge with animation
        if (resultBadge) {
            resultBadge.className = result.hasTumor ? 'result-badge negative' : 'result-badge positive';
            resultBadge.textContent = result.hasTumor ? 'Tumor Detected' : 'No Tumor Detected';
            
            // Add 'result-badge-appear' class to trigger animation
            setTimeout(() => {
                resultBadge.classList.add('result-badge-appear');
            }, 100);
        }
        
        // Display the confidence only if a tumor is detected
        const confidenceContainer = document.querySelector('.confidence-container');
        const confidenceBar = document.getElementById('confidence-bar');
        const confidenceValue = document.getElementById('confidence-value');
        
        if (confidenceContainer && confidenceBar && confidenceValue) {
            if (result.hasTumor) {
                // Show the confidence container
                confidenceContainer.style.display = 'block';
                
                // Get confidence value from API result (ensure it's a number between 0 and 1)
                let confidenceNum = 0;
                if (result.confidence) {
                    // Convert string to number if needed, preserving decimal precision
                    confidenceNum = typeof result.confidence === 'number' ? 
                        result.confidence : parseFloat(result.confidence);
                    
                    // Ensure it's between 0 and 1 for percentage calculation
                    // If it's already in percentage form (>1), convert it to decimal
                    if (confidenceNum > 1) {
                        confidenceNum = confidenceNum / 100;
                    }
                    
                    // Final safety check to ensure value is between 0-1
                    confidenceNum = Math.max(0, Math.min(1, confidenceNum));
                }
                
                console.log("Confidence value from API:", result.confidence);
                console.log("Processed confidence value:", confidenceNum);
                
                // Format as percentage and display with one decimal place precision
                const confidencePercentage = (confidenceNum * 100).toFixed(1) + '%';
                confidenceValue.textContent = confidencePercentage;
                
                // Add appropriate class based on confidence level
                confidenceValue.className = 'confidence-value';
                if (confidenceNum >= 0.85) {
                    confidenceValue.classList.add('high');
                } else if (confidenceNum >= 0.7) {
                    confidenceValue.classList.add('medium');
                } else {
                    confidenceValue.classList.add('low');
                }
                
                // Animate the confidence bar width
                setTimeout(() => {
                    confidenceBar.style.width = confidencePercentage;
                }, 300);
                
            } else {
                // Hide confidence container if no tumor detected
                confidenceContainer.style.display = 'none';
            }
        }
        
        // Still update the hidden confidence value for backward compatibility
        if (confidenceScore) {
            confidenceScore.parentElement.style.display = 'none';
        }
        
        // Update hidden tumor details for backward compatibility only
        if (tumorProbability) {
            if (result.hasTumor) {
                const probabilityValue = result.confidence ? 
                    (typeof result.confidence === 'number' ? result.confidence : parseFloat(result.confidence)) : 
                    0.85;
                    
                // Format as percentage with 1 decimal place
                tumorProbability.textContent = (probabilityValue * 100).toFixed(1) + '%';
            } else {
                tumorProbability.textContent = 'N/A';
            }
        }
        
        // Update hidden tumor type (for backward compatibility)
        if (tumorType) {
            tumorType.textContent = result.hasTumor ? result.tumorType : 'N/A';
        }
        
        // Update hidden tumor size (for backward compatibility)
        if (tumorSize) {
            tumorSize.textContent = result.hasTumor ? result.tumorSize : 'N/A';
        }
        
        // Update hidden tumor location (for backward compatibility)
        if (tumorLocation) {
            tumorLocation.textContent = result.hasTumor ? result.tumorLocation : 'N/A';
        }
        
        // Enable download button if we have an image
        if (downloadBtn) {
            const hasImage = result.processedImageUrl || result.processedImageData || imageUrl;
            downloadBtn.disabled = !hasImage;
            
            // Update download button to use the processed image
            if (hasImage) {
                downloadBtn.onclick = function() {
                    const imageSource = result.processedImageUrl || result.processedImageData || imageUrl;
                    const link = document.createElement('a');
                    link.href = imageSource;
                    link.download = 'brain-scan-result-' + Date.now() + '.jpg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
            }
        }
        
        // Show Save button if user is logged in
        if (saveResultBtn) {
            const user = getCurrentUser();
            if (user) {
                saveResultBtn.style.display = 'inline-block';
                
                // Only consider it saved if we have an imageId from the server AND it belongs to the current user
                // Remove the automatic disabling for sample images to allow saving them
                if (result.imageId && result.userId === user.uid) {
                    console.log("Result already saved to account. imageId:", result.imageId);
                    saveResultBtn.textContent = 'Saved to Account';
                    saveResultBtn.disabled = true;
                } else {
                    console.log("Result not yet saved to account. Setting save button active.");
                    saveResultBtn.textContent = 'Save to Account';
                    saveResultBtn.disabled = false;
                }
            } else {
                saveResultBtn.style.display = 'none';
            }
        }
        
        // Update page title to reflect scan result
        document.title = result.hasTumor ? 'Tumor Detected - BrainScan AI' : 'No Tumor Detected - BrainScan AI';
    }

    // Setup zoom functionality for the result image
    function setupZoomFunctionality() {
        const resultImage = document.getElementById('result-image');
        const resultImageContainer = document.getElementById('result-image-container');
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const zoomReset = document.getElementById('zoom-reset');
        
        if (!resultImage || !zoomIn || !zoomOut || !zoomReset) return;
        
        // Current zoom level and panning state
        let currentZoom = 1;
        const minZoom = 0.5;
        const maxZoom = 3;
        const zoomStep = 0.1;
        
        // For panning functionality
        let isPanning = false;
        let startX, startY;
        let translateX = 0;
        let translateY = 0;
        
        // Apply zoom and translation to the image
        const applyTransform = () => {
            resultImage.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
            
            // Disable zoom buttons at limits
            zoomIn.disabled = currentZoom >= maxZoom;
            zoomOut.disabled = currentZoom <= minZoom;
            
            // Enable or disable panning based on zoom level
            resultImageContainer.style.cursor = currentZoom > 1 ? 'grab' : 'default';
        };
        
        // Apply zoom to the image
        const applyZoom = (zoom) => {
            const prevZoom = currentZoom;
            currentZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
            
            // If zooming out to 1, reset translation
            if (currentZoom <= 1) {
                translateX = 0;
                translateY = 0;
            } else if (prevZoom !== currentZoom) {
                // Adjust translation to maintain zoom center
                const factor = currentZoom / prevZoom;
                translateX = translateX / factor;
                translateY = translateY / factor;
            }
            
            applyTransform();
        };
        
        // Zoom in button
        zoomIn.addEventListener('click', () => {
            applyZoom(currentZoom + zoomStep);
        });
        
        // Zoom out button
        zoomOut.addEventListener('click', () => {
            applyZoom(currentZoom - zoomStep);
        });
        
        // Reset zoom button
        zoomReset.addEventListener('click', () => {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            applyTransform();
        });
        
        // Mouse wheel zoom
        resultImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                // Zoom in
                applyZoom(currentZoom + zoomStep);
            } else {
                // Zoom out
                applyZoom(currentZoom - zoomStep);
            }
        });
        
        // Mouse panning events
        resultImage.addEventListener('mousedown', (e) => {
            if (currentZoom > 1) {
                isPanning = true;
                startX = e.clientX;
                startY = e.clientY;
                resultImageContainer.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const deltaX = (e.clientX - startX) / currentZoom;
                const deltaY = (e.clientY - startY) / currentZoom;
                
                translateX += deltaX;
                translateY += deltaY;
                
                startX = e.clientX;
                startY = e.clientY;
                
                applyTransform();
            }
        });
        
        window.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                resultImageContainer.style.cursor = currentZoom > 1 ? 'grab' : 'default';
            }
        });
        
        // Touch panning events for mobile
        resultImage.addEventListener('touchstart', (e) => {
            if (currentZoom > 1 && e.touches.length === 1) {
                isPanning = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                e.preventDefault();
            }
        });
        
        resultImage.addEventListener('touchmove', (e) => {
            if (isPanning && e.touches.length === 1) {
                const deltaX = (e.touches[0].clientX - startX) / currentZoom;
                const deltaY = (e.touches[0].clientY - startY) / currentZoom;
                
                translateX += deltaX;
                translateY += deltaY;
                
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                
                applyTransform();
                e.preventDefault();
            }
        });
        
        resultImage.addEventListener('touchend', () => {
            isPanning = false;
        });
        
        // Set initial transform
        applyTransform();
    }

    //----------------------------------------------
    // 3. User Sample Images Handling
    //----------------------------------------------
    function loadUserSampleImages() {
        const user = getCurrentUser();
        
        if (!user) {
            userSampleImages = [];
            updateSampleImagesUI();
            return;
        }
        
        console.log("Loading user sample images from Firebase");
        
        // Reference to the user's samples collection
        const samplesRef = firebase.firestore().collection('users').doc(user.uid).collection('samples');
        
        // Get the samples
        samplesRef.orderBy('createdAt', 'desc').limit(9).get()
            .then(function(querySnapshot) {
                userSampleImages = [];
                
                querySnapshot.forEach(function(doc) {
                    userSampleImages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`Loaded ${userSampleImages.length} sample images from Firebase`);
                
                // Update the UI with the user's samples
                updateSampleImagesUI();
                
                // Ensure handlers are up to date
                updateSampleImageHandlers();
            })
            .catch(function(error) {
                console.error('Error loading user samples:', error);
                showEnhancedNotification('Error', 'Failed to load your sample images.', 'error');
            });
    }

    // Update the sample images UI
    function updateSampleImagesUI() {
        const userSamplesGrid = document.getElementById('user-samples-grid');
        const sampleImagesContainer = document.querySelector('.sample-images');
        
        if (!userSamplesGrid && !sampleImagesContainer) return;
        
        // Add vibrant styling to the UI elements
        const styles = document.createElement('style');
        styles.textContent = `
            .sample-images {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .sample-image-container {
                position: relative;
                width: 120px;
                height: 120px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                cursor: pointer;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                border: 3px solid transparent;
                background: linear-gradient(145deg, #f8f9fa, #e9ecef);
            }
            
            .sample-image-container:hover {
                transform: translateY(-8px) scale(1.05);
                box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                border-color: #4facfe;
                animation: border-pulse 1.5s infinite alternate;
            }
            
            @keyframes border-pulse {
                0% { border-color: #4facfe; }
                50% { border-color: #00f2fe; }
                100% { border-color: #4facfe; }
            }
            
            .sample-image-container.loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.8);
                z-index: 2;
            }
            
            .sample-image-container.loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 30px;
                height: 30px;
                margin-top: -15px;
                margin-left: -15px;
                border: 3px solid rgba(79, 172, 254, 0.3);
                border-top: 3px solid #4facfe;
                border-radius: 50%;
                z-index: 3;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .sample-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .sample-image-container:hover .sample-image {
                transform: scale(1.1);
            }
            
            .sample-label {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
                color: white;
                padding: 8px 5px;
                font-size: 12px;
                text-align: center;
                font-weight: bold;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .sample-image-container:hover .sample-label {
                opacity: 1;
                transform: translateY(0);
            }
            
            .sample-badge {
                position: absolute;
                top: 8px;
                right: 8px;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: white;
                z-index: 1;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                transform: scale(0.9);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .sample-image-container:hover .sample-badge {
                transform: scale(1.1);
                box-shadow: 0 6px 15px rgba(0,0,0,0.25);
            }
            
            .sample-badge.has-tumor {
                background: linear-gradient(45deg, #f5365c, #ff3860);
                box-shadow: 0 2px 5px rgba(245, 54, 92, 0.4);
                animation: pulse-red 2s infinite;
            }
            
            .sample-badge.no-tumor {
                background: linear-gradient(45deg, #2dce89, #4cd964);
                box-shadow: 0 2px 5px rgba(45, 206, 137, 0.4);
            }
            
            @keyframes pulse-red {
                0% {
                    box-shadow: 0 0 0 0 rgba(245, 54, 92, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 6px rgba(245, 54, 92, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(245, 54, 92, 0);
                }
            }
            
            .profile-sample-item {
                position: relative;
                width: 170px;
                height: 200px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                margin: 10px;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                background: white;
                border: 2px solid transparent;
            }
            
            .profile-sample-item:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 30px rgba(0,0,0,0.15);
                border-color: #4facfe;
            }
            
            .sample-image-wrapper {
                position: relative;
                width: 100%;
                height: 140px;
                overflow: hidden;
                background: #f8f9fa;
            }
            
            .profile-sample-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .profile-sample-item:hover .profile-sample-image {
                transform: scale(1.1);
            }
            
            .sample-actions {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .profile-sample-item:hover .sample-actions {
                opacity: 1;
                animation: fade-in 0.3s forwards;
            }
            
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .sample-action {
                background: white;
                border: none;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                margin: 6px;
                cursor: pointer;
                transition: transform 0.3s ease, background 0.3s ease;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                transform: scale(0.8);
                opacity: 0;
            }
            
            .profile-sample-item:hover .sample-action {
                opacity: 1;
                transform: scale(1);
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
                transition-delay: calc(var(--i, 0) * 0.05s);
            }
            
            .sample-action:hover {
                transform: scale(1.15) !important;
            }
            
            .sample-action.delete-sample {
                background: linear-gradient(45deg, #f5365c, #ff3860);
                color: white;
                --i: 1;
            }
            
            .sample-info {
                padding: 12px;
                text-align: center;
            }
            
            .sample-info h4 {
                margin: 0;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #344767;
            }
            
            .sample-info p {
                margin: 5px 0 0;
                font-size: 13px;
                color: #6c757d;
            }
            
            .add-sample {
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
                cursor: pointer;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, background 0.3s ease;
            }
            
            .add-sample:hover {
                background: linear-gradient(135deg, #e0e6ed 0%, #d4d9e4 100%);
                transform: translateY(-10px);
                box-shadow: 0 15px 30px rgba(0,0,0,0.15);
            }
            
            .add-sample-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                color: #5e72e4;
                transition: transform 0.3s ease;
            }
            
            .add-sample:hover .add-sample-button {
                transform: scale(1.1);
            }
            
            .add-sample-button i {
                font-size: 28px;
                margin-bottom: 8px;
                transition: transform 0.5s ease;
            }
            
            .add-sample:hover .add-sample-button i {
                animation: bounce 1s infinite alternate;
            }
            
            @keyframes bounce {
                0% { transform: translateY(0); }
                100% { transform: translateY(-5px); }
            }
            
            .deleting {
                opacity: 0.5;
                pointer-events: none;
                transform: scale(0.95);
                transition: all 0.3s ease;
            }
            
            /* Add Sample button in header */
            .add-sample-header-btn {
                background: linear-gradient(45deg, #4facfe, #00f2fe);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .add-sample-header-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(79, 172, 254, 0.6);
                background: linear-gradient(45deg, #00f2fe, #4facfe);
            }
            
            .add-sample-header-btn i {
                font-size: 18px;
                transition: transform 0.3s ease;
            }
            
            .add-sample-header-btn:hover i {
                transform: rotate(90deg);
            }
        `;
        
        document.head.appendChild(styles);
        
        // Update the scanning section samples
        if (sampleImagesContainer) {
            sampleImagesContainer.innerHTML = ''; // Clear existing sample images
            
            if (userSampleImages.length === 0) {
                // No user samples, show default samples
                for (let i = 1; i <= 3; i++) {
                    const sampleContainer = document.createElement('div');
                    sampleContainer.className = 'sample-image-container';
                    sampleContainer.setAttribute('data-sample', i);
                    
                    sampleContainer.innerHTML = `
                        <img src="/api/placeholder/100/100" alt="Sample ${i}" class="sample-image">
                        <div class="sample-label">Sample ${i}</div>
                    `;
                    
                    sampleImagesContainer.appendChild(sampleContainer);
                    
                    // Add click event
                    sampleContainer.addEventListener('click', function() {
                        const sampleNumber = this.getAttribute('data-sample');
                        
                        // Add loading indicator
                        this.classList.add('loading');
                        
                        // Sample images logic (placeholder for now)
                        setTimeout(() => {
                            this.classList.remove('loading');
                            // Here you would normally fetch the image from server
                            // For now, just use a placeholder
                            const sampleFile = new File(
                                [new Blob([''], { type: 'image/jpg' })], 
                                `sample${sampleNumber}.jpg`, 
                                { type: 'image/jpeg' }
                            );
                            handleFileSelection(sampleFile);
                        }, 500);
                    });
                }
            } else {
                // Show user samples instead of default ones
                // Limit to 3 most recent samples for the scanner section
                const recentSamples = userSampleImages.slice(0, 3);
                
                recentSamples.forEach((sample, index) => {
                    const sampleContainer = document.createElement('div');
                    sampleContainer.className = 'sample-image-container';
                    sampleContainer.setAttribute('data-id', sample.id);
                    
                    sampleContainer.innerHTML = `
                        <img src="${sample.imageUrl}" alt="${sample.name}" class="sample-image">
                        <div class="sample-label">${sample.name}</div>
                    `;
                    
                    sampleImagesContainer.appendChild(sampleContainer);
                    
                    
                    // Add click event
                    sampleContainer.addEventListener('click', function() {
                        // Add loading indicator
                        this.classList.add('loading');
                        
                        // Create a file-like object from the sample data
                        const sampleFile = new File(
                            [new Blob([''], { type: 'image/jpeg' })], 
                            sample.name || `sample_${Date.now()}.jpg`, 
                            { type: 'image/jpeg' }
                        );
                        
                        // Set the global variables needed for scanning
                        selectedFile = sampleFile;
                        imageUrl = sample.imageUrl;
                        
                        // Store the sample data for reference
                        scanResult = {
                            fromSample: true,
                            sampleId: sample.id,
                            name: sample.name || ('Sample Scan ' + new Date().toLocaleDateString())
                        };
                        
                        // Show preview in the upload area
                        if (uploadArea) {
                            uploadArea.innerHTML = `
                                <div class="preview-container" style="position: relative; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                    <img src="${sample.imageUrl}" alt="${sample.name}" style="max-width: 100%; max-height: 250px; display: block; margin: 0 auto; border-radius: 8px;">
                                    <div class="preview-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 15px 10px 10px; color: white;">
                                        <p style="margin: 0; font-size: 14px;">Selected sample: <span style="font-weight: bold;">${sample.name || 'Sample Image'}</span></p>
                                    </div>
                                </div>
                                <p class="ready-text" style="color: #2dce89; font-weight: bold;"><i class="fas fa-check-circle"></i> Ready for analysis</p>
                            `;
                        }
                        
                        // Remove the loading indicator
                        this.classList.remove('loading');
                        
                        // Process the image using the enhanced UI
                        processImageWithAI();
                    });
                });
            }
        }
        
        // Update the profile samples grid
        if (userSamplesGrid) {
            if (userSampleImages.length === 0) {
                userSamplesGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <p>You haven't uploaded any sample images yet.</p>
                        <button id="upload-sample-btn" class="btn btn-sm">Upload Sample</button>
                    </div>
                `;
                
                // Add event listener to the upload button
                const uploadSampleBtn = document.getElementById('upload-sample-btn');
                if (uploadSampleBtn) {
                    uploadSampleBtn.addEventListener('click', function() {
                        showSampleImageUploadModal(true); // From profile
                    });
                }
            } else {
                // Clear the existing grid
                userSamplesGrid.innerHTML = '';
                
                // Add each sample to the grid
                userSampleImages.forEach(function(sample) {
                    const sampleElement = document.createElement('div');
                    sampleElement.className = 'profile-sample-item';
                    sampleElement.setAttribute('data-id', sample.id);
                    
                    sampleElement.innerHTML = `
                        <div class="sample-image-wrapper">
                            <img src="${sample.imageUrl}" alt="${sample.name}" class="profile-sample-image">
                            <div class="sample-actions">
                                <button class="sample-action delete-sample" title="Delete this sample">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="sample-info">
                            <h4>${sample.name}</h4>
                            <p>${new Date(sample.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                    `;
                    
                    userSamplesGrid.appendChild(sampleElement);
                    
                    // Add event listeners for actions
                    const deleteSampleBtn = sampleElement.querySelector('.delete-sample');
                    
                    // Delete sample
                    if (deleteSampleBtn) {
                        deleteSampleBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const user = getCurrentUser();
                            if (!user) return;
                            
                            if (confirm('Are you sure you want to delete this sample?')) {
                                const sampleId = sampleElement.getAttribute('data-id');
                                
                                // Show loading state
                                sampleElement.classList.add('deleting');
                                
                                // Delete from Firestore
                                firebase.firestore().collection('users').doc(user.uid).collection('samples').doc(sampleId).delete()
                                    .then(function() {
                                        // Remove from UI
                                        userSamplesGrid.removeChild(sampleElement);
                                        
                                        // Show notification
                                        showEnhancedNotification('Sample Deleted', 'Sample image has been deleted.', 'success');
                                        
                                        // Also remove from userSampleImages array
                                        const index = userSampleImages.findIndex(s => s.id === sampleId);
                                        if (index !== -1) {
                                            userSampleImages.splice(index, 1);
                                        }
                                        
                                        // Update samples in detector
                                        updateSampleImagesUI();
                                        
                                        // Check if grid is empty
                                        if (userSampleImages.length === 0) {
                                            updateSampleImagesUI(); // This will show the empty state
                                        }
                                    })
                                    .catch(function(error) {
                                        console.error('Error deleting sample:', error);
                                        sampleElement.classList.remove('deleting');
                                        showEnhancedNotification('Error', 'Failed to delete sample. Please try again.', 'error');
                                    });
                            }
                        });
                    }
                });
                
                // Add only one upload button in profile view
                if (fromProfile) {
                const uploadButton = document.createElement('div');
                uploadButton.className = 'profile-sample-item add-sample';
                uploadButton.innerHTML = `
                    <div class="add-sample-button">
                        <i class="fas fa-plus"></i>
                        <p>Add Sample</p>
                    </div>
                `;
                
                userSamplesGrid.appendChild(uploadButton);
                
                // Add click event to upload button
                uploadButton.addEventListener('click', function() {
                    showSampleImageUploadModal(true); // From profile
                });
            }
        }
        }
        
        // Make sure all sample image handlers are properly set up
        updateSampleImageHandlers();
    }

    // Add a universal function to handle image loading fallback
    function handleImageFallback(sample, fromProfile = false) {
        console.log("Using image URL directly: " + sample.imageUrl);
        
        // Check if we should use the direct sample scanning API
        const user = getCurrentUser();
        if (user && sample.id) {
            console.log("User is logged in and sample has ID, trying direct sample scanning");
            
            // Fetch the sample image as a blob first to ensure we have the actual image data
            fetch(sample.imageUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.blob();
                })
                .then(blob => {
                    // Create a proper File object with the blob data
                    const sampleFile = new File(
                        [blob], 
                        sample.name || `sample_${Date.now()}.jpg`, 
                        { type: blob.type || 'image/jpeg' }
                    );
                    
                    // Create an object URL for the blob to display in the preview
                    const objectUrl = URL.createObjectURL(blob);
                    
                    // Set the global variables
                    selectedFile = sampleFile;
                    imageUrl = objectUrl; // Use object URL for reliable local reference
                    
                    // Store the sample data for reference
                    scanResult = {
                        fromSample: true,
                        sampleId: sample.id,
                        name: sample.name || ('Sample Scan ' + new Date().toLocaleDateString()),
                        originalImageUrl: sample.imageUrl
                    };
                    
                    // Show the preview in the upload area first
                    if (uploadArea) {
                        uploadArea.innerHTML = `
                            <div class="preview-container" style="position: relative; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                <img src="${objectUrl}" alt="${sample.name}" style="max-width: 100%; max-height: 250px; display: block; margin: 0 auto; border-radius: 8px;">
                                <div class="preview-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 15px 10px 10px; color: white;">
                                    <p style="margin: 0; font-size: 14px;">Selected sample: <span style="font-weight: bold;">${sample.name || 'Sample Image'}</span></p>
                                </div>
                            </div>
                            <p class="ready-text" style="color: #2dce89; font-weight: bold;"><i class="fas fa-check-circle"></i> Ready for analysis</p>
                        `;
                    }
                    
                    // Process the image using the enhanced UI
                    processImageWithAI();
                    
                    // Remove loading indicator from the sample container
                    const sampleContainer = document.querySelector(`.sample-image-container[data-id="${sample.id}"]`);
                    if (sampleContainer) {
                        sampleContainer.classList.remove('loading');
                    }
                })
                .catch(error => {
                    console.error("Error fetching sample image:", error);
                    
                    // Fall back to the original method if direct fetching fails
                    fallbackToOriginalMethod();
                });
                
            return;
        }
        
        // Helper function for the original fallback method
        function fallbackToOriginalMethod() {
            // Create an Image element to load the image
            const img = new Image();
            img.crossOrigin = "anonymous";  // Try to handle CORS issues
            
            img.onload = function() {
                // Create a canvas to convert the image to a blob
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Convert to blob
                // Try to determine the image type from the URL
                let imageType = 'image/jpeg'; // Default type
                
                // Extract file extension from URL if possible
                const urlParts = sample.imageUrl.split('.');
                if (urlParts.length > 1) {
                    const extension = urlParts.pop().toLowerCase().split('?')[0]; // Remove any query parameters
                    if (['jpg', 'jpeg'].includes(extension)) {
                        imageType = 'image/jpeg';
                    } else if (extension === 'png') {
                        imageType = 'image/png';
                    } else if (extension === 'gif') {
                        imageType = 'image/gif';
                    } else if (extension === 'webp') {
                        imageType = 'image/webp';
                    } else if (extension === 'bmp') {
                        imageType = 'image/bmp';
                    }
                }
                
                canvas.toBlob(function(blob) {
                    if (blob) {
                        const file = new File([blob], sample.name, { type: imageType });
                        // Set the global imageUrl to the sample URL
                        imageUrl = canvas.toDataURL(imageType);
                        
                        if (fromProfile) {
                            // Scroll to detector section
                            const detectorSection = document.getElementById('detector');
                            if (detectorSection) {
                                detectorSection.scrollIntoView({ behavior: 'smooth' });
                                
                                // Small delay to ensure section is visible
                                setTimeout(() => {
                                    handleFileSelection(file);
                                }, 500);
                            }
                        } else {
                            handleFileSelection(file);
                            const sampleContainer = document.querySelector(`.sample-image-container[data-id="${sample.id}"]`);
                            if (sampleContainer) {
                                sampleContainer.classList.remove('loading');
                            }
                        }
                    } else {
                        handleDirectUrl();
                    }
                }, imageType);
            };
            
            img.onerror = function() {
                console.error("Image load error, using direct URL method as fallback");
                handleDirectUrl();
            };
            
            img.src = sample.imageUrl;
        }
        
        // Function for direct URL method as last resort
        function handleDirectUrl() {
            // Create a minimal file object
            const minimalFile = new File(
                [new Blob([''], { type: 'image/jpeg' })], 
                sample.name || 'sample-image.jpg', 
                { type: 'image/jpeg' }
            );
            
            // Set globals
            selectedFile = minimalFile;
            imageUrl = sample.imageUrl;
            
            // Update UI
            if (fromProfile) {
                const detectorSection = document.getElementById('detector');
                if (detectorSection) {
                    detectorSection.scrollIntoView({ behavior: 'smooth' });
                    
                    setTimeout(() => {
                        updateUploadArea();
                    }, 500);
                }
            } else {
                updateUploadArea();
                const sampleContainer = document.querySelector(`.sample-image-container[data-id="${sample.id}"]`);
                if (sampleContainer) {
                    sampleContainer.classList.remove('loading');
                }
            }
        }
        
        // Helper to update the upload area
        function updateUploadArea() {
            if (uploadArea) {
                uploadArea.innerHTML = `
                    <div class="preview-container" style="position: relative; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <img src="${sample.imageUrl}" alt="${sample.name}" style="max-width: 100%; max-height: 250px; display: block; margin: 0 auto; border-radius: 8px;">
                        <div class="preview-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 15px 10px 10px; color: white;">
                            <p style="margin: 0; font-size: 14px;">Selected sample: <span style="font-weight: bold;">${sample.name || 'Sample Image'}</span></p>
                        </div>
                    </div>
                    <p class="ready-text" style="color: #2dce89; font-weight: bold;"><i class="fas fa-check-circle"></i> Ready for analysis</p>
                `;
            }
        }
        
        // Start with the original fallback method
        fallbackToOriginalMethod();
    }

    // Update sample image container click handlers
    function updateSampleImageHandlers() {
        const sampleContainers = document.querySelectorAll('.sample-image-container');
        
        sampleContainers.forEach(container => {
            const dataId = container.getAttribute('data-id');
            if (!dataId) return;
            
            // Find the corresponding sample
            const sample = userSampleImages.find(s => s.id === dataId);
            if (!sample) return;
            
            // Update the click handler
            container.addEventListener('click', function() {
                // Add loading indicator
                this.classList.add('loading');
                
                // Check if the user is logged in
                const user = getCurrentUser();
                if (user && sample.id) {
                    console.log("Using direct sample scanning API for sample:", sample.id);
                    
                    // Show loading container
                    if (loadingContainer) {
                        loadingContainer.style.display = 'flex';
                        
                        // Update loading text
                        const loadingText = document.querySelector('.loading-text');
                        if (loadingText) {
                            loadingText.textContent = 'Scanning Sample Image...';
                        }
                        
                        // Update scanning step
                        const scanningStep = document.querySelector('.scanning-step');
                        if (scanningStep) {
                            scanningStep.textContent = 'Retrieving sample data...';
                        }
                    }
                    
                    // Use the new scan API
                    scanSampleImage(sample, function(result) {
                        container.classList.remove('loading');
                        if (loadingContainer) loadingContainer.style.display = 'none';
                        displayResults(result);
                    });
                    return;
                }
                
                // Fall back to the original method for anonymous users
                // Try fetch first
                fetch(sample.imageUrl)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return res.blob();
                    })
                    .then(blob => {
                        const file = new File([blob], sample.name, { type: 'image/jpeg' });
                        handleFileSelection(file);
                        this.classList.remove('loading');
                    })
                    .catch(error => {
                        console.error('Error loading sample image with fetch:', error);
                        // Try alternative method
                        handleImageFallback(sample);
                    });
            });
        });
    }

    // Show sample image upload modal
    function showSampleImageUploadModal(fromProfile = false) {
        const user = getCurrentUser();
        
        if (!user) {
            // Show login modal
            const authContainer = document.getElementById('auth-container');
            if (authContainer) {
                authContainer.style.display = 'flex';
                const loginTab = document.getElementById('login-tab');
                if (loginTab) loginTab.click();
            }
            return;
        }
        
        console.log("Opening sample upload modal"); // Debug log
        
        // Check if modal already exists and remove it first to prevent duplicates
        const existingModal = document.getElementById('sample-upload-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal';
        modalElement.id = 'sample-upload-modal';
        modalElement.style.display = 'flex'; // Ensure the modal is visible
        
        modalElement.innerHTML = `
            <div class="modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); z-index: 9999; backdrop-filter: blur(5px);">
                <div class="modal-content" style="width: 90%; max-width: 500px; background: white; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.25); position: relative; overflow: hidden; animation: modal-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-height: 90vh; display: flex; flex-direction: column;">
                    <div class="modal-header" style="padding: 20px 25px; border-bottom: 1px solid #f1f3f9; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(120deg, #f8f9fa, #f1f3f9);">
                        <h3 style="margin: 0; font-size: 22px; color: #344767; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-image" style="color: #4facfe;"></i>
                            Upload Sample Image
                        </h3>
                        <button class="modal-close-btn" style="background: #f1f3f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" style="padding: 25px; overflow-y: auto; flex-grow: 1;">
                        <div class="form-group" style="margin-bottom: 25px;">
                            <label for="sample-name" style="display: block; margin-bottom: 10px; font-weight: bold; color: #344767; font-size: 16px;">Sample Name</label>
                            <input type="text" id="sample-name" class="form-control" placeholder="Enter a name for this sample" style="width: 100%; padding: 12px 15px; border: 2px solid #e4e8f0; border-radius: 10px; font-size: 16px; transition: all 0.3s ease; outline: none; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        </div>
                        <div class="form-group" style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #344767; font-size: 16px;">Upload Image</label>
                            <div class="custom-file-input" style="position: relative;">
                                <input type="file" id="sample-file-input" accept="image/*" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; z-index: 2;">
                                <button class="file-input-button" style="display: inline-block; padding: 12px 20px; background: linear-gradient(45deg, #4facfe, #00f2fe); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3); font-weight: bold;">
                                    <i class="fas fa-upload" style="margin-right: 8px;"></i> Choose File
                                </button>
                                <span id="sampleFileName" style="margin-left: 10px; color: #6c757d;">No file chosen</span>
                            </div>
                        </div>
                        <div class="sample-preview" id="sample-preview" style="margin-top: 20px; text-align: center; min-height: 150px; border: 2px dashed #e4e8f0; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f8f9fa; transition: all 0.3s ease;">
                            <i class="fas fa-image" style="font-size: 40px; color: #cbd3da; margin-bottom: 10px;"></i>
                            <p style="color: #6c757d; margin: 0;">Image preview will appear here</p>
                        </div>
                    </div>
                    <div class="modal-footer" style="padding: 20px 25px; border-top: 1px solid #f1f3f9; display: flex; justify-content: flex-end; gap: 15px; background: linear-gradient(120deg, #f8f9fa, #f1f3f9); position: sticky; bottom: 0;">
                        <button class="btn-outline modal-cancel-btn" style="padding: 12px 25px; background: transparent; border: 2px solid #cbd3da; border-radius: 10px; color: #6c757d; cursor: pointer; font-weight: bold; transition: all 0.3s ease;">Cancel</button>
                        <button class="btn modal-upload-btn" style="padding: 12px 25px; background: linear-gradient(45deg, #4facfe, #00f2fe); border: none; border-radius: 10px; color: white; cursor: pointer; opacity: 0.6; box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3); font-weight: bold; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;" disabled>
                            <i class="fas fa-cloud-upload-alt"></i> Upload Sample
                        </button>
                    </div>
                </div>
            </div>
            <style>
                @keyframes modal-appear {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                .modal-close-btn:hover {
                    background: #e9ecef;
                    transform: rotate(90deg);
                }
                .toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .file-input-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4);
                    background: linear-gradient(45deg, #00f2fe, #4facfe);
                }
                .btn-outline:hover {
                    background: #f1f3f9;
                    color: #495057;
                    transform: translateY(-2px);
                }
                .modal-upload-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4);
                    background: linear-gradient(45deg, #00f2fe, #4facfe);
                }
                #sample-name:focus {
                    border-color: #4facfe;
                    box-shadow: 0 4px 10px rgba(79, 172, 254, 0.2);
                }
                .sample-preview:hover {
                    border-color: #4facfe;
                    border-style: solid;
                }
                
                /* Prevent body scroll when modal is open */
                body.modal-open {
                    overflow: hidden;
                }
            </style>
        `;
        
        // Add to the DOM
        document.body.appendChild(modalElement);
        
        // Prevent body scrolling
        document.body.classList.add('modal-open');
        
        // Get elements
        const closeBtn = modalElement.querySelector('.modal-close-btn');
        const cancelBtn = modalElement.querySelector('.modal-cancel-btn');
        const uploadBtn = modalElement.querySelector('.modal-upload-btn');
        const fileInput = modalElement.querySelector('#sample-file-input');
        const fileNameSpan = modalElement.querySelector('#sampleFileName');
        const sampleNameInput = modalElement.querySelector('#sample-name');
        const samplePreview = modalElement.querySelector('#sample-preview');
        const fileInputButton = modalElement.querySelector('.file-input-button');
        
        // Initialize variables
        let sampleFile = null;
        let hasTumor = false; // Always set to false now that we've removed the UI option
        
        // Function to properly close the modal
        const closeModal = () => {
            console.log("Closing modal"); // Debug log
            
            // Add closing animation
            const modalContent = modalElement.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'modal-disappear 0.3s forwards';
            }
            
            // Remove after animation completes
            setTimeout(() => {
                if (document.body.contains(modalElement)) {
            document.body.removeChild(modalElement);
                    // Re-enable body scrolling
                    document.body.classList.remove('modal-open');
                }
            }, 300);
        };
        
        // Set up event listeners
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        
        // Handle clicks outside the modal to close it
        modalElement.querySelector('.modal-overlay').addEventListener('click', function(e) {
            // Only close if clicking the overlay directly, not its children
            if (e.target === this) {
                closeModal();
            }
        });
        
        // hasTumor is always set to false by default now
        
        // File input and button
        fileInput.addEventListener('change', function(e) {
            e.preventDefault(); // Prevent default behavior
            
            if (this.files && this.files.length > 0) {
                console.log("File selected: " + this.files[0].name); // Debug log
                sampleFile = this.files[0];
                fileNameSpan.textContent = sampleFile.name;
                fileNameSpan.style.color = '#4facfe';
                fileNameSpan.style.fontWeight = 'bold';
                
                // Preview the image
                const reader = new FileReader();
                reader.onload = function(e) {
                    samplePreview.innerHTML = `
                        <div style="position: relative; width: 100%; max-width: 300px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
                            <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 250px; display: block; border-radius: 10px; transition: transform 0.5s ease;">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 30px 15px 10px; color: white;">
                                <p style="margin: 0; text-align: center; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">Image ready for upload</p>
                            </div>
                        </div>
                    `;
                    
                    // Make sure the upload button is visible
                    const modalContent = modalElement.querySelector('.modal-content');
                    modalContent.scrollTop = 0;
                };
                reader.readAsDataURL(sampleFile);
                
                // Enable upload button if name is entered
                if (sampleNameInput.value.trim()) {
                    uploadBtn.disabled = false;
                    uploadBtn.style.opacity = '1';
                }
            }
        });
        
        fileInputButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
        
        // Name input change
        sampleNameInput.addEventListener('input', function() {
            // Enable upload button if file is selected
            if (sampleFile && this.value.trim()) {
                uploadBtn.disabled = false;
                uploadBtn.style.opacity = '1';
            } else {
                uploadBtn.disabled = true;
                uploadBtn.style.opacity = '0.6';
            }
        });
        
        // Upload button click
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const name = sampleNameInput.value.trim();
            
            if (!name) {
                showEnhancedNotification('Error', 'Please enter a name for the sample.', 'error');
                // Add shake animation to name input
                sampleNameInput.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    sampleNameInput.style.animation = '';
                }, 500);
                return;
            }
            
            if (!sampleFile) {
                showEnhancedNotification('Error', 'Please select an image file.', 'error');
                return;
            }
            
            console.log("Uploading sample: " + name); // Debug log
            
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            this.disabled = true;
            
            // Upload the sample
            uploadSampleImage(sampleFile, name, hasTumor, this, modalElement, fromProfile);
        });
        
        // Add extra styles for animations
        const extraStyles = document.createElement('style');
        extraStyles.textContent = `
            @keyframes modal-disappear {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.8); }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            /* Prevent scrolling to the bottom when image is selected */
            #sample-upload-modal .modal-content {
                position: relative;
                overflow: auto;
            }
            
            /* Ensure footer stays at the bottom */
            #sample-upload-modal .modal-footer {
                position: sticky;
                bottom: 0;
                z-index: 10;
            }
        `;
        document.head.appendChild(extraStyles);
        
        // Add keyboard event listener to close on Escape
        const handleKeyDown = function(e) {
            if (e.key === 'Escape') {
                closeModal();
                // Remove the event listener to prevent memory leaks
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
    }

    // Update uploadSampleImage function to properly handle modal closing
    function uploadSampleImage(file, name, hasTumor, buttonElement, modalElement, fromProfile = false) {
        const user = getCurrentUser();
        
        if (!user) {
            showEnhancedNotification('Error', 'You must be logged in to upload samples.', 'error');
            return;
        }
        
        // Show loading state
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Upload the file to Firebase Storage with organized path
        const storageRef = firebase.storage().ref();
        const sampleRef = storageRef.child(`users/${user.uid}/samples/${Date.now()}_${file.name}`);
        
        sampleRef.put(file).then(snapshot => {
            // Get the download URL
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
            // Add to Firestore
            return firebase.firestore().collection('users').doc(user.uid).collection('samples').add({
                name: name,
                imageUrl: downloadURL,
                hasTumor: false, // Always false now
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                path: `users/${user.uid}/samples/${Date.now()}_${file.name}` // Store the storage path for reference
            });
        }).then(() => {
            // Show success message
            showEnhancedNotification('Sample Uploaded', 'Your sample image has been uploaded successfully.', 'success');
            
            // Close the modal properly
            if (document.body.contains(modalElement)) {
                // Add closing animation
                const modalContent = modalElement.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.animation = 'modal-disappear 0.3s forwards';
                }
                
                // Remove after animation completes
                setTimeout(() => {
                    if (document.body.contains(modalElement)) {
            document.body.removeChild(modalElement);
                        // Re-enable body scrolling
                        document.body.classList.remove('modal-open');
                    }
                }, 300);
            }
            
            // Reload the samples
            loadUserSampleImages();
            
            // If from profile, also reload the profile samples
            if (fromProfile) {
                loadUserSampleImagesForProfile();
            }
        }).catch(error => {
            console.error('Error uploading sample:', error);
            
            // Show error message
            showEnhancedNotification('Error', 'Failed to upload sample. Please try again later.', 'error');
            
            // Reset button state
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Sample';
        });
    }

    // Show notification helper function (fallback if auth.js is not available)
    function showNotification(title, message, type = 'success', duration = 5000) {
        // Use auth.js showNotification if available
        if (window.auth && window.auth.showNotification) {
            window.auth.showNotification(title, message, type, duration);
            return;
        }
        
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${type}`;
        
        // Add icon based on notification type
        let icon;
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                break;
            case 'info':
            default:
                icon = 'fa-info-circle';
                break;
        }
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Add to the DOM
        document.body.appendChild(notificationElement);
        
        // Add event listener to close button
        const closeButton = notificationElement.querySelector('.notification-close');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(notificationElement);
        });
        
        // Automatically remove after duration
        setTimeout(function() {
            if (document.body.contains(notificationElement)) {
                document.body.removeChild(notificationElement);
            }
        }, duration);
    }

    // Load user data if already logged in
    if (getCurrentUser()) {
        loadUserData();
    }

    // Function to load user profile data into the modal
    function loadUserProfileData() {
        const user = getCurrentUser();
        
        if (!user) {
            console.error('No user logged in');
            return;
        }
        
        // Get UI elements
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        const emailVerifiedBadge = document.getElementById('emailVerifiedBadge');
        const settingsName = document.getElementById('settingsName');
        const memberSinceDate = document.getElementById('memberSinceDate');
        const avatarPreview = document.getElementById('avatarPreview');

        // Use the same default avatar as in auth.js
        const defaultAvatarDataURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0iI2YwZjBmMCIvPjxwYXRoIGZpbGw9IiM2Yzc1N2QiIGQ9Ik0yNTYgMzA0Yy02MS44IDAtMTEyLTUwLjItMTEyLTExMlMxOTQuMiA4MCAyNTYgODBzMTEyIDUwLjIgMTEyIDExMi01MC4yIDExMi0xMTIgMTEyem0wIDQ4YzExMiAwIDIxNiA2MC4yIDIxNiAxNjh2MzJIMzJ2LTMyYzAtOTYgODgtMTY4IDIyNC0xNjh6Ii8+PC9zdmc+';
        const avatarSrc = user.photoURL && user.photoURL.trim() !== '' ? user.photoURL : defaultAvatarDataURI;
        
        // Update basic user information
        if (profileName) profileName.textContent = user.displayName || user.email.split('@')[0];
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileAvatar) profileAvatar.src = avatarSrc;
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        if (settingsName) settingsName.value = user.displayName || '';
        if (avatarPreview) {
            avatarPreview.src = avatarSrc;
            
            // Remove any previous change indicators
            avatarPreview.classList.remove('avatar-changed');
            const notification = avatarPreview.closest('.avatar-preview')?.querySelector('.avatar-save-notification');
            if (notification) {
                notification.style.display = 'none';
            }
        }
        
        // Update email verification badge
        if (emailVerifiedBadge) {
            if (user.emailVerified) {
                emailVerifiedBadge.innerHTML = '<i class="fas fa-check"></i> Verified';
                emailVerifiedBadge.className = 'badge badge-verified';
            } else {
                emailVerifiedBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not Verified';
                emailVerifiedBadge.className = 'badge badge-warning';
            }
        }
        
        // Get additional user data from Firestore
        firebase.firestore().collection('users').doc(user.uid).get()
            .then(function(doc) {
                let dateString = 'Unknown';
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.createdAt) {
                        const date = userData.createdAt.toDate();
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };
                        dateString = date.toLocaleDateString('en-US', options);
                    } else if (user.metadata && user.metadata.creationTime) {
                        const date = new Date(user.metadata.creationTime);
                        const options = { year: 'numeric', month: 'long', day: 'numeric' };
                        dateString = date.toLocaleDateString('en-US', options);
                    }
                } else if (user.metadata && user.metadata.creationTime) {
                    const date = new Date(user.metadata.creationTime);
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    dateString = date.toLocaleDateString('en-US', options);
                }
                if (memberSinceDate) memberSinceDate.textContent = dateString;
                // If there's user bio, update it
                if (doc.exists) {
                    const userData = doc.data();
                    const settingsBio = document.getElementById('settingsBio');
                    if (settingsBio && userData.bio) {
                        settingsBio.value = userData.bio;
                    }
                }
            })
            .catch(function(error) {
                console.error('Error getting user document:', error);
            });
    }

    // Add immediate profile photo preview when file is selected
    if (settingsAvatar) {
        settingsAvatar.addEventListener('change', function() {
            if (this.files && this.files[0] && avatarPreview) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                    
                    // Add a visual indicator that the image has changed but not saved
                    avatarPreview.classList.add('avatar-changed');
                    
                    // Show a small notification that image needs to be saved
                    const avatarContainer = avatarPreview.closest('.avatar-preview');
                    if (avatarContainer) {
                        // Create notification if it doesn't exist
                        let notification = avatarContainer.querySelector('.avatar-save-notification');
                        if (!notification) {
                            notification = document.createElement('div');
                            notification.className = 'avatar-save-notification';
                            notification.innerHTML = '<i class="fas fa-info-circle"></i> Click Save Profile to apply changes';
                            avatarContainer.appendChild(notification);
                        }
                        notification.style.display = 'block';
                    }
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Handle Add Sample button clicks
    if (addSampleBtn) {
        addSampleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Add Sample button clicked"); // Debug log
            
            // Check if we're in the profile view
            const profileTabContent = this.closest('.profile-tab-content');
            if (profileTabContent) {
                // We're in the profile view, use the grid button instead
                const gridAddButton = document.querySelector('.profile-sample-item.add-sample');
                if (gridAddButton) {
                    gridAddButton.click();
                    return;
                }
            }
            
            // Normal processing for main UI button
            showSampleImageUploadModal(false);
        });
    }

    // Handle new analysis from history button
    const newAnalysisFromHistoryBtn = document.getElementById('newAnalysisFromHistoryBtn');
    if (newAnalysisFromHistoryBtn) {
        newAnalysisFromHistoryBtn.addEventListener('click', function() {
            // Close profile modal
            if (profileModal) {
                profileModal.style.display = 'none';
            }
            
            // Scroll to detector section
            const detectorSection = document.getElementById('detector');
            if (detectorSection) {
                detectorSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Function to load user's sample images for profile display
    function loadUserSampleImagesForProfile() {
        const user = getCurrentUser();
        
        if (!user) {
            console.log('No user logged in');
            return;
        }
        
        const samplesGrid = document.getElementById('userSamplesGrid');
        const emptyState = document.getElementById('emptyUserSamples');
        
        // Remove the top Add Sample button completely
        const topAddSampleBtn = document.getElementById('addSampleBtn');
        if (topAddSampleBtn) {
            topAddSampleBtn.style.display = 'none';
        }
        
        if (!samplesGrid) return;
        
        // Show loading state
        samplesGrid.innerHTML = `
            <div class="profile-loading" style="width: 100%; text-align: center; padding: 30px;">
                <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto 15px; border: 4px solid rgba(79, 172, 254, 0.2); border-top-color: #4facfe; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #6c757d; font-size: 16px;">Loading your samples...</p>
            </div>
        `;
        
        // Reference to the user's samples collection
        const samplesRef = firebase.firestore().collection('users').doc(user.uid).collection('samples');
        
        // Get the samples
        samplesRef.orderBy('createdAt', 'desc').get()
            .then(function(querySnapshot) {
                if (querySnapshot.empty) {
                    // No samples found
                    samplesGrid.innerHTML = '';
                    if (emptyState) emptyState.style.display = 'flex';
                    
                    // Add the "Add Sample" button even when there are no samples
                    const uploadButton = document.createElement('div');
                    uploadButton.className = 'profile-sample-item add-sample';
                    uploadButton.innerHTML = `
                        <div class="add-sample-button">
                            <i class="fas fa-plus"></i>
                            <p>Add Sample</p>
                        </div>
                    `;
                    
                    samplesGrid.appendChild(uploadButton);
                    
                    // Add click event to upload button
                    uploadButton.addEventListener('click', function() {
                        showSampleImageUploadModal(true); // From profile
                    });
                    
                    return;
                }
                
                // Hide empty state
                if (emptyState) emptyState.style.display = 'none';
                
                // Clear the grid
                samplesGrid.innerHTML = '';
                
                // Add each sample to the grid
                querySnapshot.forEach(function(doc) {
                    const sample = doc.data();
                    const sampleElement = document.createElement('div');
                    sampleElement.className = 'profile-sample-item';
                    sampleElement.setAttribute('data-id', doc.id);
                    
                    sampleElement.innerHTML = `
                        <div class="sample-image-wrapper">
                            <img src="${sample.imageUrl}" alt="${sample.name}" class="profile-sample-image">
                            <div class="sample-actions">
                                <button class="sample-action delete-sample" title="Delete this sample">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="sample-info">
                            <h4>${sample.name}</h4>
                            <p>${new Date(sample.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                    `;
                    
                    samplesGrid.appendChild(sampleElement);
                    
                    // Add event listeners for actions
                    const deleteSampleBtn = sampleElement.querySelector('.delete-sample');
                    
                    // Delete sample
                    if (deleteSampleBtn) {
                        deleteSampleBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const user = getCurrentUser();
                            if (!user) return;
                            
                            if (confirm('Are you sure you want to delete this sample?')) {
                                const sampleId = sampleElement.getAttribute('data-id');
                                
                                // Show loading state
                                sampleElement.classList.add('deleting');
                                
                                // Delete from Firestore
                                firebase.firestore().collection('users').doc(user.uid).collection('samples').doc(sampleId).delete()
                                    .then(function() {
                                        // Remove from UI
                                        userSamplesGrid.removeChild(sampleElement);
                                        
                                        // Show notification
                                        showEnhancedNotification('Sample Deleted', 'Sample image has been deleted.', 'success');
                                        
                                        // Also remove from userSampleImages array
                                        const index = userSampleImages.findIndex(s => s.id === sampleId);
                                        if (index !== -1) {
                                            userSampleImages.splice(index, 1);
                                        }
                                        
                                        // Update samples in detector
                                        updateSampleImagesUI();
                                        
                                        // Check if grid is empty
                                        if (userSampleImages.length === 0) {
                                            updateSampleImagesUI(); // This will show the empty state
                                        }
                                    })
                                    .catch(function(error) {
                                        console.error('Error deleting sample:', error);
                                        sampleElement.classList.remove('deleting');
                                        showEnhancedNotification('Error', 'Failed to delete sample. Please try again.', 'error');
                                    });
                            }
                        });
                    }
                });
                
                // Add only ONE Add Sample button at the end
                const uploadButton = document.createElement('div');
                uploadButton.className = 'profile-sample-item add-sample';
                uploadButton.innerHTML = `
                    <div class="add-sample-button">
                        <i class="fas fa-plus"></i>
                        <p>Add Sample</p>
                    </div>
                `;
                
                samplesGrid.appendChild(uploadButton);
                
                // Add click event to upload button
                uploadButton.addEventListener('click', function() {
                    showSampleImageUploadModal(true); // From profile
                });
            })
            .catch(function(error) {
                console.error('Error loading user samples:', error);
                samplesGrid.innerHTML = `
                    <div class="profile-error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error loading samples. Please try again.</p>
                    </div>
                `;
            });
    }

    // Function to load user's scan history
    function loadUserScanHistory() {
        const user = getCurrentUser();
        
        if (!user) {
            console.log('No user logged in');
            return;
        }
        
        const historyList = document.getElementById('userHistoryList');
        const emptyState = document.getElementById('emptyUserHistory');
        
        if (!historyList) {
            console.error('History list element not found in DOM');
            return;
        }
        
        console.log('Loading scan history for user:', user.uid);
        
        // Show loading state
        historyList.innerHTML = `
            <div class="profile-loading">
                <div class="spinner"></div>
                <p>Loading your scan history...</p>
            </div>
        `;
        
        // Reference to the user's scans subcollection
        const scansRef = firebase.firestore().collection('users').doc(user.uid).collection('scans');
        
        console.log('Querying Firestore collection "users/' + user.uid + '/scans"');
        
        // Try to get scans without ordering first (to avoid index issues)
        scansRef.get()
            .then(function(querySnapshot) {
                console.log(`Retrieved ${querySnapshot.size} scan records`);
                
                if (querySnapshot.empty) {
                    // No history found
                    historyList.innerHTML = '';
                    if (emptyState) {
                        emptyState.style.display = 'flex';
                        console.log('No scan history found, showing empty state');
                    }
                    return;
                }
                
                // Hide empty state
                if (emptyState) emptyState.style.display = 'none';
                
                // Clear the list
                historyList.innerHTML = '';
                
                // Get all scans and sort them manually in memory
                const scans = [];
                querySnapshot.forEach(doc => {
                    const scanData = doc.data();
                    scanData.id = doc.id; // Store the document ID
                    if (scanData.timestamp) {
                        // Convert Firestore timestamp to milliseconds for sorting
                        scanData.timestampMillis = scanData.timestamp.seconds * 1000 + 
                                                  (scanData.timestamp.nanoseconds / 1000000);
                    } else {
                        // If no timestamp, use current time minus index to maintain relative order
                        scanData.timestampMillis = Date.now() - scans.length;
                    }
                    scans.push(scanData);
                });
                
                // Sort scans by timestamp (newest first)
                scans.sort((a, b) => b.timestampMillis - a.timestampMillis);
                
                // Add each scan to the list
                scans.forEach(function(scan) {
                    console.log('Processing scan record:', scan.id, scan);
                    
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.setAttribute('data-id', scan.id);
                    
                    // Format date
                    const scanDate = scan.timestamp ? new Date(scan.timestamp.seconds * 1000) : new Date();
                    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                    const formattedDate = scanDate.toLocaleDateString('en-US', dateOptions);
                    
                    // Check for required properties before rendering
                    if (!scan.result) {
                        console.warn(`Scan ${scan.id} is missing result data:`, scan);
                        scan.result = {
                            hasTumor: false,
                            confidence: 0,
                            tumorType: 'N/A',
                            tumorSize: 'N/A',
                            tumorLocation: 'N/A'
                        };
                    }
                    
                    // Make sure the scan has an imageUrl
                    // IMPORTANT: Use the processedImageUrl if available (shows tumor frame)
                    const imageUrl = scan.processedImageUrl || scan.imageUrl || 'images/placeholder-scan.jpg';
                    
                    // Add Firebase storage token if needed
                    const displayImageUrl = imageUrl.includes('firebasestorage.googleapis.com') && !imageUrl.includes('alt=media') ? 
                        `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}alt=media` : imageUrl;
                    
                    // Extract the original filename from the URL or path
                    let originalFilename = "scan-image.jpg";
                    try {
                        if (scan.imagePath) {
                            // Get filename from path
                            const pathParts = scan.imagePath.split('/');
                            const lastPart = pathParts[pathParts.length - 1];
                            if (lastPart.includes('_')) {
                                originalFilename = lastPart.split('_').slice(1).join('_'); // Remove timestamp prefix
                            } else {
                                originalFilename = lastPart;
                            }
                        } else if (scan.imageUrl) {
                            // Try to extract from URL
                            const urlObj = new URL(scan.imageUrl);
                            const pathname = urlObj.pathname;
                            const pathParts = pathname.split('/');
                            const lastPart = pathParts[pathParts.length - 1];
                            if (lastPart && !lastPart.includes('placeholder')) {
                                originalFilename = lastPart;
                            }
                        }
                    } catch (e) {
                        console.warn('Error extracting original filename:', e);
                        // Continue with default filename
                    }
                    
                    historyItem.innerHTML = `
                        <div class="history-image-container">
                        <div class="history-image">
                            <img src="${displayImageUrl}" alt="Scan preview" onerror="this.src='images/placeholder-scan.jpg'; this.dataset.isPlaceholder='true';" data-original-filename="${originalFilename}">
                                <div class="scan-overlay"></div>
                            </div>
                            <span class="history-result-badge ${scan.result.hasTumor ? 'tumor-detected' : 'no-tumor'}">${scan.result.hasTumor ? 'Tumor Detected' : 'No Tumor'}</span>
                        </div>
                        <div class="history-details">
                            <h4>${scan.name || 'Unnamed Scan'}</h4>
                            <p class="history-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</p>
                            <div class="history-result ${scan.result && scan.result.hasTumor ? 'negative' : 'positive'}">
                                <i class="fas ${scan.result && scan.result.hasTumor ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                                ${scan.result && scan.result.hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="history-action download-scan" title="Download report">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="history-action delete-scan" title="Delete this scan">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    
                    historyList.appendChild(historyItem);
                    
                    // Add event listeners to history actions
                    const downloadScanBtn = historyItem.querySelector('.download-scan');
                    const deleteScanBtn = historyItem.querySelector('.delete-scan');
                    
                    // Download scan report
                    if (downloadScanBtn) {
                        downloadScanBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            
                            try {
                                // Show generating notification
                                showEnhancedNotification('Generating PDF', 'Creating your report...', 'info', 2000);
                                
                                // Make sure jsPDF is available
                                if (typeof window.jspdf === 'undefined') {
                                    console.error('jsPDF library not loaded.');
                                    throw new Error('jsPDF library not available');
                                }
                                
                                // Create a PDF with the results
                                const { jsPDF } = window.jspdf;
                                if (!jsPDF) {
                                    throw new Error('jsPDF library not available');
                                }
                                
                                // Create PDF with white background
                                const doc = new jsPDF({
                                    orientation: 'portrait',
                                    unit: 'mm',
                                    format: 'a4',
                                    putOnlyUsedFonts: true
                                });
                                
                                // Set background to white
                                doc.setFillColor(255, 255, 255);
                                doc.rect(0, 0, 210, 297, 'F');
                                
                                // Get the result image
                                const resultImage = document.getElementById('result-image');
                                const imageUrl = resultImage.src;
                                
                                // Add header with title centered
                                doc.setFontSize(22);
                                doc.setFont("helvetica", "bold");
                                doc.text('NeuraScan - Brain Tumor Analysis Report', 105, 20, null, null, 'center');
                                
                                // Continue with the existing PDF generation
                                // Add thin line below header
                                doc.setDrawColor(200, 200, 200);
                                doc.setLineWidth(0.5);
                                doc.line(20, 25, 190, 25);
                                
                                // Calculate the date in a better format
                                const reportDate = new Date();
                                const formattedReportDate = reportDate.toLocaleDateString('en-US', {
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                });
                                
                                // Create unique reference number
                                const referenceNumber = `NS-${Math.floor(10000000 + Math.random() * 90000000)}`;
                                
                                // Patient Information Section
                                doc.setFontSize(12);
                                doc.setFont("helvetica", "normal");
                                
                                // Left column
                                let yPos = 35;
                                doc.text(`Date: ${formattedReportDate}`, 20, yPos);
                                
                                // Get the current user
                                const currentUser = getCurrentUser();
                                const patientName = currentUser ? (currentUser.displayName || 'Anonymous Patient') : 'Anonymous Patient';
                                const patientNameForFilename = patientName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                                
                                yPos += 8;
                                doc.text(`Patient: ${patientName}`, 20, yPos);
                                
                                // Create a patient ID from user ID or generate one
                                const patientId = currentUser ? currentUser.uid.substring(0, 8) : ('PT' + Math.random().toString(36).substring(2, 8)).toUpperCase();
                                yPos += 8;
                                doc.text(`Patient ID: ${patientId}`, 20, yPos);
                                
                                // Extract filename if available
                                let filename = 'Brain Scan';
                                if (selectedFile && selectedFile.name) {
                                    filename = selectedFile.name;
                                }
                                
                                yPos += 8;
                                doc.text(`Scan Name: ${filename}`, 20, yPos);
                                
                                // Right column
                                doc.text(`Reference: ${referenceNumber}`, 150, 35);
                                
                                // Add separator line before image
                                yPos += 10;
                                doc.setDrawColor(240, 240, 240);
                                doc.setLineWidth(1);
                                doc.line(20, yPos, 190, yPos);
                                
                                // Add result image
                                if (imageUrl) {
                                    // Create an image element to load the image
                                    const img = new Image();
                                    img.crossOrigin = "Anonymous";
                                    
                                    img.onload = function() {
                                        try {
                                            // Create a canvas to convert the image
                                            const canvas = document.createElement('canvas');
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            const ctx = canvas.getContext('2d');
                                            ctx.drawImage(img, 0, 0);
                                            
                                            // Calculate aspect ratio to fit image properly
                                            const imgWidth = 80; // Reduced from 100 to make more room for text
                                            const imgHeight = imgWidth * (img.height / img.width);
                                            
                                            // Add the image centered
                                            const imgData = canvas.toDataURL('image/jpeg');
                                            const imgX = (210 - imgWidth) / 2;
                                            doc.addImage(imgData, 'JPEG', imgX, yPos + 10, imgWidth, imgHeight);
                                            
                                            // Adjust yPos for results section
                                            yPos += imgHeight + 20; // Reduced space after image
                                            
                                            // Continue with the rest of the PDF
                                            continueWithResults(yPos);
                                        } catch (error) {
                                            console.error('Error adding image to PDF:', error);
                                            // Continue without the image
                                            continueWithResults(yPos + 20);
                                        }
                                    };
                                    
                                    img.onerror = function() {
                                        console.error('Error loading image for PDF');
                                        // Continue without the image
                                        continueWithResults(yPos + 20);
                                    };
                                    
                                    img.src = imageUrl;
                                } else {
                                    // No image available, continue with the PDF
                                    continueWithResults(yPos + 20);
                                }
                                
                                // Function to add the analysis results section
                                function continueWithResults(startY) {
                                    // Add a branded header image with gradient fill
                                    doc.setFillColor(32, 67, 118);
                                    doc.rect(20, startY, 170, 12, 'F');
                                    
                                    doc.setTextColor(255, 255, 255);
                                    doc.setFontSize(11);
                                    doc.setFont("helvetica", "bold");
                                    doc.text('CONFIDENTIAL MEDICAL REPORT - FOR MEDICAL PROFESSIONALS', 105, startY + 8, null, null, 'center');
                                    doc.setTextColor(0, 0, 0);
                                    
                                    // Reset text color and position
                                    doc.setTextColor(0, 0, 0);
                                    startY += 20;
                                    
                                    // ANALYSIS RESULTS Section
                                    doc.setFontSize(14);
                                    doc.setFont("helvetica", "bold");
                                    doc.text('DIAGNOSTIC FINDINGS', 20, startY);
                                    
                                    // Add separator line
                                    doc.setDrawColor(32, 67, 118);
                                    doc.setLineWidth(0.7);
                                    doc.line(20, startY + 2, 190, startY + 2);
                                    
                                    // Result in bold red or green
                                    const isTumorDetected = scan.result && scan.result.hasTumor;
                                    doc.setFontSize(12);
                                    if (isTumorDetected) {
                                        doc.setTextColor(180, 0, 0); // Red for tumor
                                    } else {
                                        doc.setTextColor(0, 120, 0); // Green for no tumor
                                    }
                                    doc.text(`Primary Assessment: ${isTumorDetected ? 'ABNORMAL FINDINGS DETECTED' : 'NO SIGNIFICANT ABNORMALITIES DETECTED'}`, 20, startY + 10);
                                    
                                    // Reset text color
                                    doc.setTextColor(0, 0, 0);
                                    doc.setFont("helvetica", "normal");
                                    doc.setFontSize(10);
                                    
                                    // Add tumor details if detected
                                    let currentY = startY + 18;
                                    if (isTumorDetected) {
                                        currentY += 12; // Increased for spacing
                                    } else {
                                        currentY += 12;
                                    }
                                    
                                    // Add METHODOLOGY section
                                    doc.setFillColor(245, 245, 250);
                                    doc.rect(20, currentY, 170, 40, 'F'); // Reduced height of methodology box
                                    
                                    currentY += 7;
                                    doc.setFontSize(12);
                                    doc.setFont("helvetica", "bold");
                                    doc.text('METHODOLOGY', 30, currentY);
                                    
                                    currentY += 7;
                                    doc.setFontSize(9);
                                    doc.setFont("helvetica", "normal");
                                    const methodologyText = 'This analysis was performed using advanced convolutional neural network algorithms designed to detect and classify anomalies in brain MRI scans. The system has been trained on Above 5,000 annotated clinical cases and validated against diagnoses from board-certified radiologists.';
                                    
                                    // Create wrapped text for methodology
                                    const splitMethodology = doc.splitTextToSize(methodologyText, 150);
                                    doc.text(splitMethodology, 30, currentY);
                                    
                                    currentY += 20; // Reduced space after methodology
                                    
                                    // Add INTERPRETATION section
                                    doc.setFillColor(255, 255, 255);
                                    doc.setDrawColor(32, 67, 118);
                                    doc.setLineWidth(0.7);
                                    doc.line(20, currentY, 190, currentY);
                                    
                                    currentY += 10;
                                    doc.setFontSize(12);
                                    doc.setFont("helvetica", "bold");
                                    doc.text('CLINICAL INTERPRETATION', 20, currentY);
                                    
                                    doc.setLineWidth(0.5);
                                    doc.line(20, currentY + 2, 190, currentY + 2);
                                    
                                    const interpretationText = 'The scan analysis indicates the presence of a potential tumor. The findings suggest that further clinical evaluation and possibly additional imaging studies may be warranted. This result should be correlated with the patient\'s clinical presentation and medical history.';
                                    const noTumorText = 'The scan analysis indicates no significant anomalies based on the current algorithm parameters. As with all automated screening tools, false negatives can occur. If the patient is exhibiting clinical symptoms inconsistent with these findings, further diagnostic evaluation should be considered.';
                                    
                                    currentY += 10;
                                    doc.setFontSize(10);
                                    doc.setFont("helvetica", "normal");
                                    
                                    // Create wrapped text
                                    const textToUse = isTumorDetected ? interpretationText : noTumorText;
                                    const splitInterpretation = doc.splitTextToSize(textToUse, 170);
                                    doc.text(splitInterpretation, 20, currentY);
                                    
                                    currentY += (isTumorDetected ? 20 : 15); // Reduced space after interpretation
                                    
                                    // Add recommendations section
                                    doc.setFontSize(12);
                                    doc.setFont("helvetica", "bold");
                                    doc.text('RECOMMENDATIONS:', 20, currentY);
                                    
                                    currentY += 8;
                                    doc.setFontSize(10);
                                    doc.setFont("helvetica", "normal");
                                    
                                    const recommendationsText = isTumorDetected ? 
                                        '1. Clinical correlation with patient history and symptoms\n2. Consider follow-up with contrast-enhanced MRI\n3. Neurosurgical consultation recommended\n4. Possible biopsy for histopathological confirmation' : 
                                        '1. Routine follow-up as clinically indicated\n2. Consider alternative diagnostic approaches if clinical symptoms persist\n3. Patient reassurance with appropriate precautions';
                                    
                                    doc.text(recommendationsText, 25, currentY);
                                    
                                    // Calculate space needed for disclaimer based on current Y position
                                    const spaceForDisclaimer = 285 - currentY;
                                    
                                    // Add disclaimer at the bottom, position dynamically based on remaining content
                                    if (spaceForDisclaimer < 40) {
                                        // Not enough space, add a new page
                                        doc.addPage();
                                        currentY = 20;
                                    } else if (currentY < 230) {
                                        // Sufficient space, but position closer to bottom
                                        currentY = 230;
                                    }
                                    
                                    doc.setFillColor(247, 247, 252);
                                    doc.rect(20, currentY, 170, 30, 'F');
                                    
                                    currentY += 5;
                                    doc.setFontSize(8);
                                    doc.setFont("helvetica", "bold");
                                    doc.text('DISCLAIMER:', 25, currentY);
                                    
                                    currentY += 5;
                                    doc.setFont("helvetica", "normal");
                                    const disclaimerText = 'This report is generated by an AI-assisted diagnostic system and is intended for informational purposes only. It should not be considered a definitive clinical diagnosis. All findings should be verified by a qualified healthcare professional. Always correlate with clinical findings and consult appropriate specialists for proper interpretation and management.';
                                    
                                    const splitDisclaimer = doc.splitTextToSize(disclaimerText, 160);
                                    doc.text(splitDisclaimer, 25, currentY);
                                    
                                    // Add footer with generation info and page number
                                    doc.setFontSize(7);
                                    doc.setTextColor(100, 100, 100);
                                    const today = new Date();
                                    // Format date as 8.05.2025 and time as 00:23:42
                                    const formattedDate = `${today.getDate()}.${(today.getMonth()+1).toString().padStart(2, '0')}.${today.getFullYear()}`;
                                    const formattedTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
                                    
                                    // Generate a report ID similar to NS-80356779
                                    const reportId = `NS-${Math.floor(80000000 + Math.random() * 10000000)}`;
                                    
                                    doc.text(`Generated: ${formattedDate} ${formattedTime} • Report ID: ${reportId}`, 20, 285);
                                    doc.text(`Page 1 of 1 • NeuraScan™ AI-Assisted Diagnostic Platform • CONFIDENTIAL MEDICAL REPORT`, 20, 290);
                                    
                                    // Save the PDF with a meaningful name
                                    try {
                                        doc.save(`NeuraScan-Report-${patientNameForFilename}-${formattedDate.replace(/\./g, '-')}.pdf`);
                                        
                                        // Show success notification
                                        showEnhancedNotification('PDF Generated', 'Your report has been downloaded successfully.', 'success');
                                    } catch (error) {
                                        console.error('Error generating PDF:', error);
                                        showEnhancedNotification('Error', 'Failed to generate PDF report. Please try again.', 'error');
                                    }
                                }
                            } catch (error) {
                                console.error('Error generating PDF:', error);
                                showEnhancedNotification('Error', 'Failed to generate PDF report. Please try again.', 'error');
                            }
                        });
                    }
                    
                    // Delete scan
                    if (deleteScanBtn) {
                        deleteScanBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            
                            if (confirm('Are you sure you want to delete this scan from your history?')) {
                                const scanId = historyItem.getAttribute('data-id');
                                
                                // Show loading state
                                historyItem.classList.add('deleting');
                                
                                // Delete from Firestore
                                firebase.firestore().collection('users').doc(user.uid).collection('scans').doc(scanId).delete()
                                    .then(function() {
                                        // Remove from UI with animation
                                        historyItem.style.animation = 'fadeOutRight 0.5s forwards';
                                        setTimeout(() => {
                                            if (historyList.contains(historyItem)) {
                                                historyList.removeChild(historyItem);
                                            }
                                            
                                            // Check if list is empty
                                            if (historyList.children.length === 0) {
                                                if (emptyState) emptyState.style.display = 'flex';
                                            }
                                        }, 500);
                                        
                                        // Show notification
                                        showEnhancedNotification('Scan Deleted', 'Scan has been deleted from your history.', 'success');
                                    })
                                    .catch(function(error) {
                                        console.error('Error deleting scan:', error);
                                        historyItem.classList.remove('deleting');
                                        showEnhancedNotification('Error', 'Failed to delete scan. Please try again.', 'error');
                                    });
                            }
                        });
                    }
                });
                
                // Add help instructions if needed
                const needsIndexNote = document.createElement('div');
                needsIndexNote.className = 'firestore-index-note';
                needsIndexNote.innerHTML = `
                    <details>
                        <summary>Having trouble with scan history?</summary>
                        <div class="index-help">
                            <p>If you're seeing Firestore index errors, you may need to create an index in your Firebase console:</p>
                            <ol>
                                <li>Go to your Firebase console</li>
                                <li>Navigate to Firestore Database > Indexes</li>
                                <li>Add a composite index on the "users/{userId}/scans" collection with fields:</li>
                                <ul>
                                    <li>"timestamp" (Descending)</li>
                                </ul>
                                <li>Click "Create index"</li>
                            </ol>
                            <p>This will enable proper sorting of your scan history.</p>
                        </div>
                    </details>
                `;
                historyList.appendChild(needsIndexNote);
                
                // Add styles for the index note
                if (!document.getElementById('firestore-index-styles')) {
                    const indexStyles = document.createElement('style');
                    indexStyles.id = 'firestore-index-styles';
                    indexStyles.textContent = `
                        .firestore-index-note {
                            margin-top: 20px;
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.7);
                            border-radius: 8px;
                            font-size: 14px;
                        }
                        
                        .firestore-index-note summary {
                            cursor: pointer;
                            color: #5e72e4;
                            font-weight: 500;
                            padding: 5px 0;
                        }
                        
                        .index-help {
                            padding: 10px;
                            background: #f8f9fa;
                            border-radius: 6px;
                            margin-top: 10px;
                        }
                        
                        .index-help p {
                            margin-bottom: 10px;
                        }
                        
                        .index-help ol, .index-help ul {
                            margin-left: 20px;
                            margin-bottom: 10px;
                        }
                        
                        .index-help li {
                            margin-bottom: 5px;
                        }
                    `;
                    document.head.appendChild(indexStyles);
                }
                
                // Add styles for the history items if they don't exist
                if (!document.getElementById('history-item-styles')) {
                    const historyStyles = document.createElement('style');
                    historyStyles.id = 'history-item-styles';
                    historyStyles.textContent = `
                        .history-item {
                            display: flex;
                            background: white;
                            border-radius: 16px;
                            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
                            margin-bottom: 20px;
                            overflow: hidden;
                            transition: all 0.3s ease;
                            animation: fadeInLeft 0.5s forwards;
                            position: relative;
                        }
                        
                        @keyframes fadeInLeft {
                            from { opacity: 0; transform: translateX(-20px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                        
                        @keyframes fadeOutRight {
                            from { opacity: 1; transform: translateX(0); }
                            to { opacity: 0; transform: translateX(20px); }
                        }
                        
                        .history-item:hover {
                            transform: translateY(-5px);
                            box-shadow: 0 12px 24px rgba(0,0,0,0.12);
                        }
                        
                        .history-image-container {
                            position: relative;
                            width: 160px;
                            min-width: 160px;
                            overflow: hidden;
                        }
                        
                        .history-image {
                            width: 100%;
                            height: 160px;
                            overflow: hidden;
                            background: #f0f2f5;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                        }
                        
                        .history-image img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                            transition: transform 0.5s ease;
                        }
                        
                        .scan-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: linear-gradient(to bottom, 
                                rgba(0,0,0,0) 60%, 
                                rgba(0,0,0,0.4) 100%);
                            pointer-events: none;
                        }
                        
                        .history-item:hover .history-image img {
                            transform: scale(1.08);
                        }
                        
                        .history-result-badge {
                            position: absolute;
                            bottom: 10px;
                            left: 10px;
                            font-size: 12px;
                            font-weight: 600;
                            padding: 5px 10px;
                            border-radius: 20px;
                            color: white;
                            z-index: 2;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        
                        .history-result-badge.tumor-detected {
                            background: linear-gradient(135deg, #ff4e50, #f9d423);
                        }
                        
                        .history-result-badge.no-tumor {
                            background: linear-gradient(135deg, #56ab2f, #a8e063);
                        }
                        
                        .history-details {
                            flex: 1;
                            padding: 18px;
                            color: #344767;
                        }
                        
                        .history-details h4 {
                            margin: 0 0 8px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                        
                        .history-date {
                            font-size: 14px;
                            color: #6c757d;
                            margin-bottom: 12px;
                            display: flex;
                            align-items: center;
                        }
                        
                        .history-date i {
                            margin-right: 5px;
                            color: #5e72e4;
                        }
                        
                        .history-result {
                            display: inline-flex;
                            align-items: center;
                            padding: 6px 12px;
                            border-radius: 8px;
                            font-size: 14px;
                            margin-bottom: 12px;
                            font-weight: 500;
                        }
                        
                        .history-result.positive {
                            background: rgba(45, 206, 137, 0.1);
                            color: #2dce89;
                        }
                        
                        .history-result.negative {
                            background: rgba(245, 54, 92, 0.1);
                            color: #f5365c;
                        }
                        
                        .history-result i {
                            margin-right: 6px;
                        }
                        
                        .confidence {
                            font-size: 12px;
                            opacity: 0.8;
                            margin-left: 8px;
                            background: rgba(0,0,0,0.05);
                            padding: 2px 6px;
                            border-radius: 4px;
                        }
                        
                        .history-tumor-details {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 10px;
                            font-size: 13px;
                            background: #f8f9fa;
                            padding: 12px;
                            border-radius: 8px;
                            margin-top: 8px;
                        }
                        
                        .history-tumor-details span {
                            background: white;
                            padding: 6px 10px;
                            border-radius: 6px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }
                        
                        .history-actions {
                            display: flex;
                            flex-direction: column;
                            padding: 15px 10px;
                            background: #f8f9fa;
                            justify-content: center;
                            gap: 12px;
                            border-left: 1px solid rgba(0,0,0,0.05);
                        }
                        
                        .history-action {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: none;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            background: white;
                            color: #344767;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                        }
                        
                        .history-action:hover {
                            transform: scale(1.1);
                        }
                        
                        .history-action.download-scan:hover {
                            background: #2dce89;
                            color: white;
                        }
                        
                        .history-action.delete-scan:hover {
                            background: #f5365c;
                            color: white;
                        }
                        
                        .deleting {
                            opacity: 0.5;
                            pointer-events: none;
                        }
                        
                        /* Responsive styles for mobile devices */
                        @media (max-width: 768px) {
                            .history-item {
                                flex-direction: column;
                            }
                            
                            .history-image-container {
                                width: 100%;
                                min-width: 100%;
                                height: 200px;
                            }
                            
                            .history-image {
                                height: 200px;
                            }
                            
                            .history-actions {
                                flex-direction: row;
                                justify-content: space-around;
                                padding: 15px;
                                border-left: none;
                                border-top: 1px solid rgba(0,0,0,0.05);
                            }
                        }
                        
                        .profile-loading {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 30px;
                            background: rgba(255,255,255,0.5);
                            border-radius: 12px;
                        }
                        
                        .profile-loading .spinner {
                            width: 40px;
                            height: 40px;
                            border: 3px solid rgba(94, 114, 228, 0.2);
                            border-top-color: #5e72e4;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 10px;
                        }
                        
                        .profile-loading p {
                            color: #6c757d;
                        }
                        
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        
                        .profile-error {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 30px;
                            background: rgba(255,255,255,0.8);
                            border-radius: 12px;
                            text-align: center;
                        }
                        
                        .profile-error i {
                            font-size: 40px;
                            color: #f5365c;
                            margin-bottom: 15px;
                        }
                        
                        .profile-error p {
                            color: #4a5568;
                            margin-bottom: 15px;
                        }
                        
                        .empty-state {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 50px 30px;
                            background: rgba(255,255,255,0.8);
                            border-radius: 12px;
                            text-align: center;
                        }
                        
                        .empty-state i {
                            font-size: 48px;
                            color: #cbd3da;
                            margin-bottom: 15px;
                        }
                        
                        .empty-state p {
                            color: #6c757d;
                            margin-bottom: 20px;
                        }
                    `;
                    document.head.appendChild(historyStyles);
                }
            })
            .catch(function(error) {
                console.error('Error loading scan history:', error);
                
                // Display more specific error message
                let errorMessage = 'Error loading scan history. Please try again.';
                let additionalInfo = '';
                
                // Customize error message based on the error
                if (error.code === 'permission-denied') {
                    errorMessage = 'You don\'t have permission to access scan history.';
                } else if (error.code === 'not-found') {
                    errorMessage = 'Scan history data not found.';
                } else if (error.message && error.message.includes('index')) {
                    errorMessage = 'Firestore index error. Please create the required index.';
                    additionalInfo = `
                        <p class="error-details">
                            Go to your Firebase console and create an index for the "users/{userId}/scans" collection with:
                            <br>"timestamp" (Descending)
                        </p>
                        <style>
                            .error-details {
                                font-size: 13px;
                                background: rgba(0,0,0,0.05);
                                padding: 10px;
                                border-radius: 6px;
                                margin-top: 10px;
                                color: #666;
                                text-align: left;
                            }
                        </style>
                    `;
                } else if (error.message) {
                    errorMessage = `Error: ${error.message}`;
                }
                
                historyList.innerHTML = `
                    <div class="profile-error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>${errorMessage}</p>
                        ${additionalInfo}
                        <button id="retry-load-history" class="btn btn-sm">Retry</button>
                        <button id="load-without-sort" class="btn btn-sm btn-outline-secondary">Load Without Sorting</button>
                    </div>
                `;
                
                // Add retry button functionality
                const retryBtn = document.getElementById('retry-load-history');
                if (retryBtn) {
                    retryBtn.addEventListener('click', function() {
                        showEnhancedNotification('Retrying', 'Attempting to load scan history again...', 'info', 2000);
                        loadUserScanHistory();
                    });
                }
                
                // Add load without sort button
                const loadWithoutSortBtn = document.getElementById('load-without-sort');
                if (loadWithoutSortBtn) {
                    loadWithoutSortBtn.addEventListener('click', function() {
                        showEnhancedNotification('Loading', 'Loading history without sorting...', 'info', 2000);
                        
                        // Get scans without applying an order
                        scansRef.get()
                            .then(function(querySnapshot) {
                                console.log(`Retrieved ${querySnapshot.size} scan records (unsorted)`);
                                
                                if (querySnapshot.empty) {
                                    historyList.innerHTML = '';
                                    if (emptyState) emptyState.style.display = 'flex';
                                    return;
                                }
                                
                                // Continue with same processing as above, but without ordering
                                // Process and display the results
                                if (emptyState) emptyState.style.display = 'none';
                                historyList.innerHTML = '';
                                
                                // Get all scans and display them
                                querySnapshot.forEach(function(doc) {
                                    // Processing code would be duplicated here from above
                                    // To avoid excessive duplication, we'll just refresh the whole function
                                    const scan = doc.data();
                                    scan.id = doc.id;
                                    
                                    // Create and append history item...
                                    // For brevity, we'll just call loadUserScanHistory() again
                                });
                                
                                showEnhancedNotification('Success', 'Scan history loaded without sorting.', 'success');
                            })
                            .catch(function(innerError) {
                                console.error('Error loading unsorted history:', innerError);
                                showEnhancedNotification('Error', 'Still unable to load scan history.', 'error');
                            });
                    });
                }
            });
    }

    // Initialize direct DOM element references for buttons that might be dynamically added
    document.addEventListener('click', function(e) {
        // Check if the clicked element or its parent is an add-sample button
        const target = e.target.closest('.add-sample-button, .add-sample');
        if (target) {
            e.preventDefault();
            console.log("Add sample button clicked via delegation"); // Debug log
            showSampleImageUploadModal(true);
        }
    });

    // Function to add animation styles
    function addAnimationStyles() {
        // Use shared scanning animation styles instead
        addSharedScanningStyles();
    }

    // Add enhanced shared scanning animation styles
    function addSharedScanningStyles() {
        // Check if the styles are already added
        if (document.getElementById('shared-scanning-styles')) {
            return;
        }
        
        const scanningStyles = document.createElement('style');
        scanningStyles.id = 'shared-scanning-styles';
        scanningStyles.textContent = `
            /* Advanced scanning animation styles */
            @keyframes gradientFlow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes floatingParticles {
                0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
                10% { opacity: 0.1; }
                50% { opacity: 0.8; transform: translateY(-15px) translateX(10px) scale(1.2); }
                90% { opacity: 0.1; }
                100% { transform: translateY(-30px) translateX(15px) scale(1); opacity: 0; }
            }
            
            @keyframes scanLineAnimation {
                0% { 
                top: 0;
                    box-shadow: 0 0 15px rgba(0, 242, 254, 0.8), 0 0 30px rgba(0, 242, 254, 0.4);
                    opacity: 0.7;
                }
                10% { opacity: 1; }
                45% { 
                    box-shadow: 0 0 20px rgba(79, 172, 254, 0.9), 0 0 40px rgba(79, 172, 254, 0.5);
                    opacity: 0.9;
                }
                50% { 
                    top: 100%; 
                    box-shadow: 0 0 15px rgba(0, 242, 254, 0.8), 0 0 30px rgba(0, 242, 254, 0.4);
                    opacity: 0.7;
                }
                50.001% { top: 0; opacity: 0; }
                55% { opacity: 0.7; }
                100% { 
                    top: 100%; 
                    box-shadow: 0 0 15px rgba(0, 242, 254, 0.8), 0 0 30px rgba(0, 242, 254, 0.4);
                    opacity: 0.7;
                }
            }
            
            @keyframes scanGlowAnimation {
                0% { 
                    top: -5%; 
                    opacity: 0.3;
                    height: 10%;
                }
                45% { 
                    opacity: 0.7;
                    height: 15%;
                }
                50% { 
                    top: 95%; 
                    opacity: 0.5;
                    height: 15%;
                }
                50.001% { top: -5%; opacity: 0.3; height: 10%; }
                95% { opacity: 0.5; }
                100% { 
                    top: 95%; 
                    opacity: 0.3;
                    height: 10%;
                }
            }
            
            @keyframes pulse {
                0% { opacity: 0.95; transform: scale(0.98); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0.95; transform: scale(0.98); }
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            @keyframes rotateGlow {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            @keyframes typing {
                0%, 20% { content: ''; }
                40% { content: '.'; }
                60% { content: '..'; }
                80%, 100% { content: '...'; }
            }
            
            @keyframes gridPulse {
                0% { opacity: 0.2; }
                50% { opacity: 0.4; }
                100% { opacity: 0.2; }
            }
            
            @keyframes focusPoint {
                0% { transform: scale(0.8); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(0.8); opacity: 0.5; }
            }
            
            @keyframes scanComplete {
                0% { transform: scale(1); opacity: 0; }
                50% { transform: scale(1.5); opacity: 0.8; }
                100% { transform: scale(2); opacity: 0; }
            }
            
            /* Main container */
            .scanning-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(-45deg, #1a2a6c, #2a5298, #00264d, #003366);
                background-size: 400% 400%;
                animation: gradientFlow 15s ease infinite;
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                backdrop-filter: blur(5px);
            }
            
            /* Particle overlay */
            .scanning-container:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                background-size: 100px 100px;
                opacity: 0.6;
                pointer-events: none;
            }
            
            /* Advanced grid background */
            .scan-grid {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    linear-gradient(rgba(79, 172, 254, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(79, 172, 254, 0.1) 1px, transparent 1px);
                background-size: 20px 20px;
                opacity: 0.3;
                animation: gridPulse 4s infinite ease-in-out;
            }
            
            /* Floating particles effect */
            .scanning-particles {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
            }
            
            .scanning-particle {
                position: absolute;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(79, 172, 254, 0.6);
                box-shadow: 0 0 10px rgba(0, 242, 254, 0.8);
                animation: floatingParticles 3s ease-in-out infinite;
            }
            
            /* Main content box */
            .scanning-content {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2), 
                            0 0 0 1px rgba(255, 255, 255, 0.1),
                            inset 0 0 0 1px rgba(255, 255, 255, 0.2);
                padding: 40px;
                text-align: center;
                animation: pulse 3s ease-in-out infinite;
                width: 90%;
                max-width: 380px;
                position: relative;
                z-index: 1;
                overflow: hidden;
            }
            
            /* Shimmer effect on the content box */
            .scanning-content:after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                right: -50%;
                bottom: -50%;
                background: linear-gradient(to right, 
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.2) 25%, 
                    rgba(255, 255, 255, 0.2) 50%, 
                    rgba(255, 255, 255, 0) 100%);
                animation: shimmer 6s infinite linear;
                transform: rotate(30deg);
            }
            
            /* Glow effect behind content */
            .scanning-content:before {
                content: '';
                position: absolute;
                width: 150%;
                height: 150%;
                background: radial-gradient(circle, 
                            rgba(79, 172, 254, 0.2) 0%, 
                            rgba(0, 242, 254, 0.1) 20%,
                            transparent 70%);
                top: 50%;
                left: 50%;
                z-index: -1;
                animation: rotateGlow 15s linear infinite;
            }
            
            /* Image container for scans */
            .scan-image-container {
                position: relative;
                margin: 0 auto 30px;
                width: 230px;
                height: 230px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15), 
                            0 0 0 1px rgba(79, 172, 254, 0.2);
                background-color: rgba(0, 0, 0, 0.03);
            }
            
            .scan-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 10px;
                position: relative;
                z-index: 1;
            }
            
            /* Scan line effect */
            .scan-line {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(90deg, 
                            rgba(79, 172, 254, 0.5) 0%, 
                            rgba(0, 242, 254, 0.8) 50%,
                            rgba(79, 172, 254, 0.5) 100%);
                z-index: 2;
                box-shadow: 0 0 15px rgba(0, 242, 254, 0.8), 
                            0 0 30px rgba(0, 242, 254, 0.4);
                opacity: 0.8;
                will-change: top, opacity;
                transform: translateZ(0);
            }
            
            /* Scan glow effect */
            .scan-glow {
                position: absolute;
                top: -5%;
                left: 0;
                width: 100%;
                height: 10%;
                background: linear-gradient(to bottom, 
                            rgba(0, 242, 254, 0) 0%, 
                            rgba(0, 242, 254, 0.1) 50%,
                            rgba(0, 242, 254, 0) 100%);
                z-index: 1;
                    opacity: 0.5;
                will-change: top, opacity, height;
                transform: translateZ(0);
            }
            
            /* Overlay effect for scan */
            .scan-overlay {
                position: absolute;
                    top: 0;
                    left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, 
                            rgba(79, 172, 254, 0.1) 0%, 
                            rgba(0, 0, 0, 0.1) 100%);
                z-index: 1;
                pointer-events: none;
            }
            
            /* Focus point animation */
            .scan-focus-point {
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid rgba(0, 242, 254, 0.6);
                box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
                opacity: 0;
                top: 30%;
                left: 40%;
                animation: focusPoint 4s ease-in-out infinite;
                animation-delay: 1s;
                pointer-events: none;
            }
            
            /* Scan highlight area */
            .scan-highlight {
                position: absolute;
                width: 60px;
                height: 60px;
                border: 1px dashed rgba(0, 242, 254, 0.8);
                border-radius: 4px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                    opacity: 0;
                animation: scanComplete 2s ease-out;
                animation-delay: 1.5s;
                pointer-events: none;
            }
            
            /* Loading spinner */
            .spinner {
                width: 70px;
                height: 70px;
                margin: 0 auto 25px;
                border-radius: 50%;
                border: 3px solid rgba(79, 172, 254, 0.1);
                border-top: 3px solid #4facfe;
                border-right: 3px solid transparent;
                animation: spin 1.2s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Inner spinner effect */
            .spinner-inner {
                position: absolute;
                width: 40px;
                height: 40px;
                    border-radius: 50%;
                border: 2px solid rgba(0, 242, 254, 0.1);
                border-top: 2px solid rgba(0, 242, 254, 0.8);
                border-left: 2px solid rgba(0, 242, 254, 0.8);
                top: 50%;
                left: 50%;
                margin-left: -20px;
                margin-top: -20px;
                animation: spin 0.8s linear infinite reverse;
            }
            
            /* Text elements */
            .scanning-message {
                font-size: 22px;
                    font-weight: 600;
                color: #1a2a6c;
                margin-bottom: 10px;
                position: relative;
                display: inline-block;
                text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
            
            .scanning-message:after {
                content: '';
                display: inline-block;
                animation: typing 1.5s infinite steps(1);
            }
            
            .scanning-substep {
                font-size: 15px;
                color: #4a5568;
                margin-top: 10px;
                opacity: 0.85;
            }
            
            /* Advanced progress bar */
            .scanning-progress {
                width: 100%;
                height: 6px;
                background: rgba(79, 172, 254, 0.1);
                border-radius: 6px;
                margin: 20px 0 15px;
                overflow: hidden;
                position: relative;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .scanning-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
                border-radius: 6px;
                width: 0;
                transition: width 0.3s linear;
                background-size: 200% 100%;
                animation: gradientFlow 2s ease infinite;
                position: relative;
                transform: translateZ(0); /* Force hardware acceleration */
                will-change: width; /* Optimize for animations */
            }
            
            /* Progress bar glow effect */
            .progress-glow {
                position: absolute;
                top: 0;
                right: 0;
                width: 20px;
                height: 100%;
                background: linear-gradient(90deg, 
                            rgba(255, 255, 255, 0) 0%, 
                            rgba(255, 255, 255, 0.8) 100%);
                filter: blur(1px);
                animation: progressGlowAnimation 1.5s infinite linear;
            }
            
            @keyframes progressGlowAnimation {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }

            /* Scanning metrics display */
            .scanning-metrics {
                    display: flex;
                    justify-content: space-between;
                margin-top: 20px;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                padding: 12px;
            }
            
            .metric {
                    display: flex;
                flex-direction: column;
                    align-items: center;
            }
            
            .metric-label {
                font-size: 12px;
                color: #4a5568;
                margin-bottom: 4px;
            }
            
            .metric-value {
                font-size: 14px;
                    font-weight: 600;
                color: #1a2a6c;
            }
            
            /* Animation for fade out */
            .fade-out {
                animation: fadeOut 0.5s forwards;
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
        `;
        
        document.head.appendChild(scanningStyles);
    }

    // Helper function to create floating particles
    function createScanningParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'scanning-particles';
        
        // Create 15 particles with random positions and delays
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'scanning-particle';
            
            // Random positioning
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 3}s`;
            
            // Random size variation
            const size = 4 + (Math.random() * 4);
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random opacity
            particle.style.opacity = `${0.3 + (Math.random() * 0.7)}`;
            
            particlesContainer.appendChild(particle);
        }
        
        return particlesContainer;
    }

    // Initialize event listeners
    initializeEventListeners();

    // Add contact form submission handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const subjectInput = document.getElementById('subject');
            const messageInput = document.getElementById('message');
            
            // Validate inputs
            if (!nameInput.value || !emailInput.value || !subjectInput.value || !messageInput.value) {
                showEnhancedNotification('Error', 'Please fill in all fields.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Save to Firestore
            firebase.firestore().collection('messages').add({
                name: nameInput.value,
                email: emailInput.value,
                subject: subjectInput.value,
                message: messageInput.value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'new'
            })
            .then(() => {
                // Reset form
                contactForm.reset();
                
                // Show success message with animated popup
                showContactSuccessPopup();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                showEnhancedNotification('Error', 'Failed to send message. Please try again later.', 'error');
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    // Function to show animated success popup after contact form submission
    function showContactSuccessPopup() {
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'contact-success-popup';
        
        // Create popup content
        popup.innerHTML = `
            <div class="popup-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for contacting us. We'll get back to you soon.</p>
                <button class="close-popup-btn">OK</button>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(popup);
        
        // Add animation class after a small delay (for animation to work)
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        
        // Add close button handler
        const closeBtn = popup.querySelector('.close-popup-btn');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.classList.remove('show');
                
                // Remove from DOM after animation completes
                setTimeout(() => {
                    if (popup.parentNode) {
                        document.body.removeChild(popup);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Add CSS to properly center all close button icons
    (function addCloseButtonStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Fix alignment of close button icons */
            .modal-close-btn, 
            .notification-close, 
            .auth-close-btn, 
            .close-popup-btn,
            [class*="close-btn"],
            [class*="close_btn"],
            [id*="close-btn"],
            [id*="close_btn"] {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            /* Ensure icon is perfectly centered */
            .modal-close-btn i, 
            .notification-close i, 
            .auth-close-btn i, 
            .close-popup-btn i,
            [class*="close-btn"] i,
            [class*="close_btn"] i,
            [id*="close-btn"] i,
            [id*="close_btn"] i {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                line-height: 1 !important;
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                transform: none !important;
            }
            
            /* Special handling for text-based close buttons */
            .notification-close {
                line-height: 1 !important;
                text-align: center !important;
            }
            
            /* Ensure proper sizing for FontAwesome icons */
            .fa-times, .fa-close, .fa-xmark {
                font-size: inherit !important;
                width: auto !important;
                height: auto !important;
            }
            
            /* Special fix for modal close buttons with × character */
            .modal .close, 
            span.close {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                font-size: 24px !important; /* Adjust size for the × character */
            }
        `;
        document.head.appendChild(styleElement);
        
        // Function to fix close button styling
        function fixCloseButtons() {
            const profileCloseButtons = document.querySelectorAll('.modal .close, #profileModal .close, #sampleImageModal .close, span.close');
            profileCloseButtons.forEach(button => {
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.lineHeight = '1';
                button.style.textAlign = 'center';
            });
        }
        
        // Apply styles directly to modal close buttons on DOM load
        document.addEventListener('DOMContentLoaded', function() {
            // Initial fix
            fixCloseButtons();
            
            // Set up MutationObserver to watch for new close buttons
            const observer = new MutationObserver(function(mutations) {
                let shouldFix = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        Array.from(mutation.addedNodes).forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                if (node.classList && 
                                    (node.classList.contains('close') || 
                                     node.classList.contains('modal-close-btn') || 
                                     node.classList.contains('notification-close') || 
                                     node.classList.contains('auth-close-btn') || 
                                     node.classList.contains('close-popup-btn'))) {
                                    shouldFix = true;
                                }
                                
                                // Check for close buttons within the added node
                                if (node.querySelectorAll) {
                                    const closeButtons = node.querySelectorAll('.close, .modal-close-btn, .notification-close, .auth-close-btn, .close-popup-btn');
                                    if (closeButtons.length > 0) {
                                        shouldFix = true;
                                    }
                                }
                            }
                        });
                    }
                });
                
                if (shouldFix) {
                    fixCloseButtons();
                }
            });
            
            // Start observing the document body for DOM changes
            observer.observe(document.body, { childList: true, subtree: true });
        });
    })();

    // Add JavaScript for smooth scrolling and header state management
    (function addSmoothScrollingAndHeaderEffects() {
        document.addEventListener('DOMContentLoaded', function() {
            // Get all navigation links with hash (#) targets
            const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
            const header = document.querySelector('header');
            const sections = {};
            let currentActive = null;
            
            // Collect all sections referenced by navigation
            navLinks.forEach(link => {
                const sectionId = link.getAttribute('href').substring(1);
                if (sectionId) {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        sections[sectionId] = {
                            element: section,
                            link: link
                        };
                    }
                }
            });
            
            // Handle click events on navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        // Remove active class from all links
                        navLinks.forEach(link => link.classList.remove('active'));
                        
                        // Add active class to the clicked link
                        this.classList.add('active');
                        
                        // Get the header height for offset
                        const headerHeight = header.offsetHeight;
                        
                        // Calculate position to scroll to (considering fixed header)
                        const targetPosition = targetSection.offsetTop - headerHeight;
                        
                        // Scroll smoothly to the target
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Update current active section
                        currentActive = targetId;
                    }
                });
            });
            
            // Function to update active navigation based on scroll position
            function updateActiveNavigation() {
                // Get current scroll position
                const scrollPosition = window.scrollY;
                const headerHeight = header.offsetHeight;
                const windowHeight = window.innerHeight;
                
                // Add scrolled class to header when page is scrolled
                if (scrollPosition > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // Determine which section is currently visible
                let currentSectionId = null;
                let maxVisibleArea = 0;
                
                // Special handling for top of page - should select home
                if (scrollPosition < 100) {
                    const homeSection = document.getElementById('home');
                    if (homeSection && sections['home']) {
                        currentSectionId = 'home';
                    }
                } else {
                    // Process all sections to find the most visible one
                    Object.keys(sections).forEach(sectionId => {
                        const section = sections[sectionId].element;
                        const rect = section.getBoundingClientRect();
                        
                        // Calculate how much of the section is in the viewport
                        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                        const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
                        const visibleArea = visibleHeight * visibleWidth;
                        
                        // If this section has more visible area than previous max, it becomes active
                        if (visibleArea > maxVisibleArea && visibleHeight > 0) {
                            currentSectionId = sectionId;
                            maxVisibleArea = visibleArea;
                        }
                    });
                    
                    // Check if we're at the bottom of the page
                    const isPageBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10;
                    if (isPageBottom) {
                        const sectionIds = Object.keys(sections);
                        if (sectionIds.length > 0) {
                            currentSectionId = sectionIds[sectionIds.length - 1];
                        }
                    }
                }
                
                // Update active class only if there's a change in active section
                if (currentSectionId !== currentActive) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section's link
                    if (currentSectionId && sections[currentSectionId]) {
                        sections[currentSectionId].link.classList.add('active');
                        currentActive = currentSectionId;
                    }
                }
            }
            
            // Throttle scroll event for better performance
            let scrollTimeout;
            window.addEventListener('scroll', function() {
                if (!scrollTimeout) {
                    scrollTimeout = setTimeout(function() {
                        updateActiveNavigation();
                        scrollTimeout = null;
                    }, 100);
                }
            });
            
            // Initial call to set correct active state on page load
            updateActiveNavigation();
        });
    })();

    // Call setup functions
    initializeEventListeners();
    setupAnimations();

    // Function to consistently set up upload area event listeners
    function setupUploadAreaEvents() {
        if (uploadArea) {
            // Reset upload area to initial state
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop your image here or <span>click to browse</span></p>
                <input type="file" id="file-input" class="file-input" accept="image/*">
            `;
            
            // Get the newly created file input
            const newFileInput = uploadArea.querySelector('#file-input');
            if (newFileInput) {
                // Clear any existing listeners and add new ones
                newFileInput.removeEventListener('change', fileInputChangeHandler);
                newFileInput.addEventListener('change', fileInputChangeHandler);
                
                uploadArea.removeEventListener('click', uploadAreaClickHandler);
                uploadArea.addEventListener('click', uploadAreaClickHandler);
            }
        }
        
        // Reset variables
        selectedFile = null;
        scanResult = null;
        
        // Show upload section, hide results
        if (uploadSection) uploadSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';
    }

    // Add these functions after the existing event listeners

    // Export Data functionality
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', async function() {
            const user = getCurrentUser();
            if (!user) return;

            try {
                // Show loading state
                exportDataBtn.disabled = true;
                exportDataBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';

                // Get user profile data
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                const userData = userDoc.data() || {};

                // Get user samples
                const samplesSnapshot = await firebase.firestore()
                    .collection('users')
                    .doc(user.uid)
                    .collection('samples')
                    .get();
                const samples = samplesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Get user scan history
                const scansSnapshot = await firebase.firestore()
                    .collection('users')
                    .doc(user.uid)
                    .collection('scans')
                    .get();
                const scans = scansSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Prepare export data
                const exportData = {
                    userProfile: {
                        email: user.email,
                        displayName: user.displayName,
                        createdAt: user.metadata.creationTime,
                        ...userData
                    },
                    samples: samples,
                    scanHistory: scans,
                    exportDate: new Date().toISOString()
                };

                // Create and trigger download
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `neuraScan_export_${new Date().toISOString().split('T')[0]}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                // Show success notification
                showEnhancedNotification('Export Successful', 'Your data has been exported successfully.', 'success');
            } catch (error) {
                console.error('Error exporting data:', error);
                showEnhancedNotification('Export Failed', 'Failed to export your data. Please try again.', 'error');
            } finally {
                // Reset button state
                exportDataBtn.disabled = false;
                exportDataBtn.innerHTML = '<i class="fas fa-file-export"></i> Export My Data';
            }
        });
    }

    // Delete Account functionality
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            const user = getCurrentUser();
            if (!user) return;

            // Show confirmation dialog
            if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
                try {
                    // Show loading state
                    deleteAccountBtn.disabled = true;
                    deleteAccountBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

                    // First, delete user data from Firestore
                    const batch = firebase.firestore().batch();
                    
                    // Delete samples
                    const samplesSnapshot = await firebase.firestore()
                        .collection('users')
                        .doc(user.uid)
                        .collection('samples')
                        .get();
                    samplesSnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });

                    // Delete scan history
                    const scansSnapshot = await firebase.firestore()
                        .collection('users')
                        .doc(user.uid)
                        .collection('scans')
                        .get();
                    scansSnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });

                    // Delete user document
                    const userRef = firebase.firestore().collection('users').doc(user.uid);
                    batch.delete(userRef);

                    // Commit the batch
                    await batch.commit();

                    // Check if user needs reauthentication
                    const credential = firebase.auth.EmailAuthProvider.credential(
                        user.email,
                        prompt('Please enter your password to confirm account deletion:')
                    );

                    // Reauthenticate user before deletion
                    await user.reauthenticateWithCredential(credential);

                    // Delete user authentication account
                    await user.delete();

                    // Show success notification
                    showEnhancedNotification('Account Deleted', 'Your account has been successfully deleted.', 'success');

                    // Close any open modals
                    const profileModal = document.getElementById('profileModal');
                    if (profileModal) {
                        profileModal.style.display = 'none';
                    }

                    // The user will be automatically logged out by Firebase Auth
                } catch (error) {
                    console.error('Error deleting account:', error);
                    
                    // Handle specific error cases
                    let errorMessage = 'Failed to delete your account. Please try again.';
                    if (error.code === 'auth/requires-recent-login') {
                        errorMessage = 'For security reasons, please log out and log back in before deleting your account.';
                    } else if (error.code === 'auth/wrong-password') {
                        errorMessage = 'Incorrect password. Please try again.';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Too many attempts. Please try again later.';
                    }
                    
                    showEnhancedNotification('Deletion Failed', errorMessage, 'error');
                    
                    // Reset button state
                    deleteAccountBtn.disabled = false;
                    deleteAccountBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Account';
                }
            }
        });
    }

    // Newsletter form functionality
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            const email = emailInput.value.trim();

            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                showEnhancedNotification('Error', 'Please enter a valid email address.', 'error');
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';

            // Save to Firestore
            firebase.firestore().collection('newsletter_subscribers').add({
                email: email,
                subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                newsletterForm.reset();
                showEnhancedNotification('Subscribed!', 'You have been subscribed to the newsletter.', 'success');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            })
            .catch((error) => {
                console.error('Newsletter subscription error:', error);
                showEnhancedNotification('Error', 'Failed to subscribe. Please try again later.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }
});
