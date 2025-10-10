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

  if (loading || error || !tags.length) return null;

  return (
    <section className="container" style={{marginTop:'1.25rem'}} aria-label="Portfolio categories">
      <div className="pf-cat">
        {showHeader && (
          <div className="pf-cat-head">
            <h2 className="pf-cat-title">Explore our work</h2>
            <p className="pf-cat-sub">Browse by category curated from portfolio tags</p>
          </div>
        )}
        <div className="pf-cat-wrap">
          <button type="button" className="pf-chip pf-chip-all" onClick={()=>navigate('/portfolio')}>All</button>
          {tags.map(tag => (
            <button key={tag} type="button" className="pf-chip" onClick={()=>goToTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
