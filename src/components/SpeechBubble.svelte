<script>
  import { wavyBorder } from '../actions/wavyBorder.js';
  let { text = '', tail = 'left', delay = 0 } = $props();
  const words = $derived(text.trim().split(/\s+/).filter(Boolean));
</script>

<div class="bubble-outer" style="animation-delay: {delay}s">
  <div class="bubble" use:wavyBorder={{
    radius: 32,
    fill: '#FFFFFF',
    stroke: '#151515',
    strokeWidth: 2.4,
    waviness: 3.6,
    baseFrequency: 0.020
  }}>
    <p class="text">
      {#each words as w, i (i)}
        <span class="word" style="animation-delay: {delay + i * 0.035}s">{w}</span>
      {/each}
    </p>
  </div>

  {#if tail === 'left'}
    <svg class="bubble-tail" width="36" height="40" viewBox="0 0 36 40">
      <path d="M 32 6 L 4 20 L 30 32 Z"
        fill="#FFFFFF" stroke="#151515" stroke-width="2.4"
        stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="33" y1="4" x2="33" y2="36" stroke="#FFFFFF" stroke-width="4"/>
    </svg>
  {/if}
</div>

<style>
  .bubble-outer {
    position: relative;
    width: 100%;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.25));
    animation: bubblePop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    transform-origin: 10% 50%;
  }
  @keyframes bubblePop {
    from { opacity: 0; transform: translateX(-8px) scale(0.94); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  .bubble {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    padding: 24px 30px;
    background: transparent;
  }
  .text {
    margin: 0;
    text-align: center;
    color: #000000;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1.1rem;
    line-height: 1.32;
    word-wrap: break-word;
    overflow-wrap: break-word;
    position: relative;
    z-index: 2;
  }
  .word {
    display: inline-block;
    margin-right: 0.28em;
    opacity: 0;
    animation: wordIn 0.3s ease forwards;
  }
  .bubble-tail {
    position: absolute;
    top: 50%;
    left: -24px;
    transform: translateY(-50%);
    z-index: 2;
  }

  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .bubble { padding: 18px 22px; }
    .text { font-size: 0.9rem; line-height: 1.28; }
    .bubble-tail { transform: translateY(-50%) scale(0.8); left: -20px; }
  }
</style>
