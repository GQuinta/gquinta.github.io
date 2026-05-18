const logoShell = document.getElementById('logo-shell');

function createLogo() {
  if (!logoShell) return;

  logoShell.style.opacity = '0';
  logoShell.innerHTML = `
    <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet" class="logo-svg">
      <line id="edge1" x1="160" y1="134" x2="160" y2="88.5" stroke="#ffffff" stroke-width="5" stroke-linecap="butt" opacity="0" />
      <line id="edge2" x1="137.46" y1="173.1" x2="98.6" y2="195.7" stroke="#ffffff" stroke-width="5" stroke-linecap="butt" opacity="0" />
      <line id="edge3" x1="182.54" y1="173.1" x2="221.4" y2="195.7" stroke="#ffffff" stroke-width="5" stroke-linecap="butt" opacity="0" />
      <circle id="whiteCircle" cx="160" cy="160" r="26" transform="rotate(-90 160 160)" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="butt" opacity="0" />
      <circle id="redCircle" cx="160" cy="60" r="26" transform="rotate(-90 160 60)" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="butt" opacity="0" />
      <circle id="greenCircle" cx="74" cy="210" r="26" transform="rotate(-90 74 210)" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="butt" opacity="0" />
      <circle id="blueCircle" cx="246" cy="210" r="26" transform="rotate(-90 246 210)" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="butt" opacity="0" />
    </svg>
  `;

  initializeLogoAnimation();
  setupExploreButton();
  // Start slightly smaller so the final zoom-in feels satisfying
  const logoSvg = logoShell.querySelector('.logo-svg');
  if (logoSvg) logoSvg.style.transform = 'scale(0.90)';
  logoShell.style.opacity = '1';
  setTimeout(() => animateLogoDraw(), 500);
}

function setStrokeHidden(element) {
  if (element.tagName.toLowerCase() === 'circle') {
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.6s ease';
  } else {
    const length = element.getTotalLength();
    element.style.strokeDasharray = `${length} ${length}`;
    element.style.strokeDashoffset = length;
    element.style.opacity = '0';
  }
}

function animateAppear(element, duration) {
  return new Promise(resolve => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    setTimeout(resolve, duration);
  });
}

// Blink the element on/off a few times then settle — mimics the animejs.com flicker
function animateBlink(element) {
  return new Promise(resolve => {
    // [opacity, hold-ms] pairs; last entry has 0ms to signal resolve
    const steps = [
      [1,  55],
      [0,  70],
      [1,  50],
      [0,  90],
      [1,   0],
    ];
    element.style.transition = 'none';
    element.style.opacity = '0';
    let i = 0;
    function tick() {
      const [op, delay] = steps[i++];
      element.style.opacity = op;
      if (delay > 0) setTimeout(tick, delay);
      else resolve();
    }
    setTimeout(tick, 20); // tiny lead-in
  });
}

function animateStroke(element, duration, counterclockwise = false) {
  return new Promise(resolve => {
    const length = element.getTotalLength();
    element.style.strokeDasharray = `${length} ${length}`;
    const startOffset = counterclockwise ? -length : length;
    element.style.strokeDashoffset = startOffset;
    element.style.opacity = '1';

    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.strokeDashoffset = startOffset + (0 - startOffset) * progress;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.style.strokeDasharray = 'none';
        element.style.strokeDashoffset = '0';
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

function initializeLogoAnimation() {
  const redCircle = document.getElementById('redCircle');
  const greenCircle = document.getElementById('greenCircle');
  const blueCircle = document.getElementById('blueCircle');
  const whiteCircle = document.getElementById('whiteCircle');
  const edges = [
    document.getElementById('edge1'),
    document.getElementById('edge2'),
    document.getElementById('edge3'),
  ];

  [redCircle, greenCircle, blueCircle, whiteCircle, ...edges].forEach(el => {
    if (el) setStrokeHidden(el);
  });
}

async function animateLogoDraw() {
  const redCircle = document.getElementById('redCircle');
  const greenCircle = document.getElementById('greenCircle');
  const blueCircle = document.getElementById('blueCircle');
  const whiteCircle = document.getElementById('whiteCircle');
  const edges = [
    document.getElementById('edge1'),
    document.getElementById('edge2'),
    document.getElementById('edge3'),
  ];

  if (!redCircle || !greenCircle || !blueCircle || !whiteCircle || edges.includes(null)) return;

  await animateBlink(whiteCircle);
  await animateBlink(redCircle);
  await animateBlink(greenCircle);
  await animateBlink(blueCircle);
  // Zoom to full size while edges draw — both finish together
  const svg = logoShell.querySelector('.logo-svg');
  const zoomIn = svg ? new Promise(res => {
    svg.style.transition = 'transform 420ms ease-out';
    svg.style.transform = 'scale(1)';
    setTimeout(res, 420);
  }) : Promise.resolve();
  await Promise.all([...edges.map(edge => animateStroke(edge, 200, false)), zoomIn]);
  await animateExploreButton();
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) scrollHint.style.opacity = '1';
}

// Explore button elements — created immediately in createLogo() so space is
// reserved from page load; animateExploreButton() only drives the animation.
let _exploreBorder = null, _exploreLabel = null, _explorePerim = 0;

function setupExploreButton() {
  const container = document.getElementById('explore-button');
  if (!container) return;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 200, H = 44, R = 6;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.cssText = `width:${W}px;height:${H}px;overflow:visible;cursor:default`;
  container.appendChild(svg);

  const d = `M ${W-R},0 L ${R},0 Q 0,0 0,${R} L 0,${H-R} Q 0,${H} ${R},${H}`
          + ` L ${W-R},${H} Q ${W},${H} ${W},${H-R} L ${W},${R} Q ${W},0 ${W-R},0 Z`;
  const border = document.createElementNS(NS, 'path');
  border.setAttribute('d', d);
  border.setAttribute('fill', 'none');
  border.setAttribute('stroke', '#4adeac');
  border.setAttribute('stroke-width', '2');
  border.setAttribute('stroke-linecap', 'round');
  border.setAttribute('filter', 'url(#photon-glow)');
  svg.appendChild(border);
  const perim = border.getTotalLength();
  border.setAttribute('stroke-dasharray', perim);
  border.setAttribute('stroke-dashoffset', perim);

  const label = document.createElementNS(NS, 'text');
  label.setAttribute('x', W / 2); label.setAttribute('y', H / 2);
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('dominant-baseline', 'central');
  label.setAttribute('fill', 'var(--text)');
  label.setAttribute('font-family', "'Barlow', sans-serif");
  label.setAttribute('font-weight', '300');
  label.setAttribute('font-size', '14');
  label.setAttribute('letter-spacing', '0.18em');
  label.textContent = 'Coming Soon';
  label.style.opacity = '0';
  svg.appendChild(label);

  _exploreBorder = border;
  _exploreLabel  = label;
  _explorePerim  = perim;
}

async function animateExploreButton() {
  if (!_exploreBorder) return;

  await new Promise(resolve => {
    const dur = 800;
    let t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      _exploreBorder.setAttribute('stroke-dashoffset', _explorePerim * (1 - p));
      p < 1 ? requestAnimationFrame(step) : resolve();
    }
    requestAnimationFrame(step);
  });

  await new Promise(resolve => {
    const dur = 400;
    let t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      _exploreLabel.style.opacity = p;
      p < 1 ? requestAnimationFrame(step) : resolve();
    }
    requestAnimationFrame(step);
  });
}

createLogo();
