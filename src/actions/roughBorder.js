// Svelte action: gives any element a hand-drawn (RoughJS) border that
// follows the element's size. Native border should be removed via CSS.
//
// Usage:
//   <button class="rough" use:roughBorder={{ radius: 18, fill: '#faf6ec' }}>
//     <span class="rough-content">Click me</span>
//   </button>

import rough from 'roughjs';

const NS = 'http://www.w3.org/2000/svg';

export function roughBorder(node, options = {}) {
  let opts = normalize(options);

  // Ensure positioning context
  if (getComputedStyle(node).position === 'static') {
    node.style.position = 'relative';
  }

  // Create the SVG that holds the wobbly border
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('rough-border');
  svg.setAttribute('xmlns', NS);
  node.prepend(svg);

  let drawn = null;
  let raf = 0;

  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = Math.max(2, node.offsetWidth);
      const h = Math.max(2, node.offsetHeight);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      if (drawn) {
        svg.removeChild(drawn);
        drawn = null;
      }
      const rc = rough.svg(svg);
      const inset = (opts.strokeWidth ?? 1.6) / 2 + 1;
      const r = Math.min(opts.radius, Math.min(w, h) / 2 - inset);
      const path = roundedRectPath(inset, inset, w - inset * 2, h - inset * 2, Math.max(0, r));
      drawn = rc.path(path, {
        stroke: opts.stroke,
        strokeWidth: opts.strokeWidth,
        roughness: opts.roughness,
        bowing: opts.bowing,
        fill: opts.fill,
        fillStyle: opts.fillStyle,
        fillWeight: 1,
        seed: opts.seed,
      });
      svg.appendChild(drawn);
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
    stroke: o.stroke ?? '#2a2a2a',
    strokeWidth: o.strokeWidth ?? 1.6,
    roughness: o.roughness ?? 1.4,
    bowing: o.bowing ?? 1.5,
    fill: o.fill ?? 'none',
    fillStyle: o.fillStyle ?? 'solid',
    seed: o.seed ?? Math.floor(Math.random() * 1000) + 1,
  };
}

function roundedRectPath(x, y, w, h, r) {
  if (r <= 0) {
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  return `M ${x + r} ${y}
          L ${x + w - r} ${y}
          Q ${x + w} ${y} ${x + w} ${y + r}
          L ${x + w} ${y + h - r}
          Q ${x + w} ${y + h} ${x + w - r} ${y + h}
          L ${x + r} ${y + h}
          Q ${x} ${y + h} ${x} ${y + h - r}
          L ${x} ${y + r}
          Q ${x} ${y} ${x + r} ${y}
          Z`;
}
