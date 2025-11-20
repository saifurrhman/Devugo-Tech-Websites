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
                    <div style={{ textAlign: 'center' }}>
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
          padding-top: 3rem;
          padding-bottom: 4rem;
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

        .blog-sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
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

        .sidebar-card h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: #fff;
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

        .recent-post-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #fff;
        }

        .recent-post-date {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }

        .back-button:hover {
          color: #fff;
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

        .blog-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .blog-content-card img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
        }

        .blog-content-card h1,
        .blog-content-card h2,
        .blog-content-card h3,
        .blog-content-card h4,
        .blog-content-card h5 {
          color: #fff;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content-card p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .blog-content-card ul,
        .blog-content-card ol {
          color: rgba(255, 255, 255, 0.8);
          margin: 1rem 0;
          padding-left: 2rem;
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

        .blog-content-card pre {
          background: rgba(0, 0, 0, 0.3);
          color: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .share-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin: 2rem 0;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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

        .share-button:hover {
          transform: translateY(-3px);
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

        .gallery-grid img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .gallery-grid img:hover {
          transform: scale(1.05);
        }

        .related-posts-section {
          margin-top: 3rem;
        }

        .related-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
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

        .related-post-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .related-post-card-content {
          padding: 1.5rem;
        }

        .related-post-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #fff;
        }

        .related-post-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
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
                <div style={{ marginBottom: '1rem' }}>
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
                                <p style={{
                                    fontSize: '1.2rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    marginBottom: '1.5rem',
                                    lineHeight: '1.6'
                                }}>
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Meta Information */}
                            <div className="blog-meta">
                                {post.publishedAt && (
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 6v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        {formatDate(post.publishedAt)}
                                    </span>
                                )}
                                {post.author && (
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                                            <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        {post.author}
                                    </span>
                                )}
                                {post.categories && post.categories.length > 0 && (
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                                            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" />
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
                                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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