<script>
  // Round dignity badge with wavy hand-drawn border. Sprite swaps
  // through buckets as standing changes. Tooltip shows percentage.
  import { gsap } from 'gsap';
  import { wavyBorder } from '../actions/wavyBorder.js';
  import Tooltip from './Tooltip.svelte';

  let { standing = 100 } = $props();

  function bucket(s) {
    if (s >= 88) return 100;
    if (s >= 63) return 75;
    if (s >= 38) return 50;
    if (s >= 18) return 25;
    return 10;
  }

  const b = $derived(bucket(standing));
  const url = $derived(`/assets/ui/dignity-${b}.png`);
  const tooltipText = $derived(`${standing}%`);

  let badgeEl;
  let flashEl;
  const INK = '#151515';
  const RED = '#c63838';
  // How long the character + border stay red on a drop.
  const HOLD = 1.1;

  // Track the RAW standing value (not just the bucket) so every drop is
  // signalled, even small ones that don't change the sprite.
  let prevStanding = 100;
  $effect(() => {
    if (badgeEl && standing !== prevStanding) {
      if (standing < prevStanding) {
        gsap.fromTo(badgeEl,
          { rotate: -3, scale: 1.06 },
          { rotate: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }
        );
        // Hold the character red for a clearly noticeable beat.
        if (flashEl) {
          gsap.timeline()
            .fromTo(flashEl, { opacity: 0 }, { opacity: 0.85, duration: 0.14, ease: 'power1.out' })
            .to(flashEl, { opacity: 0.85, duration: HOLD })
            .to(flashEl, { opacity: 0, duration: 0.35, ease: 'power1.in' });
        }
        // Turn the badge border red on the same schedule.
        const rect = badgeEl.querySelector('svg.wavy-border rect');
        if (rect) {
          gsap.timeline()
            .to(rect, { attr: { stroke: RED }, duration: 0.14, ease: 'power1.out' })
            .to(rect, { attr: { stroke: RED }, duration: HOLD })
            .to(rect, { attr: { stroke: INK }, duration: 0.35, ease: 'power1.in' });
        }
      }
      prevStanding = standing;
    }
  });
</script>

<Tooltip label={tooltipText} placement="left">
  <div
    class="badge"
    bind:this={badgeEl}
    use:wavyBorder={{ radius: 60, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.2, waviness: 3.2, baseFrequency: 0.022 }}
  >
    <div class="figure-content">
      <div class="pct">{standing}%</div>
      {#key b}
        <img src={url} alt="" class="figure" />
      {/key}
      <!-- Red copy of the figure (image used as a mask), flashed on a drop. -->
      <div class="flash" bind:this={flashEl} style="--fig:url({url})"></div>
    </div>
  </div>
</Tooltip>

<style>
  .badge {
    position: relative;
    width: 94px;
    height: 94px;
    cursor: default;
    background: transparent;
    border: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.22));
    transition: filter 0.15s ease;
  }
  .badge:hover { filter: brightness(1.04) drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.22)); }
  .figure-content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    overflow: hidden;
    border-radius: 999px;
  }
  .figure {
    height: 80%;
    width: auto;
    object-fit: contain;
    object-position: bottom;
    animation: figIn 0.32s ease forwards;
    opacity: 0;
  }
  /* Live percentage, sitting in the white space above the figure's head. */
  .pct {
    position: absolute;
    top: 14%;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 5;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 0.8rem;
    line-height: 1;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
    pointer-events: none;
  }
  @keyframes figIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  /* Red copy of the figure: a red fill masked by the figure image, so only
     the character (not the surrounding box) turns red on a dignity drop. */
  .flash {
    position: absolute;
    inset: 0;
    background: var(--accent-red);
    opacity: 0;
    pointer-events: none;
    -webkit-mask-image: var(--fig);
    mask-image: var(--fig);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center bottom;
    mask-position: center bottom;
    -webkit-mask-size: auto 80%;
    mask-size: auto 80%;
  }
</style>
