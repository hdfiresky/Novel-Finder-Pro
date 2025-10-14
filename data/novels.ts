
import { Novel } from '../types';


let cachedNovels: Novel[] | null = null;

/**
 * A simple, non-cryptographic hash function to generate a consistent numeric seed from a string.
 * This is used to provide a stable `picsum.photos` seed for novels without a cover image,
 * ensuring the same image is displayed for the same novel on every load.
 * @param str The input string (e.g., a novel title).
 * @returns A positive 32-bit integer hash.
 */
const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Fetches and processes the novel data from the static JSON file.
 * It implements a caching mechanism to avoid redundant network requests.
 * The function also performs essential data cleaning and enrichment:
 * - Assigns a unique ID to each novel for React keys.
 * - Parses chapter counts from the `latest_chapter` title for more accuracy.
 * - Cleans up genre data by removing excessively long, erroneous lists.
 * - Provides a fallback cover image using a seeded hash of the title.
 * @returns A promise that resolves to an array of processed `Novel` objects.
 * @throws {Error} If the network request fails.
 */
export const loadNovels = async (): Promise<Novel[]> => {
    // Return cached data if available to prevent re-fetching and re-processing on every call.
    if (cachedNovels) {
        return Promise.resolve(cachedNovels);
    }

    const response = await fetch('/data/novels.json');
    if (!response.ok) {
        throw new Error(`Failed to fetch novels data: ${response.statusText}`);
    }
    const rawData = await response.json();

    // A reasonable threshold to detect bad genre data from the source file.
    // Some entries have a list of every possible genre, which is incorrect.
    const GENRE_THRESHOLD = 10; 

    const processedNovels: Novel[] = (rawData as any[]).map((novel, index) => {
      let finalChapterCount: number;
      const title = novel.latest_chapter?.title;
      
      // Attempt to parse a more accurate chapter count from the latest chapter's title.
      // The source data's `chapter_count` can sometimes be null or inaccurate.
      const numbersInTitle = title?.match(/\d+/g)?.map(Number).filter(n => !isNaN(n));
      
      if (numbersInTitle && numbersInTitle.length > 0) {
        // Use the largest number found in the title as the most likely chapter count.
        finalChapterCount = Math.max(...numbersInTitle);
      } else {
        // Fallback to the original chapter count if parsing fails.
        finalChapterCount = novel.chapter_count ?? 0;
      }
      
      // Data cleaning: some novels have a huge list of genres when none are specified.
      // This is a data scraping artifact. We'll treat this as having no genres by clearing
      // the array if it's longer than our defined threshold.
      const genres = novel.genres || [];
      const cleanedGenres = genres.length > GENRE_THRESHOLD ? [] : genres;

      return {
        ...novel,
        // Generate a unique and stable ID for use as a `key` in React components.
        id: `${novel.title.replace(/\s/g, '-')}-${index}`,
        status: novel.status as Novel['status'],
        genres: cleanedGenres,
        // Provide a consistent fallback cover image for novels that are missing one.
        cover_image: novel.cover_image || `https://picsum.photos/seed/${stringToHash(novel.title)}/400/600`,
        chapter_count: finalChapterCount,
      };
    });
    
    // Cache the processed data for subsequent calls.
    cachedNovels = processedNovels;
    return processedNovels;
}
