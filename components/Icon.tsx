
import { LucideProps } from 'lucide-react';
import React from 'react';
import { icons, IconName } from './icons';

type IconProps = LucideProps & {
  /** The name of the icon to render. Must be a valid key from the local icons object. */
  name: IconName;
};

/**
 * A dynamic icon component that renders a specific icon from the local icons.tsx file
 * based on the provided `name` prop. This improves tree-shaking and provides a single
 * source of truth for all icons used in the application.
 * @param {IconProps} props The props for the Icon component.
 * @returns {JSX.Element | null} The rendered Lucide icon component, or null if the name is invalid.
 */
const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // In a real-world scenario, you might want to log this error or show a default "question mark" icon.
    console.warn(`Icon with name "${name}" not found in local icon set.`);
    return null;
  }

  return <LucideIcon {...props} />;
};

export default Icon;
