import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import * as turf from '@turf/turf';
import { TERRITORY_POLYGON } from '../utils/geo';

const { width } = Dimensions.get('window');

const HUD = ({ 
  regions = [],
  captureProgress, 
  userTeam,
  sessionCoins = 0,
}) => {
  // Your Custom Button URLs
  const TEAM_BUTTONS = {
    RED: "https://i.ibb.co/Tq8WMcQ0/Red-Team.png",
    BLUE: "https://i.ibb.co/d0zDhxkD/Blue-Team.png",
    GREEN: "https://i.ibb.co/bMM01d27/Green-Team.png",
  };

  const teamColors = { RED: '#ff4444', BLUE: '#4444ff', GREEN: '#44ff44' };

  // Area Control Calculations
  const regionsByTeam = {};
  regions.forEach(r => {
    if (!regionsByTeam[r.ownerTeam]) regionsByTeam[r.ownerTeam] = 0;
    regionsByTeam[r.ownerTeam]++;
  });

  const userRegionCount = regionsByTeam[userTeam] || 0;
  const territoryArea = turf.area(TERRITORY_POLYGON) || 1;
  const areaByTeam = { RED: 0, BLUE: 0, GREEN: 0 };
  
 regions.forEach((r) => {
  if (!r.polygon || !r.polygon.coordinates) return; // Added extra safety check
  try {
    const regionPoly = turf.polygon(r.polygon.coordinates);
    const intersection = turf.intersect(regionPoly, TERRITORY_POLYGON);
    if (intersection) {
      areaByTeam[r.ownerTeam] = (areaByTeam[r.ownerTeam] || 0) + turf.area(intersection);
    }
  } catch (e) {
    // This prevents a single bad polygon from crashing the whole game
    console.warn('Skipping malformed polygon:', r.id); 
  }
});

  const percent = {
    RED: Math.min(100, Math.round((areaByTeam.RED / territoryArea) * 1000) / 10),
    BLUE: Math.min(100, Math.round((areaByTeam.BLUE / territoryArea) * 1000) / 10),
    GREEN: Math.min(100, Math.round((areaByTeam.GREEN / territoryArea) * 1000) / 10),
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* CLAIMED REGIONS */}
      <View style={styles.card}>
        <Text style={styles.label}>Claimed Regions</Text>
        {['RED', 'BLUE', 'GREEN'].map(team => (
          <View key={team} style={styles.claimedRow}>
            <Text style={[styles.claimedTeam, { color: teamColors[team] }]}>{team}</Text>
            <Text style={styles.claimedValue}>{regionsByTeam[team] || 0}</Text>
          </View>
        ))}
        <Text style={styles.points}>Total: {regions.length}</Text>
      </View>

      {/* CAPTURE PROGRESS */}
      <View style={styles.card}>
        <Text style={styles.label}>Capture Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${captureProgress * 100}%` }]} />
        </View>
        <Text style={styles.subtleText}>Pocket coins: {sessionCoins}</Text>
      </View>

      {/* YOUR TEAM */}
      <View style={styles.card}>
        <Text style={styles.label}>Your Team</Text>
        <Image source={{ uri: TEAM_BUTTONS[userTeam] }} style={styles.teamBadge} resizeMode="contain" />
      </View>

      {/* AREA CONTROL BOX */}
      <View style={styles.verdictBox}>
        <Text style={styles.label}>Area Control</Text>
        {['RED', 'BLUE', 'GREEN'].map(team => (
          <View key={team} style={styles.verdictRow}>
            <Text style={[styles.verdictTeam, { color: teamColors[team] }]}>{team}</Text>
            <Text style={styles.verdictValue}>{percent[team]}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 24,
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 100,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teamBadge: {
    width: width * 0.65,
    height: 40,
  },
  claimedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.65,
    paddingVertical: 4,
  },
  claimedTeam: {
    fontWeight: '900',
    fontSize: 12,
  },
  claimedValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  points: { color: '#fff', fontSize: 12, fontWeight: '700', marginTop: 4 },
  
  progressBar: {
    width: width * 0.65,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff', // White "Snow" Fill
    shadowColor: '#fff',
    shadowRadius: 5,
    shadowOpacity: 0.8,
  },
  subtleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  verdictBox: {
    position: 'absolute',
    top: 130,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: 120,
  },
  verdictRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  verdictTeam: { fontWeight: '900', fontSize: 11 },
  verdictValue: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default HUD;
