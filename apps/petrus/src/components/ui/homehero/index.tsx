'use client'
import { ReactNode } from 'react';
// Tipos
type HeroProps = {
  children?: ReactNode
}

/* eslint-disable react/display-name */
const Hero: React.FC<HeroProps> = ({children}) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {children}
      </div>
    </div>
  );
};
Hero.displayName = "HomeHeroUI"
export { Hero };