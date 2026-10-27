/**
 * Reward wallpapers, generated from the official OGR leaf mark
 * (see scripts/gen-wallpapers.js). Redeemed with points in the rewards tab and
 * saved to the device photo library.
 */
export type Wallpaper = {
  id: string;
  name: string;
  tagline: string;
  cost: number;
  palette: [string, string];
  full: number;
  thumb: number;
};

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'ember-rise',
    name: 'Ember Rise',
    tagline: 'The leaf at golden hour. Free for every fan.',
    cost: 0,
    palette: ['#FFB067', '#240603'],
    full: require('../../assets/wallpapers/ember-rise.jpg'),
    thumb: require('../../assets/wallpapers/ember-rise-thumb.jpg'),
  },
  {
    id: 'ink-glow',
    name: 'Ink Glow',
    tagline: 'Black-out OLED friendly with an ember halo.',
    cost: 120,
    palette: ['#C43A05', '#0B0A09'],
    full: require('../../assets/wallpapers/ink-glow.jpg'),
    thumb: require('../../assets/wallpapers/ink-glow-thumb.jpg'),
  },
  {
    id: 'cream-poster',
    name: 'Cream Poster',
    tagline: 'Gallery-print framing of the original artwork.',
    cost: 150,
    palette: ['#FFFDF8', '#EFE1CB'],
    full: require('../../assets/wallpapers/cream-poster.jpg'),
    thumb: require('../../assets/wallpapers/cream-poster-thumb.jpg'),
  },
  {
    id: 'gold-hour',
    name: 'Gold Hour',
    tagline: 'Warm brass tones for the 6pm session.',
    cost: 200,
    palette: ['#F5B841', '#2A0803'],
    full: require('../../assets/wallpapers/gold-hour.jpg'),
    thumb: require('../../assets/wallpapers/gold-hour-thumb.jpg'),
  },
  {
    id: 'moss-static',
    name: 'Moss Static',
    tagline: 'Deep green, low glow, easy on the eyes.',
    cost: 200,
    palette: ['#4C7A57', '#070C08'],
    full: require('../../assets/wallpapers/moss-static.jpg'),
    thumb: require('../../assets/wallpapers/moss-static-thumb.jpg'),
  },
  {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Late-night studio blue with an ember floor.',
    cost: 250,
    palette: ['#223A5E', '#05070C'],
    full: require('../../assets/wallpapers/midnight.jpg'),
    thumb: require('../../assets/wallpapers/midnight-thumb.jpg'),
  },
];

export function getWallpaper(id: string): Wallpaper | undefined {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id);
}
