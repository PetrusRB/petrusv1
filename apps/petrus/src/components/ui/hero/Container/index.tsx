import { ReactNode } from 'react';
// Tipos
type HeroProps = {
  children?: ReactNode;
};

/* eslint-disable react/display-name */
const HeroContainer: React.FC<HeroProps> = ({ children }) => {
  return (
    <section className="flex flex-col items-center justify-center w-full">
      {children}
    </section>
  );
};
HeroContainer.displayName = 'HeroContainer';
export { HeroContainer };
