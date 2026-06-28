<script>
  // Simple positioned tooltip. Wraps its children and shows a label on hover.
  let { label = '', placement = 'bottom', children } = $props();
  let hovering = $state(false);
</script>

<div
  class="tt-wrap"
  onmouseenter={() => hovering = true}
  onmouseleave={() => hovering = false}
  onfocusin={() => hovering = true}
  onfocusout={() => hovering = false}
  role="presentation"
>
  {@render children?.()}
  {#if hovering && label}
    <div class="tt tt-{placement}">
      {label}
    </div>
  {/if}
</div>

<style>
  .tt-wrap {
    position: relative;
    display: inline-block;
  }
  .tt {
    position: absolute;
    background: rgba(20, 20, 20, 0.94);
    color: #FFFFFF;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 0.9rem;
    line-height: 1.35;
    padding: 0.4rem 0.7rem;
    border-radius: 8px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 999;
    animation: ttIn 0.18s ease forwards;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
  }
  .tt-bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  .tt-top {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  .tt-left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
  /* small caret */
  .tt::before {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    background: inherit;
    transform: rotate(45deg);
  }
  .tt-bottom::before { top: -4px;   left: 50%; margin-left: -4px; }
  .tt-top::before    { bottom: -4px; left: 50%; margin-left: -4px; }
  .tt-left::before   { right: -4px;  top: 50%; margin-top: -4px; }

  @keyframes ttIn {
    from { opacity: 0; transform: translateX(-50%) translateY(3px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .tt-top { animation: ttInTop 0.18s ease forwards; }
  @keyframes ttInTop {
    from { opacity: 0; transform: translateX(-50%) translateY(-3px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .tt-left { animation: ttInLeft 0.18s ease forwards; }
  @keyframes ttInLeft {
    from { opacity: 0; transform: translateY(-50%) translateX(3px); }
    to   { opacity: 1; transform: translateY(-50%) translateX(0); }
  }
</style>
