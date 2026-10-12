<script>
  import { wavyBorder } from '../actions/wavyBorder.js';
  let { onstart } = $props();

  // Grocery line art around the title, placed as in the Figma landing frame
  // (1920 x 1080, node 297:10). x / y / w / h are in that frame's pixels and
  // converted to % of the stage below, so the layout scales with the screen.
  // Each PNG is an alpha mask of the drawing, so its colour is set in CSS:
  // faint ink at rest, a palette colour on hover.
  const FRAME_W = 1920;
  const FRAME_H = 1080;
  const ITEMS = [
    { name: 'sourdough',   x: 20,   y: 0,   w: 278, h: 204 },
    { name: 'amul',        x: 259,  y: 0,   w: 188, h: 226 },
    { name: 'chips',       x: 115,  y: 171, w: 183, h: 240 },
    { name: 'cup-noodles', x: 149,  y: 390, w: 158, h: 173 },
    { name: 'basmati',     x: 0,    y: 457, w: 161, h: 342 },
    { name: 'eggs',        x: 137,  y: 540, w: 226, h: 166 },
    { name: 'ice-cream',   x: 172,  y: 688, w: 154, h: 184 },
    { name: 'bread',       x: 0,    y: 749, w: 166, h: 301 },
    { name: 'safal',       x: 1704, y: 0,   w: 214, h: 178 },
    { name: 'wheat-flour', x: 1437, y: 105, w: 194, h: 241 },
    { name: 'caffe-latte', x: 1793, y: 168, w: 127, h: 295 },
    { name: 'apples',      x: 1547, y: 269, w: 247, h: 282 },
    { name: 'rice-bag',    x: 1690, y: 445, w: 230, h: 419 },
    { name: 'choco-latte', x: 1545, y: 641, w: 205, h: 265 },
    { name: 'vaporub',     x: 1683, y: 872, w: 111, h: 113 },
    { name: 'pretzels',    x: 1750, y: 848, w: 170, h: 232 },
    { name: 'maggi',       x: 1512, y: 918, w: 201, h: 162 },
    { name: 'cookies',     x: 1375, y: 0,   w: 346, h: 123 },
    { name: 'ok-can',      x: 1640, y: 123, w: 121, h: 147 },
    { name: 'wafer-stix',  x: 0,    y: 230, w: 132, h: 233 },
    { name: 'taste-bag',   x: 137,  y: 812, w: 329, h: 268 },
  ];

  // Hover colours, from the Figma "Colours" frame. Items take them in turn,
  // so neighbours on the same side never share a colour.
  const HOVER = ['#F0AF46', '#1B2A6B', '#E69CB7', '#93253B', '#4E75AC', '#5DAF5E'];

  const pct = (v, total) => `${(v / total) * 100}%`;

  // Slow drift: each item bobs and tilts on its own long cycle so the
  // shelves feel alive without ever moving in step. Derived from the index
  // so it's the same on every visit.
  const drift = (i) => {
    const dur = 7 + ((i * 37) % 50) / 10;          // 7s – 12s
    const delay = -((i * 53) % 90) / 10;           // start mid-cycle
    const dy = 4 + (i % 3) * 2;                    // 4 – 8px
    const rot = (i % 2 ? 1 : -1) * (0.8 + (i % 4) * 0.4); // ±0.8° – 2°
    return `--drift-dur:${dur}s; --drift-delay:${delay}s; --dy:${dy}px; --rot:${rot}deg`;
  };
</script>

<div class="title-screen">
  <div class="art" aria-hidden="true">
    {#each ITEMS as it, i (it.name)}
      <div
        class="item"
        style="left:{pct(it.x, FRAME_W)}; top:{pct(it.y, FRAME_H)}; width:{pct(it.w, FRAME_W)};
               aspect-ratio:{it.w} / {it.h}; --src:url('/assets/landing/{it.name}.png');
               --hover:{HOVER[i % HOVER.length]}; --in-delay:{0.25 + i * 0.04}s; {drift(i)}"
      ></div>
    {/each}
  </div>

  <h1 class="hero">
    <span class="word" style="animation-delay: 0.05s">THE</span>
    <span class="word" style="animation-delay: 0.20s">CONVENIENCE</span>
    <span class="word" style="animation-delay: 0.40s">STORE</span>
  </h1>

  <button
    class="play"
    onclick={onstart}
    use:wavyBorder={{ radius: 'pill', fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.6, baseFrequency: 0.020 }}
  >
    <span class="play-label">PLAY  →</span>
  </button>

  <p class="credit">By Parisa Mehta and Srividhya S</p>
</div>

<style>
  .title-screen {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #FFFFFF;
    /* Type is sized in cqw so it keeps the Figma proportions at any size. */
    container-type: size;
  }

  .art { position: absolute; inset: 0; }
  .item {
    position: absolute;
    background-color: var(--ink);
    -webkit-mask: var(--src) center / contain no-repeat;
            mask: var(--src) center / contain no-repeat;
    opacity: 0;
    animation:
      itemIn 0.6s ease var(--in-delay) forwards,
      drift var(--drift-dur) ease-in-out var(--drift-delay) infinite alternate;
    transition: background-color 0.3s ease, filter 0.3s ease;
  }
  @keyframes drift {
    from { transform: translateY(0) rotate(0deg); }
    to   { transform: translateY(calc(var(--dy) * -1)) rotate(var(--rot)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .item { animation: itemIn 0.6s ease var(--in-delay) forwards; }
  }
  .item:hover {
    background-color: var(--hover);
    filter: drop-shadow(0 0 0.5px var(--hover));
  }
  /* The drawings sit faint (50%) like the Figma frame, and full strength in
     colour on hover. */
  @keyframes itemIn {
    from { opacity: 0; }
    to   { opacity: 0.5; }
  }
  .item:hover { opacity: 1 !important; }

  .hero {
    position: absolute;
    left: 50%;
    top: 27.7%;
    transform: translateX(-50%);
    width: 46%;
    margin: 0;
    font-family: 'Love Ya Like A Sister', cursive;
    font-weight: 400;
    font-size: 7.34cqw;
    line-height: 0.87;
    text-align: center;
    color: #000000;
    z-index: 2;
    pointer-events: none;
  }
  .hero .word {
    display: block;
    opacity: 0;
    animation: wordIn 0.55s ease forwards;
  }

  .play {
    position: absolute;
    left: 50%;
    top: 72%;
    transform: translateX(-50%);
    padding: 0.85rem 2.8rem;
    font-size: 1.5rem;
    font-family: 'Love Ya Like A Sister', cursive;
    color: var(--ink);
    cursor: pointer;
    opacity: 0;
    animation: fadeIn 0.7s ease 1s forwards;
    transition: transform 0.15s ease, filter 0.15s ease;
    background: transparent;
    border: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.18));
    z-index: 3;
  }
  .play-label { position: relative; z-index: 2; white-space: pre; }
  .play:hover { transform: translateX(-50%) translateY(-2px); filter: drop-shadow(-1.2px 6px 4px rgba(0, 0, 0, 0.22)); }
  .play:active { transform: translateX(-50%); }

  .credit {
    position: absolute;
    left: 50%;
    top: 94.9%;
    transform: translate(-50%, -50%);
    margin: 0;
    width: 46%;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1.54cqw;
    letter-spacing: -0.02em;
    line-height: 1.32;
    text-align: center;
    color: #000000;
    z-index: 2;
    opacity: 0;
    animation: fadeIn 0.7s ease 1.2s forwards;
  }
</style>
