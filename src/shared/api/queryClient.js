import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        if (error?.response?.status === 401) {
          window.location.href = '/login'
        }
      }
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        if (error?.response?.status === 401) {
          window.location.href = '/login'
        }
      }
    }
  }
})
