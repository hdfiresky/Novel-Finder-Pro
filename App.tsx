

import React, { useState, useEffect } from 'react';
import { Novel } from './types';
import { useNovels } from './hooks/useNovels';
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

const AppContent: React.FC = () => {
    const {
        allNovels,
        paginatedNovels,
        totalFilteredCount,
        totalNovelsCount,
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
        setCurrentPage,
    } = useNovels();
    
    const [novelHistory, setNovelHistory] = useState<Novel[]>([]);
    const [hasNavigatedInModal, setHasNavigatedInModal] = useState(false);
    
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        // On mobile, always start with the sidebar closed for a better initial view.
        if (window.innerWidth < 768) {
            return false;
        }
        
        // On desktop, respect the session storage setting.
        try {
            const stored = sessionStorage.getItem(SIDEBAR_STATE_KEY);
            if (stored !== null) {
                return JSON.parse(stored);
            }
            // Default to open on desktop if no session state is found.
            return true; 
        } catch {
            // Fallback in case of error.
            return true;
        }
    });

    const { user, loading: authLoading } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [initialAuthView, setInitialAuthView] = useState<'login' | 'register'>('login');
    const [view, setView] = useState<'home' | 'library'>('home');

    useEffect(() => {
        sessionStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);
    
    const openAuthModal = (view: 'login' | 'register') => {
        setInitialAuthView(view);
        setIsAuthModalOpen(true);
    };
    
    const selectedNovel = novelHistory.length > 0 ? novelHistory[novelHistory.length - 1] : null;

    const handleSelectNovel = (novel: Novel) => {
        setNovelHistory([novel]);
        setHasNavigatedInModal(false);
    };

    const handleNavigateToNovel = (novel: Novel) => {
        setNovelHistory(prev => [...prev, novel]);
        setHasNavigatedInModal(true);
    };

    const handleCloseModal = () => {
        setNovelHistory([]);
        setHasNavigatedInModal(false);
    };

    const handleGoBackNovel = () => {
        if (novelHistory.length > 1) {
            setNovelHistory(prev => prev.slice(0, -1));
        } else {
            handleCloseModal();
        }
    };


    if (isLoading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-400">
                <Icon name="Loader" size={48} className="animate-spin mb-4" />
                <p className="text-lg">Loading novels...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-red-400">
                <Icon name="AlertTriangle" size={48} className="mb-4" />
                <h2 className="text-xl font-semibold">Failed to Load Data</h2>
                <p className="mt-2 text-gray-400">{error}</p>
            </div>
        );
    }
    
    if (!filters) {
        return null; 
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
             <div className="flex flex-col w-full">
                <header className="relative z-30 flex-shrink-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                    <button onClick={() => setView('home')} className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition-colors">
                        <Icon name="BookHeart" size={28} className="text-indigo-500"/>
                        <h1>Novel Finder Pro</h1>
                    </button>
                    <div className="flex items-center gap-4">
                       {view === 'home' && <div className="text-sm text-gray-400 hidden sm:block">
                            {totalFilteredCount} / {totalNovelsCount} novels
                        </div>}
                        {user ? (
                            <ProfileDropdown onGoToLibrary={() => setView('library')} onOpenSettings={() => setIsSettingsModalOpen(true)} />
                        ) : (
                            <div className="flex items-stretch gap-2">
                                <Button variant="secondary" onClick={() => openAuthModal('login')} className="px-3 py-1.5 text-sm">Login</Button>
                                <Button variant="primary" onClick={() => openAuthModal('register')} className="px-3 py-1.5 text-sm">Sign Up</Button>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <div className={`transition-all duration-300 ${isSidebarOpen && view === 'home' ? 'w-80 lg:w-96' : 'w-0'} h-full overflow-hidden relative`}>
                        <FilterSidebar
                            filterState={filters}
                            onFilterChange={handleFilterChange}
                            onToggleFilter={handleToggleFilter}
                            sortOptions={sortOptions}
                            onSortChange={setSortOptions}
                            onReset={resetFiltersAndSort}
                            availableGenres={availableGenres}
                            availableTags={availableTags}
                            availableStatuses={availableStatuses}
                            maxChapterCount={maxChapterCount}
                            recommendationCriteria={recommendationCriteria}
                            onRecommendationCriteriaChange={handleRecommendationCriteriaChange}
                        />
                    </div>
                    
                    {view === 'home' && <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)} 
                        className={`absolute top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-indigo-600 text-white p-2 rounded-r-lg z-20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ring-offset-2 ring-offset-gray-900 ${isSidebarOpen ? 'left-[calc(20rem-1px)] lg:left-[calc(24rem-1px)]' : 'left-0'}`}
                        aria-label="Toggle filters sidebar"
                        style={{top: 'calc(50% + 36px)'}} // Adjust for header height
                    >
                        <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} />
                    </button>}

                    <main className="flex-1 flex flex-col overflow-hidden">
                        {view === 'home' ? (
                            <>
                                <div className="flex-shrink-0 w-full p-4">
                                    <SearchBar 
                                        searchTerm={filters.searchTerm} 
                                        setSearchTerm={(term) => handleFilterChange('searchTerm', term)}
                                    />
                                </div>

                                <SelectedFiltersDisplay
                                    filters={filters}
                                    onRemoveFilter={removeFilter}
                                    onClearAll={resetFiltersAndSort}
                                />

                                <div className="flex-1 overflow-y-auto px-6 pb-6">
                                    {paginatedNovels.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                                {paginatedNovels.map(novel => (
                                                    <NovelCard key={novel.id} novel={novel} onSelect={handleSelectNovel} onAddFilter={addInclusionFilter} />
                                                ))}
                                            </div>
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                            <Icon name="SearchX" size={64} className="mb-4"/>
                                            <h3 className="text-xl font-semibold">No Novels Found</h3>
                                            <p className="mt-2">Try adjusting your search or filter criteria.</p>
                                            <button onClick={resetFiltersAndSort} className="mt-4 text-indigo-400 hover:text-indigo-300 font-semibold">Reset Filters</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <LibraryView allNovels={allNovels} onSelectNovel={handleSelectNovel} onAddFilter={addInclusionFilter} />
                        )}
                    </main>
                </div>
            </div>

            {selectedNovel && (
                <NovelDetailModal
                    novel={selectedNovel}
                    allNovels={allNovels}
                    sortOptions={sortOptions}
                    onClose={handleCloseModal}
                    onSelectNovel={handleNavigateToNovel}
                    onAddFilter={addInclusionFilter}
                    globalRecommendationCriteria={recommendationCriteria}
                    onGoBack={handleGoBackNovel}
                    showBackButton={hasNavigatedInModal}
                />
            )}

            {isAuthModalOpen && (
                <AuthModal 
                    onClose={() => setIsAuthModalOpen(false)}
                    initialView={initialAuthView}
                />
            )}
            
            {isSettingsModalOpen && (
                <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <UserDataProvider>
                <AppContent />
            </UserDataProvider>
        </AuthProvider>
    );
};

export default App;
