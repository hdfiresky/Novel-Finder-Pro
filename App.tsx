import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Novel, FilterState, SortOption, RecommendationCriteria } from './types';
import { useNovels } from './hooks/useNovels';
import { parseUrlState, serializeUrlState } from './utils/urlState';
import FilterSidebar from './components/FilterSidebar';
import NovelCard from './components/NovelCard';
import SearchBar from './components/SearchBar';
import NovelDetailModal from './components/NovelDetailModal';
import Icon from './components/Icon';
import SelectedFiltersDisplay from './components/SelectedFiltersDisplay';
import Pagination from './components/ui/Pagination';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import Button from './components/ui/Button';
import AuthModal from './components/AuthModal';
import ProfileDropdown from './components/ProfileDropdown';
import LibraryView from './components/LibraryView';
import SettingsModal from './components/SettingsModal';

const SIDEBAR_STATE_KEY = 'novel_finder_sidebar_open';
const RECOMMENDATION_CRITERIA_KEY = 'novel_finder_recommendation_criteria';

/**
 * The main content component of the application.
 * It orchestrates the entire UI by managing all URL-driven state and passing it
 * down to the relevant components.
 */
const AppContent: React.FC = () => {
    const [initialMaxChapters, setInitialMaxChapters] = useState(1000);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    // This state object holds all URL-managed application state.
    const [urlState, setUrlState] = useState(() => parseUrlState(initialMaxChapters));
    
    // State that is NOT URL-driven (local UI preferences).
    const [recommendationCriteria, setRecommendationCriteria] = useState<RecommendationCriteria>(() => {
        try {
            const stored = sessionStorage.getItem(RECOMMENDATION_CRITERIA_KEY);
            return stored ? JSON.parse(stored) : { genres: true, tags: true, description: true, author: true };
        } catch {
            return { genres: true, tags: true, description: true, author: true };
        }
    });
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        if (window.innerWidth < 768) return false;
        try {
            const stored = sessionStorage.getItem(SIDEBAR_STATE_KEY);
            return stored !== null ? JSON.parse(stored) : true;
        } catch { return true; }
    });

    const { user, loading: authLoading } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [initialAuthView, setInitialAuthView] = useState<'login' | 'register'>('login');
    const [novelHistory, setNovelHistory] = useState<string[]>(urlState.modalNovelId ? [urlState.modalNovelId] : []);
    
    const {
        allNovels, paginatedNovels, totalFilteredCount, totalNovelsCount,
        availableGenres, availableTags, availableStatuses, maxChapterCount,
        isLoading, error, totalPages,
    } = useNovels({ 
        filters: urlState.filters, 
        sortOptions: urlState.sortOptions, 
        currentPage: urlState.currentPage 
    });

    const defaultFilters = useMemo(() => ({
        searchTerm: '', searchFields: ['title', 'author', 'description'] as ('title' | 'author' | 'description')[],
        genres: { include: [], exclude: [] }, tags: { include: [], exclude: [] },
        status: null, ratingRange: [0, 10] as [number, number], chapterCountRange: [0, maxChapterCount] as [number, number],
    }), [maxChapterCount]);

    // Effect to update the initial max chapter count once data is loaded.
    useEffect(() => {
        if (maxChapterCount > 0 && !isDataLoaded) {
            setInitialMaxChapters(maxChapterCount);
            // Re-parse URL state with the correct max chapter count for the default range.
            setUrlState(parseUrlState(maxChapterCount));
            setIsDataLoaded(true);
        }
    }, [maxChapterCount, isDataLoaded]);

    // Effect to handle browser back/forward navigation.
    useEffect(() => {
        const handlePopState = () => {
            setUrlState(parseUrlState(maxChapterCount));
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [maxChapterCount]);
    
    // Persist non-URL state to sessionStorage.
    useEffect(() => { sessionStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarOpen)); }, [isSidebarOpen]);
    useEffect(() => { sessionStorage.setItem(RECOMMENDATION_CRITERIA_KEY, JSON.stringify(recommendationCriteria)); }, [recommendationCriteria]);

    /**
     * Central function to update the URL and application state.
     * @param newState A partial state object with the changes.
     * @param options.replace If true, uses `history.replaceState`; otherwise, `history.pushState`.
     */
    const updateUrlState = useCallback((newState: Partial<typeof urlState>, options: { replace: boolean } = { replace: false }) => {
        const newUrlState = { ...urlState, ...newState };
        // Reset page to 1 on any filter/sort change
        if (newState.filters || newState.sortOptions) {
            newUrlState.currentPage = 1;
        }
        setUrlState(newUrlState);
        const queryString = serializeUrlState(newUrlState, defaultFilters);
        const url = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
        
        if (options.replace) {
            history.replaceState(newUrlState, '', url);
        } else {
            history.pushState(newUrlState, '', url);
        }
    }, [urlState, defaultFilters]);

    // Derive selected novel from URL state.
    const selectedNovel = useMemo(() => {
        if (!urlState.modalNovelId || allNovels.length === 0) return null;
        return allNovels.find(n => n.id === urlState.modalNovelId) || null;
    }, [urlState.modalNovelId, allNovels]);
    
    // Handlers for state changes, which now call `updateUrlState`.
    const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        updateUrlState({ filters: { ...urlState.filters, [key]: value } }, { replace: true });
    }, [updateUrlState, urlState.filters]);

    const handleSearchFieldChange = useCallback((fields: ('title' | 'author' | 'description')[]) => {
        updateUrlState({ filters: { ...urlState.filters, searchFields: fields } }, { replace: true });
    }, [updateUrlState, urlState.filters]);

    const handleToggleFilter = useCallback((key: 'genres' | 'tags', value: string, type: 'include' | 'exclude') => {
        const current = urlState.filters[key];
        const isIncluded = current.include.includes(value); const isExcluded = current.exclude.includes(value);
        const newInclude = [...current.include]; const newExclude = [...current.exclude];

        if (type === 'include') {
            if (isIncluded) newInclude.splice(newInclude.indexOf(value), 1);
            else { newInclude.push(value); if (isExcluded) newExclude.splice(newExclude.indexOf(value), 1); }
        } else {
            if (isExcluded) newExclude.splice(newExclude.indexOf(value), 1);
            else { newExclude.push(value); if (isIncluded) newInclude.splice(newInclude.indexOf(value), 1); }
        }
        handleFilterChange(key, { include: newInclude, exclude: newExclude });
    }, [handleFilterChange, urlState.filters]);
    
    const addInclusionFilter = useCallback((key: 'genres' | 'tags', value: string) => {
        const current = urlState.filters[key];
        if (current.include.includes(value)) return;
        const newInclude = [...current.include, value];
        const newExclude = current.exclude.filter(v => v !== value);
        handleFilterChange(key, { include: newInclude, exclude: newExclude });
    }, [handleFilterChange, urlState.filters]);

    const removeFilter = useCallback((key: 'genres' | 'tags', value: string, type: 'include' | 'exclude') => {
        const current = urlState.filters[key];
        const list = current[type];
        const newList = list.filter(v => v !== value);
        handleFilterChange(key, { ...current, [type]: newList });
    }, [handleFilterChange, urlState.filters]);

    const resetFiltersAndSort = useCallback(() => {
        updateUrlState({
            filters: defaultFilters,
            sortOptions: [{ key: 'rating_count', direction: 'desc' }, { key: 'rating', direction: 'desc' }],
            currentPage: 1,
        }, { replace: true });
    }, [updateUrlState, defaultFilters]);
    
    const handleSortChange = (options: SortOption[]) => updateUrlState({ sortOptions: options }, { replace: true });
    const handlePageChange = (page: number) => updateUrlState({ currentPage: page });
    const setView = (view: 'home' | 'library') => updateUrlState({ view });
    const setLibraryTab = (tab: 'favorites' | 'reviews' | 'wishlist') => updateUrlState({ libraryTab: tab }, { replace: true });

    const handleSelectNovel = (novel: Novel) => {
        setNovelHistory([novel.id]);
        updateUrlState({ modalNovelId: novel.id });
    };
    const handleNavigateToNovel = (novel: Novel) => {
        setNovelHistory(prev => [...prev, novel.id]);
        updateUrlState({ modalNovelId: novel.id });
    };
    const handleCloseModal = () => {
        // If there's history, go back, otherwise remove modal from URL
        if (novelHistory.length > 1) {
            history.back();
        } else {
            updateUrlState({ modalNovelId: null }, { replace: true });
        }
        setNovelHistory([]);
    };
    const handleGoBackNovel = () => history.back();

    useEffect(() => {
        if (urlState.modalNovelId) {
            if (!novelHistory.includes(urlState.modalNovelId)) {
                setNovelHistory(prev => [...prev, urlState.modalNovelId!]);
            }
        } else {
            setNovelHistory([]);
        }
    }, [urlState.modalNovelId]);

    const openAuthModal = (view: 'login' | 'register') => { 
        setInitialAuthView(view); 
        setIsAuthModalOpen(true); 
    };

    // --- RENDER LOGIC ---
    if (isLoading || authLoading || !isDataLoaded) { /* ... loading spinner ... */ }
    if (error) { /* ... error message ... */ }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
             <div className="flex flex-col w-full">
                <header className="relative z-30 flex-shrink-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                    <button onClick={() => setView('home')} className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition-colors">
                        <Icon name="BookHeart" size={28} className="text-indigo-500"/><h1>Novel Finder Pro</h1>
                    </button>
                    <div className="flex items-center gap-4">
                       {urlState.view === 'home' && <div className="text-sm text-gray-400 hidden sm:block">{totalFilteredCount} / {totalNovelsCount} novels</div>}
                        {user ? (<ProfileDropdown onGoToLibrary={() => setView('library')} onOpenSettings={() => setIsSettingsModalOpen(true)} />) 
                         : (<div className="flex items-stretch gap-2"><Button variant="secondary" onClick={() => openAuthModal('login')} className="px-3 py-1.5 text-sm">Login</Button><Button variant="primary" onClick={() => openAuthModal('register')} className="px-3 py-1.5 text-sm">Sign Up</Button></div>)}
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <div className={`transition-all duration-300 ${isSidebarOpen && urlState.view === 'home' ? 'w-80 lg:w-96' : 'w-0'} h-full overflow-hidden`}>
                        <FilterSidebar filterState={urlState.filters} onFilterChange={handleFilterChange} onToggleFilter={handleToggleFilter} sortOptions={urlState.sortOptions} onSortChange={handleSortChange} onReset={resetFiltersAndSort} availableGenres={availableGenres} availableTags={availableTags} availableStatuses={availableStatuses} maxChapterCount={maxChapterCount} recommendationCriteria={recommendationCriteria} onRecommendationCriteriaChange={key => setRecommendationCriteria(prev => ({...prev, [key]: !prev[key]}))} />
                    </div>
                    
                    <main className="flex-1 flex flex-col overflow-hidden">
                        {urlState.view === 'home' ? (
                            <>
                                <div className="flex-shrink-0 w-full p-4 flex items-center gap-4 bg-gray-800/50">
                                    <div className="flex-grow">
                                        <SearchBar 
                                            searchTerm={urlState.filters.searchTerm} 
                                            setSearchTerm={(term) => handleFilterChange('searchTerm', term)}
                                            searchFields={urlState.filters.searchFields}
                                            onSearchFieldsChange={handleSearchFieldChange}
                                        />
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => setSidebarOpen(!isSidebarOpen)} 
                                        className="px-3"
                                        aria-label="Toggle filters sidebar"
                                        aria-expanded={isSidebarOpen}
                                    >
                                        <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} className="mr-0 sm:mr-2"/>
                                        <span className="hidden sm:inline">Filters</span>
                                    </Button>
                                </div>

                                <SelectedFiltersDisplay filters={urlState.filters} onRemoveFilter={removeFilter} onClearAll={resetFiltersAndSort} />
                                
                                <div className="flex-1 overflow-y-auto px-6 pb-6">
                                    {paginatedNovels.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                                {paginatedNovels.map(novel => (<NovelCard key={novel.id} novel={novel} onSelect={handleSelectNovel} onAddFilter={addInclusionFilter} />))}
                                            </div>
                                            <Pagination currentPage={urlState.currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><Icon name="SearchX" size={64} className="mb-4"/><h3 className="text-xl font-semibold">No Novels Found</h3><p className="mt-2">Try adjusting your search or filter criteria.</p><button onClick={resetFiltersAndSort} className="mt-4 text-indigo-400 hover:text-indigo-300 font-semibold">Reset Filters</button></div>
                                    )}
                                </div>
                            </>
                        ) : (
                           <LibraryView allNovels={allNovels} onSelectNovel={handleSelectNovel} onAddFilter={addInclusionFilter} activeTab={urlState.libraryTab} onTabChange={setLibraryTab} />
                        )}
                    </main>
                </div>
            </div>

            {selectedNovel && (<NovelDetailModal novel={selectedNovel} allNovels={allNovels} sortOptions={urlState.sortOptions} onClose={handleCloseModal} onSelectNovel={handleNavigateToNovel} onAddFilter={addInclusionFilter} globalRecommendationCriteria={recommendationCriteria} onGoBack={handleGoBackNovel} showBackButton={novelHistory.length > 1} />)}
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} initialView={initialAuthView} />}
            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <UserDataProvider>
            <AppContent />
        </UserDataProvider>
    </AuthProvider>
);

export default App;