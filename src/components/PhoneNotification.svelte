<script>
  // Mom's phone notification — middle-LEFT, styled like the game's other
  // dialog boxes (wavy white box, hand-drawn font) just bigger.
  import { ui, story } from '../story/storyEngine.js';
  import { wavyBorder } from '../actions/wavyBorder.js';

  let visible = $state(false);
  let text = $state('');
  let lastBuzz = 0;

  ui.subscribe((u) => {
    if (u.phoneBuzz !== lastBuzz) {
      lastBuzz = u.phoneBuzz;
      const f = story.current();
      if (f?.phone) {
        text = f.phone;
        visible = true;
        setTimeout(() => { visible = false; }, 4500);
      }
    }
  });
</script>

{#if visible}
  <div class="phone-outer" role="status">
    <div class="phone" use:wavyBorder={{
      radius: 28,
      fill: '#FFFFFF',
      stroke: '#151515',
      strokeWidth: 2.4,
      waviness: 3.6,
      baseFrequency: 0.020
    }}>
      <div class="head">
        <span>Mom</span>
      </div>
      <p class="body">{text}</p>
    </div>
  </div>
{/if}

<style>
  .phone-outer {
    position: absolute;
    top: 50%;
    left: 2.2rem;
    transform: translateY(-50%);
    width: min(32%, 380px);
    z-index: 200;
    pointer-events: none;
    filter: drop-shadow(-1.2px 4.9px 3.5px rgba(0, 0, 0, 0.25));
    animation:
      phoneIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards,
      phoneOut 0.45s ease 4.05s forwards,
      phoneNudge 0.3s ease 0.5s;
  }
  .phone {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    padding: 18px 26px;
    background: transparent;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1rem;
    color: #6a6a6a;
    margin-bottom: 0.3rem;
    position: relative;
    z-index: 2;
  }
  .body {
    margin: 0;
    font-family: 'Love Ya Like A Sister', cursive;
    font-size: 1.35rem;
    line-height: 1.32;
    color: #000000;
    word-wrap: break-word;
    overflow-wrap: break-word;
    position: relative;
    z-index: 2;
  }
  @keyframes phoneIn {
    from { opacity: 0; transform: translate(-22px, -50%) scale(0.96); }
    to   { opacity: 1; transform: translate(0, -50%) scale(1); }
  }
  @keyframes phoneOut {
    from { opacity: 1; transform: translate(0, -50%); }
    to   { opacity: 0; transform: translate(-22px, -50%); }
  }
  @keyframes phoneNudge {
    0%, 100% { transform: translate(0, -50%) rotate(0); }
    25%      { transform: translate(0, calc(-50% - 2px)) rotate(-1.5deg); }
    75%      { transform: translate(0, -50%) rotate(1.5deg); }
  }
</style>
