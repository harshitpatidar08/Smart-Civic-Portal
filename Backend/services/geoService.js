// Converts degrees to radians
const toRad = (value) => (value * Math.PI) / 180;

/**
 * Calculates the Haversine distance between two coordinates in meters.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in meters
 */
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Checks if a provided resolution coordinate is within the strict geo-fence of the original complaint
 * @param {number} originalLat 
 * @param {number} originalLng 
 * @param {number} resolutionLat 
 * @param {number} resolutionLng 
 * @param {number} maxDistanceMeters 
 * @returns {boolean} 
 */
const isWithinResolutionRadius = (originalLat, originalLng, resolutionLat, resolutionLng, maxDistanceMeters = 30) => {
  const distance = getDistanceInMeters(originalLat, originalLng, resolutionLat, resolutionLng);
  return distance <= maxDistanceMeters;
};

module.exports = {
  getDistanceInMeters,
  isWithinResolutionRadius
};
