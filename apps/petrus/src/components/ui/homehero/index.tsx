'use client'
import { ReactNode } from 'react';
// Tipos
type HeroProps = {
  children?: ReactNode
}

/* eslint-disable react/display-name */
const Hero: React.FC<HeroProps> = ({ children }) => {
  return (
    <section className="flex flex-col items-center justify-center w-full">
      {children}
    </section>
  );
};
Hero.displayName = "HomeHeroUI"
export { Hero };
