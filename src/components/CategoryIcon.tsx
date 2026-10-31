import React from 'react';
import {
  Armchair,
  UtensilsCrossed,
  Bath,
  Paintbrush,
  Layers,
  Trees,
  Tent,
  Axe,
  BrickWall,
  Wrench,
  Zap,
  Hammer
} from 'lucide-react';
import { CategoryId } from '../types';

interface CategoryIconProps {
  category: CategoryId;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5' }) => {
  switch (category) {
    case 'mobili':
      return <Armchair className={className} />;
    case 'cucina':
      return <UtensilsCrossed className={className} />;
    case 'bagno':
      return <Bath className={className} />;
    case 'pareti':
      return <Paintbrush className={className} />;
    case 'pavimenti':
      return <Layers className={className} />;
    case 'giardino':
      return <Trees className={className} />;
    case 'pergole':
      return <Tent className={className} />;
    case 'falegnameria':
      return <Axe className={className} />;
    case 'muratura':
      return <BrickWall className={className} />;
    case 'idraulica':
      return <Wrench className={className} />;
    case 'elettricita':
      return <Zap className={className} />;
    default:
      return <Hammer className={className} />;
  }
};
