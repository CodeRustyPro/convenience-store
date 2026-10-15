<script>
  // PNG character sprite — always anchored bottom-left.
  let { id } = $props();

  const CHAR = {
    'mom-1':           '/assets/chars/mom-1.png',
    'mom-2':           '/assets/chars/mom-2.png',
    'greeter-1':       '/assets/chars/greeter-1.png',
    'greeter-2':       '/assets/chars/greeter-2.png',
    'nagger-1':        '/assets/chars/nagger-1.png',
    'nagger-2':        '/assets/chars/nagger-2.png',
    'nagger-3':        '/assets/chars/nagger-3.png',
    'bread-clerk':     '/assets/chars/bread-clerk.png',
    'maggi-clerk':     '/assets/chars/maggi-clerk.png',
    'produce-clerk':   '/assets/chars/produce-clerk.png',
    'sneaker':         '/assets/chars/sneaker.png',
    'fellow-shopper':  '/assets/chars/fellow-shopper.png',
    'cashier-1':       '/assets/chars/cashier-1.png',
    'cashier-2':       '/assets/chars/cashier-2.png',
    'guard-1':         '/assets/chars/guard-1.png',
    'guard-2':         '/assets/chars/guard-2.png',
  };

  // Mom is a square sofa-scene asset; needs a slightly different height
  // but still anchored left so the dialog can sit right of her.
  const HEIGHT = {
    'mom-1': 78,
    'mom-2': 78,
  };

  const url = $derived(CHAR[id]);
  const h = $derived(HEIGHT[id] ?? 76);
</script>

{#if url}
  <div class="character-slot" style="--h: {h}%;">
    {#key id}
      <img src={url} alt="" class="sprite" />
    {/key}
  </div>
{/if}

<style>
  .character-slot {
    position: absolute;
    left: 2%;
    bottom: 0;
    height: var(--h);
    display: flex;
    align-items: flex-end;
    pointer-events: none;
  }
  .sprite {
    height: 100%;
    width: auto;
    object-fit: contain;
    object-position: bottom;
    user-select: none;
    -webkit-user-drag: none;
    transform-origin: 50% 95%;
    animation:
      sprite-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards,
      sprite-sway 5s ease-in-out 0.6s infinite;
  }
  @keyframes sprite-enter {
    from { opacity: 0; transform: translateX(-22px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes sprite-sway {
    0%, 100% { transform: rotate(-0.35deg) translateY(0); }
    50%      { transform: rotate(0.35deg)  translateY(-2px); }
  }

  @media (hover: none) and (pointer: coarse) and (orientation: portrait) {
    .character-slot { left: 3%; height: calc(var(--h) * 0.92); }
  }
</style>
