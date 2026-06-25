import confetti from 'canvas-confetti';

const CONFETTI_COLORS = ['#22d3ee', '#06b6d4', '#34d399', '#fbbf24', '#ffffff'];

function burst(particleRatio: number, options: confetti.Options) {
  confetti({
    origin: { y: 0.62 },
    colors: CONFETTI_COLORS,
    zIndex: 9999,
    ...options,
    particleCount: Math.floor(160 * particleRatio),
  });
}

export function fireSuccessConfetti(): void {
  if (typeof window === 'undefined') {
    return;
  }

  burst(0.28, { spread: 28, startVelocity: 52 });
  burst(0.22, { spread: 58 });
  burst(0.35, { spread: 92, decay: 0.92, scalar: 0.85 });
  burst(0.15, { spread: 110, startVelocity: 38, scalar: 1.1 });
}
