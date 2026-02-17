// backend/utils/calculateAverageRating.js
export default function calculateAverageRating(reviews = []) {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0.0;

  const total = reviews.reduce((sum, r) => sum + (Number(r?.rating) || 0), 0);
  return Number((total / reviews.length).toFixed(1));
}
