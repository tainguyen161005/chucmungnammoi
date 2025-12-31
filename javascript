// --- CẤU HÌNH NỘI DUNG ---
const messages = [
    "Chúc mừng năm mới 2026!",
    "Vạn sự như ý, tỷ sự như mơ",
    "An khang thịnh vượng",
    "Tiền vào như nước",
    "Sức khỏe dồi dào",
    "Gia đình hạnh phúc",
    "Công việc thuận lợi, thăng tiến"
];

// Danh sách tên file ảnh của bạn (để chung thư mục với file HTML)
const images = [
    'img1.jpg', 
    'img2.jpg',
    // Thêm ảnh của bạn vào đây
];


// --- CÁC DOM ELEMENTS ---
const startScreen = document.getElementById('start-screen');
const introScreen = document.getElementById('intro-screen');
const mainContainer = document.getElementById('main-container');
const countdownText = document.getElementById('countdown-text');
const btnStart = document.getElementById('btn-start');
const floatingContainer = document.getElementById('floating-container');
const audioLaunch = document.getElementById('audio-launch');
const audioExplode = document.getElementById('audio-explode');
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

let fireworksActive = false;

// --- XỬ LÝ QUY TRÌNH CHÍNH (START SEQUENCE) ---

btnStart.addEventListener('click', () => {
    // 1. Ẩn màn hình start
    startScreen.classList.add('hidden');
    
    // 2. Hiện màn hình intro
    introScreen.classList.remove('hidden');
    
    // 3. Mở khóa âm thanh (Do trình duyệt chặn autoplay)
    audioLaunch.play().then(() => audioLaunch.pause()).catch(e => console.log("Audio init needed"));
    audioExplode.play().then(() => audioExplode.pause()).catch(e => console.log("Audio init needed"));

    // 4. Bắt đầu đếm ngược
    runCountdown();
});

function runCountdown() {
    let count = 3;
    countdownText.innerText = count;
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.innerText = count;
        } else if (count === 0) {
            countdownText.innerHTML = "HAPPY<br>NEW YEAR<br>2026";
            countdownText.style.fontSize = "100px";
        } else {
            // Kết thúc đếm ngược
            clearInterval(interval);
            startMainCelebration();
        }
    }, 1000); // Đếm mỗi giây
}

function startMainCelebration() {
    // Ẩn màn hình intro
    introScreen.classList.add('hidden');
    // Hiện màn hình chính
    mainContainer.classList.remove('hidden');
    mainContainer.classList.add('visible');

    // Bắt đầu pháo hoa và các yếu tố bay
    fireworksActive = true;
    resizeCanvas();
    loopFireworks();
    // Tạo nội dung bay mỗi 1.5 giây
    setInterval(createFloatingElement, 1500); 
}


// --- XỬ LÝ CÁC YẾU TỐ BAY (FLOATING ELEMENTS) ---

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createFloatingElement() {
    const el = document.createElement('div');
    el.classList.add('floating-element');

    // Random chọn giữa chữ (70%) và ảnh (30%)
    const isImage = Math.random() < 0.3 && images.length > 0;

    if (isImage) {
        el.classList.add('is-image');
        const img = document.createElement('img');
        img.src = images[randomInt(0, images.length - 1)];
        el.appendChild(img);
    } else {
        el.innerText = messages[randomInt(0, messages.length - 1)];
    }

    // Random vị trí xuất hiện theo chiều ngang (Left)
    el.style.left = randomInt(5, 85) + '%';
    
    // Random tốc độ bay (Duration)
    const duration = randomInt(8, 15);
    el.style.animationDuration = duration + 's';

    floatingContainer.appendChild(el);

    // Tự động xóa element sau khi bay xong để tránh lag
    setTimeout(() => {
        el.remove();
    }, duration * 1000);
}


// --- HỆ THỐNG PHÁO HOA CANVAS (Đơn giản hóa & Rực rỡ) ---

let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

function playSound(type) {
    // Clone node để có thể phát nhiều âm thanh chồng lên nhau
    let sound;
    if (type === 'launch') sound = audioLaunch.cloneNode();
    else sound = audioExplode.cloneNode();
    
    sound.volume = 0.5; // Giảm âm lượng một chút
    sound.play().catch(e => console.log("Sound blocked"));
}

class Particle {
    constructor(x, y, color, isSparkle) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isSparkle = isSparkle;
        // Vận tốc ngẫu nhiên tản ra xung quanh
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1; // Độ trong suốt
        this.decay = Math.random() * 0.015 + 0.01; // Tốc độ mờ dần
        this.gravity = 0.05; // Trọng lực nhẹ
    }

    update() {
        this.vx *= 0.98; // Lực cản không khí
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.isSparkle ? 2 : 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Hiệu ứng phát sáng (Glow)
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function createFirework(x, y) {
    playSound('explode');
    // Màu sắc rực rỡ như ảnh 1
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ffaa00'];
    const baseColor = colors[randomInt(0, colors.length -1)];
    
    const particleCount = 100; // Số lượng hạt
    for (let i = 0; i < particleCount; i++) {
        // Tạo các biến thể màu sắc nhẹ
        particles.push(new Particle(x, y, baseColor, Math.random() < 0.3));
    }
}

function loopFireworks() {
    if (!fireworksActive) return;
    requestAnimationFrame(loopFireworks);

    // Hiệu ứng mờ dần tạo vệt đuôi (Trail effect)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Cập nhật và vẽ các hạt
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1); // Xóa hạt đã mờ hẳn
        }
    }

    // Tự động bắn pháo hoa ngẫu nhiên
    if (Math.random() < 0.03) { // Tỷ lệ bắn (càng cao càng nhiều)
        createFirework(Math.random() * canvas.width, Math.random() * canvas.height / 2);
    }
}
