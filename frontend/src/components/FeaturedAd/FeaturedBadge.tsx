import { Star } from 'lucide-react';

export function FeaturedBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
      <span>Istaknuto</span>
    </div>
  );
}
