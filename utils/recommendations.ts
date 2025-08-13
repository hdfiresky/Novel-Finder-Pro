import { Novel, RecommendationCriteria, ScoredNovel, SortOption } from '../types';

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

// Cache tokenized descriptions to avoid re-calculating them repeatedly.
const descriptionWordCache = new Map<string, Set<string>>();

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
    
    return commonWords * 0.1; // Weight each common word
};


export const getSimilarNovels = (
  currentNovel: Novel, 
  allNovels: Novel[], 
  sortOptions: SortOption[],
  criteria: RecommendationCriteria
): ScoredNovel[] => {
  if (!currentNovel) return [];
  
  // OPTIMIZATION: Instead of scoring all novels, create a smaller pool of candidates first.
  const candidates = allNovels.filter(otherNovel => {
    if (otherNovel.id === currentNovel.id) return false;

    // If only description is enabled, we have to use the slow path and check all novels.
    if (criteria.description && !criteria.author && !criteria.genres && !criteria.tags) {
        return true;
    }

    // Fast path: A novel is a candidate if it matches any of the cheaper criteria.
    if (criteria.author && otherNovel.author === currentNovel.author) {
        return true;
    }
    if (criteria.genres && currentNovel.genres.some(g => otherNovel.genres.includes(g))) {
        return true;
    }
    if (criteria.tags && currentNovel.tags.some(t => otherNovel.tags.includes(t))) {
        return true;
    }
    
    return false;
  });

  // Now, run the expensive scoring logic ONLY on the candidates.
  const scoredNovels: ScoredNovel[] = candidates
    .map(otherNovel => {
      let score = 0;
      if (criteria.genres) {
        score += otherNovel.genres.filter(g => currentNovel.genres.includes(g)).length;
      }
      if (criteria.tags) {
        score += otherNovel.tags.filter(t => currentNovel.tags.includes(t)).length * 0.5;
      }
      if (criteria.description) {
        score += calculateDescriptionScore(currentNovel.description, otherNovel.description);
      }
      if (criteria.author && otherNovel.author === currentNovel.author) {
        score += 2; // Author match is a strong signal
      }
      return { ...otherNovel, score };
    })
    .filter(n => n.score > 0);

    // Multi-level sort on the scored candidates
    scoredNovels.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
  
      for (const option of sortOptions) {
          const valA = a[option.key];
          const valB = b[option.key];
  
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
