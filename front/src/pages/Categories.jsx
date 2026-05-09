/**
 * 分类页 - 展示所有分类及其文章数
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { getCategories, getCategoryPosts } from '../api';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const catId = searchParams.get('cat');
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(res => {
      if (res.code === 200) setCategories(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (catId) {
      setLoading(true);
      getCategoryPosts(catId)
        .then(res => {
          if (res.code === 200) {
            setPosts(res.data.posts);
            setSelectedCat(res.data.category);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setPosts([]);
      setSelectedCat(null);
      setLoading(false);
    }
  }, [catId]);

  return (
    <div className="page-categories">
      <h1 className="page-title">分类</h1>

      <div className="category-list">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={catId === String(cat.id) ? '/categories' : `/categories?cat=${cat.id}`}
            className={`category-item ${catId === String(cat.id) ? 'active' : ''}`}
          >
            <span className="cat-name">{cat.name}</span>
            <span className="cat-count">{cat.post_count} 篇</span>
          </Link>
        ))}
      </div>

      {selectedCat && (
        <div className="category-posts">
          <h2 className="section-title">「{selectedCat.name}」下的文章</h2>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="empty">该分类下暂无文章</div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
