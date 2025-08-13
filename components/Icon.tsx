import { icons, LucideProps } from 'lucide-react';
import React from 'react';

type IconProps = LucideProps & {
  name: keyof typeof icons;
};

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return null; // Or return a default icon
  }

  return <LucideIcon {...props} />;
};

export default Icon;
