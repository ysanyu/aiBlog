/**
 * API 请求封装
 *
 * 使用 axios 库统一管理所有后端 API 请求
 *
 * 说明：
 *   - baseURL: 后端 API 的基础地址，所有请求都会加上这个前缀
 *   - interceptors: 请求拦截器，自动在请求头中添加 JWT token
 *   - 所有 API 函数都返回 Promise，使用 async/await 调用
 *
 * 使用示例：
 *   import { getPosts, login } from './api';
 *   const posts = await getPosts({ page: 1 });
 */

import axios from 'axios';

// 创建 axios 实例
// 优先使用环境变量（部署时注入），本地开发用默认地址
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
});

// ============================================================
// 请求拦截器 - 在每个请求发出前自动添加 token
// ============================================================
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 读取登录时保存的 token
    const token = localStorage.getItem('token');
    if (token) {
      // JWT 规范格式：Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 响应拦截器 - 统一处理错误
// ============================================================
api.interceptors.response.use(
  (response) => response.data, // 直接返回 data 部分，简化调用
  (error) => {
    // 401 表示 token 过期或无效，跳转到登录页
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 如果不在登录页，则跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 认证相关 API
// ============================================================

/** 用户登录 */
export const login = (data) => api.post('/auth/login', data);

/** 用户注册 */
export const register = (data) => api.post('/auth/register', data);

/** 检查 token 是否有效 */
export const checkAuth = () => api.get('/auth/check');

/** 获取当前用户信息 */
export const getProfile = () => api.get('/auth/profile');

// ============================================================
// 文章相关 API
// ============================================================

/**
 * 获取文章列表
 * @param {Object} params - 查询参数 { page, per_page, category_id, tag_id, keyword, published }
 */
export const getPosts = (params = {}) => api.get('/posts', { params });

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 */
export const getPost = (id) => api.get(`/posts/${id}`);

/** 创建文章 */
export const createPost = (data) => api.post('/posts', data);

/** 更新文章 */
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);

/** 删除文章 */
export const deletePost = (id) => api.delete(`/posts/${id}`);

// ============================================================
// 标签相关 API
// ============================================================

/** 获取所有标签 */
export const getTags = () => api.get('/tags');

/** 获取标签下的文章 */
export const getTagPosts = (tagId, params = {}) => api.get(`/tags/${tagId}/posts`, { params });

/** 创建标签 */
export const createTag = (data) => api.post('/tags', data);

/** 更新标签 */
export const updateTag = (id, data) => api.put(`/tags/${id}`, data);

/** 删除标签 */
export const deleteTag = (id) => api.delete(`/tags/${id}`);

// ============================================================
// 分类相关 API
// ============================================================

/** 获取所有分类 */
export const getCategories = () => api.get('/categories');

/** 获取分类下的文章 */
export const getCategoryPosts = (catId, params = {}) => api.get(`/categories/${catId}/posts`, { params });

/** 创建分类 */
export const createCategory = (data) => api.post('/categories', data);

/** 更新分类 */
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

/** 删除分类 */
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ============================================================
// 友链相关 API
// ============================================================

/** 获取所有友链 */
export const getLinks = () => api.get('/links');

/** 创建友链 */
export const createLink = (data) => api.post('/links', data);

/** 更新友链 */
export const updateLink = (id, data) => api.put(`/links/${id}`, data);

/** 删除友链 */
export const deleteLink = (id) => api.delete(`/links/${id}`);

// ============================================================
// 归档相关 API
// ============================================================

/** 获取归档列表 */
export const getArchives = () => api.get('/archives');

// ============================================================
// 关于页面 API
// ============================================================

/** 获取关于页面 */
export const getAbout = () => api.get('/about');

/** 更新关于页面 */
export const updateAbout = (data) => api.put('/about', data);

// ============================================================
// 统计 API
// ============================================================

/** 获取博客统计 */
export const getStats = () => api.get('/stats');

// ============================================================
// 上传 API
// ============================================================

/**
 * 上传图片
 * @param {File} file - 要上传的图片文件
 * @returns {Promise} 返回包含图片URL的响应
 */
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
