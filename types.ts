

export interface LatestChapter {
  title: string;
  url: string;
}

export interface Novel {
  id: string; // Add a unique ID for React keys
  url: string;
  title: string;
  alternative_names: string[];
  author: string;
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  publishers: string;
  genres: string[];
  tags: string[];
  description: string;
  cover_image: string | null;
  rating: number;
  rating_count: number;
  chapter_count: number;
  latest_chapter: LatestChapter;
}

export type ScoredNovel = Novel & { score: number };

export interface FilterState {
  searchTerm: string;
  genres: {
    include: string[];
    exclude: string[];
  };
  tags: {
    include: string[];
    exclude: string[];
  };
  status: string | null;
  ratingRange: [number, number];
  chapterCountRange: [number, number];
}

export interface SortOption {
  key: keyof Novel;
  direction: 'asc' | 'desc';
}

export interface RecommendationCriteria {
  genres: boolean;
  tags: boolean;
  description: boolean;
  author: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Review {
  rating: number; // Rating from 1 to 10
  text: string;
}

export interface UserSettings {
  showFavoriteButton: boolean;
  showWishlistButton: boolean;
  showNsfw: boolean;
}