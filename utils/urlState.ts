import { FilterState, SortOption } from '../types';

const defaultSortOptions: SortOption[] = [
  { key: 'rating_count', direction: 'desc' },
  { key: 'rating', direction: 'desc' },
];

const defaultSearchFields: ('title' | 'author' | 'description')[] = ['title', 'author', 'description'];

const getDefaultFilterState = (maxChapterCount: number): FilterState => ({
  searchTerm: '',
  searchFields: defaultSearchFields,
  genres: { include: [], exclude: [] },
  tags: { include: [], exclude: [] },
  status: null,
  ratingRange: [0, 10],
  chapterCountRange: [0, maxChapterCount],
});

/**
 * Parses the URL query string and returns a structured state object.
 * @param maxChapterCount The maximum chapter count from the dataset, used for default filter state.
 * @returns An object representing the application's URL-driven state.
 */
export const parseUrlState = (maxChapterCount: number) => {
  const params = new URLSearchParams(window.location.search);
  const defaultFilters = getDefaultFilterState(maxChapterCount);
  
  const searchFieldsParam = params.get('search_in')?.split(',').filter(Boolean) as ('title' | 'author' | 'description')[];

  const filters: FilterState = {
    searchTerm: params.get('q') || defaultFilters.searchTerm,
    searchFields: searchFieldsParam && searchFieldsParam.length > 0 ? searchFieldsParam : defaultFilters.searchFields,
    genres: {
      include: params.get('g_in')?.split(',').filter(Boolean) || defaultFilters.genres.include,
      exclude: params.get('g_ex')?.split(',').filter(Boolean) || defaultFilters.genres.exclude,
    },
    tags: {
      include: params.get('t_in')?.split(',').filter(Boolean) || defaultFilters.tags.include,
      exclude: params.get('t_ex')?.split(',').filter(Boolean) || defaultFilters.tags.exclude,
    },
    status: params.get('status') || defaultFilters.status,
    ratingRange: params.get('rating')?.split(',').map(Number) as [number, number] || defaultFilters.ratingRange,
    chapterCountRange: params.get('chapters')?.split(',').map(Number) as [number, number] || defaultFilters.chapterCountRange,
  };

  const sortOptions: SortOption[] = (params.get('sort')?.split(',').filter(Boolean) || []).map(s => {
    const [key, direction] = s.split('_');
    return { key: key as keyof import('../types').Novel, direction: direction as 'asc' | 'desc' };
  });

  return {
    filters,
    sortOptions: sortOptions.length > 0 ? sortOptions : defaultSortOptions,
    currentPage: Number(params.get('page') || '1'),
    view: (params.get('view') as 'home' | 'library') || 'home',
    libraryTab: (params.get('tab') as 'favorites' | 'reviews' | 'wishlist') || 'favorites',
    modalNovelId: params.get('modal') || null,
  };
};

type AppUrlState = ReturnType<typeof parseUrlState>;

/**
 * Serializes the application state object into a URL query string.
 * Omits default values to keep the URL clean.
 * @param state The application's state object.
 * @param defaultFilters The default filter state to compare against.
 * @returns A URL query string.
 */
export const serializeUrlState = (state: AppUrlState, defaultFilters: FilterState): string => {
  const params = new URLSearchParams();

  if (state.filters.searchTerm !== defaultFilters.searchTerm) params.set('q', state.filters.searchTerm);
  
  const searchFieldsString = state.filters.searchFields.sort().join(',');
  const defaultSearchFieldsString = defaultSearchFields.sort().join(',');
  if (searchFieldsString !== defaultSearchFieldsString) {
    params.set('search_in', searchFieldsString);
  }

  if (state.filters.genres.include.length) params.set('g_in', state.filters.genres.include.join(','));
  if (state.filters.genres.exclude.length) params.set('g_ex', state.filters.genres.exclude.join(','));
  if (state.filters.tags.include.length) params.set('t_in', state.filters.tags.include.join(','));
  if (state.filters.tags.exclude.length) params.set('t_ex', state.filters.tags.exclude.join(','));
  if (state.filters.status !== defaultFilters.status) params.set('status', state.filters.status!);
  if (state.filters.ratingRange[0] !== defaultFilters.ratingRange[0] || state.filters.ratingRange[1] !== defaultFilters.ratingRange[1]) {
    params.set('rating', state.filters.ratingRange.join(','));
  }
  if (state.filters.chapterCountRange[0] !== defaultFilters.chapterCountRange[0] || state.filters.chapterCountRange[1] !== defaultFilters.chapterCountRange[1]) {
    params.set('chapters', state.filters.chapterCountRange.join(','));
  }
  
  const sortString = state.sortOptions.map(s => `${s.key}_${s.direction}`).join(',');
  const defaultSortString = defaultSortOptions.map(s => `${s.key}_${s.direction}`).join(',');
  if (sortString !== defaultSortString) params.set('sort', sortString);

  if (state.currentPage > 1) params.set('page', String(state.currentPage));
  if (state.view !== 'home') params.set('view', state.view);
  if (state.view === 'library' && state.libraryTab !== 'favorites') params.set('tab', state.libraryTab);
  if (state.modalNovelId) params.set('modal', state.modalNovelId);

  return params.toString();
};