import { ComponentType } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  HelpCircle, 
  BookOpen,
  Users, 
  Target, 
  Globe, 
  Lightbulb
} from 'lucide-react'; // Replace with your icon library

import { CityBlockId } from '@/features/city/types';

export type IconComponent = ComponentType<{ className?: string }>;


// Map string identifiers to the actual React component
export const ICON_MAP: Record<string, IconComponent> = {
  shield: ShieldCheck,
  building: Building2,
  book: BookOpen,
  users: Users,
  target: Target,
  globe: Globe,
  lightbulb: Lightbulb
};

// Fallback icon when an unknown string is supplied
export const DEFAULT_ICON: IconComponent = HelpCircle;

export function resolveIcon(iconName: string): IconComponent {
  return ICON_MAP[iconName.toLowerCase().trim()] ?? DEFAULT_ICON;
}

export function cityBlockIdMapper(blockId: string): CityBlockId {
  switch (blockId) {
    case 'leftUp':
      return 'leftUp';
    case 'rightUp':
      return 'rightUp';
    case 'central':
      return 'central';
    case 'leftDown':
      return 'leftDown';
    case 'rightDown':
      return 'rightDown';
    default:
      console.warn(`Unknown blockId: ${blockId}`);
      return 'central'; // Default to central if unknown
  }
}