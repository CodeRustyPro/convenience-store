<script>
  // "Meet the Designers" — a scroll-down page opened from the end screen,
  // styled like the dignity explainer: white paper, hand-drawn boxes.
  import { wavyBorder } from '../actions/wavyBorder.js';
  import { fade, fly } from 'svelte/transition';

  let { onClose } = $props();

  const DESIGNERS = [
    {
      name: 'Parisa Mehta',
      // Circular crop: zoom in and centre on the face.
      photo: { src: '/assets/designers/parisa.jpg', pos: '48% 34%', zoom: 1.8 },
      bio: 'Parisa Mehta is a design researcher and student at BITS Design School, India. She works across people, systems and services, using research and strategy to craft unique, context-driven solutions that are actionable, equitable and, most importantly, spark joy. Her work spans urban spaces, digital services, community systems and consumer experiences.',
      email: 'parisa.mehta2024@bitsdesign.edu.in',
      linkedin: 'https://www.linkedin.com/in/parisa-mehta/',
    },
    {
      name: 'Srividhya S',
      photo: { src: '/assets/designers/srividhya.jpg', pos: '44% 42%', zoom: 1.35 },
      bio: 'Srividhya S. is a designer and researcher pursuing a BDes at BITS Design School, specializing in digital products, UX research, interaction, and service design. Her practice traces everyday experiences to underlying systems to question how things function. Her work explores civic grievance systems, digital dark patterns, visual accessibility, and AI-mediated decision-making, and has been published in the ACM Digital Library.',
      email: 'srividhya.s2024@bitsdesign.edu.in',
      linkedin: 'https://www.linkedin.com/in/srividhya-s-496023311/',
    },
  ];

  // Until a photo is in public/assets/designers/, show a game figure instead.
  let missing = $state([false, false]);

  const pill = { radius: 'pill', fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2, waviness: 3, baseFrequency: 0.022 };
  const box  = { radius: 3, fill: '#FFFFFF', stroke: '#151515', strokeWidth: 2.4, waviness: 3.4, baseFrequency: 0.02 };
</script>

<div class="sheet" transition:fade={{ duration: 300 }}>
  <button class="back" onclick={onClose} use:wavyBorder={pill}>
    <span class="label">← back</span>
  </button>

  <article in:fly={{ y: 24, duration: 500, delay: 150 }}>
    <header>
      <p class="kicker">the convenience store</p>
      <h1>Meet the Designers!</h1>
    </header>

    <div class="people">
      {#each DESIGNERS as d, i}
        <section class="person" use:wavyBorder={box}>
          <div class="inner">
            <div class="photo" use:wavyBorder={{ ...pill, strokeWidth: 2.4 }}>
              <div class="clip">
                {#if missing[i]}
                  <img class="placeholder" src="/assets/ui/dignity-100.png" alt="" />
                {:else}
                  <img
                    src={d.photo.src}
                    alt="Portrait of {d.name}"
                    style="object-position:{d.photo.pos}; transform-origin:{d.photo.pos}; transform:scale({d.photo.zoom})"
                    onerror={() => (missing[i] = true)}
                  />
                {/if}
              </div>
            </div>
            <h2>{d.name}</h2>
            <p class="bio">{d.bio}</p>
            <ul class="contact">
              <li>
                <span class="kind">email</span>
                <a href="mailto:{d.email}">{d.email}</a>
              </li>
              <li>
                <span class="kind">linkedin</span>
                <a href={d.linkedin} target="_blank" rel="noopener noreferrer">{d.linkedin.replace('https://www.', '')}</a>
              </li>
            </ul>
          </div>
        </section>
      {/each}
    </div>

    <footer>
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
    max-width: 960px;
    margin: 0 auto;
    padding: 1rem 2rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 2.6rem;
  }

  header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; padding-top: 1.5rem; }
  .kicker { margin: 0 auto; font-size: 0.85rem; letter-spacing: 0.2em; color: var(--grey-mid); text-transform: uppercase; }
  h1 { margin: 0; font-weight: 400; font-size: 3rem; line-height: 1.05; text-wrap: balance; }
  /* Round portrait inside a hand-drawn circle. */
  .photo { width: 150px; height: 150px; flex: none; }
  .clip {
    position: absolute;
    inset: 8px;
    z-index: 1;
    border-radius: 50%;
    overflow: hidden;
    background: #F4F4F4;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .clip img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .clip img.placeholder { width: auto; height: 78%; object-fit: contain; transform: none; }

  .people { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; align-items: stretch; }
  .person { position: relative; }
  .inner { position: relative; z-index: 2; padding: 2rem 2.2rem 2.2rem; display: flex; flex-direction: column; gap: 1rem; height: 100%; }
  h2 { margin: 0; font-weight: 400; font-size: 1.9rem; line-height: 1.1; }
  .bio { margin: 0; font-size: 1.05rem; line-height: 1.6; color: var(--ink-soft); flex: 1; }

  .contact { list-style: none; margin: 0.4rem 0 0; padding: 1rem 0 0; border-top: 1.5px dotted var(--grey-low); display: flex; flex-direction: column; gap: 0.5rem; }
  /* Label above the link, so addresses get the full width. */
  .contact li { display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem; min-width: 0; }
  .kind { font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--grey-mid); }
  .contact a {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--ink);
    font-size: 0.98rem;
    text-decoration: none;
    border-bottom: 1.5px dotted var(--grey-low);
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .contact a:hover, .contact a:focus-visible { color: var(--accent-red); border-bottom-color: var(--accent-red); outline: none; }

  footer { display: flex; justify-content: center; padding-top: 0.5rem; }
  .done { padding: 0.7rem 2rem; font-size: 1.15rem; filter: drop-shadow(-1px 4px 3px rgba(0, 0, 0, 0.16)); }
  .back, .done { transition: transform 0.15s ease; }
  .back:hover, .done:hover { transform: translateY(-2px); }

  /* Portrait phones: one column. */
  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .back { top: calc(env(safe-area-inset-top, 0px) + 0.8rem); margin-left: 1rem; }
    article { padding: 0.5rem 1.15rem calc(env(safe-area-inset-bottom, 0px) + 3rem); gap: 2rem; }
    h1 { font-size: 2.2rem; }
    .photo { width: 124px; height: 124px; }
    .people { grid-template-columns: 1fr; gap: 1.4rem; }
    .inner { padding: 1.5rem 1.5rem 1.6rem; gap: 0.8rem; }
    h2 { font-size: 1.55rem; }
    .bio { font-size: 1rem; }
    .back:hover, .done:hover { transform: none; }
  }
</style>
