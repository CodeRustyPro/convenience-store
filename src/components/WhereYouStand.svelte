<script>
  // "Where you stand": the player's dignity against everyone who has
  // finished the game, from the playtest sheet. A boxed, line-art histogram
  // in 10-point bands with the player's band filled red, plus one headline.
  // Hidden entirely if the sheet can't be reached or too few have played.
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { fetchDignityStats } from '../analytics/analytics.js';
  import { wavyBorder } from '../actions/wavyBorder.js';

  let { score = 0 } = $props();

  const BANDS = [0, 10, 20, 30, 40, 50, 60, 70, 80];   // best possible run is 81
  const MIN_OTHERS = 3;
  const bandOf = (d) => Math.min(BANDS.length - 1, Math.floor(d / 10));
  const bandLabel = (i) => (i === BANDS.length - 1 ? '80+' : `${BANDS[i]}–${BANDS[i] + 9}`);

  let stats = $state(null);   // { total, counts } of other players

  // ?standdemo=1 shows sample data, to preview the design before the sheet
  // has enough runs.
  function demoStats() {
    const counts = {};
    const shape = [3, 8, 14, 21, 18, 11, 7, 4, 2];
    shape.forEach((n, i) => { counts[BANDS[i] + 5] = n; });
    return { total: shape.reduce((a, b) => a + b, 0), counts };
  }

  onMount(async () => {
    let demo = false;
    try { demo = new URLSearchParams(location.search).get('standdemo') === '1'; } catch {}
    stats = demo ? demoStats() : await fetchDignityStats();
  });

  // The sheet may or may not already hold this run, so the comparison is
  // against everyone else: below + half of ties, as a percentage.
  const view = $derived.by(() => {
    if (!stats || stats.total < MIN_OTHERS) return null;
    const bands = BANDS.map(() => 0);
    let below = 0, same = 0;
    for (const [k, n] of Object.entries(stats.counts)) {
      const d = Number(k), c = Number(n) || 0;
      bands[bandOf(d)] += c;
      if (d < score) below += c;
      else if (d === score) same += c;
    }
    const yours = bandOf(score);
    bands[yours] += 1;   // include this player in the picture
    const max = Math.max(...bands);
    const pct = Math.round(((below + same / 2) / stats.total) * 100);
    return { bands, yours, max, pct };
  });
</script>

{#if view}
  <section class="stand" in:fade={{ duration: 600 }} aria-label="Where you stand"
           use:wavyBorder={{ radius: 3, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.4, baseFrequency: 0.02 }}>
    <div class="inner">
    <div class="lbl">where you stand</div>
    <p class="headline">
      You kept more dignity than <b>{view.pct}%</b> of shoppers.
    </p>

    <div class="chart" role="img"
         aria-label="Dignity of everyone who has played, in bands of ten. You are in the {bandLabel(view.yours)} band.">
      {#each view.bands as n, i}
        <div class="col">
          {#if i === view.yours}<span class="you">you</span>{/if}
          <div class="bar" class:mine={i === view.yours} style="height:{Math.max(4, (n / view.max) * 100)}%"></div>
        </div>
      {/each}
    </div>
    <div class="axis" aria-hidden="true">
      {#each BANDS as b, i}<span>{i === BANDS.length - 1 ? '80+' : b}</span>{/each}
    </div>
    <div class="axis-title">dignity left, %</div>
    </div>
  </section>
{/if}

<style>
  .stand {
    width: min(500px, 100%);
    position: relative;
  }
  .inner {
    position: relative;
    z-index: 2;
    padding: 1.2rem 1.8rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Love Ya Like A Sister', cursive;
    color: var(--ink);
  }
  /* Same treatment as the dignity left / coins left labels. */
  .lbl { font-size: 1rem; letter-spacing: 0.16em; text-transform: uppercase; }
  .headline { margin: 0; font-size: 1.05rem; line-height: 1.4; text-align: center; }
  .headline b { color: var(--accent-red); font-weight: 700; }

  .chart {
    width: 100%;
    height: 118px;
    padding-top: 22px;   /* headroom for the "you" label over a full bar */
    box-sizing: border-box;
    margin-top: 0.2rem;
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    gap: 2px;
    align-items: end;
    border-bottom: 1.5px solid var(--ink);
  }
  .col { position: relative; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
  .bar {
    width: 72%;
    border: 1.5px solid var(--ink);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    background: #FFFFFF;
    box-sizing: border-box;
  }
  .bar.mine { background: var(--accent-red); border-color: var(--accent-red); }
  .you {
    position: absolute;
    bottom: calc(100% + 2px);
    font-size: 0.85rem;
    color: var(--ink);
    white-space: nowrap;
  }
  .col:has(.mine) .you { bottom: auto; top: -1.3rem; }
  .axis {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    font-size: 0.75rem;
    color: var(--grey-mid);
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .axis-title { font-size: 0.75rem; color: var(--grey-mid); margin-top: -0.2rem; min-height: 1.1em; }

  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .inner { padding: 1rem 1.2rem 0.9rem; }
    .lbl { font-size: 0.72rem; letter-spacing: 0.1em; }
    .headline { font-size: 0.95rem; }
    .chart { height: 100px; }
  }
</style>
