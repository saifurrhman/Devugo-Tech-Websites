import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BlogAPI } from '../lib/api';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Blog Detail - Devugo Tech';
    window.scrollTo(0, 0);
  }, [id]);

  // Track reading progress
  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress((scrolled / height) * 100);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      setLoading(true);
      setError('');
      
      try {
        const { post: fetchedPost } = await BlogAPI.get(id);
        
        if (!mounted) return;
        
        setPost(fetchedPost);
        
        if (fetchedPost?.title) {
          document.title = `${fetchedPost.title} - Devugo Tech Blog`;
        }

        const { posts: allPosts } = await BlogAPI.list();
        
        if (!mounted) return;

        const recent = allPosts
          .filter(p => p._id !== id)
          .slice(0, 5);
        setRecentPosts(recent);

        if (fetchedPost?.categories?.length > 0) {
          const related = allPosts
            .filter(p => 
              p._id !== id && 
              p.categories?.some(cat => 
                fetchedPost.categories.some(c => 
                  (c._id || c) === (cat._id || cat)
                )
              )
            )
            .slice(0, 3);
          setRelatedPosts(related);
        }

        const allCategories = allPosts.reduce((acc, p) => {
          if (p.categories) {
            p.categories.forEach(cat => {
              const catId = cat._id || cat;
              const catName = cat.name || cat;
              if (!acc.find(c => (c._id || c) === catId)) {
                acc.push({ _id: catId, name: catName });
              }
            });
          }
          return acc;
        }, []);
        setCategories(allCategories);

      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load blog post');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => { mounted = false };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareOnSocial = (platform) => {
    const url = window.location.href;
    const text = post?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${searchQuery}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid rgba(255,255,255,0.2)', 
              borderTop: '4px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#fff' }}>Loading blog post...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <main className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
          <div style={{ textAlign: 'center', padding: '0 1rem' }}>
            <h2 style={{ color: '#fff' }}>Blog Post Not Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '1rem 0' }}>
              {error || 'The blog post you are looking for does not exist'}
            </p>
            <button 
              onClick={() => navigate('/blog')} 
              className="btn"
              style={{ marginTop: '1rem', background: '#0f2b5b', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              Back to Blog
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .blog-detail-container {
          padding: 2rem 0 4rem;
        }

        @media (max-width: 768px) {
          .blog-detail-container {
            padding: 1rem 0 2rem;
          }
        }

        .blog-detail-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 1024px) {
          .blog-detail-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .blog-detail-layout {
            margin-top: 1rem;
            gap: 1.5rem;
          }
        }

        .blog-content-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2.5rem;
          color: #fff;
        }

        @media (max-width: 768px) {
          .blog-content-card {
            padding: 1.5rem;
            border-radius: 12px;
          }
        }

        @media (max-width: 480px) {
          .blog-content-card {
            padding: 1rem;
          }
        }

        .blog-sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        @media (max-width: 1024px) {
          .blog-sidebar {
            position: static;
          }
        }

        .sidebar-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        @media (max-width: 768px) {
          .sidebar-card {
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1rem;
          }
        }

        .sidebar-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: #fff;
        }

        @media (max-width: 768px) {
          .sidebar-card h3 {
            font-size: 1rem;
          }
        }

        .search-form {
          display: flex;
          gap: 0.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .search-input {
            padding: 0.6rem;
            font-size: 0.85rem;
          }
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .search-btn {
          padding: 0.75rem 1rem;
          background: #0f2b5b;
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .search-btn {
            padding: 0.6rem 0.8rem;
          }
        }

        .search-btn:hover {
          background: #1a3d78;
        }

        .category-chip {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 0.85rem;
          margin: 0.25rem;
          cursor: pointer;
          text-decoration: none;
          color: #fff;
          transition: all 0.2s;
        }

        @media (max-width: 768px) {
          .category-chip {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }

        .category-chip:hover {
          background: #0f2b5b;
          border-color: #0f2b5b;
        }

        .recent-post-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          color: #fff;
          transition: all 0.2s;
          margin-bottom: 0.75rem;
        }

        @media (max-width: 768px) {
          .recent-post-item {
            padding: 0.5rem;
            gap: 0.5rem;
          }
        }

        .recent-post-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .recent-post-img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .recent-post-img {
            width: 70px;
            height: 50px;
          }
        }

        .recent-post-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #fff;
        }

        @media (max-width: 768px) {
          .recent-post-content h4 {
            font-size: 0.85rem;
          }
        }

        .recent-post-date {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 768px) {
          .recent-post-date {
            font-size: 0.75rem;
          }
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .back-button {
            margin-bottom: 1rem;
            font-size: 0.9rem;
          }
        }

        .back-button:hover {
          color: #fff;
        }

        .breadcrumb {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          overflow-x: auto;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .breadcrumb {
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }
        }

        .blog-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
          margin: 1.5rem 0;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .blog-meta {
            gap: 1rem;
            margin: 1rem 0;
            padding: 0.75rem 0;
          }
        }

        .blog-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .blog-meta span {
            font-size: 0.85rem;
            gap: 0.4rem;
          }
        }

        .blog-content-card img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
        }

        @media (max-width: 768px) {
          .blog-content-card img {
            border-radius: 8px;
            margin: 1rem 0;
          }
        }

        .blog-content-card h1 {
          margin-top: 0;
          margin-bottom: 1rem;
          fontSize: 2.5rem;
          line-height: 1.2;
          color: #fff;
        }

        @media (max-width: 768px) {
          .blog-content-card h1 {
            font-size: 1.75rem !important;
          }
        }

        @media (max-width: 480px) {
          .blog-content-card h1 {
            font-size: 1.5rem !important;
          }
        }

        .blog-content-card h2,
        .blog-content-card h3,
        .blog-content-card h4,
        .blog-content-card h5 {
          color: #fff;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .blog-content-card h2 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
          }
          
          .blog-content-card h3 {
            font-size: 1.25rem;
            margin-top: 1.5rem;
          }
          
          .blog-content-card h4 {
            font-size: 1.1rem;
          }
        }

        .blog-content-card p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 1.05rem;
        }

        @media (max-width: 768px) {
          .blog-content-card p {
            font-size: 0.95rem;
            line-height: 1.7;
          }
        }

        .blog-excerpt {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .blog-excerpt {
            font-size: 1.05rem;
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 480px) {
          .blog-excerpt {
            font-size: 0.95rem;
          }
        }

        .blog-content-card ul,
        .blog-content-card ol {
          color: rgba(255, 255, 255, 0.8);
          margin: 1rem 0;
          padding-left: 2rem;
        }

        @media (max-width: 768px) {
          .blog-content-card ul,
          .blog-content-card ol {
            padding-left: 1.5rem;
          }
        }

        .blog-content-card li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .blog-content-card blockquote {
          border-left: 4px solid #0f2b5b;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 768px) {
          .blog-content-card blockquote {
            padding-left: 0.75rem;
            margin: 1rem 0;
            border-left-width: 3px;
          }
        }

        .blog-content-card pre {
          background: rgba(0, 0, 0, 0.3);
          color: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .blog-content-card pre {
            padding: 0.75rem;
            font-size: 0.85rem;
            margin: 1rem 0;
          }
        }

        .share-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin: 2rem 0;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .share-buttons {
            gap: 0.6rem;
            margin: 1.5rem 0;
            padding: 1rem 0;
          }
        }

        .share-button {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .share-button {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
        }

        .share-button:hover {
          transform: translateY(-3px);
        }

        @media (max-width: 768px) {
          .share-button:hover {
            transform: translateY(-2px);
          }
        }

        .share-button.facebook {
          background: #1877f2;
          color: white;
        }

        .share-button.twitter {
          background: #1da1f2;
          color: white;
        }

        .share-button.linkedin {
          background: #0077b5;
          color: white;
        }

        .share-button.whatsapp {
          background: #25d366;
          color: white;
        }

        .share-button.copy {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }

        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
            margin: 1.5rem 0;
          }
        }

        @media (max-width: 480px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }

        .gallery-grid img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        @media (max-width: 768px) {
          .gallery-grid img {
            height: 150px;
          }
        }

        @media (max-width: 480px) {
          .gallery-grid img {
            height: 120px;
          }
        }

        .gallery-grid img:hover {
          transform: scale(1.05);
        }

        .related-posts-section {
          margin-top: 3rem;
        }

        @media (max-width: 768px) {
          .related-posts-section {
            margin-top: 2rem;
          }
        }

        .related-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .related-posts-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-top: 1rem;
          }
        }

        .related-post-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: #fff;
          transition: all 0.3s;
        }

        .related-post-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 768px) {
          .related-post-card:hover {
            transform: translateY(-2px);
          }
        }

        .related-post-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .related-post-card img {
            height: 180px;
          }
        }

        .related-post-card-content {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .related-post-card-content {
            padding: 1rem;
          }
        }

        .related-post-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #fff;
        }

        @media (max-width: 768px) {
          .related-post-card h3 {
            font-size: 1rem;
          }
        }

        .related-post-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .related-post-card p {
            font-size: 0.85rem;
          }
        }

        .reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          background: #0f2b5b;
          z-index: 1000;
          transition: width 0.2s;
        }
      `}</style>

      <Navbar />

      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readProgress}%` }}></div>

      <main className="container blog-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0.5rem' }}>/</span>
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Blog</Link>
          <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0.5rem' }}>/</span>
          <span style={{ color: '#fff' }}>{post.title}</span>
        </div>

        <Link to="/blog" className="back-button">
          <span>←</span>
          <span>Back to Blog</span>
        </Link>

        <div className="blog-detail-layout">
          {/* Main Content */}
          <div>
            <div className="blog-content-card">
              {/* Featured Image */}
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxHeight: '500px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    marginTop: 0
                  }}
                />
              )}

              {/* Title */}
              <h1 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '2.5rem', lineHeight: '1.2', color: '#fff' }}>
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="blog-excerpt">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="blog-meta">
                {post.publishedAt && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {formatDate(post.publishedAt)}
                  </span>
                )}
                {post.author && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {post.author}
                  </span>
                )}
                {post.categories && post.categories.length > 0 && (
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {post.categories.map(cat => cat.name || cat).join(', ')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div 
                style={{ fontSize: '1.05rem', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Gallery */}
              {post.galleryImages && post.galleryImages.length > 0 && (
                <div className="gallery-grid">
                  {post.galleryImages.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Gallery ${idx + 1}`}
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <strong style={{ color: '#fff' }}>Tags: </strong>
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="category-chip" style={{ cursor: 'default' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <div>
                <strong style={{ color: '#fff' }}>Share this post:</strong>
                <div className="share-buttons">
                  <button className="share-button facebook" onClick={() => shareOnSocial('facebook')} title="Share on Facebook">
                    <span>f</span>
                  </button>
                  <button className="share-button twitter" onClick={() => shareOnSocial('twitter')} title="Share on Twitter">
                    <span>𝕏</span>
                  </button>
                  <button className="share-button linkedin" onClick={() => shareOnSocial('linkedin')} title="Share on LinkedIn">
                    <span>in</span>
                  </button>
                  <button className="share-button whatsapp" onClick={() => shareOnSocial('whatsapp')} title="Share on WhatsApp">
                    <span>W</span>
                  </button>
                  <button className="share-button copy" onClick={copyLink} title="Copy link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="related-posts-section">
                <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Related Posts</h2>
                <div className="related-posts-grid">
                  {relatedPosts.map(related => (
                    <Link 
                      key={related._id} 
                      to={`/blog/${related._id}`}
                      className="related-post-card"
                    >
                      {related.coverImage && (
                        <img src={related.coverImage} alt={related.title} />
                      )}
                      <div className="related-post-card-content">
                        <h3>{related.title}</h3>
                        {related.excerpt && <p>{related.excerpt}</p>}
                        <small className="recent-post-date">
                          {formatDate(related.publishedAt)}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            {/* Search Box */}
            <div className="sidebar-card">
              <h3>Search</h3>
              <form onSubmit={handleSearch} className="search-form">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </form>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="sidebar-card">
                <h3>Categories</h3>
                <div>
                  {categories.map(cat => (
                    <Link 
                      key={cat._id || cat.name} 
                      to={`/blog?category=${cat._id || cat.name}`}
                      className="category-chip"
                    >
                      {cat.name || cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div className="sidebar-card">
                <h3>Recent Posts</h3>
                <div>
                  {recentPosts.map(recent => (
                    <Link 
                      key={recent._id}
                      to={`/blog/${recent._id}`}
                      className="recent-post-item"
                    >
                      {recent.coverImage && (
                        <img 
                          src={recent.coverImage} 
                          alt={recent.title}
                          className="recent-post-img"
                        />
                      )}
                      <div className="recent-post-content">
                        <h4>{recent.title}</h4>
                        <span className="recent-post-date">
                          {formatDate(recent.publishedAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}