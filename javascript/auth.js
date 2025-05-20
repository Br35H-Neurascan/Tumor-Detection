// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure Firebase is available
    if (typeof firebase === 'undefined') {
        console.error("Firebase authentication is not available. Check your script loading.");
        alert("Error: Firebase failed to load. Authentication may not work correctly.");
        return;
    }

    // Authentication Elements
    const authContainer = document.getElementById('auth-container');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const resetForm = document.getElementById('reset-form');
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');
    const resetButton = document.getElementById('reset-button');
    const loginNavButton = document.getElementById('login-nav-button');
    const forgotPassword = document.getElementById('forgot-password');
    const backToLogin = document.getElementById('back-to-login');
    const googleLoginButton = document.getElementById('google-login');
    const logoutButton = document.getElementById('logout-button');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const viewHistory = document.getElementById('view-history');
    const accountSettings = document.getElementById('account-settings');
    const authCloseBtn = document.getElementById('auth-close');

    // Global variables
    let currentUser = null;

    // Define default profile avatar as a data URI
    const defaultAvatarDataURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI1NiIgZmlsbD0iI2YwZjBmMCIvPjxwYXRoIGZpbGw9IiM2Yzc1N2QiIGQ9Ik0yNTYgMzA0Yy02MS44IDAtMTEyLTUwLjItMTEyLTExMlMxOTQuMiA4MCAyNTYgODBzMTEyIDUwLjIgMTEyIDExMi01MC4yIDExMi0xMTIgMTEyem0wIDQ4YzExMiAwIDIxNiA2MC4yIDIxNiAxNjh2MzJIMzJ2LTMyYzAtOTYgODgtMTY4IDIyNC0xNjh6Ii8+PC9zdmc+';

    //----------------------------------------------
    // Firebase Authentication State Listener
    //----------------------------------------------
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log("User is signed in:", user.email);
            console.log("User account created:", user.metadata.creationTime);
            currentUser = user;

            // Update the UI for authenticated user
            if (loginNavButton) loginNavButton.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            
            // Update user profile in the navbar
            if (userAvatar) {
                userAvatar.src = user.photoURL || defaultAvatarDataURI;
            }
            
            if (userName) {
                userName.textContent = user.displayName || user.email.split('@')[0];
            }

            // Update profile UI with user data
            updateProfileUI(user);
            
            // Update member date immediately
            displayMemberDate();
            
            // Load user data (history, samples, etc.)
            // This will be called from script.js
            if (typeof loadUserData === 'function') {
                loadUserData();
            }

            // Check email verification status if the modal is closed
            if (authContainer && authContainer.style.display !== 'flex') {
                checkEmailVerification();
            }
            
            // Dispatch an event so other scripts can react to login
            document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
        } else {
            // User is signed out
            console.log("User is signed out");
            currentUser = null;

            // Update the UI for non-authenticated user
            if (loginNavButton) loginNavButton.style.display = 'inline-block';
            if (userProfile) userProfile.style.display = 'none';

            // Dispatch an event so other scripts can react to logout
            document.dispatchEvent(new CustomEvent('userLoggedOut'));
        }
    });

    // Set up auth UI event listeners
    function setupAuthUIListeners() {
        // Open auth modal when login button is clicked
        if (loginNavButton) {
            loginNavButton.addEventListener('click', function() {
                if (authContainer) {
                    authContainer.style.display = 'flex';
                    // Default to login tab
                    if (loginTab) loginTab.click();
                }
            });
        }

        // Close auth modal when close button is clicked
        if (authCloseBtn) {
            authCloseBtn.addEventListener('click', function() {
                if (authContainer) {
                    authContainer.style.display = 'none';
                }
            });
        }

        // Close auth modal when clicking outside the modal
        if (authContainer) {
            authContainer.addEventListener('click', function(e) {
                if (e.target === authContainer) {
                    authContainer.style.display = 'none';
                }
            });
        }

        // Switch to login tab
        if (loginTab) {
            loginTab.addEventListener('click', function() {
                loginTab.classList.add('active');
                if (signupTab) signupTab.classList.remove('active');
                if (loginForm) loginForm.style.display = 'block';
                if (signupForm) signupForm.style.display = 'none';
                if (resetForm) resetForm.style.display = 'none';
            });
        }

        // Switch to signup tab
        if (signupTab) {
            signupTab.addEventListener('click', function() {
                signupTab.classList.add('active');
                if (loginTab) loginTab.classList.remove('active');
                if (signupForm) signupForm.style.display = 'block';
                if (loginForm) loginForm.style.display = 'none';
                if (resetForm) resetForm.style.display = 'none';
            });
        }

        // Show password reset form
        if (forgotPassword) {
            forgotPassword.addEventListener('click', function() {
                if (loginForm) loginForm.style.display = 'none';
                if (resetForm) resetForm.style.display = 'block';
            });
        }

        // Go back to login form from reset form
        if (backToLogin) {
            backToLogin.addEventListener('click', function() {
                if (resetForm) resetForm.style.display = 'none';
                if (loginForm) loginForm.style.display = 'block';
            });
        }

        // Handle login form submission
        if (loginButton) {
            loginButton.addEventListener('click', function() {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const messageElement = document.getElementById('login-message');
                
                if (!email || !password) {
                    if (messageElement) messageElement.textContent = 'Please enter both email and password.';
                    return;
                }
                
                // Disable button and show loading state
                loginButton.disabled = true;
                loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(function(userCredential) {
                        // Hide auth modal after successful login
                        if (authContainer) authContainer.style.display = 'none';
                        
                        // Show notification
                        showNotification('Login Successful', 'Welcome back to NeuraScan!', 'success');
                    })
                    .catch(function(error) {
                        console.error('Login error:', error);
                        
                        // Show error message
                        if (messageElement) {
                            if (error.code === 'auth/wrong-password') {
                                messageElement.textContent = 'Incorrect password. Please try again.';
                            } else if (error.code === 'auth/user-not-found') {
                                messageElement.textContent = 'No account found with this email.';
                            } else if (error.code === 'auth/invalid-email') {
                                messageElement.textContent = 'Invalid email format.';
                            } else if (error.code === 'auth/too-many-requests') {
                                messageElement.textContent = 'Too many failed login attempts. Please try again later.';
                            } else {
                                messageElement.textContent = error.message;
                            }
                        }
                    })
                    .finally(function() {
                        // Re-enable button and remove loading state
                        loginButton.disabled = false;
                        loginButton.innerHTML = 'Login';
                    });
            });
        }

        // Handle signup form submission
        if (signupButton) {
            signupButton.addEventListener('click', function() {
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const messageElement = document.getElementById('signup-message');
                
                if (!name || !email || !password) {
                    if (messageElement) messageElement.textContent = 'Please fill in all fields.';
                    return;
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (messageElement) messageElement.textContent = 'Please enter a valid email address.';
                    return;
                }
                
                // Password strength check
                if (password.length < 6) {
                    if (messageElement) messageElement.textContent = 'Password must be at least 6 characters.';
                    return;
                }
                
                // Disable button and show loading state
                signupButton.disabled = true;
                signupButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(function(userCredential) {
                        // Update user profile with name
                        return userCredential.user.updateProfile({
                            displayName: name
                        }).then(function() {
                            // Create user document in Firestore
                            return firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                                name: name,
                                email: email,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                scans: 0,
                                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }).then(function() {
                            // Send verification email
                            return sendEmailVerification();
                        }).then(function() {
                            // Hide auth modal
                            if (authContainer) authContainer.style.display = 'none';
                            
                            // Update user display name in UI immediately
                            if (userName) {
                                userName.textContent = name;
                            }
                            
                            // Update profile UI manually without waiting for auth state change
                            if (userAvatar) {
                                userAvatar.src = defaultAvatarDataURI;
                            }
                            
                            if (userProfile) {
                                userProfile.style.display = 'flex';
                            }
                            
                            if (loginNavButton) {
                                loginNavButton.style.display = 'none';
                            }
                            
                            // Show account created modal for new users
                            showAccountCreatedModal(name, email);
                        });
                    })
                    .catch(function(error) {
                        console.error('Signup error:', error);
                        
                        // Show error message
                        if (messageElement) {
                            if (error.code === 'auth/email-already-in-use') {
                                messageElement.textContent = 'This email is already in use.';
                            } else if (error.code === 'auth/invalid-email') {
                                messageElement.textContent = 'Invalid email format.';
                            } else if (error.code === 'auth/weak-password') {
                                messageElement.textContent = 'Password is too weak.';
                            } else if (error.code === 'auth/invalid-recipient-email') {
                                messageElement.textContent = 'This email address cannot receive emails. Please use a different email.';
                            } else if (error.code === 'auth/operation-not-allowed') {
                                messageElement.textContent = 'Email/password accounts are not enabled. Please contact support.';
                            } else {
                                messageElement.textContent = error.message;
                            }
                        }
                    })
                    .finally(function() {
                        // Re-enable button and remove loading state
                        signupButton.disabled = false;
                        signupButton.innerHTML = 'Sign Up';
                    });
            });
        }

        // Handle password reset form submission
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                const email = document.getElementById('reset-email').value;
                const messageElement = document.getElementById('reset-message');
                
                if (!email) {
                    if (messageElement) messageElement.textContent = 'Please enter your email.';
                    return;
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (messageElement) messageElement.textContent = 'Please enter a valid email address.';
                    return;
                }
                
                // Disable button and show loading state
                resetButton.disabled = true;
                resetButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                firebase.auth().sendPasswordResetEmail(email)
                    .then(function() {
                        if (messageElement) {
                            messageElement.textContent = 'Password reset email sent. Check your inbox.';
                            messageElement.style.color = 'green';
                        }
                        
                        // Automatically go back to login after 3 seconds
                        setTimeout(function() {
                            if (backToLogin) backToLogin.click();
                        }, 3000);
                    })
                    .catch(function(error) {
                        console.error('Password reset error:', error);
                        
                        if (messageElement) {
                            if (error.code === 'auth/user-not-found') {
                                messageElement.textContent = 'No account found with this email.';
                            } else if (error.code === 'auth/invalid-email') {
                                messageElement.textContent = 'Invalid email format.';
                            } else if (error.code === 'auth/invalid-recipient-email') {
                                messageElement.textContent = 'This email address cannot receive emails.';
                            } else if (error.code === 'auth/too-many-requests') {
                                messageElement.textContent = 'Too many attempts. Please try again later.';
                            } else {
                                messageElement.textContent = error.message;
                            }
                        }
                    })
                    .finally(function() {
                        // Re-enable button and remove loading state
                        resetButton.disabled = false;
                        resetButton.innerHTML = 'Reset Password';
                    });
            });
        }

        // Handle Google sign-in
        if (googleLoginButton) {
            googleLoginButton.addEventListener('click', function() {
                const provider = new firebase.auth.GoogleAuthProvider();
                signInWithProvider(provider, 'Google');
            });
        }

        // Handle Google sign-up (redirects to Google sign-in)
        const googleSignupButton = document.getElementById('google-signup');
        if (googleSignupButton) {
            googleSignupButton.addEventListener('click', function() {
                const provider = new firebase.auth.GoogleAuthProvider();
                signInWithProvider(provider, 'Google');
            });
        }

        // Handle logout
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
                firebase.auth().signOut()
                    .then(function() {
                        showNotification('Logged Out', 'You have been signed out successfully.', 'info');
                    })
                    .catch(function(error) {
                        console.error('Logout error:', error);
                        showNotification('Error', 'Failed to log out. Please try again.', 'error');
                    });
            });
        }
        
        // Password change modal handlers
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const passwordChangeModal = document.getElementById('passwordChangeModal');
        const closePasswordModal = document.getElementById('close-password-modal');
        const cancelPasswordChange = document.getElementById('cancelPasswordChange');
        const updatePasswordBtn = document.getElementById('updatePasswordBtn');
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordChangeError = document.getElementById('passwordChangeError');
        const passwordStrengthBar = document.getElementById('passwordStrengthBar');
        const passwordHint = document.getElementById('passwordHint');
        
        // Password toggle visibility buttons
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        // Password criteria elements
        const lengthCheck = document.getElementById('length-check');
        const uppercaseCheck = document.getElementById('uppercase-check');
        const lowercaseCheck = document.getElementById('lowercase-check');
        const numberCheck = document.getElementById('number-check');
        
        // Open password change modal
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', function() {
                if (passwordChangeModal) {
                    passwordChangeModal.style.display = 'flex';
                    // Clear previous inputs
                    if (currentPasswordInput) currentPasswordInput.value = '';
                    if (newPasswordInput) newPasswordInput.value = '';
                    if (confirmPasswordInput) confirmPasswordInput.value = '';
                    if (passwordChangeError) passwordChangeError.textContent = '';
                    
                    // Reset password strength indicator
                    if (passwordStrengthBar) passwordStrengthBar.style.width = '0%';
                    if (passwordHint) {
                        passwordHint.className = 'password-hint';
                        passwordHint.textContent = 'Password should be at least 8 characters';
                    }
                    
                    // Reset criteria checks
                    resetPasswordCriteria();
                }
            });
        }
        
        // Close password change modal
        if (closePasswordModal) {
            closePasswordModal.addEventListener('click', function() {
                if (passwordChangeModal) {
                    passwordChangeModal.style.display = 'none';
                }
            });
        }
        
        // Cancel password change
        if (cancelPasswordChange) {
            cancelPasswordChange.addEventListener('click', function() {
                if (passwordChangeModal) {
                    passwordChangeModal.style.display = 'none';
                }
            });
        }
        
        // Click outside modal to close
        if (passwordChangeModal) {
            passwordChangeModal.addEventListener('click', function(e) {
                if (e.target === passwordChangeModal) {
                    passwordChangeModal.style.display = 'none';
                }
            });
        }
        
        // Password toggle visibility
        if (passwordToggles) {
            passwordToggles.forEach(function(toggle) {
                toggle.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-for');
                    const passwordField = document.getElementById(targetId);
                    const icon = this.querySelector('i');
                    
                    if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        icon.className = 'far fa-eye-slash';
                    } else {
                        passwordField.type = 'password';
                        icon.className = 'far fa-eye';
                    }
                    
                    this.classList.toggle('active');
                });
            });
        }
        
        // Password strength check
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', function() {
                const password = this.value;
                
                // Check criteria
                const hasLength = password.length >= 8;
                const hasUppercase = /[A-Z]/.test(password);
                const hasLowercase = /[a-z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                
                // Update criteria UI
                updateCriteriaCheck(lengthCheck, hasLength);
                updateCriteriaCheck(uppercaseCheck, hasUppercase);
                updateCriteriaCheck(lowercaseCheck, hasLowercase);
                updateCriteriaCheck(numberCheck, hasNumber);
                
                // Calculate strength
                let strength = 0;
                if (hasLength) strength += 25;
                if (hasUppercase) strength += 25;
                if (hasLowercase) strength += 25;
                if (hasNumber) strength += 25;
                
                // Update UI
                if (passwordStrengthBar) {
                    passwordStrengthBar.style.width = strength + '%';
                    
                    if (strength <= 25) {
                        passwordStrengthBar.style.backgroundColor = '#e74c3c'; // Weak (Red)
                        if (passwordHint) {
                            passwordHint.className = 'password-hint weak';
                            passwordHint.textContent = 'Weak password';
                        }
                    } else if (strength <= 75) {
                        passwordStrengthBar.style.backgroundColor = '#f39c12'; // Medium (Orange)
                        if (passwordHint) {
                            passwordHint.className = 'password-hint medium';
                            passwordHint.textContent = 'Medium strength password';
                        }
                    } else {
                        passwordStrengthBar.style.backgroundColor = '#2ecc71'; // Strong (Green)
                        if (passwordHint) {
                            passwordHint.className = 'password-hint strong';
                            passwordHint.textContent = 'Strong password';
                        }
                    }
                }
            });
        }
        
        // Submit password change form
        if (updatePasswordBtn) {
            updatePasswordBtn.addEventListener('click', function() {
                if (passwordChangeError) passwordChangeError.textContent = '';
                
                const currentPassword = currentPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (!currentPassword || !newPassword || !confirmPassword) {
                    passwordChangeError.textContent = 'Please fill in all fields.';
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    passwordChangeError.textContent = 'New passwords do not match.';
                    return;
                }
                
                // Check if password meets minimum requirements
                const hasLength = newPassword.length >= 8;
                const hasUppercase = /[A-Z]/.test(newPassword);
                const hasLowercase = /[a-z]/.test(newPassword);
                const hasNumber = /[0-9]/.test(newPassword);
                
                if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber) {
                    passwordChangeError.textContent = 'New password does not meet all requirements.';
                    return;
                }
                
                // Disable button and show loading state
                updatePasswordBtn.disabled = true;
                updatePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
                
                // Get current user
                const user = firebase.auth().currentUser;
                if (!user) {
                    passwordChangeError.textContent = 'You must be logged in to change your password.';
                    updatePasswordBtn.disabled = false;
                    updatePasswordBtn.innerHTML = '<i class="fas fa-key"></i> Update Password';
                    return;
                }
                
                // Create credential
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    currentPassword
                );
                
                // Re-authenticate
                user.reauthenticateWithCredential(credential)
                    .then(function() {
                        // Reauthentication successful, now update password
                        return user.updatePassword(newPassword);
                    })
                    .then(function() {
                        // Password updated successfully
                        showNotification('Success', 'Your password has been updated successfully.', 'success');
                        if (passwordChangeModal) passwordChangeModal.style.display = 'none';
                    })
                    .catch(function(error) {
                        console.error('Password change error:', error);
                        
                        if (error.code === 'auth/wrong-password') {
                            passwordChangeError.textContent = 'Current password is incorrect.';
                        } else if (error.code === 'auth/weak-password') {
                            passwordChangeError.textContent = 'New password is too weak.';
                        } else {
                            passwordChangeError.textContent = error.message;
                        }
                    })
                    .finally(function() {
                        // Re-enable button and remove loading state
                        updatePasswordBtn.disabled = false;
                        updatePasswordBtn.innerHTML = '<i class="fas fa-key"></i> Update Password';
                    });
            });
        }
    }

    // Helper function for social provider sign-in
    function signInWithProvider(provider, providerName) {
        // Get the button that was clicked (either login or signup)
        const googleLoginBtn = document.getElementById('google-login');
        const googleSignupBtn = document.getElementById('google-signup');
        let clickedButton;
        if (providerName === 'Google') {
            clickedButton = document.activeElement === googleSignupBtn ? googleSignupBtn : googleLoginBtn;
        }
        // Show loading state
        if (clickedButton) {
            const originalContent = clickedButton.innerHTML;
            clickedButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            clickedButton.disabled = true;
        }
        
        // Add scopes based on provider
        if (providerName === 'Google') {
            provider.addScope('email');
            provider.addScope('profile');
        }
        
        // Set custom parameters - ensure we get a selection and persist the session
        provider.setCustomParameters({
            'prompt': 'select_account',
            'login_hint': '',  // Leave empty to show all accounts
            'include_granted_scopes': 'true'
        });

        // Set persistence to LOCAL to help keep the session
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                // Now that persistence is set, initiate the sign-in popup
                return firebase.auth().signInWithPopup(provider);
            })
            .then(function(result) {
                // This gives you a Access Token
                const credential = result.credential;
                const token = credential.accessToken;
                const user = result.user;
                // Check if this is a new user
                const isNewUser = result.additionalUserInfo.isNewUser;
                if (isNewUser) {
                    // Create user document in Firestore for new users
                    return firebase.firestore().collection('users').doc(user.uid).set({
                        name: user.displayName || '',
                        email: user.email,
                        photoURL: user.photoURL || '',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        provider: providerName,
                        scans: 0,
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() {
                        // Hide auth modal
                        if (authContainer) authContainer.style.display = 'none';
                        // Update user display name in UI immediately
                        if (userName) {
                            userName.textContent = user.displayName || user.email.split('@')[0];
                        }
                        // Update profile UI manually without waiting for auth state change
                        if (userAvatar) {
                            userAvatar.src = user.photoURL || defaultAvatarDataURI;
                        }
                        if (userProfile) {
                            userProfile.style.display = 'flex';
                        }
                        if (loginNavButton) {
                            loginNavButton.style.display = 'none';
                        }
                        // Show account created modal for new users
                        showAccountCreatedModal(user.displayName || user.email.split('@')[0], user.email);
                    });
                } else {
                    // Update last login time for existing users
                    return firebase.firestore().collection('users').doc(user.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() {
                        // Hide auth modal
                        if (authContainer) authContainer.style.display = 'none';
                        // Show welcome back message
                        showNotification('Welcome Back!', `You've signed in with ${providerName}.`, 'success');
                    });
                }
            })
            .catch(function(error) {
                console.error(`${providerName} sign-in error:`, error);
                
                // Better error handling
                if (error.code === 'auth/account-exists-with-different-credential') {
                    showNotification('Error', `This email is already used with a different sign-in method. Please use that method instead.`, 'error');
                } else if (error.code === 'auth/popup-closed-by-user') {
                    showNotification('Cancelled', `Sign-in was cancelled. Please try again.`, 'info');
                } else if (error.code === 'auth/popup-blocked') {
                    showNotification('Error', 'Sign-in popup was blocked by the browser. Please ensure popups are enabled.', 'error');
                } else if (error.code === 'auth/cancelled-popup-request') {
                    showNotification('Cancelled', 'Multiple popup requests detected. Please try again.', 'info');
                } else if (error.code === 'auth/network-request-failed') {
                    showNotification('Error', 'Network error. Please check your internet connection and try again.', 'error');
                } else {
                    showNotification('Error', `Failed to sign in with ${providerName}. ${error.message}`, 'error');
                }
            })
            .finally(function() {
                // Restore button state
                if (clickedButton) {
                    // Restore original content
                    if (providerName === 'Google') {
                        clickedButton.innerHTML = '<i class="fab fa-google"></i>';
                    }
                    clickedButton.disabled = false;
                }
            });
    }

    // Send email verification
    function sendEmailVerification() {
        const user = firebase.auth().currentUser;
        
        if (user && !user.emailVerified) {
            return user.sendEmailVerification()
                .then(function() {
                    console.log('Verification email sent');
                    return Promise.resolve();
                })
                .catch(function(error) {
                    console.error('Error sending verification email:', error);
                    
                    // Handle specific error cases
                    if (error.code === 'auth/invalid-recipient-email') {
                        showNotification('Email Error', 'Could not send verification email. The email address may be invalid.', 'error');
                    } else if (error.code === 'auth/too-many-requests') {
                        showNotification('Email Error', 'Too many verification attempts. Please try again later.', 'warning');
                    } else {
                        showNotification('Email Error', 'Failed to send verification email. Please try again later.', 'error');
                    }
                    
                    return Promise.reject(error);
                });
        }
        
        return Promise.resolve();
    }

    // Check email verification status
    function checkEmailVerification() {
        const user = firebase.auth().currentUser;
        
        if (user && !user.emailVerified) {
            // If email is not verified, show a reminder
            showVerificationReminder();
            
            // Reload user to check if they've verified their email
            user.reload().then(function() {
                if (user.emailVerified) {
                    // If verified, update UI
                    console.log('Email verified');
                    
                    // Update verification status in Firestore
                    firebase.firestore().collection('users').doc(user.uid).update({
                        emailVerified: true
                    }).catch(function(error) {
                        console.error('Error updating verification status:', error);
                    });
                }
            }).catch(function(error) {
                console.error('Error reloading user:', error);
            });
        }
    }

    // Show email verification reminder
    function showVerificationReminder() {
        const user = firebase.auth().currentUser;
        
        if (!user || user.emailVerified) return;
        
        // Check if we've already shown the reminder recently (using localStorage)
        const lastReminder = localStorage.getItem('verification_reminder_shown');
        const now = new Date().getTime();
        
        // Only show reminder once every 4 hours
        if (lastReminder && (now - parseInt(lastReminder)) < 4 * 60 * 60 * 1000) {
            return;
        }
        
        // Create reminder element
        const reminderElement = document.createElement('div');
        reminderElement.className = 'verification-reminder';
        reminderElement.innerHTML = `
            <div class="reminder-content">
                <i class="fas fa-envelope"></i>
                <div class="reminder-text">
                    <h4>Please verify your email</h4>
                    <p>We've sent a verification link to ${user.email}</p>
                </div>
                <div class="reminder-actions">
                    <button id="resend-verification" class="btn-sm">Resend</button>
                    <button id="dismiss-reminder" class="btn-sm btn-outline">Dismiss</button>
                </div>
            </div>
        `;
        
        // Add to the DOM
        document.body.appendChild(reminderElement);
        
        // Add event listeners
        document.getElementById('resend-verification').addEventListener('click', function() {
            sendEmailVerification()
                .then(function() {
                    showNotification('Email Sent', 'Verification email has been resent.', 'success');
                    document.body.removeChild(reminderElement);
                })
                .catch(function(error) {
                    showNotification('Error', 'Failed to send verification email. Try again later.', 'error');
                });
        });
        
        document.getElementById('dismiss-reminder').addEventListener('click', function() {
            document.body.removeChild(reminderElement);
            
            // Remember that we've shown the reminder
            localStorage.setItem('verification_reminder_shown', now.toString());
        });
    }

    // Format member date from user
    function formatMemberDate(user) {
        if (!user || !user.metadata || !user.metadata.creationTime) return '';
        
        const creationDate = new Date(user.metadata.creationTime);
        const now = new Date();
        const diffTime = Math.abs(now - creationDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
            return 'Joined today';
        } else if (diffDays === 1) {
            return 'Joined yesterday';
        } else if (diffDays < 30) {
            return `Joined ${diffDays} days ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `Joined ${months} ${months === 1 ? 'month' : 'months'} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `Joined ${years} ${years === 1 ? 'year' : 'years'} ago`;
        }
    }

    // Update profile UI with user information
    function updateProfileUI(user) {
        // Update all profile elements on the page
        const profileElements = {
            'profileName': user.displayName || user.email.split('@')[0],
            'profileEmail': user.email,
            'profileAvatar': user.photoURL || defaultAvatarDataURI,
            'avatarPreview': user.photoURL || defaultAvatarDataURI,
            'settingsName': user.displayName || '',
            'userEmailDisplay': user.email
        };
        
        // Update each element if it exists
        for (const [id, value] of Object.entries(profileElements)) {
            const element = document.getElementById(id);
            if (element) {
                if (id.includes('Avatar') || id.includes('Preview')) {
                    element.src = value;
                } else {
                    element.textContent = value;
                }
            }
        }
    }

    // Function to get current user (can be called from other scripts)
    window.getCurrentUser = function() {
        return firebase.auth().currentUser;
    };

    // Function to display member date
    function displayMemberDate() {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        // Get user document from Firestore
        firebase.firestore().collection('users').doc(user.uid).get()
            .then(function(doc) {
                if (doc.exists) {
                    const userData = doc.data();
                    const memberDateElement = document.getElementById('member-date');
                    
                    if (memberDateElement) {
                        if (userData.createdAt) {
                            const date = userData.createdAt.toDate();
                            const options = { year: 'numeric', month: 'long', day: 'numeric' };
                            memberDateElement.textContent = `Member since ${date.toLocaleDateString('en-US', options)}`;
                        } else {
                            memberDateElement.textContent = formatMemberDate(user);
                        }
                    }
                }
            })
            .catch(function(error) {
                console.error('Error getting user document:', error);
            });
    }

    // Show notification helper function
    function showNotification(title, message, type = 'success', duration = 5000) {
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

    // Show account created modal
    function showAccountCreatedModal(name, email) {
        const accountCreatedModal = document.getElementById('account-created-modal');
        
        // Update content with user info
        const successMessage = accountCreatedModal.querySelector('.account-success-message');
        if (successMessage) {
            successMessage.textContent = `Welcome to NeuraScan, ${name}!`;
        }
        
        const verifyMessage = accountCreatedModal.querySelector('.account-verify-message');
        if (verifyMessage) {
            verifyMessage.textContent = `We've sent a verification email to ${email}`;
        }
        
        // Display the modal
        accountCreatedModal.style.display = 'flex';
        
        // Handle close button click
        const closeBtn = document.getElementById('close-account-created');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                accountCreatedModal.style.display = 'none';
            });
        }
        
        // Handle get started button
        const getStartedBtn = document.getElementById('account-success-btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', function() {
                accountCreatedModal.style.display = 'none';
            });
        }
        
        // Close on click outside
        accountCreatedModal.addEventListener('click', function(event) {
            if (event.target === accountCreatedModal) {
                accountCreatedModal.style.display = 'none';
            }
        });
    }

    // Helper function to update password criteria check UI
    function updateCriteriaCheck(element, isValid) {
        if (!element) return;
        
        const icon = element.querySelector('.criteria-icon i');
        if (!icon) return;
        
        if (isValid) {
            icon.className = 'fas fa-check';
            element.classList.add('active');
        } else {
            icon.className = 'fas fa-times';
            element.classList.remove('active');
        }
    }
    
    // Helper function to reset password criteria UI
    function resetPasswordCriteria() {
        const criteriaItems = document.querySelectorAll('.criteria-item');
        if (criteriaItems) {
            criteriaItems.forEach(function(item) {
                const icon = item.querySelector('.criteria-icon i');
                if (icon) {
                    icon.className = 'fas fa-times';
                }
                item.classList.remove('active');
            });
        }
    }

    // Initialize auth UI elements and listeners
    setupAuthUIListeners();

    // Expose functions for use by other scripts
    window.auth = {
        getCurrentUser: function() {
            return firebase.auth().currentUser;
        },
        signOut: function() {
            return firebase.auth().signOut();
        },
        sendEmailVerification: sendEmailVerification,
        showNotification: showNotification
    };
}); 