<script>
  // Top-center scene title chyron. Appears when text changes,
  // holds briefly, then fades out to avoid cluttering the screen.
  let { text, sceneId = 0 } = $props();

  let visible = $state(false);
  let current = $state('');
  let hideTimer = null;

  $effect(() => {
    // Only show when text is present AND scene changed
    if (text && text.length) {
      current = text;
      visible = true;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { visible = false; }, 2600);
    } else {
      visible = false;
    }
    // Tie to sceneId so re-entering with same title still re-triggers
    void sceneId;
  });
</script>

{#if visible}
  <div class="title" role="status">
    {current}
  </div>
{/if}

<style>
  .title {
    position: absolute;
    top: 5.6rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Love Ya Like A Sister', cursive;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: 0.16em;
    color: var(--ink);
    background: rgba(250, 246, 236, 0.86);
    padding: 0.45rem 1.2rem;
    border-radius: 999px;
    pointer-events: none;
    z-index: 90;
    text-transform: uppercase;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    animation:
      title-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
      title-out 0.5s ease 2.1s forwards;
  }
  @keyframes title-in {
    from { opacity: 0; transform: translate(-50%, -16px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes title-out {
    from { opacity: 1; transform: translate(-50%, 0); }
    to   { opacity: 0; transform: translate(-50%, -10px); }
  }
</style>
