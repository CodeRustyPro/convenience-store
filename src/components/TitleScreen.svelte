<script>
  import { wavyBorder } from '../actions/wavyBorder.js';
  let { onstart } = $props();
</script>

<div class="title-screen">
  <div class="center">
    <h1 class="hero">
      <span class="line">
        <span class="word" style="animation-delay: 0.05s">THE</span>
      </span>
      <span class="line">
        <span class="word" style="animation-delay: 0.20s">CONVENIENCE</span>
      </span>
      <span class="line">
        <span class="word" style="animation-delay: 0.40s">STORE</span>
      </span>
    </h1>

    <button
      class="play"
      onclick={onstart}
      use:wavyBorder={{ radius: 26, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.6, baseFrequency: 0.020 }}
    >
      <span class="play-label">PLAY  →</span>
    </button>
  </div>
</div>

<style>
  .title-screen {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #FFFFFF;
  }
  .center {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 2rem;
    gap: 2.4rem;
  }
  .hero {
    font-family: 'Love Ya Like A Sister', cursive;
    font-weight: 400;
    font-size: clamp(3rem, 8vw, 6.4rem);
    line-height: 0.96;
    margin: 0;
    letter-spacing: 0.01em;
    color: var(--ink);
  }
  .hero .line { display: block; }
  .hero .word {
    display: inline-block;
    opacity: 0;
    animation: wordIn 0.55s ease forwards;
  }
  .play {
    position: relative;
    padding: 0.95rem 2.8rem;
    font-size: 1.6rem;
    font-family: 'Love Ya Like A Sister', cursive;
    color: var(--ink);
    cursor: pointer;
    opacity: 0;
    animation: fadeIn 0.7s ease 1s forwards;
    transition: transform 0.15s ease, filter 0.15s ease;
    background: transparent;
    border: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.18));
  }
  .play-label {
    position: relative;
    z-index: 2;
  }
  .play:hover { transform: translateY(-2px); filter: drop-shadow(-1.2px 6px 4px rgba(0, 0, 0, 0.22)); }
  .play:active { transform: translateY(0); }
</style>
