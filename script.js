/**
 * Valentine's Day — Rupsa Bhattacharya
 * Bold, cinematic, highly animated single-page site
 * Plain HTML, CSS, JS — no frameworks
 */

(function () {
  'use strict';

  // --- Scroll progress bar ---
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // --- Cursor glow trail (desktop only) ---
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function updateCursorGlow() {
    glowX = lerp(glowX, mouseX, 0.08);
    glowY = lerp(glowY, mouseY, 0.08);
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(updateCursorGlow);
  }
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  if (cursorGlow) requestAnimationFrame(updateCursorGlow);

  // --- Sound: simple Web Audio (no external files) ---
  let audioCtx = null;
  let muted = false;
  const muteBtn = document.getElementById('muteBtn');
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function playClick() {
    if (muted || !window.AudioContext) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  }
  function playModalOpen() {
    if (muted || !window.AudioContext) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }
  let heartbeatInterval = null;
  function startHeartbeat() {
    if (heartbeatInterval) return;
    function beat() {
      if (muted || !window.AudioContext) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } catch (_) {}
    }
    beat();
    heartbeatInterval = setInterval(beat, 900);
  }
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }
  muteBtn.addEventListener('click', function () {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted', muted);
    if (muted) stopHeartbeat();
    else startHeartbeat();
  });

  // --- Hero: text reveal after 1s ---
  const heroReveal = document.getElementById('heroReveal');
  if (heroReveal) {
    setTimeout(function () {
      heroReveal.classList.add('visible');
      scrambleReveal(heroReveal, 50);
    }, 1000);
  }

  /**
   * Text scramble reveal: cycles random chars then settles to real text
   */
  function scrambleReveal(el, duration) {
    const text = el.textContent;
    const chars = '!@#$%^&*()_+~`-=[]{}|;:,.<>?';
    let frame = 0;
    const maxFrames = duration || 50;
    function update() {
      frame++;
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const progress = frame / maxFrames;
        const charProgress = (progress - (i / text.length) * 0.7) / 0.3;
        if (charProgress >= 1) out += text[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (frame < maxFrames) requestAnimationFrame(update);
      else el.textContent = text;
    }
    requestAnimationFrame(update);
  }

  // --- Enter If You Dare: smooth scroll + sound ---
  const enterBtn = document.getElementById('enterBtn');
  enterBtn.addEventListener('click', function () {
    playClick();
    document.getElementById('whoYouAre').scrollIntoView({ behavior: 'smooth' });
  });

  // --- Magnetic button effect ---
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
      btn.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(1.02)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });

  // --- Parallax on who-you-are ---
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    const speed = parseFloat(parallaxBg.getAttribute('data-speed')) || 0.3;
    window.addEventListener('scroll', function () {
      const section = document.getElementById('whoYouAre');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (window.innerHeight / 2 - center) * speed;
      parallaxBg.style.transform = 'translateY(' + offset + 'px)';
    }, { passive: true });
  }

  // --- Intersection Observer: scroll reveals ---
  const revealEls = document.querySelectorAll('.scroll-reveal');
  const powerWords = document.querySelectorAll('.power-word');
  const confessionFirst = document.getElementById('confessionFirst');
  const confessionSecond = document.getElementById('confessionSecond');

  const observerOpts = { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.1 };
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
    });
  }, observerOpts);

  revealEls.forEach(function (el) { observer.observe(el); });

  // Power words + quips + image: animate in when Who You Are section is in view
  const whoSection = document.getElementById('whoYouAre');
  const whoQuips = document.querySelectorAll('.who-quip');
  const whoImage = whoSection && whoSection.querySelector('.who-image');
  const powerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      powerWords.forEach(function (word) {
        const delay = parseInt(word.getAttribute('data-delay'), 10) || 0;
        setTimeout(function () { word.classList.add('visible'); }, delay * 280);
      });
      whoQuips.forEach(function (quip) {
        const i = parseInt(quip.getAttribute('data-quip'), 10) || 0;
        setTimeout(function () { quip.classList.add('visible'); }, 400 + i * 150);
      });
      if (whoImage) setTimeout(function () { whoImage.classList.add('visible'); }, 600);
    });
  }, { threshold: 0.2 });
  if (whoSection) powerObserver.observe(whoSection);

  // Confession section: show lines when in view
  const confessionSection = document.getElementById('confession');
  const confessionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      confessionFirst.classList.add('visible');
      setTimeout(function () { confessionSecond.classList.add('visible'); }, 800);
    });
  }, { threshold: 0.3 });
  if (confessionSection) confessionObserver.observe(confessionSection);

  // --- Hero particles ---
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles) {
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 5 + 's';
      p.style.width = p.style.height = (4 + Math.random() * 6) + 'px';
      p.style.background = Math.random() > 0.5 ? 'rgba(201, 162, 39, 0.4)' : 'rgba(255, 45, 106, 0.3)';
      p.style.borderRadius = '50%';
      p.style.position = 'absolute';
      p.style.pointerEvents = 'none';
      p.style.animation = 'particleFloat 12s ease-in-out infinite';
      heroParticles.appendChild(p);
    }
  }

  // Add particle float keyframes via style tag if not in CSS
  const style = document.createElement('style');
  style.textContent = '.particle { animation: particleFloat 12s ease-in-out infinite; } @keyframes particleFloat { 0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; } 25% { transform: translate(10px,-20px) scale(1.2); opacity: 0.8; } 50% { transform: translate(-15px,-10px) scale(0.9); opacity: 0.6; } 75% { transform: translate(5px,-25px) scale(1.1); opacity: 0.7; } }';
  document.head.appendChild(style);

  // --- Timeline modals ---
  const modalOverlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modalText');
  const modalClose = document.getElementById('modalClose');
  const messages = [
    'The moment I first saw you, my brain short-circuited. Best malfunction ever.',
    'Our first real conversation felt like coming home. You just get it.',
    'Your laugh is my favorite song. I’m still not over it.',
    'That spark between us? I knew it was the beginning of everything.',
    'Every day with you is the adventure I never knew I needed. Forever sounds good.',
  ];
  document.querySelectorAll('.timeline-stop').forEach(function (stop) {
    stop.addEventListener('click', function () {
      const id = parseInt(stop.getAttribute('data-modal'), 10);
      modalText.textContent = messages[(id - 1) % messages.length];
      modalOverlay.classList.add('open');
      playModalOpen();
    });
  });
  function closeModal() {
    modalOverlay.classList.remove('open');
  }
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  // --- Therapy button: show outcome ---
  const therapyBtn = document.getElementById('therapyBtn');
  const therapyOutcome = document.getElementById('therapyOutcome');
  if (therapyBtn && therapyOutcome) {
    therapyBtn.addEventListener('click', function () {
      therapyOutcome.classList.add('show');
      playClick();
    });
  }

  // --- Finale: starry background ---
  const starryBg = document.getElementById('starryBg');
  if (starryBg) {
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = (1 + Math.random() * 2) + 'px';
      star.style.height = star.style.width;
      star.style.background = '#fff';
      star.style.borderRadius = '50%';
      star.style.opacity = 0.3 + Math.random() * 0.7;
      star.style.animation = 'twinkle 2s ease-in-out infinite';
      star.style.animationDelay = Math.random() * 2 + 's';
      star.style.pointerEvents = 'none';
      starryBg.appendChild(star);
    }
  }
  const twinkleStyle = document.createElement('style');
  twinkleStyle.textContent = '@keyframes twinkle { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }';
  document.head.appendChild(twinkleStyle);

  // --- 3D floating hearts ---
  const hearts3d = document.getElementById('hearts3d');
  if (hearts3d) {
    const heartChars = ['♥', '❤', '💕'];
    for (let i = 0; i < 12; i++) {
      const h = document.createElement('span');
      h.className = 'heart-3d';
      h.textContent = heartChars[i % 3];
      h.style.left = Math.random() * 100 + '%';
      h.style.top = Math.random() * 100 + '%';
      h.style.animationDelay = Math.random() * 4 + 's';
      h.style.fontSize = (18 + Math.random() * 20) + 'px';
      hearts3d.appendChild(h);
    }
  }

  // --- Claim Valentine button: explosion, confetti, glow, final text ---
  const claimBtn = document.getElementById('claimBtn');
  const finaleReveal = document.getElementById('finaleReveal');
  const confettiCanvas = document.getElementById('confettiCanvas');

  function heartExplosion() {
    const btn = claimBtn;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 20; i++) {
      const heart = document.createElement('span');
      heart.textContent = '♥';
      heart.style.position = 'fixed';
      heart.style.left = cx + 'px';
      heart.style.top = cy + 'px';
      heart.style.fontSize = '24px';
      heart.style.color = '#ff2d6a';
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '9996';
      heart.style.transition = 'none';
      document.body.appendChild(heart);
      const angle = (Math.PI * 2 * i) / 20 + Math.random();
      const dist = 80 + Math.random() * 120;
      const tx = cx + Math.cos(angle) * dist;
      const ty = cy + Math.sin(angle) * dist;
      requestAnimationFrame(function () {
        heart.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
        heart.style.transform = 'translate(' + (tx - cx) + 'px, ' + (ty - cy) + 'px) scale(0)';
        heart.style.opacity = '0';
        setTimeout(function () { heart.remove(); }, 600);
      });
    }
  }

  function runConfetti() {
    const canvas = confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function sizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    const particles = [];
    const colors = ['#ff2d6a', '#c9a227', '#722f37', '#ff6b9d', '#e8c547'];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
      });
    }
    let frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.vx *= 0.99;
        p.vy *= 0.99;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      if (frame < 180) requestAnimationFrame(draw);
    }
    draw();
  }

  function screenGlowFlash() {
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle, rgba(201,162,39,0.4) 0%, transparent 70%);pointer-events:none;z-index:9995;animation:flashFade 1s ease-out forwards;';
    document.body.appendChild(flash);
    const s = document.createElement('style');
    s.textContent = '@keyframes flashFade { 0% { opacity: 1; } 100% { opacity: 0; } }';
    document.head.appendChild(s);
    setTimeout(function () { flash.remove(); }, 1000);
  }

  // Flip cards: tap to flip on touch devices
  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  });

  if (claimBtn && finaleReveal) {
    claimBtn.addEventListener('click', function () {
      playClick();
      heartExplosion();
      runConfetti();
      screenGlowFlash();
      claimBtn.style.opacity = '0';
      claimBtn.style.pointerEvents = 'none';
      setTimeout(function () {
        finaleReveal.classList.add('show');
      }, 600);
    });
  }

  // --- Easter egg: R five times ---
  let rCount = 0;
  let rTimeout = null;
  const secretMessage = document.getElementById('secretMessage');
  document.addEventListener('keydown', function (e) {
    if (e.key === 'r' || e.key === 'R') {
      rCount++;
      clearTimeout(rTimeout);
      rTimeout = setTimeout(function () { rCount = 0; }, 800);
      if (rCount >= 5) {
        rCount = 0;
        secretMessage.classList.add('show');
        setTimeout(function () {
          secretMessage.classList.remove('show');
        }, 4000);
      }
    }
  });

  // --- Start subtle heartbeat on first interaction (optional) ---
  document.body.addEventListener('click', function startOnce() {
    startHeartbeat();
    document.body.removeEventListener('click', startOnce);
  }, { once: true });
})();
