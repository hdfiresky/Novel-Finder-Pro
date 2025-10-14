
import { Novel, RecommendationCriteria, ScoredNovel, SortOption } from '../types';

/** A set of common English "stop words" to be ignored when calculating description similarity. */
const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do',
    'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
    'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'o', 'of', 'on',
    'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should',
    'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
    'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
    'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours',
    'yourself', 'yourselves'
]);

// Cache tokenized descriptions to avoid re-calculating them repeatedly during a single recommendation cycle.
const descriptionWordCache = new Map<string, Set<string>>();

/**
 * Tokenizes a description string into a set of significant words, excluding stop words.
 * Uses a cache to improve performance.
 * @param desc The description string.
 * @returns A set of unique, lowercased words.
 */
const getWordsFromDescription = (desc: string): Set<string> => {
    if (descriptionWordCache.has(desc)) {
        return descriptionWordCache.get(desc)!;
    }
    const words = new Set(
        (desc.toLowerCase().match(/\b(\w+)\b/g) || []).filter(word => !STOP_WORDS.has(word))
    );
    descriptionWordCache.set(desc, words);
    return words;
};

/**
 * Calculates a similarity score between two descriptions based on the number of common significant words.
 * @param desc1 The first description.
 * @param desc2 The second description.
 * @returns A numeric similarity score.
 */
const calculateDescriptionScore = (desc1: string, desc2: string): number => {
    const words1 = getWordsFromDescription(desc1);
    const words2 = getWordsFromDescription(desc2);
    
    if (words1.size === 0 || words2.size === 0) return 0;

    let commonWords = 0;
    for(const word of words2) {
        if(words1.has(word)) {
            commonWords++;
        }
    }
    
    return commonWords * 0.1; // Assign a weight to each common word.
};

/**
 * Finds and scores novels similar to a given novel based on selected criteria.
 * The algorithm first pre-filters a smaller pool of candidates to optimize performance,
 * then calculates a weighted score for each candidate.
 * The final list is sorted by this score and then by the user's global sort preferences.
 * @param currentNovel The novel to find recommendations for.
 * @param allNovels The entire dataset of novels to search through.
 * @param sortOptions The user's current sorting preferences, used as a tie-breaker.
 * @param criteria An object specifying which attributes (genres, tags, etc.) to use for scoring.
 * @returns An array of the top 5 most similar `ScoredNovel` objects.
 */
export const getSimilarNovels = (
  currentNovel: Novel, 
  allNovels: Novel[], 
  sortOptions: SortOption[],
  criteria: RecommendationCriteria
): ScoredNovel[] => {
  if (!currentNovel) return [];
  
  descriptionWordCache.clear(); // Clear cache for each new recommendation call.

  // PERFORMANCE OPTIMIZATION: Instead of scoring all novels, create a smaller pool of candidates first.
  // A novel is considered a candidate if it matches at least one of the "cheaper" criteria (author, genre, tag).
  // The expensive description comparison is only run on this smaller candidate pool.
  const candidates = allNovels.filter(otherNovel => {
    if (otherNovel.id === currentNovel.id) return false;

    // If only description is enabled, we must use the slow path and check all novels.
    if (criteria.description && !criteria.author && !criteria.genres && !criteria.tags) {
        return true;
    }

    // Fast path: A novel is a candidate if it matches any of the cheaper criteria.
    if (criteria.author && otherNovel.author === currentNovel.author) return true;
    if (criteria.genres && currentNovel.genres.some(g => otherNovel.genres.includes(g))) return true;
    if (criteria.tags && currentNovel.tags.some(t => otherNovel.tags.includes(t))) return true;
    
    // If no cheap criteria are enabled but description is, it will have been caught by the slow path check above.
    // Otherwise, if it matches none of the selected cheap criteria, it's not a candidate.
    return false;
  });

  // Now, run the expensive scoring logic ONLY on the pre-filtered candidates.
  const scoredNovels: ScoredNovel[] = candidates
    .map(otherNovel => {
      let score = 0;
      // Assign weights to different criteria matches.
      if (criteria.genres) score += otherNovel.genres.filter(g => currentNovel.genres.includes(g)).length; // 1 point per common genre
      if (criteria.tags) score += otherNovel.tags.filter(t => currentNovel.tags.includes(t)).length * 0.5; // 0.5 points per common tag
      if (criteria.description) score += calculateDescriptionScore(currentNovel.description, otherNovel.description);
      if (criteria.author && otherNovel.author === currentNovel.author) score += 2; // Author match is a strong signal
      
      return { ...otherNovel, score };
    })
    .filter(n => n.score > 0);

    // Multi-level sort: first by recommendation score, then by the user's global sort settings.
    scoredNovels.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
  
      for (const option of sortOptions) {
          const valA = a[option.key]; const valB = b[option.key];
          if (typeof valA === 'string' && typeof valB === 'string') {
              const comparison = valA.localeCompare(valB);
              if (comparison !== 0) return option.direction === 'asc' ? comparison : -comparison;
          } else if (typeof valA === 'number' && typeof valB === 'number') {
              if (valA !== valB) return option.direction === 'asc' ? valA - valB : valB - valA;
          }
      }
      return 0;
    });

    return scoredNovels.slice(0, 5);
};
