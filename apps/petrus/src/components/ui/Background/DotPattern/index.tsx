'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
}

export function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Medição do container
  useEffect(() => {
    const update = () => {
      if (!svgRef.current) return;
      const { width, height } = svgRef.current.getBoundingClientRect();
      setSize({ w: width, h: height });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Grid
  const cols = Math.ceil(size.w / width);
  const rows = Math.ceil(size.h / height);

  const gridWidth = cols * width;
  const gridHeight = rows * height;

  const offsetX = (size.w - gridWidth) / 2;
  const offsetY = (size.h - gridHeight) / 2;

  const dots = Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    return {
      x: offsetX + col * width + cx,
      y: offsetY + row * height + cy,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    };
  });

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80',
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {dots.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-glow)` : 'currentColor'}
          initial={glow ? { opacity: 0.4, scale: 1 } : undefined}
          animate={
            glow ? { opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] } : undefined
          }
          transition={
            glow
              ? {
                  duration: dot.duration,
                  delay: dot.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
