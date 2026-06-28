<script>
  // Background with crossfade + slow ken-burns. Pure asset — no tints.
  let { id } = $props();

  const BG_FOR = {
    intro:       '/assets/bg/intro.png',
    storefront:  '/assets/bg/storefront.png',
    entrance:    '/assets/bg/entrance.png',
    bread:       '/assets/bg/bread.png',
    maggi:       '/assets/bg/maggi.png',
    rice:        '/assets/bg/rice.png',
    produce:     '/assets/bg/produce.png',
    'cold-flu':  '/assets/bg/cold-flu.png',
    eggs:        '/assets/bg/eggs.png',
    crossroads:  '/assets/bg/crossroads.png',
    register:    '/assets/bg/register.png',
    exit:        '/assets/bg/exit.png',
    end:         '/assets/bg/end.png',
  };

  const url = $derived(BG_FOR[id] || BG_FOR.intro);

  let layers = $state([]);
  let nextKey = 0;

  $effect(() => {
    const u = url;
    if (!layers.length) {
      layers = [{ key: nextKey++, url: u }];
      return;
    }
    if (layers[layers.length - 1].url !== u) {
      layers = [...layers, { key: nextKey++, url: u }];
      setTimeout(() => { layers = layers.slice(-1); }, 1000);
    }
  });
</script>

<div class="bg-stack">
  {#each layers as l (l.key)}
    <div class="layer" style="background-image: url('{l.url}');"></div>
  {/each}
</div>

<style>
  .bg-stack {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    background: #FFFFFF;
  }
  .layer {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #FFFFFF;
    animation:
      bg-fade 1000ms ease forwards,
      bg-ken 28s ease-in-out 1000ms infinite alternate;
    transform-origin: 55% 50%;
  }
  .layer:first-child {
    animation:
      bg-fade-quick 1ms forwards,
      bg-ken 28s ease-in-out infinite alternate;
  }
  @keyframes bg-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bg-fade-quick {
    from { opacity: 1; }
    to   { opacity: 1; }
  }
  @keyframes bg-ken {
    from { transform: scale(1) translate(0, 0); }
    to   { transform: scale(1.035) translate(-0.6%, -0.4%); }
  }
</style>
