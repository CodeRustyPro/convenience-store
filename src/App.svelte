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

<div class="stage">
  {#if screen === 'title'}
    <div class="screen" out:fade={{ duration: 400 }}>
      <TitleScreen onstart={startGame} />
    </div>
  {:else}
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
  <div class="paper-grain"></div>
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
</style>
