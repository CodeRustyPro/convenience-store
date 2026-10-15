<script>
  import { game, formatTime } from '../stores/game.js';
  import StandingFigure from './StandingFigure.svelte';
  import Tooltip from './Tooltip.svelte';
  import { wavyBorder } from '../actions/wavyBorder.js';
  import { gsap } from 'gsap';

  let state = $state({ coins: 500, timeSeconds: 900, standing: 100, standingLabel: 'STANDING' });
  game.subscribe((s) => { state = s; });

  let coinsEl, timeEl;
  let prevCoins = 500, prevTime = 900;
  let coinsLowFlashed = false;

  // Transient "kam hua" delta badges shown next to a meter when it changes.
  // Each carries its own key so re-firing on the same value restarts the anim.
  let coinDelta = $state(null); // { text, up, key }
  let timeDelta = $state(null);
  let coinTimer, timeTimer;
  let deltaKey = 0;

  function fmtCoinDelta(n) {
    return `${n > 0 ? '+' : '−'}₹${Math.abs(n)}`;
  }
  function fmtTimeDelta(seconds) {
    const sign = seconds > 0 ? '+' : '−';
    const s = Math.abs(seconds);
    const m = Math.floor(s / 60);
    return `${sign}${m}:${(s % 60).toString().padStart(2, '0')}`;
  }

  $effect(() => {
    if (state.coins !== prevCoins && coinsEl) {
      const diff = state.coins - prevCoins;
      coinDelta = { text: fmtCoinDelta(diff), up: diff > 0, key: ++deltaKey };
      clearTimeout(coinTimer);
      coinTimer = setTimeout(() => { coinDelta = null; }, 1600);
      if (state.coins < prevCoins) {
        gsap.fromTo(coinsEl, { y: -3 }, { y: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
      }
      if (state.coins < 50 && !coinsLowFlashed) {
        coinsLowFlashed = true;
        gsap.fromTo(coinsEl, { color: 'var(--ink)' }, { color: 'var(--accent-red)', duration: 0.4, yoyo: true, repeat: 1 });
      }
      prevCoins = state.coins;
    }
  });

  $effect(() => {
    if (state.timeSeconds !== prevTime && timeEl) {
      const diff = state.timeSeconds - prevTime;
      // Ignore the 1s/tick countdown — only surface choice-driven jumps.
      if (Math.abs(diff) > 1) {
        timeDelta = { text: fmtTimeDelta(diff), up: diff > 0, key: ++deltaKey };
        clearTimeout(timeTimer);
        timeTimer = setTimeout(() => { timeDelta = null; }, 1600);
      }
      if (state.timeSeconds < 180) {
        gsap.fromTo(timeEl, { scale: 1 }, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1 });
      }
      prevTime = state.timeSeconds;
    }
  });
</script>

<div class="hud">
  <div class="game-title">the convenience store: a game</div>
  <div class="hud-left">
    <Tooltip label="Your mother's money." placement="bottom">
      <div class="pill" class:warn={state.coins < 50}
           use:wavyBorder={{ radius: 26, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.2, waviness: 3.2, baseFrequency: 0.022 }}>
        <span class="content">
          <img src="/assets/ui/wallet.png" alt="" class="icon" />
          <span class="value" bind:this={coinsEl}>₹ {state.coins}</span>
          {#if coinDelta}
            {#key coinDelta.key}
              <span class="delta" class:up={coinDelta.up}>{coinDelta.text}</span>
            {/key}
          {/if}
        </span>
      </div>
    </Tooltip>

    <Tooltip label="Her medication window." placement="bottom">
      <div class="pill wide" class:warn={state.timeSeconds < 180}
           use:wavyBorder={{ radius: 26, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.2, waviness: 3.2, baseFrequency: 0.022 }}>
        <span class="content">
          <img src="/assets/ui/hourglass.svg" alt="" class="icon" />
          <span class="value" bind:this={timeEl}>{formatTime(state.timeSeconds)} m</span>
          {#if timeDelta}
            {#key timeDelta.key}
              <span class="delta" class:up={timeDelta.up}>{timeDelta.text}</span>
            {/key}
          {/if}
        </span>
      </div>
    </Tooltip>
  </div>

  <div class="hud-right">
    <StandingFigure standing={state.standing} />
  </div>
</div>

<style>
  .hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    padding: 1.9rem 1.7rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 100;
  }
  .game-title {
    position: absolute;
    top: 0.85rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 0.82rem;
    letter-spacing: 0.07em;
    color: var(--grey-low);
    white-space: nowrap;
    pointer-events: none;
    z-index: 101;
  }
  .hud-left {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    pointer-events: auto;
  }
  .hud-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    pointer-events: auto;
  }
  .pill {
    position: relative;
    width: 168px;
    height: 57px;
    font-size: 1.28rem;
    background: transparent;
    border: none;
    cursor: default;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.22));
  }
  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  /* Wide enough for "15:00 m". */
  .pill.wide { width: 186px; }
  .icon {
    width: 27px;
    height: 27px;
    object-fit: contain;
  }
  .value {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    min-width: 62px;
    text-align: left;
  }
  .pill.warn .value {
    color: var(--accent-red);
  }
  /* "kam hua" delta — floats just right of the meter, drifts up and fades. */
  .delta {
    position: absolute;
    left: calc(100% + 0.4rem);
    top: 50%;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
    color: var(--accent-red);
    white-space: nowrap;
    pointer-events: none;
    animation: deltaFloat 1.6s ease forwards;
  }
  .delta.up { color: var(--accent-green); }
  @keyframes deltaFloat {
    0%   { opacity: 0; transform: translate(-6px, -50%) scale(0.9); }
    18%  { opacity: 1; transform: translate(0, -50%) scale(1.06); }
    32%  { opacity: 1; transform: translate(0, -50%) scale(1); }
    78%  { opacity: 1; transform: translate(0, -70%); }
    100% { opacity: 0; transform: translate(0, -95%); }
  }

  /* Portrait phones: one compact row along the top. */
  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .hud {
      bottom: auto;
      height: var(--hud-h);
      padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 0;
      align-items: flex-start;
    }
    .game-title { display: none; }
    .hud-left { flex-direction: column; gap: 6px; }
    .pill, .pill.wide { width: 140px; height: 40px; padding: 0 12px; font-size: 0.95rem; }
    .content { gap: 0.4rem; }
    .icon { width: 19px; height: 19px; }
    .value { min-width: 0; }
    /* Change badges drop below the pill instead of beside it. */
    .delta { font-size: 1rem; }
  }
</style>
