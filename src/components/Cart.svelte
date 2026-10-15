<script>
  // Cart reads its contents from game.flags (set via # flag: tags on
  // each buy choice). Anchored to the right column for exact horizontal
  // alignment with the choice stack above.
  import { story } from '../story/storyEngine.js';
  import { game } from '../stores/game.js';
  import { fade } from 'svelte/transition';

  const SHOP_BGS = new Set([
    'bread', 'maggi', 'rice', 'produce', 'cold-flu', 'eggs', 'crossroads', 'register',
  ]);

  let visible = $state(false);
  let flags = $state({});

  story.subscribe((f) => { visible = SHOP_BGS.has(f.bg); });
  game.subscribe((s) => { flags = s.flags || {}; });

  function flagNum(k) {
    const v = flags[k];
    if (v === true) return 1;
    if (typeof v === 'number') return v;
    return 0;
  }

  const items = $derived.by(() => {
    const list = [];
    if (flags.joinedClub) list.push({ id: 'saver-card', src: '/assets/products/saver-card.png' });

    const b = flagNum('boughtBread');
    if (b === 1) list.push({ id: 'bread', src: '/assets/products/regular-bread.png' });
    if (b === 2) list.push({ id: 'bread', src: '/assets/products/sourdough.png', scale: 0.8 });

    const m = flagNum('boughtMaggi');
    if (m === 1) list.push({ id: 'maggi', src: '/assets/products/maggi.png', scale: 0.8 });
    if (m === 2) list.push({ id: 'maggi', src: '/assets/products/maggi-6pack.png', scale: 0.8 });

    const r = flagNum('boughtRice');
    if (r === 1) list.push({ id: 'rice', src: '/assets/products/small-rice.png' });
    if (r === 2) list.push({ id: 'rice', src: '/assets/products/value-rice.png', scale: 1.4 });

    const a = flagNum('boughtApples');
    if (a === 1) list.push({ id: 'apples', src: '/assets/products/regular-apples.png' });
    if (a === 2) list.push({ id: 'apples', src: '/assets/products/premium-apples.png' });

    const v = flagNum('boughtVicks');
    if (v > 0) list.push({ id: 'vicks', src: '/assets/products/vicks.png', scale: 0.5 });
    // Care bundle drops in the moment the narration says it's "now in
    // there" (sneakedCare), and stays unless the player puts it all back.
    const sc = flagNum('sneakCompliance');
    if (flags.sneakedCare || sc >= 1) list.push({ id: 'bundle', src: '/assets/products/flu-bundle.png' });

    const e = flagNum('boughtEggs');
    if (e > 0) list.push({ id: 'eggs', src: '/assets/products/eggs.png' });

    if (flags.boughtChocolate) list.push({ id: 'chocolate', src: '/assets/products/chocolate.png' });

    return list;
  });

  // Track which item ids we've already seen so newly-added items animate in
  let seenIds = new Set();
  const taggedItems = $derived(items.map((it) => {
    const isFresh = !seenIds.has(it.id);
    return { ...it, isFresh };
  }));
  $effect(() => {
    seenIds = new Set(items.map(it => it.id));
  });

  // Items pile into the basket and OVERLAP rather than tiling: each new
  // item is spread across the cavity width and layered on top of the
  // previous ones (higher z-index), so the basket always looks full and
  // nothing is ever pushed out of frame, however many items there are.
  const ITEM_W = 48; // item box width, % of cavity
  function pos(i, n) {
    const left = n <= 1 ? (100 - ITEM_W) / 2 : ((100 - ITEM_W) / (n - 1)) * i;
    const lift = i % 2 === 0 ? 0 : 8;       // alternate height -> piled look
    const tilt = i % 2 === 0 ? -4 : 5;      // slight tilt -> organic heap
    return `left:${left}%; bottom:${lift}%; z-index:${i + 1}; --tilt:${tilt}deg`;
  }
</script>

{#if visible}
  <!-- The anchor matches the right-column's horizontal position so
       the cart sits exactly under the choice stack. -->
  <div class="cart-anchor">
    <div class="cart-wrap" in:fade={{ duration: 400 }}>
      <div class="items">
        {#each taggedItems as it, i (it.id)}
          <img
            src={it.src}
            alt=""
            class="item"
            class:fresh={it.isFresh}
            style="{pos(i, taggedItems.length)}; --scale:{it.scale ?? 1}"
          />
        {/each}
      </div>
      <img class="cart-img" src="/assets/products/cart.png" alt="" />
    </div>
  </div>
{/if}

<style>
  /* Same horizontal box as Scene.svelte's .right-column (left:54%,
     width:42%, max-width:480px) — guarantees the cart aligns under
     the choices on any viewport. */
  .cart-anchor {
    position: absolute;
    left: 54%;
    bottom: -1%;
    width: 42%;
    max-width: 480px;
    z-index: 30;
    pointer-events: none;
    display: flex;
    justify-content: center;
  }

  /* Cart can be wider than the column for "BIGGER" presence. */
  .cart-wrap {
    position: relative;
    width: 145%;
    max-width: 680px;
    aspect-ratio: 808 / 828;
    pointer-events: none;
  }

  .cart-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    z-index: 3;
    pointer-events: none;
  }

  /* Basket cavity in cart.png — the wire basket sits in the LOWER
     portion of the sprite (≈60%–84% vertically). Match the reference
     store's placement (left/right:20%, top:60%, bottom:16%) so items
     land inside the basket, and render them IN FRONT of the cart. */
  /* The basket cavity. Items are positioned absolutely inside it and
     overlap, so the count never changes the footprint. */
  .items {
    position: absolute;
    top: 56%;
    left: 16%;
    right: 16%;
    bottom: 12%;
    z-index: 4;
  }
  /* Every item shares one bottom-anchored box and is contained inside
     it, so a tall item (10kg rice) and a flat one (eggs) occupy the same
     slot. left / z-index / --tilt come from pos() inline, so each new
     item fans across the basket and stacks ON TOP of the older ones. */
  .item {
    position: absolute;
    width: 48%;
    height: 92%;
    object-fit: contain;
    object-position: bottom center;
    transform: rotate(var(--tilt, 0deg)) scale(var(--scale, 1));
    transform-origin: bottom center;
    filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.22));
  }
  .item.fresh {
    animation: drop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes drop-in {
    0%   { opacity: 0; transform: translateY(-120px) rotate(-16deg) scale(0.75); }
    60%  { opacity: 1; transform: translateY(4px) rotate(calc(var(--tilt, 0deg) + 2deg)) scale(1.05); }
    100% { opacity: 1; transform: rotate(var(--tilt, 0deg)) scale(1); }
  }

  /* Portrait phones: a small cart in the bottom-right of the scene art. */
  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .cart-anchor {
      left: auto;
      right: 1%;
      top: var(--art-top);
      bottom: auto;
      height: var(--art-h);
      width: 34%;
      max-width: none;
      align-items: flex-end;
    }
    .cart-wrap { width: 100%; max-width: none; }
  }
</style>
