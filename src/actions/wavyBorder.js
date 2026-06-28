// Svelte action: draws a rounded-rect border whose edge is displaced by an
// SVG turbulence filter, giving the wavy/squiggly hand-drawn look (as seen
// in the design reference). Sized via ResizeObserver to match its element.
//
// Usage:
//   <div class="bubble" use:wavyBorder={{ radius: 22, strokeWidth: 2.4 }}>

const NS = 'http://www.w3.org/2000/svg';

export function wavyBorder(node, options = {}) {
  let opts = normalize(options);

  if (getComputedStyle(node).position === 'static') {
    node.style.position = 'relative';
  }

  const filterId = `wave-${Math.random().toString(36).slice(2, 10)}`;

  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('wavy-border');
  svg.setAttribute('xmlns', NS);
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.pointerEvents = 'none';
  svg.style.overflow = 'visible';

  // Filter definition (turbulence + displacement)
  svg.innerHTML = `
    <defs>
      <filter id="${filterId}" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise"
          baseFrequency="${opts.baseFrequency}"
          numOctaves="2"
          seed="${Math.floor(Math.random() * 1000)}"
          result="t"/>
        <feDisplacementMap in="SourceGraphic" in2="t"
          scale="${opts.waviness}"
          xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  `;

  node.prepend(svg);

  let rectEl = null;
  let raf = 0;

  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = Math.max(2, node.offsetWidth);
      const h = Math.max(2, node.offsetHeight);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      if (rectEl) rectEl.remove();

      // Inset enough to give the displacement room to wobble outward
      const inset = opts.strokeWidth / 2 + opts.waviness + 1;
      rectEl = document.createElementNS(NS, 'rect');
      rectEl.setAttribute('x', inset);
      rectEl.setAttribute('y', inset);
      rectEl.setAttribute('width', Math.max(1, w - inset * 2));
      rectEl.setAttribute('height', Math.max(1, h - inset * 2));
      rectEl.setAttribute('rx', opts.radius);
      rectEl.setAttribute('ry', opts.radius);
      rectEl.setAttribute('fill', opts.fill);
      rectEl.setAttribute('stroke', opts.stroke);
      rectEl.setAttribute('stroke-width', opts.strokeWidth);
      rectEl.setAttribute('filter', `url(#${filterId})`);
      svg.appendChild(rectEl);
    });
  }

  const ro = new ResizeObserver(draw);
  ro.observe(node);
  draw();

  return {
    update(newOptions) {
      opts = normalize(newOptions);
      draw();
    },
    destroy() {
      ro.disconnect();
      cancelAnimationFrame(raf);
      if (svg.parentNode === node) node.removeChild(svg);
    },
  };
}

function normalize(o = {}) {
  return {
    radius: o.radius ?? 18,
    stroke: o.stroke ?? '#151515',
    strokeWidth: o.strokeWidth ?? 2.2,
    fill: o.fill ?? '#FFFFFF',
    waviness: o.waviness ?? 3.5,         // displacement scale (amplitude)
    baseFrequency: o.baseFrequency ?? 0.022, // turbulence detail (frequency)
  };
}
