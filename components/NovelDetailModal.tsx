

import React, { useState, useMemo, useEffect } from 'react';
import { Novel, SortOption, RecommendationCriteria, Review } from '../types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Icon from './Icon';
import ImageWithLoader from './ui/ImageWithLoader';
import RecommendationTuner from './RecommendationTuner';
import { getSimilarNovels } from '../utils/recommendations';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import StarRatingInput from './ui/StarRatingInput';

interface NovelDetailModalProps {
  novel: Novel | null;
  allNovels: Novel[];
  sortOptions: SortOption[];
  onClose: () => void;
  onSelectNovel: (novel: Novel) => void;
  onAddFilter: (key: 'genres' | 'tags', value: string) => void;
  globalRecommendationCriteria: RecommendationCriteria;
  onGoBack: () => void;
  showBackButton: boolean;
}

const NovelDetailModal: React.FC<NovelDetailModalProps> = ({ novel, allNovels, sortOptions, onClose, onSelectNovel, onAddFilter, globalRecommendationCriteria, onGoBack, showBackButton }) => {
  if (!novel) return null; // Guard against null novel early

  const { user } = useAuth();
  const { isFavorite, toggleFavorite, getReview, updateReview, deleteReview, isWished, toggleWishlist, settings } = useUserData();

  const [localRecommendationCriteria, setLocalRecommendationCriteria] = useState<RecommendationCriteria>(globalRecommendationCriteria);
  const [isImageZoomed, setImageZoomed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const existingReview = useMemo(() => getReview(novel.id), [getReview, novel.id]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalRecommendationCriteria(globalRecommendationCriteria);
    if(existingReview) {
      setReviewRating(existingReview.rating);
      setReviewText(existingReview.text);
    } else {
      setReviewRating(0);
      setReviewText('');
    }
  }, [novel, globalRecommendationCriteria, existingReview]);
  
  const handleCriteriaChange = (key: keyof RecommendationCriteria) => {
    setLocalRecommendationCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const similarNovels = useMemo(() => {
    return getSimilarNovels(novel, allNovels, sortOptions, localRecommendationCriteria);
  }, [novel, allNovels, sortOptions, localRecommendationCriteria]);
  
  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  const handleOpenZoom = () => setImageZoomed(true);
  
  const handleCloseZoom = () => {
    setImageZoomed(false);
    setTimeout(() => handleResetZoom(), 200);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = 0.1;
    const newZoom = e.deltaY > 0 ? zoom - zoomFactor : zoom + zoomFactor;
    setZoom(Math.max(0.5, Math.min(newZoom, 5)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault(); e.stopPropagation();
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };

  const handleSelectSimilar = (selectedNovel: Novel) => {
    onSelectNovel(selectedNovel);
  };
  
  const handleSaveReview = () => {
    if (!user || reviewRating === 0) return;
    updateReview(novel.id, { rating: reviewRating, text: reviewText });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };
  
  const handleDeleteReview = () => {
      deleteReview(novel.id);
      setReviewRating(0);
      setReviewText('');
  }

  const isFavorited = isFavorite(novel.id);
  const isInWishlist = isWished(novel.id);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageWithLoader 
            src={novel.cover_image || `https://picsum.photos/seed/${novel.id}/400/600`} 
            alt={novel.title} 
            className="w-full md:w-1/3 h-64 md:h-auto cursor-zoom-in" 
            onClick={handleOpenZoom}
          />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold text-white mb-2 flex-1 pr-4 break-words">{novel.title}</h2>
              <div className="flex items-center gap-2 shrink-0">
                  {showBackButton && (
                      <button onClick={onGoBack} className="text-gray-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-700 transition-colors animate-fade-in" aria-label="Go back to previous novel">
                          <Icon name="ArrowLeft" size={20} />
                          <span className="text-sm hidden sm:inline">Back</span>
                      </button>
                  )}
                  <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                      <Icon name="X" size={24} />
                  </button>
              </div>
            </div>
            <p className="text-gray-400 mb-4">by {novel.author}</p>
            
            <div className="flex flex-wrap gap-4 items-center mb-4 text-sm text-gray-300">
              <div className="flex items-center gap-1"><Icon name="Star" className="w-5 h-5 text-yellow-400 fill-current" /> <span className="font-bold text-lg">{novel.rating.toFixed(1)}</span><span className="text-gray-400">({novel.rating_count} ratings)</span></div>
              <div className="flex items-center gap-1"><Icon name="BookOpen" className="w-5 h-5 text-indigo-400" /><span>{novel.chapter_count} Chapters</span></div>
              <div className="flex items-center gap-1"><Badge className={novel.status === 'Ongoing' ? 'bg-green-800 text-green-300' : 'bg-gray-700 text-gray-300'}>{novel.status}</Badge></div>
            </div>

            <div className="space-y-2 mb-4"><h4 className="font-semibold text-gray-200">Genres</h4><div className="flex flex-wrap gap-2">{novel.genres.map(g => (<button key={g} onClick={() => onAddFilter('genres', g)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-400 rounded-full transition-transform transform hover:scale-105" aria-label={`Filter by genre: ${g}`}><Badge>{g}</Badge></button>))}</div></div>
            {novel.tags.length > 0 && (<div className="space-y-2 mb-4"><h4 className="font-semibold text-gray-200">Tags</h4><div className="flex flex-wrap gap-2">{novel.tags.map(t => (<button key={t} onClick={() => onAddFilter('tags', t)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-400 rounded-full transition-transform transform hover:scale-105" aria-label={`Filter by tag: ${t}`}><Badge className="bg-gray-600 text-teal-300">{t}</Badge></button>))}</div></div>)}

            <h4 className="font-semibold text-gray-200 mt-6 mb-2">Description</h4>
            <p className="text-gray-300 leading-relaxed max-h-48 overflow-y-auto pr-2">{novel.description}</p>
            
            {user && (
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="font-semibold text-gray-200 mb-3">Your Review</h4>
                    <div className="space-y-3">
                        <StarRatingInput rating={reviewRating} setRating={setReviewRating} />
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your thoughts on this novel..."
                            className="w-full h-24 bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        ></textarea>
                        <div className="flex items-center justify-end gap-2">
                             {showSuccess && <span className="text-sm text-green-400 animate-fade-in">Review Saved!</span>}
                             {existingReview && <Button onClick={handleDeleteReview} variant="danger" className="px-3 py-1 text-sm">Delete</Button>}
                             <Button onClick={handleSaveReview} variant="primary" className="px-3 py-1 text-sm" disabled={reviewRating === 0}>Save Review</Button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="mt-6"><h4 className="font-semibold text-gray-200 mb-2">You might also like</h4><div className="mb-4 p-3 bg-gray-900/50 rounded-lg"><RecommendationTuner criteria={localRecommendationCriteria} onCriteriaChange={handleCriteriaChange} layout="horizontal"/></div>
              {similarNovels.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3">{similarNovels.map(sim => (<div key={sim.id} className="cursor-pointer group" onClick={() => handleSelectSimilar(sim)}><div className="relative"><ImageWithLoader src={sim.cover_image!} alt={sim.title} className="w-full h-32 rounded-md mb-1 group-hover:opacity-80 transition-opacity" /><Badge className="absolute top-1 right-1 bg-black bg-opacity-70 text-xs !px-2 !py-0.5 !text-green-300 flex items-center gap-1"><Icon name="Sparkles" className="w-3 h-3" />{sim.score.toFixed(1)}</Badge><Badge className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-xs !px-2 !py-0.5 !text-indigo-400 flex items-center gap-1"><Icon name="BookOpen" className="w-3 h-3" />{sim.chapter_count}</Badge></div><p className="text-xs text-center text-gray-300 truncate group-hover:text-indigo-400 transition-colors">{sim.title}</p></div>))}</div>) : (<div className="text-center py-8 bg-gray-900/30 rounded-lg"><Icon name="Lightbulb" size={32} className="mx-auto text-gray-500 mb-2" /><p className="text-gray-400 text-sm">Select one or more criteria above to see recommendations.</p></div>)}
            </div>
            
            <div className="mt-6 border-t border-gray-700 pt-4 flex items-center gap-4">
              <Button onClick={() => window.open(novel.url, '_blank')}>
                Read Now <Icon name="ExternalLink" className="inline ml-2" size={16}/>
              </Button>
              {user && settings.showFavoriteButton && (
                <Button onClick={() => toggleFavorite(novel)} variant="secondary" title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
                    <Icon name="Heart" className={`inline mr-2 transition-colors ${isFavorited ? 'text-red-500 fill-current' : ''}`} size={16}/>
                    {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
              )}
              {user && settings.showWishlistButton && (
                <Button onClick={() => toggleWishlist(novel)} variant="secondary" title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
                      <Icon name="Bookmark" className={`inline mr-2 transition-colors ${isInWishlist ? 'text-blue-400 fill-current' : ''}`} size={16}/>
                      {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isImageZoomed && (<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={handleCloseZoom} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOrLeave} onMouseLeave={handleMouseUpOrLeave} onWheel={handleWheel}><img src={novel.cover_image || `https://picsum.photos/seed/${novel.id}/400/600`} alt={`Zoomed cover for ${novel.title}`} className={`transition-transform duration-100 ease-out rounded-lg shadow-2xl ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-out'}`} style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, maxWidth: '90vw', maxHeight: '90vh', touchAction: 'none' }} onMouseDown={handleMouseDown} onClick={e => { e.stopPropagation(); if (zoom <= 1) handleCloseZoom(); }} draggable={false} /><div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gray-900/70 backdrop-blur-sm text-white rounded-lg shadow-lg flex items-center gap-2 p-2 border border-gray-700" onClick={e => e.stopPropagation()}><button onClick={handleZoomOut} className="p-2 hover:bg-gray-700 rounded-md transition-colors" title="Zoom Out"><Icon name="ZoomOut" size={20} /></button><span className="w-16 text-center text-sm font-mono select-none">{(zoom * 100).toFixed(0)}%</span><button onClick={handleZoomIn} className="p-2 hover:bg-gray-700 rounded-md transition-colors" title="Zoom In"><Icon name="ZoomIn" size={20} /></button><button onClick={handleResetZoom} className="p-2 hover:bg-gray-700 rounded-md transition-colors" title="Reset"><Icon name="RefreshCcw" size={20} /></button></div></div>)}
    </>
  );
};

export default NovelDetailModal;