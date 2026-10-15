<script>
  import { wavyBorder } from '../actions/wavyBorder.js';
  let { onstart } = $props();

  // The page is built on the Figma landing frame itself (1920 x 1080, node
  // 297:10): everything below is in that frame's pixels and is scaled as one,
  // so proportions match the design. At 16:9 it is the Figma frame exactly;
  // on other shapes the left and right columns stay pinned to their screen
  // edges and the title stays centred, so nothing gets cropped.
  // Each PNG is an alpha mask of the drawing, so its colour is set in CSS:
  // faint ink until hovered, then a palette colour that stays.
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

  // Index into HOVER for each item, or -1 while it's still uncoloured.
  // Hovering colours an item and it keeps that colour; each new hover moves
  // it on to the next colour in the list.
  let colourOf = $state(ITEMS.map(() => -1));
  function recolour(i) {
    colourOf[i] = colourOf[i] < 0 ? i % HOVER.length : (colourOf[i] + 1) % HOVER.length;
  }

  // Portrait phones show just the title, PLAY and the credit (no drawings),
  // laid out with plain CSS (see the portrait styles below).
  const PORTRAIT_MQ = '(hover: none) and (pointer: coarse) and (orientation: portrait)';

  // Landscape: scale to the window height, but shrink further if the window
  // is too narrow for both columns plus the title (1600 frame px).
  // Portrait: scale the 1080 frame to the window width.
  const MIN_W = 1600;
  let portrait = $state(false);
  let scale = $state(1);
  let offY = $state(0);
  $effect(() => {
    const mq = window.matchMedia(PORTRAIT_MQ);
    const fit = () => {
      portrait = mq.matches;
      if (portrait) {
        scale = 1;
        offY = 0;
      } else {
        scale = Math.min(window.innerHeight / FRAME_H, window.innerWidth / MIN_W);
        offY = (window.innerHeight - FRAME_H * scale) / 2;
      }
    };
    fit();
    window.addEventListener('resize', fit);
    mq.addEventListener('change', fit);
    return () => {
      window.removeEventListener('resize', fit);
      mq.removeEventListener('change', fit);
    };
  });

  // Slow drift: each item floats, sways and tilts on its own cycle so the
  // shelves feel alive without moving in step. Derived from the index so
  // it's the same on every visit. Distances are in frame pixels.
  const left = ITEMS.map((it, i) => ({ ...it, i })).filter((it) => it.x < FRAME_W / 2);
  const right = ITEMS.map((it, i) => ({ ...it, i })).filter((it) => it.x >= FRAME_W / 2);

  const drift = (i) => {
    const dur = 5 + ((i * 37) % 40) / 10;                 // 5s – 9s
    const delay = -((i * 53) % 90) / 10;                  // start mid-cycle
    const dy = 12 + (i % 3) * 5;                          // 12 – 22px
    const dx = (i % 2 ? 1 : -1) * (4 + (i % 4) * 2);      // ±4 – 10px
    const rot = (i % 2 ? -1 : 1) * (2 + (i % 4) * 0.8);   // ±2° – 4.4°
    return `--drift-dur:${dur}s; --drift-delay:${delay}s; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg`;
  };
</script>

{#snippet art(list, shift)}
  {#each list as it (it.name)}
    <div
      class="item"
      class:coloured={colourOf[it.i] >= 0}
      onpointerenter={() => recolour(it.i)}
      style="left:{it.x - shift}px; top:{it.y}px; width:{it.w}px; height:{it.h}px;
             --src:url('/assets/landing/{it.name}.png');
             --colour:{colourOf[it.i] >= 0 ? HOVER[colourOf[it.i]] : 'var(--ink)'}; --in-delay:{0.25 + it.i * 0.04}s; {drift(it.i)}"
    ></div>
  {/each}
{/snippet}

<div class="title-screen" class:portrait style="--scale:{scale}; --off-y:{offY}px">
  {#if !portrait}
    <div class="side left" aria-hidden="true">{@render art(left, 0)}</div>
    <div class="side right" aria-hidden="true">{@render art(right, FRAME_W / 2)}</div>
  {/if}

  <div class="center">
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

    {#if !portrait}
      <p class="credit">By Parisa Mehta and Srividhya S</p>
    {/if}
  </div>

  {#if portrait}
    <p class="credit bottom-credit">By Parisa Mehta and Srividhya S</p>
  {/if}
</div>

<style>
  .title-screen {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #FFFFFF;
  }
  /* Three layers in frame pixels, each scaled from the edge it's pinned to. */
  .side, .center {
    position: absolute;
    top: var(--off-y, 0);
    height: 1080px;
  }
  .side { width: 960px; }
  .side.left  { left: 0;  transform-origin: 0 0;    transform: scale(var(--scale, 1)); }
  .side.right { right: 0; transform-origin: 100% 0; transform: scale(var(--scale, 1)); }
  .center {
    left: 50%;
    width: 1920px;
    transform-origin: 50% 0;
    transform: translateX(-50%) scale(var(--scale, 1));
    pointer-events: none;
  }
  .center .play { pointer-events: auto; }
  .item {
    position: absolute;
    background-color: var(--ink);
    -webkit-mask: var(--src) center / contain no-repeat;
            mask: var(--src) center / contain no-repeat;
    opacity: 0;
    animation:
      itemIn 0.6s ease var(--in-delay) forwards,
      drift var(--drift-dur) ease-in-out var(--drift-delay) infinite alternate;
    transition: background-color 0.3s ease;
    /* Own compositing layer: Safari can drop a masked element that is also
       being transformed every frame unless it's promoted like this. */
    will-change: transform, opacity;
    -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
  }
  @keyframes drift {
    0%   { transform: translate(0, 0) rotate(0deg); }
    50%  { transform: translate(var(--dx), calc(var(--dy) * -0.6)) rotate(calc(var(--rot) * 0.5)); }
    100% { transform: translate(calc(var(--dx) * -0.5), calc(var(--dy) * -1)) rotate(var(--rot)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .item { animation: itemIn 0.6s ease var(--in-delay) forwards; }
  }
  /* No filter here: a filter on a masked, animated element is what makes
     Safari stop drawing it. */
  .item.coloured {
    background-color: var(--colour);
  }
  /* The drawings sit faint (50%) like the Figma frame, and full strength in
     colour on hover. */
  @keyframes itemIn {
    from { opacity: 0; }
    to   { opacity: 0.5; }
  }
  .item.coloured { opacity: 1 !important; }

  .hero {
    position: absolute;
    left: 495px;
    top: 299px;
    width: 883px;
    margin: 0;
    font-family: 'Love Ya Like A Sister', cursive;
    font-weight: 400;
    font-size: 141px;
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
    top: 790px;
    transform: translateX(-50%);
    padding: 20px 64px;
    font-size: 36px;
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
    top: 1025.5px;
    transform: translate(-50%, -50%);
    margin: 0;
    width: 881px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 29.55px;
    letter-spacing: -0.591px;
    line-height: 1.32;
    text-align: center;
    color: #000000;
    z-index: 2;
    opacity: 0;
    animation: fadeIn 0.7s ease 1.2s forwards;
  }

  /* ---- Portrait phones ----
     Plain layout, no scaling: the title is sized to the screen width,
     PLAY sits right under it, and the credit sits at the bottom. */
  .title-screen.portrait { top: 0; right: 0; bottom: 0; left: 0; }
  .portrait .center {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    height: auto;
    transform: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 20px 72px;
  }
  .portrait .hero {
    position: static;
    width: auto;
    font-size: min(12vw, 64px);
  }
  .portrait .play {
    position: static;
    transform: none;
    margin-top: 28px;
    padding: 10px 32px;
    font-size: 17px;
  }
  .portrait .play:hover, .portrait .play:active { transform: none; }
  .portrait .bottom-credit {
    left: 0;
    right: 0;
    top: auto;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 22px);
    transform: none;
    width: auto;
    font-size: 12.5px;
    letter-spacing: -0.2px;
  }
</style>
