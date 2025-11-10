import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioCategoryAPI } from '../lib/api';

export default function PortfolioCategories({ showHeader = true }){
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const goToTag = (tag) => {
    navigate(`/portfolio?tag=${encodeURIComponent(tag)}`);
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

  // Don't render if no tags (but don't hide completely)
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

        {/* Categories/Tags Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
          
          {/* "All" Button */}
          <button 
            type="button" 
            className="px-4 py-2 lg:px-5 lg:py-2 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            onClick={()=>navigate('/portfolio')}
          >
            All
          </button>

          {/* Category Buttons */}
          {tags.map(tag => (
            <button 
              key={tag} 
              type="button" 
              className="px-4 py-2 lg:px-5 lg:py-2 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              onClick={()=>goToTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}