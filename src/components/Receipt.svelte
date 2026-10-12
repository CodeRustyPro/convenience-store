<script>
  // Final receipt — computed from Ink variables + game store.
  // Section 1: HER LIST (items actually bought)
  // Section 2: WHAT THE STORE ADDED (fees, upsells, sneaks, membership, dynamic price)
  // Section 3: HOW THE STORE GOT TO YOU (dark-pattern mechanisms that worked)

  import { game } from '../stores/game.js';
  import { story, ui } from '../story/storyEngine.js';
  import { fade, fly } from 'svelte/transition';
  import { wavyBorder } from '../actions/wavyBorder.js';

  let { onContinue } = $props();

  // Snapshot game + story state once on mount
  const gameState = game; // store, not a value — we read with subscribe below
  let snap = $state(null);

  let g = $state({ coins: 0, standing: 0, timeSeconds: 0, standingLabel: 'DIGNITY' });
  game.subscribe((s) => { g = s; });

  // Read all Ink variables that drive the receipt
  function readSnapshot() {
    return {
      joinedClub:      !!story.getInkVariable('joinedClub'),
      boughtBread:     story.getInkVariable('boughtBread') ?? 0,
      boughtMaggi:     story.getInkVariable('boughtMaggi') ?? 0,
      boughtRice:      story.getInkVariable('boughtRice') ?? 0,
      boughtApples:    story.getInkVariable('boughtApples') ?? 0,
      boughtVicks:     story.getInkVariable('boughtVicks') ?? 0,
      boughtEggs:      story.getInkVariable('boughtEggs') ?? 0,
      boughtChocolate: !!story.getInkVariable('boughtChocolate'),
      tookExpress:     !!story.getInkVariable('tookExpress'),
      paidGateFee:     !!story.getInkVariable('paidGateFee'),
      addedFiller:     !!story.getInkVariable('addedFiller'),
      paidDripFees:    !!story.getInkVariable('paidDripFees'),
      sneakCompliance: story.getInkVariable('sneakCompliance') ?? 0,
      nagsRefused:     story.getInkVariable('nagsRefused') ?? 0,
    };
  }

  snap = readSnapshot();

  // ---------- Section 1: HER LIST ----------
  const list = $derived([
    snap.boughtEggs  > 0 && { name: 'Eggs',   price: 90 },
    snap.boughtBread > 0 && { name: 'Bread',  price: snap.boughtBread === 2 ? 95 : 40 },
    snap.boughtMaggi > 0 && { name: 'Maggi',  price: snap.boughtMaggi === 2 ? 60 : 14 },
    snap.boughtRice  > 0 && { name: 'Rice',   price: snap.boughtRice  === 2 ? 180 : 45 },
    snap.boughtVicks > 0 && { name: 'Vicks',  price: 85 },
    snap.boughtApples> 0 && { name: 'Apples', price: snap.boughtApples=== 2 ? 140 : 70 },
  ].filter(Boolean));

  // ---------- Section 2: WHAT THE STORE ADDED ----------
  const extras = $derived([
    snap.joinedClub      && { name: 'A membership you didn\'t want',                price: 49 },
    snap.boughtBread === 2 && { name: 'Bread at the eye-level price',               price: 55 },
    snap.boughtMaggi === 2 && { name: '5 extra Maggi packs you didn\'t need',       price: 46 },
    snap.boughtRice  === 2 && { name: '9 kg of rice, because "best value"',         price: 135 },
    snap.boughtApples=== 2 && { name: 'Apples upgraded to "wellness picks"',        price: 70 },
    snap.sneakCompliance === 1 && { name: 'A protection bundle you didn\'t choose', price: 90 },
    snap.tookExpress     && { name: 'Paying to skip the queue',                     price: 80 },
    snap.boughtChocolate && { name: 'A chocolate, to clear the minimum-order bar',  price: 50 },
    snap.paidGateFee     && { name: 'A "convenience" fee at the gate',              price: 35 },
    snap.paidDripFees    && { name: 'Fees that appeared at the last second',        price: 45 },
    snap.boughtEggs  > 0 && { name: 'The "you" price on a tray of eggs',            price: 30 },
  ].filter(Boolean));

  // ---------- Section 3: HOW THE STORE GOT TO YOU ----------
  // Each losing choice sets a dg_<scene> flag listing the mechanisms it lost
  // dignity to (D/P/O). A scene counts once per mechanism. "Tries" is how
  // many scenes use that mechanism at all (see the scoring note in
  // source.ink.js).
  const MECHANISMS = [
    { key: 'D', label: "Times you didn't see the trick",               tries: 9 },
    { key: 'P', label: 'Times you gave in to pressure',                 tries: 8 },
    { key: 'O', label: 'Times "the smart choice" won you over',         tries: 9 },
  ];
  const hits = $derived(Object.entries(g.flags || {})
    .filter(([k, v]) => k.startsWith('dg_') && typeof v === 'string')
    .map(([, v]) => v));
  const compromised = $derived(MECHANISMS.map((m) => ({
    ...m,
    count: hits.filter((v) => v.includes(m.key)).length,
  })));

  const subtotal = $derived(list.reduce((s, x) => s + x.price, 0));
  const extrasTotal = $derived(extras.reduce((s, x) => s + x.price, 0));
</script>

<div class="overlay" in:fade={{ duration: 400 }}>
  <div class="receipt" in:fly={{ y: 30, duration: 600, delay: 200 }}>
    <div class="header">
      <div class="brand">THE CONVENIENCE STORE</div>
      <div class="sub">your receipt</div>
    </div>

    <div class="rule">— · — · — · — · — · — · — · — · —</div>

    <section>
      <h3>HER LIST</h3>
      <ul class="rows">
        {#each list as item}
          <li>
            <span class="name">{item.name}</span>
            <span class="dots"></span>
            <span class="price">₹{item.price}</span>
          </li>
        {:else}
          <li class="empty">(nothing on the list survived)</li>
        {/each}
      </ul>
      <div class="line-total">
        <span>subtotal</span><span>₹{subtotal}</span>
      </div>
    </section>

    <div class="rule">— · — · — · — · — · — · — · — · —</div>

    <section>
      <h3>WHAT THE STORE ADDED</h3>
      <ul class="rows">
        {#each extras as item}
          <li>
            <span class="name">
              {item.name}
            </span>
            <span class="dots"></span>
            <span class="price">+ ₹{item.price}</span>
          </li>
        {:else}
          <li class="empty">(remarkable — they added nothing)</li>
        {/each}
      </ul>
      <div class="line-total">
        <span>added</span><span>+ ₹{extrasTotal}</span>
      </div>
    </section>

    <div class="rule">— · — · — · — · — · — · — · — · —</div>

    <section>
      <h3>HOW THE STORE GOT TO YOU</h3>
      <ul class="rows">
        {#each compromised as m}
          <li><span class="name">{m.label}</span><span class="dots"></span><span class="price">{m.count} of {m.tries}</span></li>
        {/each}
      </ul>
      <div class="line-total big">
        <span>Dignity remaining</span><span>{g.standing}%</span>
      </div>
    </section>

    <div class="rule">— · — · — · — · — · — · — · — · —</div>

    <p class="closing">
      You have the groceries.<br/>
      The receipt has the rest.
    </p>

    <button class="cont"
            use:wavyBorder={{ radius: 24, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.6, baseFrequency: 0.020 }}
            onclick={onContinue}>
      <span class="cont-label">step outside →</span>
    </button>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(20, 20, 20, 0.55);
    backdrop-filter: blur(4px);
    /* Column flex + margin:auto on the child centres the receipt when it
       fits and scrolls cleanly from the top when it's taller than the
       viewport (align-items:center would clip the top instead). */
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 500;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 2rem 1rem;
  }
  .receipt {
    width: min(560px, 92%);
    margin: auto;
    flex: 0 0 auto;
    background: #FFFFFF;
    color: var(--ink);
    padding: 2rem 2.2rem 1.6rem;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
    font-family: 'Love Ya Like A Sister', cursive;
    border-radius: 4px;
    /* paper-edge wave */
    mask-image: linear-gradient(to bottom, black calc(100% - 14px), transparent 100%);
  }
  .header { text-align: center; margin-bottom: 0.4rem; }
  .brand {
    font-family: 'Love Ya Like A Sister', cursive;
    font-weight: 700;
    font-size: 1.3rem;
    letter-spacing: 0.1em;
  }
  .sub {
    font-size: 0.95rem;
    color: var(--grey-mid);
    letter-spacing: 0.18em;
    text-transform: lowercase;
    margin-top: 2px;
  }
  .rule {
    text-align: center;
    color: var(--grey-low);
    margin: 0.5rem 0;
    letter-spacing: 0;
    font-size: 0.7rem;
  }
  h3 {
    margin: 0.6rem 0 0.4rem;
    font-size: 0.85rem;
    letter-spacing: 0.18em;
    color: var(--grey-mid);
    text-transform: uppercase;
  }
  .rows { list-style: none; padding: 0; margin: 0; }
  .rows li {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    padding: 0.18rem 0;
    font-size: 1.05rem;
  }
  .rows li.empty { color: var(--grey-low); font-style: italic; }
  /* Long names wrap instead of running past the paper edge. */
  .rows .name { flex: 0 1 auto; min-width: 0; }
  .rows .dots {
    flex-grow: 1;
    border-bottom: 1.5px dotted var(--grey-low);
    position: relative;
    top: -4px;
    min-width: 24px;
  }
  .rows .price { flex-shrink: 0; font-variant-numeric: tabular-nums; }

  .line-total {
    display: flex;
    justify-content: space-between;
    margin-top: 0.4rem;
    padding-top: 0.3rem;
    border-top: 1px solid var(--grey-low);
    font-size: 1rem;
    color: var(--grey-mid);
  }

  .line-total.big { font-size: 1.2rem; color: var(--ink); }

  .closing {
    text-align: center;
    margin: 1rem 0 1.2rem;
    font-size: 1.05rem;
    color: var(--ink);
    line-height: 1.5;
  }
  .cont {
    position: relative;
    display: block;
    margin: 0 auto;
    padding: 0.7rem 1.9rem;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1.1rem;
    color: var(--ink);
    cursor: pointer;
    background: transparent;
    border: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.18));
    transition: transform 0.15s ease, filter 0.15s ease;
  }
  .cont-label { position: relative; z-index: 2; }
  .cont:hover { transform: translateY(-2px); filter: drop-shadow(-1.2px 6px 4px rgba(0, 0, 0, 0.22)); }
  .cont:active { transform: translateY(0); }
</style>
