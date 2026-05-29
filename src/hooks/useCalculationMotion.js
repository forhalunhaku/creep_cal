import { useCallback, useRef } from 'react';
import { animate, createTimeline, stagger } from 'animejs';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function animatePacket(root) {
  const trigger = root.querySelector('.calculate-trigger');
  const target = root.querySelector('.result-panel');
  if (!trigger || !target) return;

  const start = trigger.getBoundingClientRect();
  const end = target.getBoundingClientRect();
  const packet = document.createElement('div');
  packet.className = 'calculation-packet';
  packet.style.left = `${start.left + start.width / 2}px`;
  packet.style.top = `${start.top + start.height / 2}px`;
  document.body.appendChild(packet);

  animate(packet, {
    left: `${end.left + end.width / 2}px`,
    top: `${end.top + Math.min(end.height * 0.42, 160)}px`,
    scale: [0.72, 1.12, 0.58],
    opacity: [0, 1, 0],
    duration: 760,
    ease: 'inOutCubic',
    onComplete: () => packet.remove(),
  });
}

export function useCalculationMotion() {
  const rootRef = useRef(null);

  const playCalculationMotion = useCallback(() => {
    if (!rootRef.current || prefersReducedMotion()) return;
    const root = rootRef.current;

    animatePacket(root);

    createTimeline({
      defaults: {
        ease: 'outExpo',
      },
    })
      .add(root.querySelectorAll('.parameter-motion'), {
        opacity: [0.72, 1],
        translateY: [8, 0],
        duration: 420,
        delay: stagger(28),
      }, 0)
      .add(root.querySelectorAll('.chart-stage'), {
        opacity: [0.72, 1],
        scale: [0.985, 1],
        duration: 520,
      }, 90)
      .add(root.querySelectorAll('.result-panel'), {
        scale: [0.965, 1],
        boxShadow: [
          '0 24px 70px rgba(8, 18, 12, 0.32)',
          '0 30px 90px rgba(47, 111, 78, 0.18)',
          '0 24px 70px rgba(8, 18, 12, 0.32)',
        ],
        duration: 620,
      }, 150)
      .add(root.querySelectorAll('.system-feed-line'), {
        opacity: [0, 1],
        translateX: [10, 0],
        duration: 260,
        delay: stagger(24, { from: 'last' }),
      }, 250);
  }, []);

  return { rootRef, playCalculationMotion };
}
