// Project Data
const projectsData = [
    {
        id: 1,
        title: "Combat System",
        description: "Combat system with damage and hitboxes. Has working AI.",
        category: "systems",
        tags: ["Combat", "Scripting"],
        icon: "fa-hand-fist"
    },
    {
        id: 2,
        title: "RNG System",
        description: "Something like Sol's RNG.",
        category: "systems",
        tags: ["RNG", "Probability"],
        icon: "fa-dice"
    },
    {
        id: 3,
        title: "Minigame System",
        description: "Round-based minigame framework.",
        category: "systems",
        tags: ["Minigames", "Framework"],
        icon: "fa-gamepad"
    }
];

// State
let currentCategory = 'all';

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Render Projects
    renderProjects();

    // Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderProjects();
        });
    });

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! I\'ll get back to you soon.');
            this.reset();
        });
    }

    // Animate skill bars on scroll
    const skillCards = document.querySelectorAll('.skill-card');
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    progressBar.style.width = progressBar.getAttribute('style').match(/width:\s*(\d+%)/)[1];
                }
            }
        });
    }, observerOptions);

    skillCards.forEach(card => observer.observe(card));

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinksContainer.style.display = 
                navLinksContainer.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});

// Render Projects Function
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';

    const filteredProjects = currentCategory === 'all' 
        ? projectsData 
        : projectsData.filter(project => project.category === currentCategory);

    filteredProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

// Create Project Card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.opacity = '0';
    card.style.animation = 'fadeInUp 0.5s ease forwards';

    card.innerHTML = `
        <div class="project-image">
            <i class="fas ${project.icon}"></i>
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <a href="#" class="project-link">
                View Project <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;

    return card;
}

// Add fadeInUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 46, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(26, 26, 46, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    }
});
