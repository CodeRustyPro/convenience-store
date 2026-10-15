<script>
  // "How was dignity calculated?" — a plain, scroll-down explanation of the
  // scoring rules, walked through one example (the bread aisle). The numbers
  // match the standing= values on the choices in source.ink.js.
  import { wavyBorder } from '../actions/wavyBorder.js';
  import { fade, fly } from 'svelte/transition';

  let { score = 0, onClose } = $props();

  const AISLES = [
    ['The Savers Club', 13],
    ['Bread', 10],
    ['Maggi', 9],
    ['Rice', 8],
    ['Apples', 10],
    ['Vapour rub', 11],
    ['Eggs', 9],
    ['The Express lane', 8],
    ['The minimum order', 14],
    ['Checkout fees', 8],
  ];

  const BREAD_CHOICES = [
    { label: 'Take the artisan loaf.',      lost: 10, why: 'The trick worked completely.' },
    { label: 'Ask staff for cheaper bread.', lost: 8,  why: 'You saw through it, but still walked away with the ₹95 loaf.' },
    { label: 'Crouch for the ₹40 bread.',    lost: 0,  why: 'You kept all 10.' },
  ];

  const pill = { radius: 'pill', fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2, waviness: 3, baseFrequency: 0.022 };
  const box  = { radius: 3, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.6, waviness: 3.4, baseFrequency: 0.02 };
</script>

<div class="sheet" transition:fade={{ duration: 300 }}>
  <button class="back" onclick={onClose} use:wavyBorder={pill}>
    <span class="label">← back</span>
  </button>

  <article in:fly={{ y: 24, duration: 500, delay: 150 }}>
    <header>
      <p class="kicker">the convenience store</p>
      <h1>How was dignity calculated?</h1>
      <p class="lede">
        You walked in with <b>100%</b> dignity. Every aisle had a trick waiting for you.
        Each time a trick worked, you lost a little.
      </p>
      <p class="scroll-hint" aria-hidden="true">scroll ↓</p>
    </header>

    <section>
      <h2><span class="num">1</span> Every aisle puts some dignity at stake</h2>
      <p>
        Some tricks take more from you than others. A trick is worth more points the more
        parts of your dignity it goes after: your freedom to choose for yourself, knowing
        what's really going on, being treated fairly, your privacy, and your time and effort.
      </p>
      <p>Between them, the ten aisles hold all 100 points.</p>
      <ul class="ledger">
        {#each AISLES as [name, pts]}
          <li><span>{name}</span><span class="dots"></span><span class="pts">{pts}</span></li>
        {/each}
        <li class="total"><span>Everything at stake</span><span class="dots"></span><span class="pts">100</span></li>
      </ul>
    </section>

    <section>
      <h2><span class="num">2</span> The store has three kinds of tricks</h2>
      <div class="kinds">
        <div class="kind">
          <h3>It hides things</h3>
          <p>The trick works because you can't see it. A cheap option tucked away, items slipped into your basket, fees that only show up at the till.</p>
        </div>
        <div class="kind">
          <h3>It pressures you</h3>
          <p>The trick works by rushing or guilting you. Asking again and again, "only a few left", "your mum's unwell, isn't she?"</p>
        </div>
        <div class="kind">
          <h3>It looks like the smart choice</h3>
          <p>The trick dresses up what's good for the store as what's good for you. "Best value" stickers, member rates, a minimum order just out of reach.</p>
        </div>
      </div>
      <p>Most aisles use more than one. The more a trick leans on, the more it can take.</p>
    </section>

    <section>
      <h2><span class="num">3</span> An example: the bread aisle</h2>
      <div class="scene" use:wavyBorder={box}>
        <div class="loaves" aria-hidden="true">
          <img src="/assets/products/sourdough.png" alt="" />
          <img src="/assets/products/regular-bread.png" alt="" class="small" />
        </div>
        <p>
          The ₹95 sponsored sourdough sits at eye level. The ₹40 loaf you need is on the
          bottom shelf, half-hidden behind a cardboard mascot.
        </p>
      </div>

      <p>This aisle is worth <b>10 points</b>, because the trick does three things at once:</p>
      <ul class="parts">
        <li><span class="pts-tag">5</span><span>It <b>hides</b> the cheap loaf, so you don't see your real options.</span></li>
        <li><span class="pts-tag">3</span><span>It makes the cheap loaf awkward to reach, <b>pressuring</b> you to grab what's in front of you.</span></li>
        <li><span class="pts-tag">2</span><span>It arranges the shelf for the sponsor and calls it <b>the smart choice</b>.</span></li>
      </ul>

      <p>What you lose depends on what you did:</p>
      <ul class="choices">
        {#each BREAD_CHOICES as c}
          <li>
            <div class="choice" use:wavyBorder={pill}><span class="label">{c.label}</span></div>
            <div class="result" class:kept={c.lost === 0}>
              <span class="delta">{c.lost ? `−${c.lost}` : '−0'}</span>
              <span class="why">{c.why}</span>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section>
      <h2><span class="num">4</span> Speaking up rarely saves you</h2>
      <p>
        In real life, questioning a price at the till almost never changes it. So in this
        game, asking questions only saves you part of the points: you kept your wits, but
        the store still got its way.
      </p>
      <p>
        Some tricks can't be escaped at all. The minimum order, the checkout fees and the
        "you" price on eggs cost you something whatever you do. Even if you resisted every
        single trick, the best you could leave with is <b>81%</b>.
      </p>
    </section>

    <section>
      <h2><span class="num">5</span> Add it all up</h2>
      <p class="sum">100 <span class="minus">−</span> everything the store took <span class="eq">=</span> the dignity you left with</p>
      <p class="yours">You left with <b>{score}%</b>.</p>
    </section>

    <footer>
      <p class="note">
        The scoring comes from our research into dark patterns: interface features that steer
        your decisions by deceiving you, pressuring you, or making the store's choice look
        like the obvious one.
      </p>
      <button class="done" onclick={onClose} use:wavyBorder={pill}>
        <span class="label">back to the end</span>
      </button>
    </footer>
  </article>
</div>

<style>
  .sheet {
    position: absolute;
    inset: 0;
    z-index: 700;
    background: #FFFFFF;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    font-family: 'Love Ya Like A Sister', cursive;
    color: var(--ink);
  }

  .back {
    position: sticky;
    top: 1.2rem;
    margin-left: 1.6rem;
    z-index: 2;
    padding: 0.4rem 1.2rem;
    font-size: 1rem;
    filter: drop-shadow(-1px 3px 3px rgba(0, 0, 0, 0.16));
  }
  .label { position: relative; z-index: 2; }

  article {
    max-width: 620px;
    margin: 0 auto;
    padding: 1rem 1.5rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 3.2rem;
  }

  header { text-align: center; min-height: 70vh; display: flex; flex-direction: column; justify-content: center; gap: 1rem; }
  .kicker { margin: 0; font-size: 0.85rem; letter-spacing: 0.2em; color: var(--grey-mid); text-transform: uppercase; }
  h1 { margin: 0; font-weight: 400; font-size: 2.8rem; line-height: 1.05; text-wrap: balance; }
  .lede { margin: 0; font-size: 1.3rem; line-height: 1.5; }
  .scroll-hint { margin: 1.5rem 0 0; color: var(--grey-low); font-size: 1rem; animation: nudge 2s ease-in-out infinite; }
  @keyframes nudge { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
  @media (prefers-reduced-motion: reduce) { .scroll-hint { animation: none; } }

  section { display: flex; flex-direction: column; gap: 0.9rem; }
  h2 { margin: 0 0 0.2rem; font-weight: 400; font-size: 1.6rem; line-height: 1.2; display: flex; align-items: baseline; gap: 0.6rem; }
  .num {
    flex: none;
    width: 1.7rem; height: 1.7rem;
    display: inline-flex; align-items: center; justify-content: center;
    border: 2px solid var(--ink); border-radius: 50%;
    font-size: 1rem;
    position: relative; top: -0.15rem;
  }
  p { margin: 0; font-size: 1.1rem; line-height: 1.55; }
  b { font-weight: 700; }

  /* Aisle points, set like the receipt. */
  .ledger { list-style: none; margin: 0.4rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.15rem; }
  .ledger li { display: flex; align-items: baseline; gap: 0.5rem; font-size: 1.05rem; }
  .ledger .dots { flex: 1; border-bottom: 1.5px dotted var(--grey-low); position: relative; top: -4px; }
  .ledger .pts { font-variant-numeric: tabular-nums; min-width: 1.8em; text-align: right; }
  .ledger .total { margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px solid var(--grey-low); }
  .ledger .total .dots { border-bottom-color: transparent; }

  .kinds { display: flex; flex-direction: column; gap: 1rem; margin: 0.3rem 0; }
  .kind { padding-left: 1rem; border-left: 3px solid var(--ink); }
  .kind h3 { margin: 0 0 0.2rem; font-weight: 400; font-size: 1.2rem; }
  .kind p { font-size: 1.02rem; color: var(--ink-soft); }

  .scene { padding: 1.3rem 1.5rem; display: flex; gap: 1.2rem; align-items: center; margin: 0.4rem 0; }
  .scene p { position: relative; z-index: 2; }
  .loaves { position: relative; z-index: 2; flex: none; display: flex; align-items: flex-end; gap: 0.3rem; }
  .loaves img { height: 96px; width: auto; }
  .loaves img.small { height: 72px; }

  .parts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }
  .parts li { display: flex; gap: 0.8rem; align-items: baseline; font-size: 1.08rem; line-height: 1.45; }
  .pts-tag {
    flex: none; min-width: 2.2rem; text-align: center;
    color: var(--accent-red); font-variant-numeric: tabular-nums;
    border: 1.5px solid var(--accent-red); border-radius: 999px; padding: 0 0.4rem; font-size: 0.95rem;
  }

  .choices { list-style: none; margin: 0.2rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
  .choices li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; align-items: center; }
  .choice { padding: 0.55rem 1.2rem; text-align: center; font-size: 1rem; filter: drop-shadow(-1px 3px 3px rgba(0, 0, 0, 0.14)); }
  .result { display: flex; gap: 0.7rem; align-items: baseline; }
  .delta { flex: none; font-size: 1.5rem; color: var(--accent-red); font-variant-numeric: tabular-nums; min-width: 2.6rem; }
  .result.kept .delta { color: var(--accent-green); }
  .why { font-size: 0.98rem; line-height: 1.35; color: var(--ink-soft); }

  .sum { font-size: 1.35rem; line-height: 1.6; text-align: center; padding: 1rem 0; }
  .minus, .eq { color: var(--accent-red); margin: 0 0.3rem; }
  .yours { text-align: center; font-size: 1.3rem; }
  .yours b { color: var(--accent-red); }

  footer { display: flex; flex-direction: column; align-items: center; gap: 1.6rem; padding-top: 1rem; border-top: 1.5px dotted var(--grey-low); }
  .note { font-size: 0.95rem; color: var(--grey-mid); text-align: center; line-height: 1.5; }
  .done { padding: 0.7rem 2rem; font-size: 1.15rem; filter: drop-shadow(-1px 4px 3px rgba(0, 0, 0, 0.16)); }
  .back, .done { transition: transform 0.15s ease; }
  .back:hover, .done:hover { transform: translateY(-2px); }
</style>
