import * as turf from '@turf/turf';
import { COLLEGE_TERRITORY } from '../config/territory';
export const TERRITORY_POLYGON = COLLEGE_TERRITORY;

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

function areValidCoordinates(lat, lng) {
  return isFiniteNumber(lat) && isFiniteNumber(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {boolean}
 */
export function isPointInTerritory(lat, lng) {
  if (!areValidCoordinates(lat, lng)) return false;
  const point = turf.point([lng, lat]);
  return turf.booleanPointInPolygon(point, TERRITORY_POLYGON);
}

/** 
 * @param {number} lat
 * @param {number} lng
 * @returns {number}
 */
export function getAngleFromCenter(lat, lng) {
  if (!areValidCoordinates(lat, lng)) return NaN;
  const center = turf.centroid(TERRITORY_POLYGON);
  const point = turf.point([lng, lat]);
  
  const dx = point.geometry.coordinates[0] - center.geometry.coordinates[0];
  const dy = point.geometry.coordinates[1] - center.geometry.coordinates[1];
  
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  angle = (angle + 360) % 360;
  
  return angle;
}

/**
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Dist in m not mm
 */
export function getDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
  if (!areValidCoordinates(lat1, lng1) || !areValidCoordinates(lat2, lng2)) return NaN;
  const point1 = turf.point([lng1, lat1]);
  const point2 = turf.point([lng2, lat2]);
  const distance = turf.distance(point1, point2, { units: 'meters' });
  return distance;
}

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {number}
 */
export function getDistanceFromCenter(lat, lng) {
  if (!areValidCoordinates(lat, lng)) return NaN;
  const center = turf.centroid(TERRITORY_POLYGON);
  const point = turf.point([lng, lat]);
  const distance = turf.distance(center, point, { units: 'meters' });
  return distance;
}

/**
 * @returns {object} {minLng,minLat,maxLng,maxLat}
 */
export function getTerritoryBounds() {
  const bbox = turf.bbox(TERRITORY_POLYGON);
  return {
    minLng: bbox[0],
    minLat: bbox[1],
    maxLng: bbox[2],
    maxLat: bbox[3]
  };
}
