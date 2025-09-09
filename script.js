// 90s Website JavaScript - Totally Rad Interactive Features!

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initVisitorCounter();
    initRandomMessages();
    initGuestbook();
    initSpecialEffects();
    showWelcomeAlert();
});

// Show a classic 90s welcome alert
function showWelcomeAlert() {
    setTimeout(function() {
        alert('Welcome to my AWESOME homepage! \n\nYou are now entering the COOLEST site on the World Wide Web! \n\nDon\'t forget to sign my guestbook! 😎');
    }, 1000);
}

// Visitor counter functionality
function initVisitorCounter() {
    // Simulate a visitor counter
    const counterElement = document.getElementById('visitor-count');
    const currentVisitorElement = document.getElementById('current-visitor');
    
    if (counterElement && currentVisitorElement) {
        // Get or create visitor count in localStorage
        let visitorCount = localStorage.getItem('visitorCount');
        if (!visitorCount) {
            visitorCount = 1337; // Start with a classic number
        } else {
            visitorCount = parseInt(visitorCount) + 1;
        }
        
        localStorage.setItem('visitorCount', visitorCount);
        
        // Animate the counter
        animateCounter(counterElement, visitorCount);
        currentVisitorElement.textContent = visitorCount + 1;
    }
}

// Animate counter digits
function animateCounter(element, targetValue) {
    let currentValue = 0;
    const increment = Math.ceil(targetValue / 50);
    
    const timer = setInterval(function() {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = String(currentValue).padStart(6, '0');
    }, 50);
}

// Random messages and effects
function initRandomMessages() {
    const messages = [
        '🌟 This site is totally rad! 🌟',
        '💫 Welcome to cyberspace! 💫',
        '🎉 You\'ve found the coolest page! 🎉',
        '🚀 Surfing the information superhighway! 🚀',
        '💻 HTML is the future! 💻'
    ];
    
    // Change the page title occasionally
    setInterval(function() {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.title = randomMessage + ' - ' + document.title.split(' - ')[1];
        
        // Reset after 3 seconds
        setTimeout(function() {
            document.title = 'Welcome to My Totally Rad Website! - Last Updated: December 1995';
        }, 3000);
    }, 15000);
}

// Guestbook functionality
function initGuestbook() {
    const guestbookForm = document.querySelector('.guestbook-form');
    
    if (guestbookForm) {
        guestbookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(guestbookForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const homepage = formData.get('homepage');
            const message = formData.get('message');
            
            if (name && message) {
                // Simulate adding to guestbook
                alert('Thanks for signing my guestbook, ' + name + '! \n\nYour message has been added to my totally rad guestbook! \n\nCome back soon! 😄');
                
                // Store in localStorage (just for fun)
                const guestbookEntries = JSON.parse(localStorage.getItem('guestbookEntries') || '[]');
                guestbookEntries.push({
                    name: name,
                    email: email,
                    homepage: homepage,
                    message: message,
                    date: new Date().toLocaleDateString()
                });
                localStorage.setItem('guestbookEntries', JSON.stringify(guestbookEntries));
                
                guestbookForm.reset();
            } else {
                alert('Please fill in your name and message! 📝');
            }
        });
    }
}

// Special 90s effects
function initSpecialEffects() {
    // Add random sparkles to the page
    setInterval(createSparkle, 2000);
    
    // Konami code easter egg
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateKonamiMode();
            konamiCode = [];
        }
    });
    
    // Update last updated date
    updateLastUpdated();
}

// Create sparkle effects
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    sparkle.style.fontSize = '20px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.animation = 'sparkleAnimation 2s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(function() {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 2000);
}

// Konami code activation
function activateKonamiMode() {
    alert('🎮 KONAMI CODE ACTIVATED! 🎮\n\nYou have unlocked the secret 90s power-user mode!\n\nYou are truly a master of the information superhighway!');
    
    // Add extra effects
    document.body.style.animation = 'rainbowShift 0.5s infinite';
    
    // Create disco ball effect
    for (let i = 0; i < 20; i++) {
        setTimeout(createSparkle, i * 100);
    }
    
    // Reset after 5 seconds
    setTimeout(function() {
        document.body.style.animation = '';
    }, 5000);
}

// Update last updated date with current date
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        lastUpdatedElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Classic 90s right-click protection (just for fun)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('Nice try! But this page is protected by the latest in 90s security technology! 🔒\n\n(Just kidding - this is just for the authentic 90s experience!)');
});

// Status bar messages (for browsers that still support it)
function setStatusMessage(message) {
    if (window.status !== undefined) {
        window.status = message;
    }
}

// Add hover effects to links
document.addEventListener('mouseover', function(e) {
    if (e.target.tagName === 'A') {
        setStatusMessage('Click here to visit: ' + e.target.href);
        e.target.style.textDecoration = 'underline overline';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.tagName === 'A') {
        setStatusMessage('Ready');
        e.target.style.textDecoration = 'none';
    }
});

// Console message for fellow developers
console.log('%c🌟 Welcome to the most RADICAL website of 1995! 🌟', 'color: #ff00ff; font-size: 20px; font-weight: bold;');
console.log('%cThis site was crafted with pure HTML, CSS, and JavaScript!', 'color: #00ffff; font-size: 14px;');
console.log('%cTry the Konami Code for a special surprise! ↑↑↓↓←→←→BA', 'color: #ffff00; font-size: 12px;');