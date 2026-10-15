<script>
  import HUD from './components/HUD.svelte';
  import Scene from './components/Scene.svelte';
  import TitleScreen from './components/TitleScreen.svelte';
  import Receipt from './components/Receipt.svelte';
  import FinalScreen from './components/FinalScreen.svelte';
  import { story, ui } from './story/storyEngine.js';
  import { game } from './stores/game.js';
  import { fade } from 'svelte/transition';

  let screen = $state('title'); // 'title' | 'game'
  let initialised = $state(false);

  // Responsive scale: on touch phones the stage is a fixed 1280x800 design
  // box that we uniformly scale to fit the viewport (a pure zoom — desktop
  // is untouched since the transform only applies in the phone media query).
  let fit = $state(1);
  $effect(() => {
    const compute = () => {
      fit = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  });

  let uiState = $state({ showReceipt: false, showFinal: false, dignityRelabel: false, phoneBuzz: 0 });
  ui.subscribe((u) => { uiState = u; });

  async function startGame() {
    if (!initialised) {
      await story.init();
      initialised = true;
    }
    screen = 'game';
  }

  function continueFromReceipt() {
    // Hide the receipt overlay and let the Ink story advance to final
    ui.update((u) => ({ ...u, showReceipt: false }));
    // Auto-advance the receipt knot's only choice
    const f = story.current();
    if (f && f.choices.length === 1) {
      story.choose(0);
    }
  }

  function restart() {
    ui.update((u) => ({ ...u, showFinal: false, showReceipt: false, dignityRelabel: false }));
    story.reset();
  }
</script>

<!-- The landing page is laid out on the Figma 16:9 frame, so it gets the
     whole window instead of the game's 16:10 stage. -->
{#if screen === 'title'}
  <div class="landing" out:fade={{ duration: 400 }}>
    <TitleScreen onstart={startGame} />
  </div>
{/if}

<div class="stage" style="--fit:{fit}">
  {#if screen === 'game'}
    <div class="screen" in:fade={{ duration: 500, delay: 200 }}>
      <Scene />
      <HUD />
      {#if uiState.showReceipt}
        <Receipt onContinue={continueFromReceipt} />
      {/if}
      {#if uiState.showFinal}
        <FinalScreen onRestart={restart} />
      {/if}
    </div>
  {/if}
</div>

<!-- Phones held sideways only: on phones the story is played upright. -->
<div class="rotate-hint" aria-hidden="true">
  <div class="rotate-card">
    <div class="rotate-icon">⟳</div>
    <div class="rotate-title">Please turn your phone upright</div>
    <div class="rotate-sub">This story is played in portrait.</div>
  </div>
</div>

<style>
  .stage {
    position: relative;
    width: min(100vw, calc(100vh * 16 / 10));
    height: min(100vh, calc(100vw * 10 / 16));
    background: #FFFFFF;
    overflow: hidden;
  }
  .screen {
    position: absolute;
    inset: 0;
  }

  .landing {
    position: fixed;
    top: 0; right: 0; bottom: 0; left: 0;
    z-index: 50;
  }

  /* Rotate hint is hidden everywhere except phones held sideways. */
  .rotate-hint { display: none; }

  /* ---- Touch devices (desktop above is left untouched) ----
     Phones are played upright: the stage fills the screen and each
     component lays itself out for portrait under the same media query
     (hover: none) and (pointer: coarse) and (orientation: portrait).
     Tablets held sideways keep the scaled 1280x800 desktop stage. */
  @media (hover: none) and (pointer: coarse) and (orientation: landscape) {
    .stage {
      width: 1280px;
      height: 800px;
      transform: scale(var(--fit, 1));
      transform-origin: center center;
      flex: none;
    }
  }
  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .stage {
      width: 100vw;
      height: 100vh;
      height: 100dvh;
    }
  }
  /* A phone on its side (short landscape screen): ask to turn it upright. */
  @media (hover: none) and (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .stage, .landing { display: none; }
    .rotate-hint {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      padding: 2rem;
    }
    .rotate-card {
      text-align: center;
      color: var(--ink);
      font-family: 'Love Ya Like A Sister', cursive;
      max-width: 22rem;
    }
    .rotate-icon {
      font-size: 3.4rem;
      line-height: 1;
      margin-bottom: 1rem;
      animation: rotate-nudge 1.8s ease-in-out infinite;
    }
    .rotate-title { font-size: 1.6rem; margin-bottom: 0.5rem; }
    .rotate-sub { font-size: 1.1rem; color: var(--grey-mid); line-height: 1.4; }
  }
  @keyframes rotate-nudge {
    0%, 100% { transform: rotate(0deg); }
    50%      { transform: rotate(-90deg); }
  }
</style>
