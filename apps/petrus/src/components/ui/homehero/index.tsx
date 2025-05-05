'use client'
import Image from 'next/image';
import { useCallback, memo } from 'react';

import { Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Tipos
enum ClickType {
  REDIRECT,
  OTHER
}

type ButtonProps = {
  label: string;
  href?: string;
  clickType: ClickType,
  icon?: React.ReactNode;
  highlight?: boolean;
  mobile?: boolean;
  onPress?: () => void;
  currentPath: string;
};

// Estilos estáticos
const BUTTON_CLASSES = {
  base: "transition-colors rounded-xl bg-[#fdc719] flex flex-row items-center justify-center",
  mobile: "py-3 px-4 w-full",
  desktop: "py-2 px-4",
  active: "bg-zinc-700/50",
  inactive: "hover:bg-zinc-800/50 active:bg-[#fdc719]/30",
  highlightMobile: "bg-indigo-600 active:bg-indigo-700",
  highlightDesktop: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
};

// Base butão.
const Button = memo(({ icon, href, clickType, label, highlight, mobile = false, onPress, currentPath }: ButtonProps) => {
  const router = useRouter();
  const isActive = currentPath === href;

  const handlePress = useCallback(() => {
    if (clickType === ClickType.REDIRECT && href) {
      router.push(href);
    }
    onPress?.();
  }, [router, href, onPress, clickType]);

  return (
    <button
      onClick={handlePress}
      aria-label={label}
      className={`
        ${BUTTON_CLASSES.base}
        ${mobile ? BUTTON_CLASSES.mobile : BUTTON_CLASSES.desktop}
        ${isActive ? BUTTON_CLASSES.active : BUTTON_CLASSES.inactive}
        ${highlight ? (mobile ? BUTTON_CLASSES.highlightMobile : BUTTON_CLASSES.highlightDesktop) : ""}
      `}
    >
      {icon && <div className="mr-2">{icon}</div>}
      <span className={`${isActive ? "font-medium" : "font-normal"} text-white ${mobile ? "text-base" : ""}`}>
        {label}
      </span>
    </button>
  );
});

// Main hero component with bot info and features section
const HomeHero = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-5">
      {/* Floating bot image */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
        className="mb-5"
      >
        <div 
          className="rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
          style={{ 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="relative w-[120px] h-[120px] rounded-full border-2 border-[#FFC817] overflow-hidden">
            <Image
              src="/round-petrus.png"
              alt="Bot image"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL="/round-petrus-50.png"
            />
          </div>
        </div>
      </motion.div>

      {/* Bot title */}
      <h1 className="text-4xl font-extrabold text-[#1F2937] mb-4 text-center transition-colors duration-300 hover:text-[#FFC817]">
        Petrus
      </h1>

      {/* Bot description */}
      <p className="text-lg text-[#4B5563] text-center leading-7 px-5 mb-6 max-w-2xl">
        Seu bot completo para moderação 🛡️, música 🎧 e diversão 😂 no Discord! Organize, anime e proteja seu servidor com comandos rápidos e fáceis. 🚀
      </p>

      {/* Buttons Container */}
      <div className="flex flex-row justify-center items-center gap-3 my-5">
        <Button 
          label='Adicionar' 
          icon={<Plus className="text-white" size={20} />} 
          currentPath='/' 
          clickType={ClickType.REDIRECT} 
          href={process.env.NEXT_PUBLIC_INVITE_LINK} 
        />
        <Button 
          label='Dashboard' 
          icon={<ArrowRight className="text-white" size={20} />} 
          currentPath='/' 
          clickType={ClickType.OTHER}
        />
      </div>

      {/* Divider */}
      <div className="w-4/5 h-px bg-[#E5E7EB] my-5" />

      {/* Features section placeholder */}
      <div className="w-full">
        {/* Aqui você deve importar e usar o componente Features */}
        {/* <Features /> */}
      </div>
    </div>
  );
};
HomeHero.displayName = 'HomeHero'

export default HomeHero;