import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Ads store using Zustand for state management
 */
export const useAdsStore = create(
  persist(
    (set, get) => ({
      // State
      ads: [],
      filters: {
        location: '',
        category: '',
        dateFrom: '',
        dateTo: '',
        priceMin: '',
        priceMax: '',
        rating: 0,
        hasPhotos: false,
      },
      loading: false,
      error: null,

      // Actions
      addAd: (ad) => {
        const newAd = {
          ...ad,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          ads: [...state.ads, newAd],
        }));
      },

      removeAd: (id) => {
        set((state) => ({
          ads: state.ads.filter((ad) => ad.id !== id),
        }));
      },

      updateAd: (id, updates) => {
        set((state) => ({
          ads: state.ads.map((ad) =>
            ad.id === id ? { ...ad, ...updates } : ad
          ),
        }));
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            location: '',
            category: '',
            dateFrom: '',
            dateTo: '',
            priceMin: '',
            priceMax: '',
            rating: 0,
            hasPhotos: false,
          },
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Computed values
      getFilteredAds: () => {
        const { ads, filters } = get();
        return ads.filter((ad) => {
          if (filters.location && !ad.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
          }
          if (filters.category && ad.category !== filters.category) {
            return false;
          }
          if (filters.dateFrom && new Date(ad.createdAt) < new Date(filters.dateFrom)) {
            return false;
          }
          if (filters.dateTo && new Date(ad.createdAt) > new Date(filters.dateTo)) {
            return false;
          }
          if (filters.hasPhotos && (!ad.photos || ad.photos.length === 0)) {
            return false;
          }
          return true;
        });
      },
    }),
    {
      name: 'ads-storage',
      partialize: (state) => ({ ads: state.ads }),
    }
  )
);