import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Crown,
} from 'lucide-react';
import { Avatar } from '../../Avatar';
interface AvatarDropdownProps {
  user: {
    name: string;
    avatar?: string;
    isPremium?: boolean;
  };
  onDashboard?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function AvatarDropdown({
  user,
  onDashboard,
  onSettings,
  onLogout,
}: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', onClick: onDashboard },
    { icon: Settings, label: 'Configurações', onClick: onSettings },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl"
      >
        <div className="relative">
          <Avatar className="h-9 w-9" src={user.avatar ?? ''} />

          {user.isPremium && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute dark:bg-background-dark bg-background-light right-0 mt-2 w-72 origin-top-right z-50"
          >
            <div className="rounded-xl border border-primary/20 shadow-[var(--shadow-dropdown)] overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={user.avatar ?? ''} className="h-12 w-12" />

                    {user.isPremium && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-1">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      {user.isPremium && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wide">
                          Pro
                        </span>
                      )}
                    </div>
                    {/* <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p> */}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 mx-2" />

              {/* Logout */}
              <div className="p-2">
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    onLogout?.();
                    setIsOpen(false);
                  }}
                  className="dropdown-item-danger"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
                    <LogOut className="w-4 h-4 text-destructive" />
                  </div>
                  <span>Sair da conta</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
