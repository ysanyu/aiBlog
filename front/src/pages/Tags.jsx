/**
 * 标签页 - 展示标签云，点击可筛选文章
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { getTags, getTagPosts } from '../api';

const Tags = () => {
  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('tag');
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTags().then(res => {
      if (res.code === 200) setTags(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (tagId) {
      setLoading(true);
      getTagPosts(tagId)
        .then(res => {
          if (res.code === 200) {
            setPosts(res.data.posts);
            setSelectedTag(res.data.tag);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setPosts([]);
      setSelectedTag(null);
      setLoading(false);
    }
  }, [tagId]);

  return (
    <div className="page-tags">
      <h1 className="page-title">标签</h1>

      {/* 标签云 */}
      <div className="tag-cloud">
        {tags.map(tag => (
          <Link
            key={tag.id}
            to={tagId === String(tag.id) ? '/tags' : `/tags?tag=${tag.id}`}
            className={`tag-item ${tagId === String(tag.id) ? 'active' : ''}`}
          >
            {tag.name}
            <span className="tag-count">{tag.post_count}</span>
          </Link>
        ))}
      </div>

      {/* 选中标签下的文章 */}
      {selectedTag && (
        <div className="tag-posts">
          <h2 className="section-title">「{selectedTag.name}」下的文章</h2>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="empty">该标签下暂无文章</div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Tags;
