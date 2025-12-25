// Region management utilities
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import * as turf from '@turf/turf';

const REGIONS_COLLECTION = 'regions';
const REGION_LOCK_DURATION_MS = 30 * 60 * 1000; 

/**
 * @param {string} ownerTeam 
 * @param {string} userId 
  * @param {array} pathPoints 
  * @returns {Promise<string>} */
export async function createCapturedRegion(ownerTeam, userId, pathPoints) {
  try {
    const ring = pathPoints.map(p => [p.lng, p.lat]);
    ring.push(ring[0]);
    
    const polygon = {
      type: 'Polygon',
      coordinates: [ring]
    };

    const regionData = {
      ownerTeam,
      capturedBy: userId,
      polygonData: JSON.stringify(polygon), 
      captureTime: Timestamp.now(),
      lockedUntil: Timestamp.fromMillis(Date.now() + REGION_LOCK_DURATION_MS),
      isLocked: true,
      areaM2: turf.area(turf.polygon([ring])),
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, REGIONS_COLLECTION), regionData);
    console.log('✓ Region created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating region:', error);
    throw error;
  }
}

/**
 * @returns {Promise<array>} 
 */
export async function getActiveRegions() {
  try {
    const q = query(
      collection(db, REGIONS_COLLECTION),
      where('lockedUntil', '>', Timestamp.now())
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}

/**
 * @param {object} region
 * @returns {boolean}
 */
export function isRegionLocked(region) {
  if (!region.lockedUntil) return false;
  const now = Date.now();
  const lockTime = region.lockedUntil.toMillis ? region.lockedUntil.toMillis() : region.lockedUntil;
  return lockTime > now;
}

/**
 * @param {object} region 
 * @returns {number}
 */
export function getRegionLockRemaining(region) {
  if (!region.lockedUntil) return 0;
  const lockTime = region.lockedUntil.toMillis ? region.lockedUntil.toMillis() : region.lockedUntil;
  const remaining = lockTime - Date.now();
  return Math.max(0, remaining);
}
