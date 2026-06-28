<script>
  // Title-screen ambient figures: real character PNGs drifting around the
  // edges of the canvas, behind the title.

  const FIGURES = [
    { src: '/assets/chars/mom-1.png',          pos: 'top-left',     size: 12, delay: 0.0, dur: 9,  rot: -8 },
    { src: '/assets/chars/greeter-1.png',      pos: 'top-right',    size: 18, delay: 0.4, dur: 11, rot: 6 },
    { src: '/assets/chars/nagger-1.png',       pos: 'mid-left',     size: 22, delay: 0.9, dur: 10, rot: -4 },
    { src: '/assets/chars/nagger-3.png',       pos: 'mid-right',    size: 22, delay: 1.4, dur: 12, rot: 3 },
    { src: '/assets/chars/bread-clerk.png',    pos: 'bottom-left',  size: 20, delay: 1.9, dur: 9,  rot: 8 },
    { src: '/assets/chars/maggi-clerk.png',    pos: 'bottom-right', size: 20, delay: 2.3, dur: 10, rot: -6 },
    { src: '/assets/chars/guard-1.png',        pos: 'far-left',     size: 24, delay: 0.6, dur: 11, rot: -2 },
    { src: '/assets/chars/cashier-1.png',      pos: 'far-right',    size: 22, delay: 2.7, dur: 12, rot: 5 },
  ];

  const POSITIONS = {
    'top-left':     { top: '4%',    left: '6%',  origin: 'top-left' },
    'top-right':    { top: '8%',    right: '8%', origin: 'top-right' },
    'mid-left':     { top: '38%',   left: '2%',  origin: 'center-left' },
    'mid-right':    { top: '36%',   right: '3%', origin: 'center-right' },
    'bottom-left':  { bottom: '6%', left: '12%', origin: 'bottom-left' },
    'bottom-right': { bottom: '4%', right: '12%', origin: 'bottom-right' },
    'far-left':     { bottom: '2%', left: '0%',  origin: 'bottom-left' },
    'far-right':    { bottom: '8%', right: '0%', origin: 'bottom-right' },
  };
</script>

<div class="ambient">
  {#each FIGURES as f, i (i)}
    {@const p = POSITIONS[f.pos]}
    <div
      class="drift"
      style="
        {p.top    ? `top: ${p.top};`       : ''}
        {p.bottom ? `bottom: ${p.bottom};` : ''}
        {p.left   ? `left: ${p.left};`     : ''}
        {p.right  ? `right: ${p.right};`   : ''}
        --size: {f.size}%;
        --rot: {f.rot}deg;
        animation-delay: {f.delay}s;
        animation-duration: {f.dur}s;
      "
    >
      <img src={f.src} alt="" />
    </div>
  {/each}
</div>

<style>
  .ambient {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  }
  .drift {
    position: absolute;
    width: var(--size);
    opacity: 0;
    animation:
      drift-in 1.6s ease-out forwards,
      drift-sway 8s ease-in-out infinite alternate;
    transform: rotate(var(--rot));
  }
  .drift img {
    width: 100%;
    height: auto;
    display: block;
    filter: grayscale(0.4) opacity(0.85);
  }
  @keyframes drift-in {
    from { opacity: 0; transform: rotate(var(--rot)) translateY(20px); }
    to   { opacity: 0.85; transform: rotate(var(--rot)) translateY(0); }
  }
  @keyframes drift-sway {
    0%, 100% { transform: rotate(var(--rot)) translateY(0); }
    50%      { transform: rotate(calc(var(--rot) + 1deg)) translateY(-6px); }
  }
</style>
