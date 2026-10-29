<script>
  // Final hold screen — white like the landing page, closing reflection.
  import { game, formatTime } from '../stores/game.js';
  import { wavyBorder } from '../actions/wavyBorder.js';
  import { fade, fly } from 'svelte/transition';
  import DignityExplainer from './DignityExplainer.svelte';
  import MeetDesigners from './MeetDesigners.svelte';

  let { onRestart } = $props();
  let g = $state({ coins: 0, standing: 0, timeSeconds: 0 });
  game.subscribe((s) => { g = s; });

  let explaining = $state(false);
  let meeting = $state(false);
</script>

<div class="final" in:fade={{ duration: 600 }}>
  <div class="content">
    <div class="footnote" in:fade={{ duration: 800, delay: 300 }}>
      This store isn't real. But the choices you made are. You've probably made them dozens of times without noticing. That's because quick commerce platforms like Blinkit, Instamart, and Zepto rarely ask for everything at once. They spread these compromises across ordinary moments, until they stop feeling like compromises at all. Convenience never asks for everything at once. It asks for one reasonable compromise at a time, until you no longer notice what you're giving up.
    </div>

    <div class="stats" in:fly={{ y: 12, duration: 600, delay: 900 }}>
      <div class="stat"><div class="lbl">dignity left</div><div class="val">{g.standing}%</div></div>
      <div class="stat"><div class="lbl">coins left</div><div class="val">₹{g.coins}</div></div>
      <div class="stat"><div class="lbl">time left</div><div class="val">{formatTime(g.timeSeconds)}</div></div>
    </div>

    <div class="actions" in:fly={{ y: 16, duration: 600, delay: 1300 }}>
      <button class="play"
              use:wavyBorder={{ radius: 'pill', fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.6, baseFrequency: 0.020 }}
              onclick={onRestart}>
        <span class="play-label">SHOP AGAIN?</span>
      </button>
      <button class="play secondary"
              use:wavyBorder={{ radius: 'pill', fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.6, baseFrequency: 0.020 }}
              onclick={() => (explaining = true)}>
        <span class="play-label">HOW WAS DIGNITY CALCULATED?</span>
      </button>
      <button class="play secondary"
              use:wavyBorder={{ radius: 'pill', fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.6, baseFrequency: 0.020 }}
              onclick={() => (meeting = true)}>
        <span class="play-label">MEET THE DESIGNERS</span>
      </button>
    </div>
  </div>

  {#if explaining}
    <DignityExplainer score={g.standing} flags={g.flags} onClose={() => (explaining = false)} />
  {/if}
  {#if meeting}
    <MeetDesigners onClose={() => (meeting = false)} />
  {/if}
</div>

<style>
  .final {
    position: absolute;
    inset: 0;
    z-index: 600;
    overflow: hidden;
    background: #FFFFFF;
  }
  .content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.8rem;
    color: var(--ink);
    text-align: center;
    padding: 2rem;
  }
  .stats {
    display: flex;
    gap: 2.2rem;
  }
  .stat .lbl {
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1rem;
    letter-spacing: 0.16em;
    color: var(--ink);
    text-transform: uppercase;
  }
  .stat .val {
    font-family: 'Love Ya Like A Sister', cursive;
    font-weight: 700;
    font-size: 2.2rem;
    color: var(--accent-red);
    line-height: 1.1;
  }
  /* Same treatment as the title-screen PLAY button. */
  .play {
    position: relative;
    padding: 0.85rem 2.2rem;
    font-size: 1.35rem;
    font-family: 'Love Ya Like A Sister', cursive;
    color: var(--ink);
    cursor: pointer;
    background: transparent;
    border: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.18));
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  .play-label {
    position: relative;
    z-index: 2;
  }
  .actions {
    display: flex;
    gap: 1.4rem;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
  .play:hover { transform: translateY(-2px); filter: drop-shadow(-1.2px 6px 4px rgba(0, 0, 0, 0.22)); }
  .play:active { transform: translateY(0); }
  .footnote {
    font-family: 'Love Ya Like A Sister', cursive;
    color: var(--ink);
    font-size: 1.2rem;
    line-height: 1.5;
    max-width: 640px;
    text-align: center;
  }

  /* Portrait phones: one scrolling column, buttons stacked full width. */
  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .content {
      justify-content: safe center;
      overflow-y: auto;
      gap: 1.5rem;
      padding: calc(env(safe-area-inset-top, 0px) + 1.5rem) 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.5rem);
    }
    .footnote { font-size: 1.02rem; line-height: 1.5; }
    .stats { gap: 1.1rem; }
    .stat .lbl { font-size: 0.72rem; letter-spacing: 0.1em; }
    .stat .val { font-size: 1.75rem; }
    .actions { flex-direction: column; width: 100%; gap: 0.9rem; }
    .play { width: 100%; font-size: 1.1rem; padding: 0.85rem 1.2rem; }
    .play:hover { transform: none; }
  }
</style>
