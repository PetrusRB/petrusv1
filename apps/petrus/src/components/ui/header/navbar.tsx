"use client";

import React, { useCallback, useEffect, useRef, useState, memo, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu as Bars3Icon, X as XMarkIcon } from "lucide-react";
import { BotIcon, WhatIcon, DiscordIcon } from "../icons";

// Interfaces para tipar os componentes
interface NavItemProps {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

interface NavLinkProps {
  item: NavItemProps;
  mobile?: boolean;
  onPress?: () => void;
  isTransparent?: boolean;
  currentPath: string;
  children?: ReactNode;
}

// Items de navegação definidos como constante fora do componente
const NAV_ITEMS: ReadonlyArray<NavItemProps> = [
  { label: "Invite", href: "/invite", icon: <BotIcon /> },
  { label: "About", href: "/about", icon: <WhatIcon /> },
  { label: "Login", href: "/login", highlight: true, icon: <DiscordIcon /> },
] as const;

/**
 * Função debounce tipada e otimizada
 * @template T
 * @param func - Função a ser executada após o debounce
 * @param delay - Tempo de espera em milissegundos
 * @param immediate - Se verdadeiro, executa a função imediatamente no primeiro evento
 * @returns Função com debounce aplicado
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    const later = () => {
      timeoutId = undefined;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(later, delay);

    if (callNow) func.apply(context, args);
  };
}

// Componente NavLink com memoização para evitar re-renders desnecessários
const NavLink: React.FC<NavLinkProps> = memo(({ item, mobile = false, onPress, children, isTransparent, currentPath }) => {
  const isActive = currentPath === item.href;

  // Classes geradas apenas uma vez usando useMemo
  const linkClasses = useMemo(() => {
    return `
      transition-colors rounded-xl flex flex-row items-center justify-center
      ${mobile ? "py-3 px-4 w-full" : "py-2 px-4"}
      ${isActive && !isTransparent ? "bg-zinc-700/50" : `${isTransparent ? "" : "hover:bg-zinc-800/50 active:bg-zinc-700/30"}`}
      ${item.highlight
        ? (mobile
          ? "bg-indigo-600 active:bg-indigo-700"
          : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800")
        : ""}
    `;
  }, [isActive, item.highlight, mobile]);

  const textClasses = useMemo(() => {
    return `${isActive ? "font-medium" : "font-normal"} ${mobile ? "text-base" : ""}`;
  }, [isActive, mobile]);

  return (
    <Link
      href={item.href || "/"}
      onClick={onPress}
      className={linkClasses}
      prefetch={false}
    >
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span className={textClasses}>
        {item.label}
        {children}
      </span>
    </Link>
  );
});

NavLink.displayName = 'NavLink';

// Componente principal da Navbar com otimizações
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const currentPath = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Controla a animação de entrada do navbar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Pequeno atraso para garantir que o componente esteja montado
    return () => clearTimeout(timer);
  }, []);

  const containerClasses = useMemo(() => `
    fixed top-4 left-0 right-0 mx-auto
    w-11/12 max-w-6xl
    text-sm
    rounded-3xl px-5 py-2
    shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-zinc-800 border-opacity-50
    z-50 bg-zinc/90 backdrop-blur-sm
    transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
  `, [isVisible]);

  const menuClasses = useMemo(() => `
    absolute top-16 right-0 z-50 w-64 backdrop-blur-xl 
    rounded-2xl py-3 px-3 bg-zinc/90 shadow-2xl md:hidden border border-zinc-800
    transition-all border-opacity-50 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
    ${isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-[-20px] scale-95 pointer-events-none'}
  `, [isOpen]);

  // Toggle menu with debounced cleanup
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle outside clicks to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleResize = debounce(() => {
      if (isOpen && window.innerWidth >= 768) {
        setIsOpen(false);
      }
    }, 100);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscKey);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscKey);
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle link clicks to close menu
  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={containerClasses}>
      <div className="flex flex-row items-center justify-between px-5 py-2 w-full">
        <Link
          href="/"
          className="p-1 hover:scale-90 transition-all active:opacity-75"
        >
          <div className="relative w-[110px] h-[60px]">
            <Image
              src="/Petrus.png"
              alt="Logo"
              width={110}
              height={60}
              className="rounded-full"
              priority={true}
              loading="eager"
            />
          </div>
        </Link>

        <div className="hidden md:flex flex-row space-x-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              currentPath={currentPath}
            />
          ))}
        </div>

        <button
          onClick={toggleMenu}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          className="p-2 rounded-xl active:scale-95 transition-transform md:hidden bg-zinc-800/50 hover:bg-zinc-700/50"
          type="button"
        >
          {isOpen ?
            <XMarkIcon className="w-6 h-6 text-white" /> :
            <Bars3Icon className="w-6 h-6 text-white" />
          }
        </button>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={menuClasses}
          role="menu"
        >
          <div className="flex flex-col items-center w-full space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                mobile
                currentPath={currentPath}
                onPress={handleLinkClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Navbar);