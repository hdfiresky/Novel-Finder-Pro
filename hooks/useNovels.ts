

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Novel, FilterState, SortOption, RecommendationCriteria, UserSettings } from '../types';
import { loadNovels } from '../data/novels';
import { useDebounce } from './useDebounce';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

const toSentenceCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getRawAvailableOptions = <T,>(data: Novel[], key: keyof Novel): T[] => {
    const allValues = data.flatMap(item => item[key] as T[]);
    return Array.from(new Set(allValues)).sort() as T[];
};

const getMaxNumericValue = (data: Novel[], key: keyof Novel): number => {
    return Math.max(...data.map(item => (item[key] as number) ?? 0), 0);
};

const ITEMS_PER_PAGE = 20;

// Keys for sessionStorage
const FILTERS_SESSION_KEY = 'novel_finder_filters';
const SORT_SESSION_KEY = 'novel_finder_sort';
const PAGE_SESSION_KEY = 'novel_finder_page';

// NSFW Content Filtering
const NSFW_GENRES = ['smut', 'yaoi', 'yuri', 'mature', 'adult', 'harem', 'ecchi'];
const NSFW_TAGS = ['r-18', 'yaoi', 'yuri'];

const isNovelNsfw = (novel: Novel): boolean => {
    const novelGenres = novel.genres.map(g => g.toLowerCase());
    if (NSFW_GENRES.some(nsfwGenre => novelGenres.includes(nsfwGenre))) {
        return true;
    }
    const novelTags = novel.tags.map(t => t.toLowerCase());
    if (NSFW_TAGS.some(nsfwTag => novelTags.includes(nsfwTag))) {
        return true;
    }
    return false;
};

export const useNovels = () => {
    const [rawNovels, setRawNovels] = useState<Novel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [initialFilterState, setInitialFilterState] = useState<FilterState | null>(null);

    const { user } = useAuth();
    const { settings } = useUserData();

    const allNovels = useMemo(() => {
        const showNsfw = user && settings.showNsfw;
        if (showNsfw) {
            return rawNovels;
        }
        return rawNovels.filter(novel => !isNovelNsfw(novel));
    }, [rawNovels, user, settings.showNsfw]);

    const [filters, setFilters] = useState<FilterState | null>(() => {
        try {
            const stored = sessionStorage.getItem(FILTERS_SESSION_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Failed to parse filters from sessionStorage", e);
            return null;
        }
    });
    
    const [sortOptions, setSortOptions] = useState<SortOption[]>(() => {
        try {
            const stored = sessionStorage.getItem(SORT_SESSION_KEY);
            return stored ? JSON.parse(stored) : [
                { key: 'rating_count', direction: 'desc' },
                { key: 'rating', direction: 'desc' },
            ];
        } catch (e) {
            console.error("Failed to parse sort options from sessionStorage", e);
            return [
                { key: 'rating_count', direction: 'desc' },
                { key: 'rating', direction: 'desc' },
            ];
        }
    });

    const [recommendationCriteria, setRecommendationCriteria] = useState<RecommendationCriteria>({
        genres: true,
        tags: true,
        description: true,
        author: true,
    });
    
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [maxChapterCount, setMaxChapterCount] = useState<number>(1000);
    
    const [currentPage, setCurrentPage] = useState<number>(() => {
        try {
            const stored = sessionStorage.getItem(PAGE_SESSION_KEY);
            return stored ? JSON.parse(stored) : 1;
        } catch (e) {
            console.error("Failed to parse page from sessionStorage", e);
            return 1;
        }
    });

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

    useEffect(() => {
        if (allNovels.length === 0) return;

        const maxChapters = getMaxNumericValue(allNovels, 'chapter_count');
        const initialState: FilterState = {
            searchTerm: '',
            genres: { include: [], exclude: [] },
            tags: { include: [], exclude: [] },
            status: null,
            ratingRange: [0, 10],
            chapterCountRange: [0, maxChapters],
        };
        
        setInitialFilterState(initialState);
        
        setFilters(prev => {
            if (prev) {
                return {
                    ...prev,
                    chapterCountRange: [
                        Math.min(prev.chapterCountRange[0], maxChapters),
                        Math.min(prev.chapterCountRange[1], maxChapters)
                    ]
                };
            }
            return initialState;
        });
        
        const allGenres = allNovels.flatMap(n => n.genres).map(toSentenceCase);
        setAvailableGenres(Array.from(new Set(allGenres)).filter(Boolean).sort());
        
        const allTags = allNovels.flatMap(n => n.tags).map(toSentenceCase);
        setAvailableTags(Array.from(new Set(allTags)).filter(Boolean).sort());
        
        setAvailableStatuses(getRawAvailableOptions<string>(allNovels, 'status'));
        setMaxChapterCount(maxChapters);

    }, [allNovels]);

    // Save state to sessionStorage on change
    useEffect(() => {
        if (filters) {
            sessionStorage.setItem(FILTERS_SESSION_KEY, JSON.stringify(filters));
        }
    }, [filters]);

    useEffect(() => {
        sessionStorage.setItem(SORT_SESSION_KEY, JSON.stringify(sortOptions));
    }, [sortOptions]);
    
    useEffect(() => {
        sessionStorage.setItem(PAGE_SESSION_KEY, JSON.stringify(currentPage));
    }, [currentPage]);


    const debouncedSearchTerm = useDebounce(filters?.searchTerm ?? '', 300);

    const filteredAndSortedNovels = useMemo(() => {
        if (!filters || !allNovels.length) {
            return [];
        }

        let filtered = [...allNovels];

        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(novel =>
                novel.title.toLowerCase().includes(lowercasedTerm) ||
                novel.author.toLowerCase().includes(lowercasedTerm) ||
                novel.description.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (filters.genres.include.length > 0) {
            filtered = filtered.filter(novel =>
                filters.genres.include.every(genre => novel.genres.map(toSentenceCase).includes(genre))
            );
        }
        if (filters.genres.exclude.length > 0) {
            filtered = filtered.filter(novel =>
                !filters.genres.exclude.some(genre => novel.genres.map(toSentenceCase).includes(genre))
            );
        }

        if (filters.tags.include.length > 0) {
            filtered = filtered.filter(novel =>
                filters.tags.include.every(tag => novel.tags.map(toSentenceCase).includes(tag))
            );
        }
        if (filters.tags.exclude.length > 0) {
            filtered = filtered.filter(novel =>
                !filters.tags.exclude.some(tag => novel.tags.map(toSentenceCase).includes(tag))
            );
        }
        
        if(filters.status) {
            filtered = filtered.filter(novel => novel.status === filters.status);
        }
        
        filtered = filtered.filter(novel => 
            novel.rating >= filters.ratingRange[0] && novel.rating <= filters.ratingRange[1]
        );

        filtered = filtered.filter(novel => 
            novel.chapter_count >= filters.chapterCountRange[0] && novel.chapter_count <= filters.chapterCountRange[1]
        );

        if (sortOptions.length > 0) {
            filtered.sort((a, b) => {
                for (const option of sortOptions) {
                    const valA = a[option.key];
                    const valB = b[option.key];

                    if (typeof valA === 'string' && typeof valB === 'string') {
                        const comparison = valA.localeCompare(valB);
                        if (comparison !== 0) {
                            return option.direction === 'asc' ? comparison : -comparison;
                        }
                    } else if (typeof valA === 'number' && typeof valB === 'number') {
                        if (valA !== valB) {
                            return option.direction === 'asc' ? valA - valB : valB - valA;
                        }
                    }
                }
                return 0;
            });
        }

        return filtered;
    }, [filters, sortOptions, debouncedSearchTerm, allNovels]);

    // Reset to page 1 whenever filters or sorting changes (but not on initial load)
    useEffect(() => {
        // This check prevents resetting to page 1 on the very first render
        // if a page was already loaded from sessionStorage.
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm, filters?.genres, filters?.tags, filters?.status, filters?.ratingRange, filters?.chapterCountRange, sortOptions]);


    const totalPages = useMemo(() => {
        return Math.ceil(filteredAndSortedNovels.length / ITEMS_PER_PAGE);
    }, [filteredAndSortedNovels.length]);

    const paginatedNovels = useMemo(() => {
        const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
        const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAndSortedNovels.slice(startIndex, endIndex);
    }, [currentPage, totalPages, filteredAndSortedNovels]);

    const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        setFilters(prev => (prev ? { ...prev, [key]: value } : null));
    }, []);
    
    const handleToggleFilter = useCallback((key: 'genres' | 'tags', value: string, type: 'include' | 'exclude') => {
        setFilters(prev => {
            if (!prev) return null;
            const current = prev[key];
            const isIncluded = current.include.includes(value);
            const isExcluded = current.exclude.includes(value);

            const newInclude = [...current.include];
            const newExclude = [...current.exclude];

            if (type === 'include') {
                if (isIncluded) {
                    newInclude.splice(newInclude.indexOf(value), 1);
                } else {
                    newInclude.push(value);
                    if (isExcluded) {
                        newExclude.splice(newExclude.indexOf(value), 1);
                    }
                }
            } else { // type === 'exclude'
                if (isExcluded) {
                    newExclude.splice(newExclude.indexOf(value), 1);
                } else {
                    newExclude.push(value);
                    if (isIncluded) {
                        newInclude.splice(newInclude.indexOf(value), 1);
                    }
                }
            }
            return { ...prev, [key]: { include: newInclude, exclude: newExclude } };
        });
    }, []);

    const addInclusionFilter = useCallback((key: 'genres' | 'tags', value: string) => {
        const sentenceCasedValue = toSentenceCase(value);
        setFilters(prev => {
            if (!prev) return null;
            const current = prev[key];
            if (current.include.includes(sentenceCasedValue)) {
                return prev;
            }
            const newInclude = [...current.include, sentenceCasedValue];
            const newExclude = current.exclude.filter(v => v !== sentenceCasedValue);
            return { ...prev, [key]: { include: newInclude, exclude: newExclude } };
        });
    }, []);

    const removeFilter = useCallback((key: 'genres' | 'tags', value: string, type: 'include' | 'exclude') => {
        setFilters(prev => {
            if (!prev) return null;
            const current = prev[key];
            if (type === 'include') {
                return { ...prev, [key]: { ...current, include: current.include.filter(v => v !== value) } };
            } else {
                return { ...prev, [key]: { ...current, exclude: current.exclude.filter(v => v !== value) } };
            }
        });
    }, []);

    const resetFiltersAndSort = useCallback(() => {
        if (initialFilterState) {
            setFilters(initialFilterState);
        }
        setSortOptions([
            { key: 'rating_count', direction: 'desc' },
            { key: 'rating', direction: 'desc' },
        ]);
        setRecommendationCriteria({
            genres: true,
            tags: true,
            description: true,
            author: true,
        });
        setCurrentPage(1);

        // Also clear from session storage
        sessionStorage.removeItem(FILTERS_SESSION_KEY);
        sessionStorage.removeItem(SORT_SESSION_KEY);
        sessionStorage.removeItem(PAGE_SESSION_KEY);

    }, [initialFilterState]);

    const handleRecommendationCriteriaChange = useCallback((key: keyof RecommendationCriteria) => {
        setRecommendationCriteria(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    return {
        allNovels,
        paginatedNovels,
        totalFilteredCount: filteredAndSortedNovels.length,
        totalNovelsCount: rawNovels.length,
        filters,
        handleFilterChange,
        handleToggleFilter,
        addInclusionFilter,
        removeFilter,
        sortOptions,
        setSortOptions,
        resetFiltersAndSort,
        recommendationCriteria,
        handleRecommendationCriteriaChange,
        availableGenres,
        availableTags,
        availableStatuses,
        maxChapterCount,
        isLoading,
        error,
        currentPage,
        totalPages,
        setCurrentPage
    };
};