import clsx from 'clsx';
import Card from '../ui/Card';
import { PET_OPTIONS } from '../../lib/constants';
import type { PetType } from '../../types';

interface PetSelectorProps {
  selected: PetType;
  onSelect: (pet: PetType) => void;
}

const PetSelector = ({ selected, onSelect }: PetSelectorProps) => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">療癒夥伴</p>
          <h3 className="text-xl font-semibold text-text-dark">選擇喜歡的小動物</h3>
        </div>
        <span className="text-2xl">{PET_OPTIONS.find((pet) => pet.id === selected)?.emoji}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {PET_OPTIONS.map((pet) => (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelect(pet.id)}
            className={clsx(
              'rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              selected === pet.id
                ? 'border-secondary/60 bg-white/80 shadow-glow'
                : 'border-white/40 bg-white/40',
            )}
          >
            <p className="text-lg font-semibold text-text-dark">
              <span className="mr-2">{pet.emoji}</span>
              {pet.label}
            </p>
            <p className="text-sm text-gray-600">{pet.description}</p>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default PetSelector;
