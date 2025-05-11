import { useRouter } from "next/navigation";
import { memo, ReactNode, useCallback } from "react";

/**
 * Tipos de clique possíveis para o botão
 */
export enum ButtonAction {
  NAVIGATE = "navigate", // Navega para uma nova rota
  SUBMIT = "submit",     // Submete um formulário
  CALLBACK = "callback"  // Executa uma função callback
}

/**
 * Variantes visuais do botão
 */
export enum ButtonVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  OUTLINE = "outline",
  GHOST = "ghost",
  LINK = "link",
  DANGER = "danger",
  SUCCESS = "success",
  WARNING = "warning",
  INFO = "info"
}

/**
 * Tamanhos disponíveis para o botão
 */
export enum ButtonSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large"
}

/**
 * Propriedades do componente Button
 */
export type ButtonProps = {
  /** Texto do botão */
  label: string;
  
  /** Ícone para exibir antes do label */
  icon?: ReactNode;
  
  /** Ícone para exibir após o label */
  rightIcon?: ReactNode;
  
  /** Determina a aparência visual do botão */
  variant?: ButtonVariant;
  
  /** Tamanho do botão */
  size?: ButtonSize;
  
  /** URL para navegação (quando action é NAVIGATE) */
  href?: string;
  
  /** Tipo de ação que o botão vai executar */
  action?: ButtonAction;
  
  /** Função de callback (quando action é CALLBACK) */
  onClick?: () => void;
  
  /** Desabilita o botão */
  disabled?: boolean;
  
  /** Mostra um estado de loading */
  loading?: boolean;
  
  /** Torna o botão de largura 100% */
  fullWidth?: boolean;
  
  /** Caminho atual para destacar botão de navegação */
  currentPath?: string;
  
  /** Classes adicionais para customização */
  className?: string;
  
  /** Tipo de botão (útil para forms) */
  type?: 'button' | 'submit' | 'reset';
  
  /** ID para testes ou referência externa */
  id?: string;
  
  /** Texto para acessibilidade */
  ariaLabel?: string;
};

/**
 * Mapeamento de variantes para classes de Tailwind
 */
const VARIANT_STYLES = {
  [ButtonVariant.PRIMARY]: {
    default: "bg-[#fdc719] text-white",
    hover: "hover:bg-indigo-700",
    active: "active:bg-indigo-800",
    disabled: "bg-indigo-300 cursor-not-allowed"
  },
  [ButtonVariant.SECONDARY]: {
    default: "bg-gray-200 text-gray-800",
    hover: "hover:bg-gray-300",
    active: "active:bg-gray-400",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed"
  },
  [ButtonVariant.OUTLINE]: {
    default: "bg-transparent border border-indigo-600 text-indigo-600",
    hover: "hover:bg-indigo-50",
    active: "active:bg-indigo-100",
    disabled: "border-indigo-300 text-indigo-300 cursor-not-allowed"
  },
  [ButtonVariant.GHOST]: {
    default: "bg-transparent",
    hover: "hover:bg-[#fdc719]",
    active: "active:bg-indigo-100", 
    disabled: "text-indigo-300 cursor-not-allowed"
  },
  [ButtonVariant.LINK]: {
    default: "bg-transparent text-indigo-600 underline p-0",
    hover: "hover:text-indigo-800",
    active: "active:text-indigo-900",
    disabled: "text-indigo-300 cursor-not-allowed"
  },
  [ButtonVariant.DANGER]: {
    default: "bg-red-600 text-white",
    hover: "hover:bg-red-700",
    active: "active:bg-red-800",
    disabled: "bg-red-300 cursor-not-allowed"
  },
  [ButtonVariant.SUCCESS]: {
    default: "bg-green-600 text-white",
    hover: "hover:bg-green-700",
    active: "active:bg-green-800",
    disabled: "bg-green-300 cursor-not-allowed"
  },
  [ButtonVariant.WARNING]: {
    default: "bg-yellow-500 text-white",
    hover: "hover:bg-yellow-600",
    active: "active:bg-yellow-700",
    disabled: "bg-yellow-300 cursor-not-allowed"
  },
  [ButtonVariant.INFO]: {
    default: "bg-blue-500 text-white",
    hover: "hover:bg-blue-600",
    active: "active:bg-blue-700",
    disabled: "bg-blue-300 cursor-not-allowed"
  }
};

/**
 * Mapeamento de tamanhos para classes de Tailwind
 */
const SIZE_STYLES = {
  [ButtonSize.SMALL]: "text-xs py-1 px-2",
  [ButtonSize.MEDIUM]: "text-sm py-2 px-4",
  [ButtonSize.LARGE]: "text-base py-3 px-6"
};

/**
 * Componente Button avançado para navegação e ações
 */
export const Button = memo(({ 
  label, 
  icon, 
  rightIcon,
  variant = ButtonVariant.PRIMARY, 
  size = ButtonSize.MEDIUM,
  href, 
  action = ButtonAction.CALLBACK, 
  onClick, 
  disabled = false,
  loading = false,
  fullWidth = false,
  currentPath,
  className = "",
  type = "button",
  id,
  ariaLabel
}: ButtonProps) => {
  const router = useRouter();
  
  // Verifica se o botão deve ser destacado (está na rota atual)
  const isActive = href && currentPath && href === currentPath;
  
  // Constrói classes de estilo baseadas nas props
  const getButtonClasses = () => {
    const variantStyle = VARIANT_STYLES[variant];
    const sizeStyle = SIZE_STYLES[size];
    
    return [
      // Classes base
      "rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium flex items-center justify-center",
      
      // Classes variantes
      disabled ? variantStyle.disabled : variantStyle.default,
      !disabled && variantStyle.hover,
      !disabled && variantStyle.active,
      
      // Classes de tamanho
      sizeStyle,
      
      // Classes condicionais
      fullWidth ? "w-full" : "",
      isActive ? "ring-2 ring-offset-1 font-semibold" : "",
      loading ? "opacity-80" : "",
      
      // Classes customizadas
      className
    ].filter(Boolean).join(" ");
  };
  
  // Lida com cliques no botão
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Previne ação se desabilitado ou carregando
    if (disabled || loading) return;
    
    // Navega para URL
    if (action === ButtonAction.NAVIGATE && href) {
      e.preventDefault();
      router.push(href);
    }
    
    // Executa callback se fornecido
    if (action === ButtonAction.CALLBACK && onClick) {
      onClick();
    }
    
    // Para ButtonAction.SUBMIT não fazemos nada, o formulário lidará com isso
  }, [action, disabled, href, loading, onClick, router]);
  
  // Constrói props do botão
  const buttonProps = {
    id,
    className: getButtonClasses(),
    onClick: handleClick,
    disabled: disabled || loading,
    type,
    'aria-label': ariaLabel || label,
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    role: "button",
    tabIndex: disabled ? -1 : 0
  };
  
  // Conteúdo interno do botão
  const buttonContent = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {icon && <span className={`${label ? 'mr-2' : ''}`}>{icon}</span>}
      {label && <span>{label}</span>}
      {rightIcon && <span className={`${label ? 'ml-2' : ''}`}>{rightIcon}</span>}
    </>
  );
  
  // Botão como link para navegação
  if (action === ButtonAction.NAVIGATE && href && !disabled) {
    return (
      <a href={href} {...buttonProps}>
        {buttonContent}
      </a>
    );
  }
  
  // Botão padrão para outros casos
  return (
    <button {...buttonProps}>
      {buttonContent}
    </button>
  );
});

Button.displayName = "Button UI";

export default Button;