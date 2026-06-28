<script>
  // ETOT-style little person: round head with eyes, simple body, arms/legs.
  // Pose 0 = upright, 4 = folded. Hat is optional (blazers, guard, etc.).
  // Idle breathing animation via CSS.

  let {
    pose = 0,
    hat = null,            // 'blazer' | 'cap' | 'beret' | null
    hatColor = '#2a2a2a',
    skin = '#FFFFFF',
    size = 1,              // scale multiplier
    facing = 'right',      // 'left' | 'right' | 'front'
    eyesClosed = false,
    mouth = 'neutral',     // 'neutral' | 'smile' | 'frown' | 'open'
    idle = true,
  } = $props();

  // Pose presets — head tilt, shoulder Y, spine curve, arm drop, leg bend
  const POSES = [
    { headY: 22, shoulderY: 48, spine: 0,  armY: 70, legAngle: 0 },
    { headY: 26, shoulderY: 50, spine: 2,  armY: 73, legAngle: 1 },
    { headY: 32, shoulderY: 54, spine: 5,  armY: 78, legAngle: 2 },
    { headY: 40, shoulderY: 60, spine: 9,  armY: 84, legAngle: 4 },
    { headY: 50, shoulderY: 68, spine: 14, armY: 92, legAngle: 6 },
  ];

  const p = $derived(POSES[Math.max(0, Math.min(4, pose))]);
  const flip = $derived(facing === 'left' ? -1 : 1);
</script>

<div class="person" class:idle style="--scale: {size}; --flip: {flip};">
  <svg viewBox="0 0 80 120" width="80" height="120">
    <!-- Head -->
    <circle cx="40" cy={p.headY} r="11" fill={skin} stroke="var(--ink)" stroke-width="2"/>
    <!-- Eyes -->
    {#if eyesClosed}
      <path d={`M${36} ${p.headY - 1} q1.5 1.5 3 0`} stroke="var(--ink)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d={`M${42} ${p.headY - 1} q1.5 1.5 3 0`} stroke="var(--ink)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    {:else}
      <circle cx="36.5" cy={p.headY - 1} r="1.2" fill="var(--ink)"/>
      <circle cx="43.5" cy={p.headY - 1} r="1.2" fill="var(--ink)"/>
    {/if}
    <!-- Mouth -->
    {#if mouth === 'smile'}
      <path d={`M${36} ${p.headY + 3.5} q4 3 8 0`} stroke="var(--ink)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    {:else if mouth === 'frown'}
      <path d={`M${36} ${p.headY + 5} q4 -3 8 0`} stroke="var(--ink)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    {:else if mouth === 'open'}
      <ellipse cx="40" cy={p.headY + 4} rx="2" ry="1.5" fill="var(--ink)"/>
    {:else}
      <line x1="37" y1={p.headY + 4} x2="43" y2={p.headY + 4} stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/>
    {/if}

    <!-- Optional hat -->
    {#if hat === 'blazer'}
      <!-- Visor/cap -->
      <path d={`M${28} ${p.headY - 8} Q40 ${p.headY - 16} ${52} ${p.headY - 8} L${50} ${p.headY - 6} L${30} ${p.headY - 6} Z`} fill={hatColor} stroke="var(--ink)" stroke-width="1.6"/>
    {:else if hat === 'cap'}
      <path d={`M${30} ${p.headY - 9} Q40 ${p.headY - 14} ${50} ${p.headY - 9} L${48} ${p.headY - 7} L${32} ${p.headY - 7} Z`} fill={hatColor} stroke="var(--ink)" stroke-width="1.6"/>
    {:else if hat === 'beret'}
      <ellipse cx="40" cy={p.headY - 10} rx="11" ry="3.5" fill={hatColor} stroke="var(--ink)" stroke-width="1.6"/>
    {/if}

    <!-- Body / spine -->
    <path
      d={`M40 ${p.headY + 11} Q${40 + p.spine} ${(p.headY + p.shoulderY + 18) / 2} 40 ${p.shoulderY + 26}`}
      fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"
    />
    <!-- Shoulders (subtle arc) -->
    <path d={`M${30 - p.spine / 2} ${p.shoulderY} Q40 ${p.shoulderY - 2} ${50 + p.spine / 2} ${p.shoulderY}`}
      fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <!-- Arms -->
    <path d={`M${30 - p.spine / 2} ${p.shoulderY} L${26 - p.spine} ${p.armY}`} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <path d={`M${50 + p.spine / 2} ${p.shoulderY} L${54 + p.spine} ${p.armY}`} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <!-- Hips -->
    <line x1="35" y1={p.shoulderY + 26} x2="45" y2={p.shoulderY + 26} stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <!-- Legs (slight outward angle = standing; bigger = staggered) -->
    <path d={`M35 ${p.shoulderY + 26} Q${35 - p.legAngle} ${p.shoulderY + 38} ${33 - p.legAngle} ${p.shoulderY + 48}`} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <path d={`M45 ${p.shoulderY + 26} Q${45 + p.legAngle} ${p.shoulderY + 38} ${47 + p.legAngle} ${p.shoulderY + 48}`} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>

<style>
  .person {
    display: inline-block;
    transform: scaleX(var(--flip)) scale(var(--scale));
    transform-origin: bottom center;
  }
  .person.idle svg {
    animation: breathe 3.4s ease-in-out infinite;
    transform-origin: center 80%;
  }
  @keyframes breathe {
    0%, 100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-1.5px) scale(1.005); }
  }
</style>
