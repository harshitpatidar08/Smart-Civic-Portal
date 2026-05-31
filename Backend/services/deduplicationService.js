const getKeywords = (text) => text.toLowerCase().match(/\b(\w+)\b/g) || [];

// Simple Jaccard Similarity approach
const calculateSimilarity = (text1, text2) => {
  const set1 = new Set(getKeywords(text1));
  const set2 = new Set(getKeywords(text2));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

// Returns { isDuplicate: true/false, similarityScore: number, matchedComplaintId: string }
const checkDuplicate = (newDescription, existingComplaints) => {
  let highestSimilarity = 0;
  let matchedId = null;

  for (const complaint of existingComplaints) {
    const similarity = calculateSimilarity(newDescription, complaint.description);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      matchedId = complaint.id;
    }
  }

  // Threshold of 0.6 similarity implies they are talking about the exact same things
  if (highestSimilarity >= 0.6) {
    return { isDuplicate: true, similarityScore: (highestSimilarity * 100).toFixed(2), matchedId };
  }

  return { isDuplicate: false, similarityScore: (highestSimilarity * 100).toFixed(2), matchedId: null };
};

module.exports = {
  checkDuplicate,
  calculateSimilarity
};
