import crypto from 'crypto';

// 🔒 Ensure consistent key order
const normalizeData = (data) => {
  return JSON.stringify(
    Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {}),
  );
};

export const generateHash = (data) => {
  return crypto.createHash('sha256').update(normalizeData(data)).digest('hex');
};
