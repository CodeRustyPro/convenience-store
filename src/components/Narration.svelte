<script>
  import { wavyBorder } from '../actions/wavyBorder.js';
  // delay (s): when the box and its words start appearing, so the scene can
  // reveal dialogue, then narration, then choices in order.
  let { text = '', delay = 0 } = $props();
  const words = $derived(text.trim().split(/\s+/).filter(Boolean));
</script>

<div class="narration-outer" style="animation-delay: {delay}s">
  <div class="narration" use:wavyBorder={{
    radius: 3,
    fill: '#FFFFFF',
    stroke: '#151515',
    strokeWidth: 2.4,   /* same line weight as speech bubbles and choices */
    waviness: 3.6,
    baseFrequency: 0.020
  }}>
    <p class="text">
      {#each words as w, i (i)}
        <span class="word" style="animation-delay: {delay + i * 0.03}s">{w}</span>
      {/each}
    </p>
  </div>
</div>

<style>
  .narration-outer {
    position: relative;
    width: 100%;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.25));
    animation: narrIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  @keyframes narrIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .narration {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    padding: 22px 30px;
    background: transparent;
  }
  .text {
    margin: 0;
    text-align: left;
    color: #000000;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1.15rem;
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

  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .narration { padding: 12px 16px; }
    .text { font-size: 0.94rem; line-height: 1.36; }
  }
</style>
