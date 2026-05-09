/**
 * 分页组件
 *
 * 参数：
 *   current: 当前页码
 *   total: 总页数
 *   onChange: 页码变化时的回调函数
 */

import React from 'react';
import './Pagination.css';

const Pagination = ({ current, total, onChange }) => {
  if (total <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        上一页
      </button>

      {start > 1 && (
        <>
          <button className="page-btn" onClick={() => onChange(1)}>1</button>
          {start > 2 && <span className="page-ellipsis">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`page-btn ${page === current ? 'active' : ''}`}
          onClick={() => onChange(page)}
        >
          {page}
        </button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className="page-ellipsis">...</span>}
          <button className="page-btn" onClick={() => onChange(total)}>{total}</button>
        </>
      )}

      <button
        className="page-btn"
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
      >
        下一页
      </button>
    </div>
  );
};

export default Pagination;
