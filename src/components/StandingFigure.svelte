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
        // Flash the figure red so the change is unmistakable.
        if (flashEl) {
          gsap.fromTo(flashEl,
            { opacity: 0 },
            { opacity: 0.6, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.inOut' }
          );
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
      {#key b}
        <img src={url} alt="" class="figure" />
      {/key}
      <div class="flash" bind:this={flashEl}></div>
    </div>
  </div>
</Tooltip>

<style>
  .badge {
    position: relative;
    width: 82px;
    height: 82px;
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
    height: 86%;
    width: auto;
    object-fit: contain;
    object-position: bottom;
    animation: figIn 0.32s ease forwards;
    opacity: 0;
  }
  @keyframes figIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  /* Red wash that flashes over the figure on a dignity drop. multiply keeps
     the dark line-art while turning the figure's light areas red. */
  .flash {
    position: absolute;
    inset: 0;
    background: var(--accent-red);
    mix-blend-mode: multiply;
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
  }
</style>
