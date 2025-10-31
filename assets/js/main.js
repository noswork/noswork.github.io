import { translations } from './i18n.js';

// ========== 初始化 ==========
let currentLang = localStorage.getItem('lang') || 'zh-TW';
let currentTheme = localStorage.getItem('theme') || 'light';

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initNavigation();
    initScrollEffects();
    initDropdowns();
    initAnimations();
});

// ========== 主題切換 ==========
function initTheme() {
    // 設置初始主題
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // 添加過渡動畫
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
}

// ========== 多語言系統 ==========
function initLanguage() {
    // 設置初始語言
    updateLanguage(currentLang);
    updateCurrentLangDisplay();
    
    // 語言切換按鈕
    const langItems = document.querySelectorAll('.dropdown-item[data-lang]');
    langItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            changeLanguage(lang);
        });
    });
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    updateLanguage(lang);
    updateCurrentLangDisplay();
    
    // 關閉下拉選單
    const langMenu = document.getElementById('langMenu');
    if (langMenu) {
        langMenu.classList.remove('show');
    }
}

function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function updateCurrentLangDisplay() {
    const langNames = {
        'zh-TW': '繁中',
        'zh-CN': '简中',
        'en': 'EN',
        'ja': '日本語'
    };
    
    const currentLangSpan = document.querySelector('.current-lang');
    if (currentLangSpan) {
        currentLangSpan.textContent = langNames[currentLang] || '繁中';
    }
}

// ========== 下拉選單 ==========
function initDropdowns() {
    const langDropdown = document.getElementById('langDropdown');
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    
    if (langBtn && langMenu) {
        // 點擊按鈕切換下拉選單
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('show');
        });
        
        // 點擊其他地方關閉下拉選單
        document.addEventListener('click', () => {
            langMenu.classList.remove('show');
        });
        
        // 防止點擊選單內部關閉
        langMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// ========== 導航欄 ==========
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 滾動時導航欄效果
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // 添加背景
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // 自動隱藏導航欄（向下滾動時）
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    });
    
    // 移動端選單切換
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }
    
    // 導航連結點擊
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // 只處理錨點連結
            if (href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // 平滑滾動
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 更新活動狀態
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // 關閉移動端選單
                    if (navToggle && navMenu) {
                        navToggle.classList.remove('active');
                        navMenu.classList.remove('active');
                        document.body.classList.remove('nav-open');
                    }
                }
            }
        });
    });
}

// ========== 滾動效果 ==========
function initScrollEffects() {
    // Intersection Observer 用於滾動動畫
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // 觀察所有需要動畫的元素
    const animatedElements = document.querySelectorAll('.tool-card, .feature-item, .tool-detail-card');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // 更新導航欄活動狀態
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5
    });
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// ========== 動畫效果 ==========
function initAnimations() {
    // 工具卡片懸停效果
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 滾動指示器動畫
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.getElementById('trickcal');
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // 視差效果
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-content');
        
        parallaxElements.forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ========== 工具函數 ==========
// 節流函數
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

// 防抖函數
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
