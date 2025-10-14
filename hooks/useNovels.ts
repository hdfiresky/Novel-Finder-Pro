import { useState, useMemo, useEffect } from 'react';
import { Novel, FilterState, SortOption, RecommendationCriteria } from '../types';
import { loadNovels } from '../data/novels';
import { useDebounce } from './useDebounce';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

/**
 * Converts a string to Sentence case (e.g., "action" -> "Action").
 * @param str The string to convert.
 * @returns The Sentence-cased string.
 */
const toSentenceCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const ITEMS_PER_PAGE = 20;

const NSFW_GENRES = ['smut', 'yaoi', 'yuri', 'mature', 'adult', 'harem', 'ecchi'];
const NSFW_TAGS = ['r-18', 'yaoi', 'yuri'];

const isNovelNsfw = (novel: Novel): boolean => {
    const novelGenres = novel.genres.map(g => g.toLowerCase());
    if (NSFW_GENRES.some(nsfwGenre => novelGenres.includes(nsfwGenre))) return true;
    const novelTags = novel.tags.map(t => t.toLowerCase());
    if (NSFW_TAGS.some(nsfwTag => novelTags.includes(nsfwTag))) return true;
    return false;
};

interface UseNovelsProps {
    filters: FilterState;
    sortOptions: SortOption[];
    currentPage: number;
}

/**
 * A custom hook that fetches and processes the novel data.
 * It takes filters, sorting, and pagination state as props and returns
 * the derived data, such as the processed list of novels and available filter options.
 * The actual state management is handled by the parent component (App.tsx) to support URL-driven state.
 * @param {UseNovelsProps} props The current state for filtering, sorting, and pagination.
 * @returns An object containing the processed data and loading/error states.
 */
export const useNovels = ({ filters, sortOptions, currentPage }: UseNovelsProps) => {
    const [rawNovels, setRawNovels] = useState<Novel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const { settings } = useUserData();

    useEffect(() => {
        const initialize = async () => {
            try {
                const novels = await loadNovels();
                setRawNovels(novels);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, []);

    const dataBundle = useMemo(() => {
        if (rawNovels.length === 0) {
            return {
                allNovels: [],
                availableGenres: [],
                availableTags: [],
                availableStatuses: [],
                maxChapterCount: 1000,
                totalNovelsCount: 0,
            };
        }

        const showNsfw = user && settings.showNsfw;
        const allNovels = showNsfw ? rawNovels : rawNovels.filter(novel => !isNovelNsfw(novel));

        const allGenres = allNovels.flatMap(n => n.genres).map(toSentenceCase);
        const availableGenres = Array.from(new Set(allGenres)).filter(Boolean).sort();
        
        const allTags = allNovels.flatMap(n => n.tags).map(toSentenceCase);
        const availableTags = Array.from(new Set(allTags)).filter(Boolean).sort();
        
        const availableStatuses = Array.from(new Set(allNovels.map(n => n.status))).sort();
        const maxChapterCount = Math.max(...allNovels.map(item => item.chapter_count ?? 0), 0);

        return {
            allNovels,
            availableGenres,
            availableTags,
            availableStatuses,
            maxChapterCount,
            totalNovelsCount: rawNovels.length
        };
    }, [rawNovels, user, settings.showNsfw]);

    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

    const filteredAndSortedNovels = useMemo(() => {
        if (!dataBundle.allNovels.length) return [];
        let filtered = [...dataBundle.allNovels];

        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            const searchFields = filters.searchFields;
            
            filtered = filtered.filter(novel => {
                if (searchFields.length === 0) return false;
                
                let match = false;
                if (searchFields.includes('title')) {
                    match = match || novel.title.toLowerCase().includes(lowercasedTerm);
                }
                if (searchFields.includes('author')) {
                    match = match || novel.author.toLowerCase().includes(lowercasedTerm);
                }
                if (searchFields.includes('description')) {
                    match = match || novel.description.toLowerCase().includes(lowercasedTerm);
                }
                return match;
            });
        }
        if (filters.genres.include.length > 0) filtered = filtered.filter(n => filters.genres.include.every(g => n.genres.map(toSentenceCase).includes(g)));
        if (filters.genres.exclude.length > 0) filtered = filtered.filter(n => !filters.genres.exclude.some(g => n.genres.map(toSentenceCase).includes(g)));
        if (filters.tags.include.length > 0) filtered = filtered.filter(n => filters.tags.include.every(t => n.tags.map(toSentenceCase).includes(t)));
        if (filters.tags.exclude.length > 0) filtered = filtered.filter(n => !filters.tags.exclude.some(t => n.tags.map(toSentenceCase).includes(t)));
        if (filters.status) filtered = filtered.filter(n => n.status === filters.status);
        
        filtered = filtered.filter(n => n.rating >= filters.ratingRange[0] && n.rating <= filters.ratingRange[1]);
        filtered = filtered.filter(n => n.chapter_count >= filters.chapterCountRange[0] && n.chapter_count <= filters.chapterCountRange[1]);

        if (sortOptions.length > 0) {
            filtered.sort((a, b) => {
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
        }
        return filtered;
    }, [filters, sortOptions, debouncedSearchTerm, dataBundle.allNovels]);

    const totalPages = useMemo(() => Math.ceil(filteredAndSortedNovels.length / ITEMS_PER_PAGE), [filteredAndSortedNovels.length]);

    const paginatedNovels = useMemo(() => {
        const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
        const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedNovels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, totalPages, filteredAndSortedNovels]);

    return {
        ...dataBundle,
        paginatedNovels,
        totalFilteredCount: filteredAndSortedNovels.length,
        isLoading,
        error,
        totalPages,
    };
};