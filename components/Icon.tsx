
import { icons, LucideProps } from 'lucide-react';
import React from 'react';

type IconProps = LucideProps & {
  /** The name of the icon to render. Must be a valid key from the `lucide-react` library. */
  name: keyof typeof icons;
};

/**
 * A dynamic icon component that renders an icon from the `lucide-react` library
 * based on the provided `name` prop. This avoids having to import each icon individually.
 * @param {IconProps} props The props for the Icon component.
 * @returns {JSX.Element | null} The rendered Lucide icon component, or null if the name is invalid.
 */
const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // In a real-world scenario, you might want to log this error or show a default "question mark" icon.
    console.warn(`Icon with name "${name}" not found.`);
    return null;
  }

  return <LucideIcon {...props} />;
};

export default Icon;
