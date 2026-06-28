<script>
  // Layout:
  //   0–28%  : character (anchored bottom-left)
  //   29–52% : speech bubble at character's head/shoulder height
  //   54–96% : right column — narration + choices stacked together, centered
  import { story } from '../story/storyEngine.js';
  import Background from './Background.svelte';
  import Character from './Character.svelte';
  import SpeechBubble from './SpeechBubble.svelte';
  import Narration from './Narration.svelte';
  import Choice from './Choice.svelte';
  import PhoneNotification from './PhoneNotification.svelte';
  import Cart from './Cart.svelte';
  import { fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let frame = $state({ sceneId: 0, lines: [], choices: [], bg: null, character: null, ended: false, phone: null });
  story.subscribe((f) => { frame = f; });

  const hasCharacter = $derived(!!frame.character && frame.character !== 'none');
  const dialogueText = $derived(
    frame.lines.filter(l => l.kind === 'dialogue').map(l => l.text).join(' ')
  );
  const narrationText = $derived(
    frame.lines.filter(l => l.kind === 'narration').map(l => l.text).join(' ')
  );

  function pick(i) { story.choose(i); }
</script>

<div class="scene">
  <Background id={frame.bg} />

  {#key frame.sceneId}
    <div class="character-layer" in:fade={{ duration: 500, delay: 100, easing: cubicOut }} out:fade={{ duration: 200 }}>
      {#if hasCharacter}
        <Character id={frame.character} />
      {/if}
    </div>
  {/key}

  <!-- Speech bubble at character's head/shoulder level, tail pointing at them -->
  {#if dialogueText}
    {#key `${frame.sceneId}-bubble`}
      <div class="bubble-slot" class:no-character={!hasCharacter} class:mom={frame.character?.startsWith('mom')} in:fade={{ duration: 320, delay: 250 }}>
        <SpeechBubble text={dialogueText} tail={hasCharacter ? 'left' : 'none'} />
      </div>
    {/key}
  {/if}

  <!-- Right column: narration + choices stacked together, vertically centered -->
  <div class="right-column">
    {#if narrationText}
      {#key `${frame.sceneId}-narr`}
        <div class="narration-block" in:fade={{ duration: 320, delay: 320 }}>
          <Narration text={narrationText} />
        </div>
      {/key}
    {/if}

    {#if frame.choices.length}
      <div class="choices" in:fade={{ duration: 320, delay: narrationText ? 460 : 360 }}>
        {#each frame.choices as c, i (c.index)}
          <div class="choice-wrap" style="animation-delay: {0.5 + i * 0.08}s">
            <Choice label={c.label} style={c.style} effects={c.effects} onclick={() => pick(c.index)} />
          </div>
        {/each}
        {#if frame.ended}
          <div class="ended">— end —</div>
        {/if}
      </div>
    {/if}
  </div>

  <Cart />
  <PhoneNotification />
</div>

<style>
  .scene {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .character-layer {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }

  /* Speech bubble: at the character's head/shoulder height, hugging their right */
  .bubble-slot {
    position: absolute;
    left: 22%;
    top: 30%;
    width: 23%;
    min-width: 200px;
    max-width: 270px;
    z-index: 40;
    pointer-events: none;
  }
  /* Mom is a wide square asset — her original placement was already perfect. */
  .bubble-slot.mom {
    left: 29%;
    top: 32%;
    width: 22%;
    max-width: 260px;
  }
  .bubble-slot.no-character {
    left: 8%;
    top: 30%;
    width: 32%;
    max-width: 360px;
  }

  /* Right column: narration + choices stacked, vertically centered */
  .right-column {
    position: absolute;
    left: 54%;
    top: 50%;
    transform: translateY(-50%);
    width: 42%;
    max-width: 480px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    pointer-events: none;
  }
  .narration-block {
    pointer-events: none;
  }
  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
    pointer-events: auto;
  }
  .choice-wrap {
    opacity: 0;
    animation: fadeUpIn 0.45s ease forwards;
    width: 100%;
  }
  .choice-wrap :global(.choice) {
    width: 100%;
    min-width: 0;
  }
  .ended {
    color: var(--grey-low);
    font-size: 0.95rem;
    letter-spacing: 0.18em;
    margin-top: 0.6rem;
    text-align: center;
  }
</style>
