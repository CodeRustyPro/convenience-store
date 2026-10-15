<script>
  import { wavyBorder } from '../actions/wavyBorder.js';
  let { label, style = 'default', effects = null, onclick } = $props();

  const styleConfig = $derived({
    default:  { radius: 'pill', strokeWidth: 2.4, fill: '#FFFFFF',     waviness: 3.4, baseFrequency: 0.022 },
    tiny:     { radius: 'pill', strokeWidth: 1.6, fill: 'transparent', waviness: 2.4, baseFrequency: 0.030 },
    huge:     { radius: 'pill', strokeWidth: 2.8, fill: '#ffe9a3',     waviness: 4.0, baseFrequency: 0.018 },
    dim:      { radius: 'pill', strokeWidth: 1.6, fill: 'transparent', waviness: 2.6, baseFrequency: 0.024 },
    disabled: { radius: 'pill', strokeWidth: 1.6, fill: '#eeeeee',     waviness: 2.4, baseFrequency: 0.024 },
  }[style] || { radius: 'pill', strokeWidth: 2.4, fill: '#FFFFFF', waviness: 3.4, baseFrequency: 0.022 });

  const coinDelta = $derived(effects && typeof effects.coins === 'number' ? effects.coins : 0);
  const timeDelta = $derived(effects && typeof effects.time === 'number'  ? effects.time  : 0);

  function fmtCoin(n) {
    const sign = n > 0 ? '+' : '−';
    return `${sign}₹${Math.abs(n)}`;
  }
  // m:ss, matching the HUD clock readout (e.g. -0:30, -2:00).
  function fmtTime(seconds) {
    const sign = seconds > 0 ? '+' : '−';
    const s = Math.abs(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${sign}${m}:${rem.toString().padStart(2, '0')}`;
  }
</script>

<button
  class="choice {style}"
  onclick={onclick}
  disabled={style === 'disabled'}
  use:wavyBorder={styleConfig}
>
  <span class="row">
    <span class="label">{label}</span>
    {#if coinDelta !== 0 || timeDelta !== 0}
      <span class="chips">
        {#if coinDelta !== 0}
          <span class="chip coin">
            <img class="chip-icon" src="/assets/ui/wallet.png" alt="" />
            {fmtCoin(coinDelta)}
          </span>
        {/if}
        {#if timeDelta !== 0}
          <span class="chip time">
            <img class="chip-icon" src="/assets/ui/hourglass.svg" alt="" />
            {fmtTime(timeDelta)}
          </span>
        {/if}
      </span>
    {/if}
  </span>
</button>

<style>
  .choice {
    position: relative;
    width: 100%;
    min-height: 52px;
    padding: 0;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1.1rem;
    line-height: 1.3;
    color: #000000;
    cursor: pointer;
    background: transparent;
    border: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.22));
    transition: transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
  }
  .row {
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 52px;
    padding: 0.55rem 1.4rem 0.55rem 1.6rem;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.6rem;
  }
  .label {
    text-align: center;
    grid-column: 1;
    line-height: 1.25;
  }
  .chips {
    grid-column: 2;
    display: flex;
    gap: 0.32rem;
    align-items: center;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.22rem;
    font-size: 0.9rem;
    line-height: 1.2;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    color: var(--ink-soft);
  }
  .chip-icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
    flex: 0 0 auto;
  }
  .choice:hover:not(:disabled) {
    transform: translateY(-2px) rotate(-0.25deg);
    filter: drop-shadow(-1.2px 6px 4px rgba(0, 0, 0, 0.28)) brightness(1.02);
  }
  .choice:active:not(:disabled) { transform: translateY(0); }
  .choice.tiny .row {
    font-size: 0.85rem;
    min-height: 34px;
    padding: 0.2rem 0.6rem;
  }
  .choice.tiny {
    width: auto;
    align-self: center;
    color: var(--grey-low);
    min-height: 34px;
  }
  .choice.huge .row { min-height: 60px; font-size: 1.25rem; }
  .choice.dim { color: var(--grey-mid); font-size: 1rem; }
  .choice:disabled { color: #bbb; cursor: not-allowed; }

  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .choice, .row { min-height: 48px; }
    .row { padding: 0.5rem 1rem 0.5rem 1.2rem; }
    .choice { font-size: 1rem; }
    .chip { font-size: 0.8rem; }
    /* No hover on touch: don't leave a button looking lifted after a tap. */
    .choice:hover:not(:disabled) { transform: none; }
  }
</style>
