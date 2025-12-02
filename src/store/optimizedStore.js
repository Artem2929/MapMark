import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

/**
 * Оптимізований глобальний стор з Zustand
 */

// Middleware для логування в development
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Store update:', args);
      }
      set(...args);
    },
    get,
    api
  );

// Основний стор додатку
export const useAppStore = create(
  logger(
    subscribeWithSelector(
      immer(
        persist(
          (set, get) => ({
            // UI стан
            ui: {
              theme: 'system',
              sidebarOpen: false,
              loading: false,
              notifications: [],
            },
            
            // Користувач
            user: {
              isAuthenticated: false,
              profile: null,
              preferences: {},
            },
            
            // Пости
            posts: {
              items: [],
              loading: false,
              hasMore: true,
              page: 1,
            },
            
            // Дії для UI
            setTheme: (theme) => set((state) => {
              state.ui.theme = theme;
            }),
            
            toggleSidebar: () => set((state) => {
              state.ui.sidebarOpen = !state.ui.sidebarOpen;
            }),
            
            setLoading: (loading) => set((state) => {
              state.ui.loading = loading;
            }),
            
            addNotification: (notification) => set((state) => {
              state.ui.notifications.push({
                id: Date.now(),
                timestamp: new Date(),
                ...notification,
              });
            }),
            
            removeNotification: (id) => set((state) => {
              state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
            }),
            
            // Дії для користувача
            setUser: (user) => set((state) => {
              state.user.profile = user;
              state.user.isAuthenticated = !!user;
            }),
            
            updateUserPreferences: (preferences) => set((state) => {
              state.user.preferences = { ...state.user.preferences, ...preferences };
            }),
            
            logout: () => set((state) => {
              state.user.isAuthenticated = false;
              state.user.profile = null;
              state.user.preferences = {};
            }),
            
            // Дії для постів
            setPosts: (posts) => set((state) => {
              state.posts.items = posts;
            }),
            
            addPosts: (newPosts) => set((state) => {
              state.posts.items.push(...newPosts);
            }),
            
            updatePost: (postId, updates) => set((state) => {
              const index = state.posts.items.findIndex(p => p.id === postId);
              if (index !== -1) {
                Object.assign(state.posts.items[index], updates);
              }
            }),
            
            removePost: (postId) => set((state) => {
              state.posts.items = state.posts.items.filter(p => p.id !== postId);
            }),
            
            setPostsLoading: (loading) => set((state) => {
              state.posts.loading = loading;
            }),
            
            setHasMorePosts: (hasMore) => set((state) => {
              state.posts.hasMore = hasMore;
            }),
            
            incrementPostsPage: () => set((state) => {
              state.posts.page += 1;
            }),
            
            resetPosts: () => set((state) => {
              state.posts.items = [];
              state.posts.page = 1;
              state.posts.hasMore = true;
            }),
          }),
          {
            name: 'mapmark-store',
            partialize: (state) => ({
              ui: {
                theme: state.ui.theme,
              },
              user: {
                preferences: state.user.preferences,
              },
            }),
          }
        )
      )
    )
  )
);

// Селектори для оптимізації
export const useTheme = () => useAppStore(state => state.ui.theme);
export const useUser = () => useAppStore(state => state.user);
export const usePosts = () => useAppStore(state => state.posts);
export const useNotifications = () => useAppStore(state => state.ui.notifications);
export const useLoading = () => useAppStore(state => state.ui.loading);

// Хуки для дій
export const useAppActions = () => useAppStore(state => ({
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setLoading: state.setLoading,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
}));

export const useUserActions = () => useAppStore(state => ({
  setUser: state.setUser,
  updateUserPreferences: state.updateUserPreferences,
  logout: state.logout,
}));

export const usePostsActions = () => useAppStore(state => ({
  setPosts: state.setPosts,
  addPosts: state.addPosts,
  updatePost: state.updatePost,
  removePost: state.removePost,
  setPostsLoading: state.setPostsLoading,
  setHasMorePosts: state.setHasMorePosts,
  incrementPostsPage: state.incrementPostsPage,
  resetPosts: state.resetPosts,
}));