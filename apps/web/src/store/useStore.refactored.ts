import { create } from 'zustand';
import api from '../lib/api.refactored';

interface Post {
  id: string;
  type: string;
  title: string;
  content?: string;
  author: any;
  community: any;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: number | null;
  isSaved?: boolean;
  isHidden?: boolean;
  createdAt: string;
  tags?: string[];
  flair?: any;
  isPinned?: boolean;
  isNSFW?: boolean;
  isLocked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: any;
  score: number;
  upvotes: number;
  downvotes: number;
  depth: number;
  replies: Comment[];
  userVote?: number | null;
  createdAt: string;
  isCollapsed?: boolean;
}

interface AppState {
  // Posts
  posts: Post[];
  currentPost: Post | null;
  postsLoading: boolean;
  postsError: string | null;
  
  // Comments
  comments: Record<string, Comment[]>;
  commentsLoading: boolean;
  commentsError: string | null;
  
  // UI State
  sortBy: 'hot' | 'new' | 'top' | 'rising';
  
  // Post Actions
  fetchPosts: (filters?: any) => Promise<void>;
  fetchPost: (postId: string) => Promise<void>;
  votePost: (postId: string, value: 1 | -1) => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  hidePost: (postId: string) => Promise<void>;
  
  // Comment Actions
  fetchComments: (postId: string, sortBy?: string) => Promise<void>;
  createComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  voteComment: (commentId: string, value: 1 | -1) => Promise<void>;
  collapseComment: (commentId: string) => void;
  
  // UI Actions
  setSortBy: (sort: 'hot' | 'new' | 'top' | 'rising') => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  posts: [],
  currentPost: null,
  postsLoading: false,
  postsError: null,
  
  comments: {},
  commentsLoading: false,
  commentsError: null,
  
  sortBy: 'hot',
  
  // Post Actions
  fetchPosts: async (filters = {}) => {
    set({ postsLoading: true, postsError: null });
    try {
      const { sortBy } = get();
      const result = await api.getPosts({
        sortBy,
        ...filters,
      });
      set({
        posts: result.posts,
        postsLoading: false,
      });
    } catch (error: any) {
      set({
        postsError: error.message || 'Failed to fetch posts',
        postsLoading: false,
      });
    }
  },
  
  fetchPost: async (postId) => {
    set({ postsLoading: true, postsError: null });
    try {
      const post = await api.getPost(postId);
      set({
        currentPost: post,
        postsLoading: false,
      });
    } catch (error: any) {
      set({
        postsError: error.message || 'Failed to fetch post',
        postsLoading: false,
      });
    }
  },
  
  votePost: async (postId, value) => {
    try {
      await api.votePost(postId, value);
      
      // Optimistic update
      set((state) => ({
        posts: state.posts.map((post) => {
          if (post.id === postId) {
            const oldVote = post.userVote || 0;
            const newVote = post.userVote === value ? 0 : value;
            const scoreDiff = newVote - oldVote;
            
            return {
              ...post,
              userVote: newVote === 0 ? null : newVote,
              score: post.score + scoreDiff,
              upvotes: newVote === 1 ? post.upvotes + 1 : post.upvotes - (oldVote === 1 ? 1 : 0),
              downvotes: newVote === -1 ? post.downvotes + 1 : post.downvotes - (oldVote === -1 ? 1 : 0),
            };
          }
          return post;
        }),
        currentPost: state.currentPost?.id === postId
          ? {
              ...state.currentPost,
              userVote: state.currentPost.userVote === value ? null : value,
              score: state.currentPost.score + (state.currentPost.userVote === value ? -value : value - (state.currentPost.userVote || 0)),
            }
          : state.currentPost,
      }));
    } catch (error: any) {
      console.error('Vote error:', error);
      // Revert optimistic update by refetching
      get().fetchPosts();
    }
  },
  
  savePost: async (postId) => {
    try {
      await api.savePost(postId);
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, isSaved: !post.isSaved } : post
        ),
      }));
    } catch (error: any) {
      console.error('Save error:', error);
    }
  },
  
  hidePost: async (postId) => {
    try {
      await api.hidePost(postId);
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, isHidden: !post.isHidden } : post
        ),
      }));
    } catch (error: any) {
      console.error('Hide error:', error);
    }
  },
  
  // Comment Actions
  fetchComments: async (postId, sortBy = 'best') => {
    set({ commentsLoading: true, commentsError: null });
    try {
      const comments = await api.getComments(postId, sortBy);
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: comments,
        },
        commentsLoading: false,
      }));
    } catch (error: any) {
      set({
        commentsError: error.message || 'Failed to fetch comments',
        commentsLoading: false,
      });
    }
  },
  
  createComment: async (postId, content, parentId) => {
    try {
      await api.createComment({ postId, content, parentId });
      // Refetch comments after creating
      await get().fetchComments(postId);
    } catch (error: any) {
      set({
        commentsError: error.message || 'Failed to create comment',
      });
      throw error;
    }
  },
  
  voteComment: async (commentId, value) => {
    try {
      await api.voteComment(commentId, value);
      
      // Optimistic update
      set((state) => {
        const updateCommentVote = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === commentId) {
              const oldVote = comment.userVote || 0;
              const newVote = comment.userVote === value ? 0 : value;
              const scoreDiff = newVote - oldVote;
              
              return {
                ...comment,
                userVote: newVote === 0 ? null : newVote,
                score: comment.score + scoreDiff,
                upvotes: newVote === 1 ? comment.upvotes + 1 : comment.upvotes - (oldVote === 1 ? 1 : 0),
                downvotes: newVote === -1 ? comment.downvotes + 1 : comment.downvotes - (oldVote === -1 ? 1 : 0),
              };
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentVote(comment.replies),
              };
            }
            return comment;
          });
        };
        
        const newComments = { ...state.comments };
        Object.keys(newComments).forEach((postId) => {
          newComments[postId] = updateCommentVote(newComments[postId]);
        });
        
        return { comments: newComments };
      });
    } catch (error: any) {
      console.error('Vote comment error:', error);
    }
  },
  
  collapseComment: (commentId) => {
    set((state) => {
      const toggleCollapse = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, isCollapsed: !comment.isCollapsed };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: toggleCollapse(comment.replies) };
          }
          return comment;
        });
      };
      
      const newComments = { ...state.comments };
      Object.keys(newComments).forEach((postId) => {
        newComments[postId] = toggleCollapse(newComments[postId]);
      });
      
      return { comments: newComments };
    });
  },
  
  // UI Actions
  setSortBy: (sortBy) => {
    set({ sortBy });
    get().fetchPosts();
  },
  
  clearError: () => {
    set({ postsError: null, commentsError: null });
  },
}));
