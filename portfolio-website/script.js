// ===== NEURAL NETWORK BACKGROUND - MOUSE FOLLOW =====
class NeuralNetworkBackground {
    constructor() {
        this.canvas = document.getElementById('neuralNetwork');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.hoveredNode = null;
        this.animationFrame = null;
        this.isInitialized = false;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        const nodeCount = Math.min(1000, Math.floor((window.innerWidth * window.innerHeight) / 8000));
        
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 1 + Math.random() * 2,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                originalRadius: 1 + Math.random() * 2,
                isHovered: false,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.02,
                targetRadius: 0,
                currentRadius: 0,
                // Mouse follow
                followX: 0,
                followY: 0,
                isFollowing: false
            });
        }

        this.nodes.forEach(node => {
            node.currentRadius = node.radius;
            node.targetRadius = node.radius;
            node.followX = node.x;
            node.followY = node.y;
        });

        this.updateEdges();
        this.isInitialized = true;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.nodes.length > 0) {
            this.nodes.forEach(node => {
                node.x = Math.min(node.x, this.canvas.width);
                node.y = Math.min(node.y, this.canvas.height);
                node.followX = node.x;
                node.followY = node.y;
            });
        }
    }

    updateEdges() {
        this.edges = [];
        const maxDistance = 120;
        
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    this.edges.push({
                        nodeA: i,
                        nodeB: j,
                        distance: distance,
                        maxDistance: maxDistance
                    });
                }
            }
        }
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            // Find closest node
            this.hoveredNode = null;
            let minDist = 80;
            
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const node = this.nodes[i];
                const dx = this.mouse.x - node.x;
                const dy = this.mouse.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDist) {
                    this.hoveredNode = i;
                    minDist = distance;
                }
            }
            
            this.nodes.forEach((node, index) => {
                const isHovered = (index === this.hoveredNode);
                node.isHovered = isHovered;
                
                if (isHovered) {
                    node.targetRadius = node.originalRadius * 4;
                } else {
                    node.targetRadius = node.originalRadius;
                }
                
                // Set follow target when mouse is near
                if (isHovered && this.mouse.x !== null) {
                    const dx = this.mouse.x - node.x;
                    const dy = this.mouse.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 1) {
                        // FOLLOW the mouse - move TOWARD it
                        const maxOffset = 80;
                        const offset = Math.min(dist, maxOffset) * 0.5;
                        node.followX = node.x + (dx / dist) * offset;
                        node.followY = node.y + (dy / dist) * offset;
                        node.isFollowing = true;
                    }
                } else {
                    // Return to floating position
                    node.followX = node.x;
                    node.followY = node.y;
                    node.isFollowing = false;
                }
            });
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
            this.hoveredNode = null;
            
            this.nodes.forEach(node => {
                node.isHovered = false;
                node.targetRadius = node.originalRadius;
                node.followX = node.x;
                node.followY = node.y;
                node.isFollowing = false;
            });
        });

        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
            
            this.hoveredNode = null;
            let minDist = 80;
            
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const node = this.nodes[i];
                const dx = this.mouse.x - node.x;
                const dy = this.mouse.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDist) {
                    this.hoveredNode = i;
                    minDist = distance;
                }
            }
            
            this.nodes.forEach((node, index) => {
                const isHovered = (index === this.hoveredNode);
                node.isHovered = isHovered;
                
                if (isHovered) {
                    node.targetRadius = node.originalRadius * 4;
                } else {
                    node.targetRadius = node.originalRadius;
                }
                
                if (isHovered && this.mouse.x !== null) {
                    const dx = this.mouse.x - node.x;
                    const dy = this.mouse.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 1) {
                        const maxOffset = 80;
                        const offset = Math.min(dist, maxOffset) * 0.5;
                        node.followX = node.x + (dx / dist) * offset;
                        node.followY = node.y + (dy / dist) * offset;
                        node.isFollowing = true;
                    }
                } else {
                    node.followX = node.x;
                    node.followY = node.y;
                    node.isFollowing = false;
                }
            });
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
            this.hoveredNode = null;
            
            this.nodes.forEach(node => {
                node.isHovered = false;
                node.targetRadius = node.originalRadius;
                node.followX = node.x;
                node.followY = node.y;
                node.isFollowing = false;
            });
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.nodes.forEach((node) => {
            // Floating movement (always)
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off walls
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
            
            // Mouse follow attraction (smooth)
            if (node.isFollowing) {
                const dx = node.followX - node.x;
                const dy = node.followY - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0.5) {
                    const followSpeed = 0.06;
                    node.x += dx * followSpeed;
                    node.y += dy * followSpeed;
                }
            }
            
            // Clamp nodes to canvas
            node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            
            // Smooth radius transition
            const radiusDiff = node.targetRadius - node.currentRadius;
            node.currentRadius += radiusDiff * 0.1;
            
            node.pulse += node.pulseSpeed;
        });

        this.updateEdges();
        this.drawEdges();
        this.drawNodes();

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawEdges() {
        this.edges.forEach(edge => {
            const nodeA = this.nodes[edge.nodeA];
            const nodeB = this.nodes[edge.nodeB];
            
            const opacity = 1 - (edge.distance / edge.maxDistance);
            const isHovered = nodeA.isHovered || nodeB.isHovered;
            const isFollowing = nodeA.isFollowing || nodeB.isFollowing;
            
            let alpha, lineWidth;
            if (isHovered || isFollowing) {
                alpha = Math.min(1, opacity * 1.5 + 0.4);
                lineWidth = 2.5;
            } else {
                alpha = opacity * 0.4;
                lineWidth = 1.5;
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(nodeA.x, nodeA.y);
            this.ctx.lineTo(nodeB.x, nodeB.y);
            this.ctx.strokeStyle = `rgba(108, 99, 255, ${alpha})`;
            this.ctx.lineWidth = lineWidth;
            
            if (isHovered || isFollowing) {
                this.ctx.shadowColor = `rgba(108, 99, 255, ${alpha * 0.5})`;
                this.ctx.shadowBlur = 15;
            } else {
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.stroke();
        });
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    drawNodes() {
        this.nodes.forEach((node) => {
            const isHovered = node.isHovered;
            const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
            
            let radius = node.currentRadius;
            
            if (!isHovered) {
                radius += pulse * 0.3;
            }
            
            let color, alpha;
            
            if (isHovered) {
                color = '108, 99, 255';
                alpha = 1;
                radius = Math.max(radius, node.originalRadius * 3);
            } else {
                color = '108, 99, 255';
                alpha = 0.3 + pulse * 0.3;
            }
            
            if (isHovered) {
                const gradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, radius * 4
                );
                gradient.addColorStop(0, `rgba(108, 99, 255, 0.6)`);
                gradient.addColorStop(0.5, `rgba(108, 99, 255, 0.2)`);
                gradient.addColorStop(1, `rgba(108, 99, 255, 0)`);
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                const gradient2 = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, radius * 2
                );
                gradient2.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
                gradient2.addColorStop(1, `rgba(108, 99, 255, 0)`);
                this.ctx.fillStyle = gradient2;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            
            if (isHovered) {
                const gradient = this.ctx.createRadialGradient(
                    node.x - radius * 0.3, node.y - radius * 0.3, 0,
                    node.x, node.y, radius
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.5, `rgba(180, 170, 255, 1)`);
                gradient.addColorStop(1, `rgba(108, 99, 255, 1)`);
                this.ctx.fillStyle = gradient;
                this.ctx.shadowColor = `rgba(108, 99, 255, 0.9)`;
                this.ctx.shadowBlur = 40;
            } else {
                this.ctx.fillStyle = `rgba(${color}, ${alpha})`;
                this.ctx.shadowColor = `rgba(108, 99, 255, ${alpha * 0.3})`;
                this.ctx.shadowBlur = 15;
            }
            
            this.ctx.fill();
            
            if (isHovered) {
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
                this.ctx.beginPath();
                this.ctx.arc(node.x - radius * 0.2, node.y - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fill();
            }
            
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// ===== MOBILE MENU TOGGLE =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== ABOUT SECTION REVEAL ANIMATION =====
document.addEventListener('DOMContentLoaded', function() {
    const aboutSection = document.querySelector('.about');
    
    if (!aboutSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                aboutSection.classList.add('visible');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of the section is visible
        rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(aboutSection);
});

// ===== ANIMATE SKILL BARS - FIXED =====
const skillBars = document.querySelectorAll('.skill-progress');
let skillsAnimated = false; // Flag to prevent re-animation

const animateSkills = () => {
    // If already animated, skip
    if (skillsAnimated) return;
    
    const skillsSection = document.querySelector('.skills');
    if (!skillsSection) return;
    
    const sectionPosition = skillsSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.2;
    
    // Only trigger if section is in view
    if (sectionPosition < screenPosition) {
        // Set flag to true so it won't animate again
        skillsAnimated = true;
        
        skillBars.forEach((bar, index) => {
            // Store the target width
            const targetWidth = bar.style.width;
            
            // Reset to 0
            bar.style.width = '0%';
            bar.style.transition = 'none';
            
            // Animate to target with delay
            setTimeout(() => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.width = targetWidth;
            }, 100 + (index * 150));
        });
    }
};

window.addEventListener('scroll', animateSkills, { passive: true });
window.addEventListener('load', () => {
    setTimeout(animateSkills, 500);
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.5)';
        navbar.style.borderBottom = '1px solid rgba(108, 99, 255, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
        navbar.style.borderBottom = '1px solid rgba(108, 99, 255, 0.1)';
    }
});

// ===== INITIALIZE NEURAL NETWORK =====
let neuralNetwork;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        neuralNetwork = new NeuralNetworkBackground();
    }, 100);
});

window.addEventListener('beforeunload', () => {
    if (neuralNetwork) {
        neuralNetwork.destroy();
    }
});



// ===== PROJECT CARD REVEAL ANIMATION =====
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add reveal class to the card
                entry.target.classList.add('reveal');
                
                // Get image and text elements inside this card
                const image = entry.target.querySelector('.reveal-image');
                const text = entry.target.querySelector('.reveal-text');
                
                // Reveal image with slight delay
                if (image) {
                    setTimeout(() => image.classList.add('reveal'), 200);
                }
                
                // Reveal text with longer delay
                if (text) {
                    setTimeout(() => text.classList.add('reveal'), 400);
                }
                
                // Optional: Unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of the card is visible
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe each project card
    projectCards.forEach(card => {
        observer.observe(card);
    });
});

// ===== REVIEWS CARD REVEAL ANIMATION =====
document.addEventListener('DOMContentLoaded', function() {
    const reviewCards = document.querySelectorAll('.review-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 150 * index);
            }
        });
    }, {
        threshold: 0.15
    });
    
    reviewCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });
});


// ===== CONTACT FORM WITH WEB3FORMS - NO REDIRECT! =====
const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('confirmModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const editBtn = document.getElementById('editBtn');
const confirmSendBtn = document.getElementById('confirmSendBtn');

// Modal display fields
const modalName = document.getElementById('modalName');
const modalEmail = document.getElementById('modalEmail');
const modalSubject = document.getElementById('modalSubject');
const modalMessage = document.getElementById('modalMessage');

// YOUR WEB3FORMS ACCESS KEY - REPLACE THIS!
const WEB3FORMS_KEY = '9fecca46-ace4-4717-b64b-0cfbcd23e246'; // Get from web3forms.com

// Store form data
let formData = {};

// Open modal with form data
function openModal(data) {
    modalName.textContent = data.name;
    modalEmail.textContent = data.email;
    modalSubject.textContent = data.subject || 'No subject';
    modalMessage.textContent = data.message;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Show success in modal
function showSuccess() {
    document.querySelector('.modal-header h3').textContent = 'Message Sent!';
    document.querySelector('.modal-body').innerHTML = `
        <div style="text-align:center;padding:2rem 0;">
            <p style="font-size:1.2rem;color:var(--text-color);">Your message has been sent successfully!</p>
            <p style="color:#aaa;font-size:0.9rem;">I'll get back to you soon.</p>
        </div>
    `;
    confirmSendBtn.style.display = 'none';
    editBtn.textContent = 'Close';
}

// Show error in modal
function showError(message) {
    document.querySelector('.modal-header h3').textContent = 'Failed to Send';
    document.querySelector('.modal-body').innerHTML = `
        <div style="text-align:center;padding:1rem 0;">
            <div style="font-size:3rem;margin-bottom:1rem;"></div>
            <p style="font-size:1.1rem;color:#e74c3c;">Something went wrong!</p>
            <p style="color:#aaa;font-size:0.9rem;">${message || 'Please try again later.'}</p>
        </div>
    `;
    confirmSendBtn.style.display = 'none';
    editBtn.textContent = 'Close';
}

// Reset modal for next use
function resetModal() {
    document.querySelector('.modal-header h3').textContent = '📧 Review Your Message';
    document.querySelector('.modal-body').innerHTML = `
        <div class="modal-field">
            <label>Name</label>
            <p id="modalName">-</p>
        </div>
        <div class="modal-field">
            <label>Email</label>
            <p id="modalEmail">-</p>
        </div>
        <div class="modal-field">
            <label>Subject</label>
            <p id="modalSubject">-</p>
        </div>
        <div class="modal-field">
            <label>Message</label>
            <p id="modalMessage">-</p>
        </div>
    `;
    confirmSendBtn.style.display = 'block';
    confirmSendBtn.textContent = 'Confirm Send';
    confirmSendBtn.disabled = false;
    editBtn.textContent = 'Edit';
    editBtn.disabled = false;
}

// Handle form submission - Show modal
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim() || 'No subject';
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    formData = { name, email, subject, message };
    openModal(formData);
});

// Close modal with X button
closeModalBtn.addEventListener('click', function() {
    closeModal();
    setTimeout(resetModal, 300);
});

// Close modal on outside click
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
        setTimeout(resetModal, 300);
    }
});

// Edit button
editBtn.addEventListener('click', function() {
    if (editBtn.textContent === 'Close') {
        closeModal();
        setTimeout(resetModal, 300);
        return;
    }
    
    closeModal();
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    setTimeout(() => {
        document.getElementById('name').focus();
    }, 500);
});

confirmSendBtn.addEventListener('click', function() {
    confirmSendBtn.textContent = 'Sending...';
    confirmSendBtn.disabled = true;
    editBtn.disabled = true;
    
    // Prepare data for Web3Forms - WITH CUSTOM SENDER
    const data = {
        access_key: WEB3FORMS_KEY,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        from_name: 'Your Website', 
        subject: 'New Message from ' + formData.name
    };
    
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showSuccess();
            contactForm.reset();
        } else {
            throw new Error(result.message || 'Something went wrong.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.message || 'Network error. Please try again.');
    })
    .finally(() => {
        confirmSendBtn.disabled = false;
        editBtn.disabled = false;
    });
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
        setTimeout(resetModal, 300);
    }
});