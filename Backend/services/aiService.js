/**
 * AI-Powered Priority Triage (Rule-based implementation for free-tier constraints)
 * Assigns category and priority purely on descriptive text analysis keywords.
 */

const analyzeComplaint = (text) => {
  const lowercaseText = text.toLowerCase();
  
  let category = 'Others';
  let priority_score = 1; // Default low priority

  const keywordMap = {
    'Emergency & Hazard': {
      keywords: ['fire', 'accident', 'open manhole', 'wire', 'electrocution', 'collapse', 'gas leak', 'danger'],
      basePriority: 9,
      category: 'Infrastructure & Safety' // Mapping general category overarching hazard
    },
    'Water & Sanitation': {
      keywords: ['water leakage', 'sewage', 'drainage', 'no water', 'overflow', 'plumbing', 'pipe block'],
      basePriority: 7,
      category: 'Water & Sanitation'
    },
    'Waste Management': {
      keywords: ['garbage', 'trash', 'litter', 'waste bin', 'cleaning', 'dump'],
      basePriority: 5,
      category: 'Waste Management'
    },
    'Roads & Transport': {
      keywords: ['pothole', 'street light', 'traffic signal', 'road broken', 'pavement'],
      basePriority: 6,
      category: 'Roads & Transport'
    }
  };

  let highestMatchedPriority = priority_score;
  let finalCategory = category;

  for (const [groupName, data] of Object.entries(keywordMap)) {
    const isMatch = data.keywords.some((kw) => lowercaseText.includes(kw));
    if (isMatch && data.basePriority > highestMatchedPriority) {
      highestMatchedPriority = data.basePriority;
      finalCategory = data.category;
    }
  }

  // Add 1 point extra if urgency words used
  const urgentModifiers = ['urgent', 'immediately', 'critical', 'severe', 'fast'];
  const hasUrgentModifier = urgentModifiers.some((mod) => lowercaseText.includes(mod));
  
  if (hasUrgentModifier && highestMatchedPriority < 10) {
    highestMatchedPriority += 1;
  }

  return {
    category: finalCategory,
    priority_score: highestMatchedPriority
  };
};

module.exports = {
  analyzeComplaint
};
