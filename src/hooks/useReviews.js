import { useState, useEffect, useCallback } from 'react';
import ReviewService from '../services/reviewService';

let reviewsCache = null;
let isLoading = false;
let subscribers = new Set();

const useReviews = () => {
  const [reviews, setReviews] = useState(reviewsCache || []);
  const [loading, setLoading] = useState(isLoading);

  const loadReviews = useCallback(async () => {
    if (reviewsCache || isLoading) {
      return reviewsCache || [];
    }

    isLoading = true;
    subscribers.forEach(callback => callback({ loading: true }));

    try {
      const reviewsData = await ReviewService.getAllReviews();
      reviewsCache = reviewsData;
      subscribers.forEach(callback => callback({ reviews: reviewsData, loading: false }));
      return reviewsData;
    } catch (error) {
      console.error('Error loading reviews:', error);
      subscribers.forEach(callback => callback({ loading: false }));
      return [];
    } finally {
      isLoading = false;
    }
  }, []);

  useEffect(() => {
    const updateState = ({ reviews: newReviews, loading: newLoading }) => {
      if (newReviews !== undefined) setReviews(newReviews);
      if (newLoading !== undefined) setLoading(newLoading);
    };

    subscribers.add(updateState);
    
    if (!reviewsCache && !isLoading) {
      loadReviews();
    }

    return () => {
      subscribers.delete(updateState);
    };
  }, [loadReviews]);

  const addReview = useCallback((newReview) => {
    const updatedReviews = [...(reviewsCache || []), newReview];
    reviewsCache = updatedReviews;
    subscribers.forEach(callback => callback({ reviews: updatedReviews }));
  }, []);

  return { reviews, loading, loadReviews, addReview };
};

export default useReviews;