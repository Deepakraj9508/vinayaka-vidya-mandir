 // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(error) {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });
        }

        // PWA Installation Prompt
        let deferredPrompt;
        const installPrompt = document.getElementById('installPrompt');
        const installButton = document.getElementById('installButton');
        const closeInstallPrompt = document.getElementById('closeInstallPrompt');

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            // Show the install prompt
            setTimeout(() => {
                installPrompt.classList.add('show');
            }, 5000);
        });

        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                // Clear the saved prompt since it can't be used again
                deferredPrompt = null;
                // Hide the install prompt
                installPrompt.classList.remove('show');
            }
        });

        closeInstallPrompt.addEventListener('click', () => {
            installPrompt.classList.remove('show');
        });

        // Network Status Detection
        const offlineIndicator = document.getElementById('offlineIndicator');

        window.addEventListener('online', () => {
            offlineIndicator.classList.remove('show');
        });

        window.addEventListener('offline', () => {
            offlineIndicator.classList.add('show');
        });

        // Check initial network status
        if (!navigator.onLine) {
            offlineIndicator.classList.add('show');
        }

        // Enhanced Mobile Navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        
        bottomNavItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                bottomNavItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
            });
        });

        // Handle splash screen
        const splashScreen = document.getElementById('splashScreen');
        
        // Hide splash screen after page loads
        window.addEventListener('load', function() {
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 2000);
        });

        // Your existing JavaScript remains here with these additions:
        
        // Enhanced form handling for offline capability
        function setupOfflineForms() {
            // Check if forms should be stored for later submission
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', function(e) {
                    if (!navigator.onLine) {
                        e.preventDefault();
                        // Store form data for later submission
                        const formData = new FormData(this);
                        const formObject = {};
                        for (let [key, value] of formData.entries()) {
                            formObject[key] = value;
                        }
                        
                        // Store in localStorage
                        const pendingForms = JSON.parse(localStorage.getItem('pendingForms') || '[]');
                        pendingForms.push({
                            formData: formObject,
                            timestamp: new Date().toISOString(),
                            url: window.location.href
                        });
                        localStorage.setItem('pendingForms', JSON.stringify(pendingForms));
                        
                        // Show offline message
                        alert('Your form has been saved and will be submitted when you are back online.');
                        this.reset();
                    }
                });
            });
        }

        // Submit pending forms when back online
        window.addEventListener('online', function() {
            const pendingForms = JSON.parse(localStorage.getItem('pendingForms') || '[]');
            if (pendingForms.length > 0) {
                // In a real app, you would send these to your server
                console.log('Submitting pending forms:', pendingForms);
                // Clear pending forms after submission
                localStorage.removeItem('pendingForms');
                // Show success message
                if (pendingForms.length === 1) {
                    alert('1 pending form has been submitted.');
                } else {
                    alert(`${pendingForms.length} pending forms have been submitted.`);
                }
            }
        });

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setupOfflineForms();
            
            // Your existing initialization code
            initializeAnnouncements();
            showTestimonial(currentTestimonial);
            setupFormAutoReply();
            
            // Auto-open chat bot after 30 seconds
            setTimeout(() => {
                if (!localStorage.getItem('vvm_chat_opened')) {
                    toggleChatBot();
                    localStorage.setItem('vvm_chat_opened', 'true');
                }
            }, 30000);
        });

        // Mobile menu toggle
        document.querySelector('.hamburger').addEventListener('click', function() {
            document.querySelector('.nav-menu').classList.toggle('active');
        });

        // Enhanced Announcements Ticker
        function initializeAnnouncements() {
            const ticker = document.querySelector('.announcements-ticker');
            const marquee = document.querySelector('.announcements-marquee');
            
            if (ticker) {
                // Clone announcements for seamless loop
                const announcementsList = ticker.querySelector('.announcements-list');
                const announcements = announcementsList.innerHTML;
                announcementsList.innerHTML += announcements;
                
                // Reset animation when it completes
                announcementsList.addEventListener('animationiteration', function() {
                    if (this.style.animationPlayState !== 'paused') {
                        this.style.animation = 'none';
                        setTimeout(() => {
                            this.style.animation = '';
                        }, 10);
                    }
                });
            }
            
            if (marquee) {
                // Pause/play on click
                marquee.addEventListener('click', function() {
                    const content = this.querySelector('.announcements-marquee-content');
                    if (content.style.animationPlayState === 'paused') {
                        content.style.animationPlayState = 'running';
                    } else {
                        content.style.animationPlayState = 'paused';
                    }
                });
            }
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeAnnouncements);

        // Testimonial slider functionality
        let currentTestimonial = 0;
        const testimonials = document.querySelectorAll('.testimonial-card');
        const totalTestimonials = testimonials.length;

        function showTestimonial(index) {
            testimonials.forEach((testimonial, i) => {
                testimonial.style.transform = `translateX(${100 * (i - index)}%)`;
            });
        }

        document.querySelector('.next-btn').addEventListener('click', function() {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            showTestimonial(currentTestimonial);
        });

        document.querySelector('.prev-btn').addEventListener('click', function() {
            currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
            showTestimonial(currentTestimonial);
        });

        // Initialize testimonial slider
        showTestimonial(currentTestimonial);

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    document.querySelector('.nav-menu').classList.remove('active');
                }
            });
        });

        // Form submission handlers (prevent default for demo)
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Thank you for your submission! This is a demo website, so no data was actually sent.');
            });
        });

        // Loading screen
        window.addEventListener('load', function() {
            const loading = document.querySelector('.loading');
            setTimeout(() => {
                loading.classList.add('hidden');
            }, 1000);
        });

        // Back to top button with enhanced animation
        const backToTopButton = document.querySelector('.back-to-top');

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Add click animation
            backToTopButton.style.transform = 'scale(0.9)';
            setTimeout(() => {
                backToTopButton.style.transform = '';
            }, 150);
        });

        // Auto-Reply System
        function showAutoReply(formData = {}) {
            const modal = document.getElementById('autoReplyModal');
            const referenceId = document.getElementById('referenceId');
            
            // Generate unique reference ID
            const refId = 'VVM-' + new Date().getTime();
            referenceId.textContent = refId;
            
            // Store form data in localStorage for tracking
            if (Object.keys(formData).length > 0) {
                localStorage.setItem('vvm_enquiry_' + refId, JSON.stringify({
                    ...formData,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                }));
            }
            
            modal.classList.add('active');
            
            // Auto-close after 10 seconds
            setTimeout(() => {
                if (modal.classList.contains('active')) {
                    closeAutoReply();
                }
            }, 10000);
        }

        function closeAutoReply() {
            const modal = document.getElementById('autoReplyModal');
            modal.classList.remove('active');
        }

        function sendSMSNotification() {
            alert('SMS notification feature would be integrated with your SMS service provider.');
            closeAutoReply();
        }

        // Chat Bot System
        function toggleChatBot() {
            const chatBot = document.getElementById('chatBot');
            chatBot.classList.toggle('active');
        }

        function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (message) {
                addMessage(message, 'user');
                input.value = '';
                
                // Auto-reply based on message content
                setTimeout(() => {
                    generateBotReply(message);
                }, 1000);
            }
        }

        function quickReply(type) {
            let message = '';
            switch(type) {
                case 'admissions':
                    message = "I'd like to know about admissions process";
                    break;
                case 'fees':
                    message = "Can you share the fee structure?";
                    break;
                case 'contact':
                    message = "What are the contact details?";
                    break;
            }
            
            document.getElementById('chatInput').value = message;
            sendMessage();
        }

        function addMessage(text, sender) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message message-${sender}`;
            messageDiv.innerHTML = `<p>${text}</p>`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function generateBotReply(userMessage) {
            let reply = '';
            const lowerMessage = userMessage.toLowerCase();
            
            if (lowerMessage.includes('admission') || lowerMessage.includes('admit')) {
                reply = "Our admissions are open for 2024-25 academic year. The process includes application form submission, entrance test, and personal interview. Would you like me to send you the detailed admission procedure?";
            } else if (lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
                reply = "The fee structure varies by grade level. For elementary school (1-5), it's ₹25,000 per annum. For middle school (6-8), it's ₹35,000. For high school (9-12), it's ₹45,000. All fees include books and uniform.";
            } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
                reply = "You can reach us at:\n📞 +91-9876543210\n📧 info@vinayakavidyamandir.edu\n📍 123 Education Street, Knowledge City\nOffice hours: 8 AM - 4 PM (Mon-Sat)";
            } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                reply = "Hello! Welcome to Vinayaka Vidya Mandir. How can I assist you with information about our school?";
            } else {
                reply = "Thank you for your message. Our team will get back to you with detailed information. In the meantime, you can check our website for frequently asked questions or contact us directly at info@vinayakavidyamandir.edu";
            }
            
            addMessage(reply, 'bot');
            
            // Add quick replies after bot message
            if (!lowerMessage.includes('hello') && !lowerMessage.includes('hi')) {
                setTimeout(() => {
                    const messagesContainer = document.getElementById('chatMessages');
                    const quickReplyDiv = document.createElement('div');
                    quickReplyDiv.className = 'message message-bot';
                    quickReplyDiv.innerHTML = `
                        <p>Is there anything else I can help you with?</p>
                        <div class="quick-reply-buttons">
                            <button class="quick-reply-btn" onclick="quickReply('admissions')">Admissions</button>
                            <button class="quick-reply-btn" onclick="quickReply('fees')">Fees</button>
                            <button class="quick-reply-btn" onclick="quickReply('contact')">Contact</button>
                        </div>
                    `;
                    messagesContainer.appendChild(quickReplyDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 500);
            }
        }

        // Form Auto-Reply Integration
        function setupFormAutoReply() {
            // Contact Form
            const contactForm = document.querySelector('.contact-form form').addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = {
                    name: document.getElementById('contact-name').value,
                    email: document.getElementById('contact-email').value,
                    subject: document.getElementById('contact-subject').value,
                    message: document.getElementById('contact-message').value,
                    type: 'contact'
                };
                showAutoReply(formData);
                this.reset();
            });
            
            // Admission Form
            const admissionForm = document.querySelector('.admissions-form form');
            if (admissionForm) {
                admissionForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const formData = {
                        parentName: document.getElementById('parent-name')?.value,
                        studentName: document.getElementById('student-name')?.value,
                        grade: document.getElementById('grade')?.value,
                        email: document.getElementById('email')?.value,
                        type: 'admission'
                    };
                    showAutoReply(formData);
                    this.reset();
                });
            }
            
            // Newsletter Form
            const newsletterForms = document.querySelectorAll('.newsletter-form');
            newsletterForms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('input[type="email"]').value;
                    showAutoReply({ email: email, type: 'newsletter' });
                    this.reset();
                });
            });
        }

        // Keyboard shortcuts for chat
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && document.getElementById('chatInput') === document.activeElement) {
                sendMessage();
            }
            if (e.key === 'Escape') {
                closeAutoReply();
                document.getElementById('chatBot').classList.remove('active');
            }
        });

        // Initialize auto-reply system when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setupFormAutoReply();
            
            // Auto-open chat bot after 30 seconds
            setTimeout(() => {
                if (!localStorage.getItem('vvm_chat_opened')) {
                    toggleChatBot();
                    localStorage.setItem('vvm_chat_opened', 'true');
                }
            }, 30000);
        });