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

  // Reveal order, so players know where to look: the speech bubble types
  // out first, then a pause, then the narration box, then a pause, then the
  // choices one at a time. Times are in seconds and follow the per-word
  // typing speed in SpeechBubble (0.035s) and Narration (0.03s).
  const WORD_IN = 0.3;      // one word's own fade-in
  const PAUSE = 0.7;        // beat between dialogue, narration and choices
  const CHOICE_STAGGER = 0.18;
  const countWords = (t) => t.trim().split(/\s+/).filter(Boolean).length;
  const timing = $derived.by(() => {
    const dialogueStart = 0.25;
    const dialogueEnd = dialogueText ? dialogueStart + countWords(dialogueText) * 0.035 + WORD_IN : 0;
    const narrStart = dialogueText ? dialogueEnd + PAUSE : 0.3;
    const narrEnd = narrationText ? narrStart + countWords(narrationText) * 0.03 + WORD_IN : dialogueEnd;
    const choicesStart = (narrationText || dialogueText) ? narrEnd + PAUSE : 0.3;
    return { dialogueStart, narrStart, choicesStart };
  });

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
      <div class="bubble-slot" class:no-character={!hasCharacter} class:mom={frame.character?.startsWith('mom')}>
        <SpeechBubble text={dialogueText} tail={hasCharacter ? 'left' : 'none'} delay={timing.dialogueStart} />
      </div>
    {/key}
  {/if}

  <!-- Right column: narration + choices stacked together, vertically centered -->
  <div class="right-column">
    {#if narrationText}
      {#key `${frame.sceneId}-narr`}
        <div class="narration-block">
          <Narration text={narrationText} delay={timing.narrStart} />
        </div>
      {/key}
    {/if}

    {#if frame.choices.length}
      {#key frame.sceneId}
      <div class="choices">
        {#each frame.choices as c, i (c.index)}
          <div class="choice-wrap" style="animation-delay: {timing.choicesStart + i * CHOICE_STAGGER}s">
            <Choice label={c.label} style={c.style} effects={c.effects} onclick={() => pick(c.index)} />
          </div>
        {/each}
        {#if frame.ended}
          <div class="ended">— end —</div>
        {/if}
      </div>
      {/key}
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
  /* Hidden (and unclickable) until its turn: visibility flips on when the
     delayed animation starts, and 'forwards' keeps it on afterwards. */
  .choice-wrap {
    opacity: 0;
    visibility: hidden;
    animation: choiceIn 0.45s ease forwards;
    width: 100%;
  }
  @keyframes choiceIn {
    from { opacity: 0; visibility: visible; transform: translateY(8px); }
    to   { opacity: 1; visibility: visible; transform: translateY(0); }
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
