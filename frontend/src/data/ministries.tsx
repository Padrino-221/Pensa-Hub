import {
  BookOpenText,
  Camera,
  Globe,
  HandsPraying,
  Heart,
  MusicNotes,
  Sparkle,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

/**
 * Icons shown for each ministry, matched by index. Icons cannot be stored in the
 * settings JSON, so components pair the saved ministry content with this list.
 */
export const MINISTRY_ICONS: ReactNode[] = [
  <Globe size={24} />,
  <HandsPraying size={24} />,
  <BookOpenText size={24} />,
  <MusicNotes size={24} />,
  <Camera size={24} />,
  <Heart size={24} />,
];

export function ministryIcon(i: number): ReactNode {
  return MINISTRY_ICONS[i % MINISTRY_ICONS.length] ?? <Sparkle size={24} />;
}
