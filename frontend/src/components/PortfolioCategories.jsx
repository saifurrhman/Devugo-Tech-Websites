import React, { useEffect, useState } from 'react';
import { PortfolioCategoryAPI } from '../lib/api';

export default function PortfolioCategories({ showHeader = true, onCategorySelect, activeCategory = 'All' }){
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTag, setActiveTag] = useState(activeCategory);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await PortfolioCategoryAPI.list();
        if(!mounted) return;
        const names = (items||[]).map(c => String(c.name||'').trim()).filter(Boolean);
        const uniq = Array.from(new Set(names)).slice(0, 16);
        setTags(uniq);
      }catch(err){ if(mounted) setError(err.message||'Failed to load categories'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  // Sync activeTag with activeCategory prop
  useEffect(() => {
    setActiveTag(activeCategory);
  }, [activeCategory]);

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    // Parent component ko batao ke konsi category select hui
    if (onCategorySelect) {
      onCategorySelect(tag === 'All' ? null : tag);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8" aria-label="Portfolio categories">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="flex flex-wrap gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-full w-24"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no tags
  if (error || !tags.length) return null;

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12" aria-label="Portfolio categories">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        {showHeader && (
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Explore our work
            </h2>
            <p className="text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
              Browse by category curated from portfolio tags
            </p>
          </div>
        )}

        {/* Categories/Tags - Horizontal Scroll on Mobile, Wrap on Desktop */}
        <div className="categories-scroll-wrapper">
          <div className="categories-container">
            
            {/* "All" Button */}
            <button 
              type="button" 
              className={`category-btn ${
                activeTag === 'All' ? 'active' : ''
              }`}
              onClick={() => handleTagClick('All')}
            >
              All
            </button>

            {/* Category Buttons */}
            {tags.map(tag => (
              <button 
                key={tag} 
                type="button" 
                className={`category-btn ${
                  activeTag === tag ? 'active' : ''
                }`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <style jsx>{`
          /* Mobile & Tablet: Horizontal Scroll */
          @media (max-width: 1023px) {
            .categories-scroll-wrapper {
              width: 100vw;
              position: relative;
              left: 50%;
              right: 50%;
              margin-left: -50vw;
              margin-right: -50vw;
              overflow-x: auto;
              overflow-y: hidden;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              -ms-overflow-style: none;
            }

            .categories-scroll-wrapper::-webkit-scrollbar {
              display: none;
            }

            .categories-container {
              display: flex;
              gap: 0.75rem;
              padding: 0 1rem;
              width: max-content;
            }

            .category-btn {
              flex-shrink: 0;
              white-space: nowrap;
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              font-weight: 500;
              border-radius: 0.5rem;
              border: 1px solid rgba(255, 255, 255, 0.2);
              background: rgba(255, 255, 255, 0.1);
              color: white;
              transition: all 0.3s ease;
              backdrop-filter: blur(4px);
            }

            .category-btn.active {
              background: white;
              color: rgb(30, 58, 138);
              border-color: white;
              font-weight: 600;
            }

            .category-btn:active {
              transform: scale(0.95);
            }
          }

          /* Desktop: Flex Wrap */
          @media (min-width: 1024px) {
            .categories-scroll-wrapper {
              overflow: visible;
            }

            .categories-container {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              justify-content: center;
              gap: 1rem;
            }

            .category-btn {
              padding: 0.5rem 1.25rem;
              font-weight: 500;
              border-radius: 0.5rem;
              border: 1px solid rgba(255, 255, 255, 0.2);
              background: rgba(255, 255, 255, 0.1);
              color: white;
              transition: all 0.3s ease;
              backdrop-filter: blur(4px);
              cursor: pointer;
            }

            .category-btn.active {
              background: white;
              color: rgb(30, 58, 138);
              border-color: white;
              font-weight: 600;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .category-btn:hover {
              background: white;
              color: rgb(30, 58, 138);
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
          }
        `}</style>
      </div>
    </section>
  );
}