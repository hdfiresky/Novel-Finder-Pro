import { Novel } from '../types';


let cachedNovels: Novel[] | null = null;

// Simple hash function to get a consistent seed from a string
const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const loadNovels = async (): Promise<Novel[]> => {
    if (cachedNovels) {
        return Promise.resolve(cachedNovels);
    }

    const response = await fetch('/data/novels.json');
    if (!response.ok) {
        throw new Error(`Failed to fetch novels data: ${response.statusText}`);
    }
    const rawData = await response.json();

    const GENRE_THRESHOLD = 10; // A reasonable threshold to detect bad genre data from the source

    const processedNovels: Novel[] = (rawData as any[]).map((novel, index) => {
      let finalChapterCount: number;
      const title = novel.latest_chapter?.title;

      const numbersInTitle = title?.match(/\d+/g)?.map(Number).filter(n => !isNaN(n));

      if (numbersInTitle && numbersInTitle.length > 0) {
        finalChapterCount = Math.max(...numbersInTitle);
      } else {
        finalChapterCount = novel.chapter_count ?? 0;
      }

      // Data cleaning: some novels have a huge list of genres when none are specified.
      // We'll treat this as having no genres by clearing the array if it's too long.
      const genres = novel.genres || [];
      const cleanedGenres = genres.length > GENRE_THRESHOLD ? [] : genres;

      return {
        ...novel,
        id: `${novel.title.replace(/\s/g, '-')}-${index}`,
        status: novel.status as Novel['status'],
        genres: cleanedGenres,
        cover_image: novel.cover_image || `https://picsum.photos/seed/${stringToHash(novel.title)}/400/600`,
        chapter_count: finalChapterCount,
      };
    });
    
    cachedNovels = processedNovels;
    return processedNovels;
}