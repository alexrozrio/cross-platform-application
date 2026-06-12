import React from 'react';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon } from '@/components/theme-icons';
import { IMAGE_THEMES } from '@/lib/themes';
import { Check } from 'lucide-react';
import { type ThemeId } from '@/lib/themes';

export default function Themes() {
  const { themeId, setThemeId } = useImageTheme();

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Image Themes</h1>
        <p className="text-muted-foreground mt-1">
          Choose the character set used when playing in image mode. Your selection applies to all games.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {IMAGE_THEMES.map(theme => {
          const isSelected = themeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setThemeId(theme.id as ThemeId)}
              className={[
                'relative text-left rounded-2xl border-2 p-5 transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/6 shadow-md ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm',
              ].join(' ')}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h2 className={['text-lg font-bold', isSelected ? 'text-primary' : ''].join(' ')}>
                    {theme.name}
                  </h2>
                </div>

                {/* Full 9-icon row */}
                <div className="grid grid-cols-9 gap-0.5">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                    <ThemeIcon key={n} themeId={theme.id} value={n} size={30} />
                  ))}
                </div>

                {/* Character names */}
                <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                  {getCharacterNames(theme.id).map((name, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <ThemeIcon themeId={theme.id} value={i + 1} size={16} />
                      <span className="text-[10px] text-muted-foreground truncate">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground pb-4">
        Your theme is saved automatically and applies to all image mode games.
      </p>
    </div>
  );
}

function getCharacterNames(themeId: ThemeId): string[] {
  const names: Record<ThemeId, string[]> = {
    superhero:  ['Spider-Man', 'Superman', 'Batman', 'Wonder Woman', 'Iron Man', 'Cap America', 'Thor', 'Hulk', 'The Flash'],
    adventure:  ['Explorer', 'Fox', 'Map', 'Backpack', 'Flower', 'Telescope', 'Key', 'Rainbow', 'Trophy'],
    ocean:      ['Dolphin', 'Octopus', 'Shark', 'Clownfish', 'Crab', 'Pufferfish', 'Squid', 'Turtle', 'Lobster'],
    jungle:     ['Monkey', 'Lion', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Leopard', 'Gorilla', 'Parrot'],
    space:      ['Rocket', 'Star', 'Moon', 'Comet', 'Saturn', 'Earth', 'Alien', 'UFO', 'Astronaut'],
    shapes:     ['Circle', 'Square', 'Triangle', 'Diamond', 'Star', 'Hexagon', 'Heart', 'Cross', 'Ring'],
  };
  return names[themeId] ?? [];
}
