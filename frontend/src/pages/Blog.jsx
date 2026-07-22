import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BlogHeroSection from '../components/BlogHeroSection';  
import Footer from '../components/Footer';
import { BlogAPI } from '../lib/api';
import SEO from '../components/SEO';

export default function Blog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  
  // Pagination - 10 posts per page
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const postsPerPage = 10; // Changed from 9 to 10

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const { posts: fetchedPosts } = await BlogAPI.list();
        if (mounted) setPosts(fetchedPosts || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load posts');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false };
  }, []);

  // Get unique categories from posts
  const categories = useMemo(() => {
    const allCategories = posts.reduce((acc, post) => {
      if (post.categories) {
        post.categories.forEach(cat => {
          const catId = cat._id || cat;
          const catName = cat.name || cat;
          if (!acc.find(c => (c._id || c) === catId)) {
            acc.push({ _id: catId, name: catName });
          }
        });
      }
      return acc;
    }, []);
    return allCategories;
  }, [posts]);

  // Get popular posts (most recent for now)
  const popularPosts = useMemo(() => {
    return [...posts].slice(0, 5);
  }, [posts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.categories?.some(cat => 
          (cat._id || cat) === selectedCategory || 
          (cat.name || cat) === selectedCategory
        )
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [posts, selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Handle blog card click
  const handleBlogClick = (postId) => {
    navigate(`/blog/${postId}`);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset page on search
    setSearchParams(params);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    const params = new URLSearchParams(searchParams);
    if (category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset page on category change
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const params = new URLSearchParams(searchParams);
    if (pageNumber > 1) {
      params.set('page', pageNumber.toString());
    } else {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show max 5 page numbers at a time
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <>
      <SEO
        title="Devugo Tech Blog | AI, SaaS & Web Development Insights"
        description="Read the latest insights on AI automation, SaaS development, and modern web technologies from the Devugo Tech team."
        url="/blog"
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .blog-container {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }

        .blog-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 1024px) {
          .blog-layout {
            grid-template-columns: 1fr;
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          color: #fff;
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

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
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

        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .category-button {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          color: #fff;
        }

        .category-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .category-button.active {
          background: #0f2b5b;
          border-color: #0f2b5b;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
        }

        .blog-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
        }

        .blog-card-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .blog-card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .blog-card-category {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(15, 43, 91, 0.8);
          color: #fff;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-bottom: 0.75rem;
          width: fit-content;
        }

        .blog-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
          color: #fff;
        }

        .blog-card-excerpt {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1rem;
          line-height: 1.6;
          flex: 1;
          font-size: 0.95rem;
        }

        .blog-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .blog-card-readmore {
          color: #4a9eff;
          font-weight: 600;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .pagination-button {
          min-width: 40px;
          height: 40px;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-button:hover:not(:disabled):not(.ellipsis) {
          background: rgba(255, 255, 255, 0.15);
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-button.active {
          background: #0f2b5b;
          border-color: #0f2b5b;
          font-weight: 600;
        }

        .pagination-button.ellipsis {
          cursor: default;
          background: transparent;
          border: none;
        }

        .results-count {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: #fff;
        }

        .no-results h3 {
          margin-top: 0;
          color: #fff;
        }

        .no-results p {
          color: rgba(255, 255, 255, 0.7);
          margin: 1rem 0;
        }

        .popular-post-item {
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

        .popular-post-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .popular-post-img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .popular-post-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #fff;
        }

        .popular-post-date {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
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

        .category-chip:hover,
        .category-chip.active {
          background: #0f2b5b;
          border-color: #0f2b5b;
        }
      `}</style>

      <Navbar />
      <BlogHeroSection />
      
      <main className="container blog-container">
        <div className="blog-layout">
          {/* Main Content */}
          <div>
            {/* Filters Card */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={handleSearch}
              />
              
              <div className="category-filter">
                <button
                  className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  All Posts
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id || cat.name}
                    className={`category-button ${selectedCategory === (cat._id || cat.name) ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat._id || cat.name)}
                  >
                    {cat.name || cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            {!loading && !error && (
              <div className="results-count">
                Showing {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, filteredPosts.length)} of {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner" style={{ 
                  width: '50px', 
                  height: '50px', 
                  border: '4px solid rgba(255,255,255,0.2)', 
                  borderTop: '4px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ color: '#fff' }}>Loading posts...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
                {error}
              </div>
            )}

            {/* Blog Posts Grid */}
            {!loading && !error && (
              <>
                {currentPosts.length > 0 ? (
                  <div className="blog-grid">
                    {currentPosts.map(post => (
                      <article
                        key={post._id}
                        className="blog-card"
                        onClick={() => handleBlogClick(post._id)}
                      >
                        {post.coverImage && (
                          <img 
                            src={post.coverImage} 
                            alt={post.title}
                            className="blog-card-image"
                          />
                        )}
                        
                        <div className="blog-card-content">
                          {post.categories && post.categories.length > 0 && (
                            <span className="blog-card-category">
                              {post.categories[0].name || post.categories[0]}
                            </span>
                          )}
                          
                          <h3 className="blog-card-title">{post.title}</h3>
                          
                          {post.excerpt && (
                            <p className="blog-card-excerpt">
                              {post.excerpt.length > 120 
                                ? post.excerpt.substring(0, 120) + '...' 
                                : post.excerpt}
                            </p>
                          )}
                          
                          <div className="blog-card-meta">
                            <span>{formatDate(post.publishedAt)}</span>
                            <span className="blog-card-readmore">
                              Read more →
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <h3>No posts found</h3>
                    <p>
                      {searchQuery || selectedCategory !== 'all'
                        ? 'Try adjusting your filters or search query'
                        : 'No blog posts available yet. Check back soon!'}
                    </p>
                    {(searchQuery || selectedCategory !== 'all') && (
                      <button 
                        className="category-button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSearchParams(new URLSearchParams());
                        }}
                        style={{ marginTop: '1rem', padding: '0.75rem 1.5rem' }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    {/* Previous Button */}
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Previous page"
                    >
                      ← Prev
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="pagination-button ellipsis">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                          title={`Go to page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      className="pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Next page"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            {/* Categories Card */}
            {categories.length > 0 && (
              <div className="sidebar-card">
                <h3>Categories</h3>
                <div>
                  <div
                    className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    All Posts
                  </div>
                  {categories.map(cat => (
                    <div
                      key={cat._id || cat.name}
                      className={`category-chip ${selectedCategory === (cat._id || cat.name) ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat._id || cat.name)}
                    >
                      {cat.name || cat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Posts Card */}
            {popularPosts.length > 0 && (
              <div className="sidebar-card">
                <h3>Popular Posts</h3>
                <div>
                  {popularPosts.map(post => (
                    <div
                      key={post._id}
                      className="popular-post-item"
                      onClick={() => handleBlogClick(post._id)}
                    >
                      {post.coverImage && (
                        <img 
                          src={post.coverImage} 
                          alt={post.title}
                          className="popular-post-img"
                        />
                      )}
                      <div className="popular-post-content">
                        <h4>{post.title}</h4>
                        <span className="popular-post-date">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                    </div>
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