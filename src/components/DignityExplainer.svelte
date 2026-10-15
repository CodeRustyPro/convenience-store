<script>
  // "How was dignity calculated?" — a plain, scroll-down explanation of the
  // scoring: what dignity means here, the three kinds of tricks, one worked
  // example (the bread aisle), and how the player's own losses add up.
  // The numbers match the standing= values and dg_ flags in source.ink.js.
  import { wavyBorder } from '../actions/wavyBorder.js';
  import { fade, fly } from 'svelte/transition';

  let { score = 0, flags = {}, onClose } = $props();

  // What the player lost to each kind of trick, from the dg_<scene> flags
  // (e.g. dg_bread = "D5P3O2"). These always add up to 100 − score.
  const lost = $derived.by(() => {
    const t = { D: 0, P: 0, O: 0 };
    for (const [k, v] of Object.entries(flags)) {
      if (!k.startsWith('dg_') || typeof v !== 'string') continue;
      for (const [, m, n] of v.matchAll(/([DPO])(\d+)/g)) t[m] += Number(n);
    }
    return t;
  });

  // What being a customer with dignity means, in the research's terms.
  const PARTS = [
    ['Choosing for yourself', 'deciding for your own reasons, not under pressure'],
    ['Knowing what\'s going on', 'seeing your real options and real prices'],
    ['Being treated fairly', 'paying what everyone else pays'],
    ['Trusting what you\'re told', 'claims and promises that hold up'],
    ['Getting what you need', 'being shown what you came for, not what pays the store'],
    ['Shopping without obstacles', 'nothing put in your way on purpose'],
    ['Your time and effort', 'not spent on the store\'s terms'],
    ['Your privacy', 'your data not used against you'],
    ['Someone to answer to', 'the store owning its tricks instead of you'],
  ];

  // The bread aisle's 10 points, part by part. weight 2 = the main thing a
  // trick goes after, 1 = a side effect.
  const BREAD = [
    { pts: 2, kind: 'hides',     what: 'Knowing a ₹40 loaf even exists' },
    { pts: 2, kind: 'hides',     what: 'Choosing for yourself, instead of being steered to the sponsor\'s loaf' },
    { pts: 1, kind: 'hides',     what: 'A fair look at the shelf: the store knows what\'s down there, you don\'t' },
    { pts: 2, kind: 'pressures', what: 'Shopping without obstacles: a mascot is in your way' },
    { pts: 1, kind: 'pressures', what: 'Your time and effort: crouching and hunting for the right loaf' },
    { pts: 2, kind: 'smart',     what: 'Being shown what you need, not what pays the store' },
  ];

  const CHOICES = [
    {
      label: 'Take the artisan loaf.',
      art: [{ src: '/assets/products/sourdough.png', h: 118 }],
      keeps: [],
      text: 'Every part of the trick worked. You didn\'t look past the sourdough, so you lose all 10.',
    },
    {
      label: 'Ask staff for cheaper bread.',
      art: [{ src: '/assets/chars/bread-clerk.png', h: 150, bust: true }, { src: '/assets/products/sourdough.png', h: 74 }],
      keeps: [0],
      text: 'You knew a cheaper loaf was there, so the store couldn\'t fool you about that: you keep those 2. But you still walked out with the ₹95 loaf, so everything else worked.',
    },
    {
      label: 'Crouch for the ₹40 bread.',
      art: [{ src: '/assets/products/regular-bread.png', h: 140 }],
      keeps: [0, 1, 2, 3, 4, 5],
      text: 'None of it worked. It cost you a minute, but that comes off the clock, not your dignity.',
    },
  ].map((c) => ({ ...c, loss: BREAD.reduce((s, p, i) => s + (c.keeps.includes(i) ? 0 : p.pts), 0) }));

  const KIND_LABEL = { hides: 'hides', pressures: 'pressures', smart: 'smart choice' };

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
      <h2><span class="num">1</span> What does dignity mean here?</h2>
      <p>
        As a customer, dignity is being treated as a person who makes their own decisions,
        not as a wallet to be steered. A good shop helps you get what you came for. A shop
        built on dark patterns quietly works against you while looking helpful.
      </p>
      <p>Our research breaks a customer's dignity into these parts:</p>
      <ul class="parts-of-dignity">
        {#each PARTS as [name, hint]}
          <li><span class="pname">{name}</span><span class="phint">{hint}</span></li>
        {/each}
      </ul>
      <p>The store in this game chips away at them, one aisle at a time.</p>
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
      <p>Most aisles use more than one at once.</p>
    </section>

    <section>
      <h2><span class="num">3</span> How much each choice costs: the bread aisle</h2>
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

      <p>
        Every aisle's trick tries to take specific parts of your dignity. The main things it
        goes after are worth <b>2 points</b> each, and its side effects <b>1 point</b>. Here's
        what the bread aisle tries to take:
      </p>
      <ul class="takes">
        {#each BREAD as part}
          <li>
            <span class="pts-tag">{part.pts}</span>
            <span class="what">{part.what}</span>
            <span class="kind-tag">{KIND_LABEL[part.kind]}</span>
          </li>
        {/each}
        <li class="takes-total"><span class="pts-tag solid">10</span><span class="what">at stake in this aisle</span></li>
      </ul>

      <p>
        Your choice decides which of those the store actually gets. <b>You lose the points
        for every part of the trick that worked on you, and keep the rest.</b>
      </p>

      <div class="choices">
        {#each CHOICES as c}
          <div class="choice-block">
            <div class="vignette" aria-hidden="true">
              {#each c.art as a}
                <img src={a.src} alt="" class:bust={a.bust} style="height:{a.h}px" />
              {/each}
            </div>
            <div class="choice-main">
              <div class="choice-head">
                <div class="choice" use:wavyBorder={pill}><span class="label">{c.label}</span></div>
                <span class="delta" class:kept={c.loss === 0}>−{c.loss}</span>
              </div>
              <p class="why">{c.text}</p>
              <ul class="ticks">
                {#each BREAD as part, i}
                  <li class:kept={c.keeps.includes(i)}>
                    <span class="mark">{c.keeps.includes(i) ? 'kept' : `−${part.pts}`}</span>
                    <span>{part.what.split(':')[0].split(',')[0]}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>

      <p>
        Every aisle works the same way. Bigger tricks, like the minimum order at the gate,
        go after more parts at once, so they can take more.
      </p>
    </section>

    <section>
      <h2><span class="num">4</span> Speaking up rarely saves you</h2>
      <p>
        In real life, questioning a price at the till almost never changes it. So in this
        game, asking questions only saves the parts you protected by noticing: you kept your
        wits, but the store still got its way.
      </p>
      <p>
        Some tricks can't be escaped at all. The minimum order, the checkout fees and the
        "you" price on eggs cost you something whatever you do. Even if you resisted every
        single trick, the best you could leave with is <b>81%</b>.
      </p>
    </section>

    <section>
      <h2><span class="num">5</span> Add it all up</h2>
      <p>Here's what the store took from you, by kind of trick:</p>
      <div class="totals">
        <div class="total"><div class="lbl">it hid things</div><div class="val">−{lost.D}</div></div>
        <div class="total"><div class="lbl">it pressured you</div><div class="val">−{lost.P}</div></div>
        <div class="total"><div class="lbl">"the smart choice"</div><div class="val">−{lost.O}</div></div>
      </div>
      <p class="sum">
        <span>100</span>
        <span class="op">−</span><span class="red">{lost.D}</span>
        <span class="op">−</span><span class="red">{lost.P}</span>
        <span class="op">−</span><span class="red">{lost.O}</span>
        <span class="op">=</span><span class="red big">{score}%</span>
      </p>
      <p class="yours">dignity left</p>
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
    max-width: 860px;
    margin: 0 auto;
    padding: 1rem 2rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 3.4rem;
  }

  header { text-align: center; min-height: 70vh; display: flex; flex-direction: column; justify-content: center; gap: 1rem; }
  .kicker { margin: 0; font-size: 0.85rem; letter-spacing: 0.2em; color: var(--grey-mid); text-transform: uppercase; }
  h1 { margin: 0; font-weight: 400; font-size: 3rem; line-height: 1.05; text-wrap: balance; }
  .lede { margin: 0 auto; font-size: 1.3rem; line-height: 1.5; max-width: 40ch; }
  .scroll-hint { margin: 1.5rem 0 0; color: var(--grey-low); font-size: 1rem; animation: nudge 2s ease-in-out infinite; }
  @keyframes nudge { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
  @media (prefers-reduced-motion: reduce) { .scroll-hint { animation: none; } }

  section { display: flex; flex-direction: column; gap: 1rem; }
  h2 { margin: 0 0 0.2rem; font-weight: 400; font-size: 1.7rem; line-height: 1.2; display: flex; align-items: baseline; gap: 0.6rem; }
  .num {
    flex: none;
    width: 1.7rem; height: 1.7rem;
    display: inline-flex; align-items: center; justify-content: center;
    border: 2px solid var(--ink); border-radius: 50%;
    font-size: 1rem;
    position: relative; top: -0.15rem;
  }
  p { margin: 0; font-size: 1.12rem; line-height: 1.55; max-width: 68ch; }
  b { font-weight: 700; }

  .parts-of-dignity {
    list-style: none; margin: 0.3rem 0; padding: 0;
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem 1.6rem;
  }
  .parts-of-dignity li { display: flex; flex-direction: column; gap: 0.15rem; padding-top: 0.5rem; border-top: 1.5px dotted var(--grey-low); }
  .pname { font-size: 1.08rem; }
  .phint { font-size: 0.92rem; line-height: 1.35; color: var(--grey-mid); }

  .kinds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.4rem; margin: 0.3rem 0; }
  .kind { padding-left: 1rem; border-left: 3px solid var(--ink); }
  .kind h3 { margin: 0 0 0.3rem; font-weight: 400; font-size: 1.2rem; line-height: 1.2; }
  .kind p { font-size: 1rem; color: var(--ink-soft); }

  .scene { padding: 1.3rem 1.6rem; display: flex; gap: 1.4rem; align-items: center; margin: 0.4rem 0; }
  .scene p { position: relative; z-index: 2; max-width: none; }
  .loaves { position: relative; z-index: 2; flex: none; display: flex; align-items: flex-end; gap: 0.3rem; }
  .loaves img { height: 96px; width: auto; }
  .loaves img.small { height: 72px; }

  .pts-tag {
    flex: none; min-width: 2.2rem; text-align: center;
    color: var(--accent-red); font-variant-numeric: tabular-nums;
    border: 1.5px solid var(--accent-red); border-radius: 999px; padding: 0 0.4rem; font-size: 0.95rem;
  }
  .pts-tag.solid { background: var(--accent-red); color: #FFFFFF; }

  .takes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.55rem; }
  .takes li { display: flex; gap: 0.8rem; align-items: baseline; font-size: 1.08rem; line-height: 1.4; }
  .takes .what { flex: 1; min-width: 0; }
  .kind-tag { flex: none; font-size: 0.82rem; color: var(--grey-mid); letter-spacing: 0.06em; }
  .takes-total { padding-top: 0.55rem; border-top: 1px solid var(--grey-low); }

  .choices { display: flex; flex-direction: column; gap: 1.6rem; margin: 0.4rem 0; }
  .choice-block {
    display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 2rem; align-items: start;
    padding-top: 1.4rem; border-top: 1.5px dotted var(--grey-low);
  }
  /* What each choice looks like, drawn from the game's own art. */
  .vignette {
    display: flex; align-items: flex-end; justify-content: center; gap: 0.3rem;
    height: 160px;
  }
  .vignette img { width: auto; max-width: 100%; object-fit: contain; filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.15)); }
  /* The clerk is a full-length figure; show head and shoulders. */
  .vignette img.bust { width: 96px; object-fit: cover; object-position: top center; }
  .choice-main { display: flex; flex-direction: column; gap: 0.8rem; min-width: 0; }
  .choice-head { display: flex; align-items: center; gap: 1rem; }
  .choice { flex: 0 1 auto; min-width: 0; padding: 0.6rem 1.2rem; text-align: center; font-size: 1.05rem; filter: drop-shadow(-1px 3px 3px rgba(0, 0, 0, 0.14)); }
  .delta { flex: none; font-size: 1.9rem; color: var(--accent-red); font-variant-numeric: tabular-nums; }
  .delta.kept { color: var(--accent-green); }
  .why { font-size: 1.05rem; line-height: 1.5; color: var(--ink-soft); }
  .ticks {
    list-style: none; margin: 0.2rem 0 0; padding: 0;
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.3rem 1.6rem;
    font-size: 0.98rem; color: var(--ink-soft);
  }
  .ticks li { display: flex; gap: 0.5rem; align-items: baseline; }
  .ticks .mark { flex: none; min-width: 2.4rem; color: var(--accent-red); font-variant-numeric: tabular-nums; }
  .ticks li.kept { color: var(--grey-low); }
  .ticks li.kept .mark { color: var(--accent-green); }

  /* Same treatment as the end screen's coins left / time left. */
  .totals { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; margin: 0.8rem 0 0.4rem; }
  .total { text-align: center; }
  .total .lbl { font-size: 1rem; letter-spacing: 0.16em; text-transform: uppercase; }
  .total .val { font-weight: 700; font-size: 2.6rem; color: var(--accent-red); line-height: 1.1; font-variant-numeric: tabular-nums; }
  .sum { max-width: none; text-align: center; font-size: 1.6rem; display: flex; justify-content: center; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.6rem; }
  .sum .op { color: var(--grey-mid); }
  .sum .red { color: var(--accent-red); }
  .sum .big { font-weight: 700; font-size: 2.6rem; }
  .yours { max-width: none; text-align: center; font-size: 1rem; letter-spacing: 0.16em; text-transform: uppercase; margin-top: -0.6rem; }

  footer { display: flex; flex-direction: column; align-items: center; gap: 1.6rem; padding-top: 1.2rem; border-top: 1.5px dotted var(--grey-low); }
  .note { font-size: 0.95rem; color: var(--grey-mid); text-align: center; line-height: 1.5; }
  .done { padding: 0.7rem 2rem; font-size: 1.15rem; filter: drop-shadow(-1px 4px 3px rgba(0, 0, 0, 0.16)); }
  .back, .done { transition: transform 0.15s ease; }
  .back:hover, .done:hover { transform: translateY(-2px); }
</style>
