// 📋 Constantes centralisées pour le projet ATTRIB
// Ce fichier contient toutes les constantes partagées entre les composants

import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// CONSTANTES POUR LES BADGES
// ============================================================================

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ============================================================================
// CONSTANTES POUR LES BOUTONS
// ============================================================================

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ============================================================================
// CONSTANTES POUR LES FORMULAIRES
// ============================================================================

export const formItemVariants = cva(
  "space-y-2"
);

export const formLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export const formControlVariants = cva(
  "peer"
);

export const formMessageVariants = cva(
  "text-sm font-medium"
);

export const formDescriptionVariants = cva(
  "text-sm text-muted-foreground"
);

// ============================================================================
// CONSTANTES POUR LES TOGGLES
// ============================================================================

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ============================================================================
// CONSTANTES POUR LES SONNER (TOASTS)
// ============================================================================

export const sonnerVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ============================================================================
// CONSTANTES POUR LES SIDEBARS
// ============================================================================

export const sidebarVariants = cva(
  "group relative flex h-full w-full flex-col overflow-hidden border-r bg-background"
);

export const sidebarHeaderVariants = cva(
  "flex h-[60px] shrink-0 items-center gap-2 border-b px-6"
);

export const sidebarContentVariants = cva(
  "flex flex-1 flex-col gap-2 overflow-hidden p-6"
);

export const sidebarFooterVariants = cva(
  "flex shrink-0 items-center gap-2 border-t p-6"
);

// ============================================================================
// CONSTANTES POUR LES MENUS DE NAVIGATION
// ============================================================================

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

// ============================================================================
// TYPES EXPORTÉS
// ============================================================================

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ToggleVariantProps = VariantProps<typeof toggleVariants>;
export type SonnerVariantProps = VariantProps<typeof sonnerVariants>; 