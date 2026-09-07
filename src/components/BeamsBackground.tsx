import { useEffect, useRef } from 'react';

interface BeamsBackgroundProps {
  beamCount?: number;
  color?: string;
}

export function BeamsBackground({ beamCount = 12, color = 'rgba(255, 255, 255, 0.15)' }: BeamsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Create beams dynamically
    for (let i = 0; i < beamCount; i++) {
      const beam = document.createElement('div');
      beam.style.position = 'absolute';
      beam.style.width = '2px';
      beam.style.height = `${100 + Math.random() * 200}px`;
      beam.style.background = `linear-gradient(to bottom, transparent, ${color}, transparent)`;
      
      // Random starting positions
      beam.style.left = `${Math.random() * 100}%`;
      beam.style.top = `-${Math.random() * 100}px`;
      
      // Animation parameters
      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * 2;
      
      beam.animate([
        { transform: 'translateY(-200px) rotate(15deg)', opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { opacity: 0, offset: 0.9 },
        { transform: 'translateY(120vh) rotate(15deg)', opacity: 0 }
      ], {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: Infinity,
        easing: 'linear'
      });
      
      container.appendChild(beam);
    }
    
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [beamCount, color]);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse at top, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at top, black, transparent 80%)'
      }}
    />
  );
}
