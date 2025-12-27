import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, TouchableOpacity, Image, Text } from 'react-native';
import { db } from '../firebase/config';
import { onSnapshot, collection, updateDoc, doc } from 'firebase/firestore';
import MapView from '../components/MapView';
import HUD from '../components/HUD';
import { startLocationTracking } from '../utils/location';
import { CaptureTracker } from '../utils/captureLogic';
import { createCapturedRegion } from '../utils/regionManager';

const MapGame = ({ userTeam, userId, onSwitchTeam }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userPath, setUserPath] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showVictory, setShowVictory] = useState(false);
  
  const captureTrackerRef = useRef(new CaptureTracker());

  // PNG URL Constants
  const UI_ASSETS = {
    SWITCH_BTN: "https://i.ibb.co/Z6HNGK9F/Switch-Team.png",
    RED: "https://i.ibb.co/Tq8WMcQ0/Red-Team.png",
    BLUE: "https://i.ibb.co/d0zDhxkD/Blue-Team.png",
    GREEN: "https://i.ibb.co/bMM01d27/Green-Team.png",
    VICTORY_ICON: "https://cdn-icons-png.flaticon.com/512/3893/3893113.png"
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'regions'), (snapshot) => {
      setRegions(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        polygon: JSON.parse(doc.data().polygonData) 
      })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      const sub = await startLocationTracking((loc) => {
        setUserLocation({ latitude: loc.latitude, longitude: loc.longitude });
        updateDoc(doc(doc(db, 'users', userId)), { 
          lastLocation: { lat: loc.latitude, lng: loc.longitude }, 
          lastUpdate: new Date().toISOString() 
        });
        
        const result = captureTrackerRef.current.addPoint(loc.latitude, loc.longitude, loc.timestamp);
        if (result.inTerritory) setUserPath(prev => [...prev, { latitude: loc.latitude, longitude: loc.longitude }].slice(-50));
        if (result.captured) handleCaptureSuccess(result.capturedPath);
      });
      return () => sub();
    };
    init();
  }, [userId, userTeam]);

  const handleCaptureSuccess = async (path) => {
    await createCapturedRegion(userTeam, userId, path);
    setShowVictory(true);
    setTimeout(() => setShowVictory(false), 3000);
    captureTrackerRef.current.reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView userLocation={userLocation} userPath={userPath} regions={regions} userTeam={userTeam} />
        
        {/* TEAM INDICATOR (Top Right) */}
        <View style={styles.teamIndicatorContainer}>
           <Image source={{ uri: UI_ASSETS[userTeam] }} style={styles.teamImg} resizeMode="contain" />
        </View>

        {/* CUSTOM SWITCH TEAM BUTTON */}
        <TouchableOpacity style={styles.switchTeamBtn} onPress={onSwitchTeam}>
          <Image 
            source={{ uri: 'https://i.ibb.co/Z6HNGK9F/Switch-Team.png' }} // Your new custom button
            style={{ width: 120, height: 45 }} 
            resizeMode="contain" 
          />
        </TouchableOpacity>

        <HUD regions={regions} userTeam={userTeam} />

        {showVictory && (
          <View style={styles.victoryOverlay}>
            <Text style={styles.victoryText}>TERRITORY CLAIMED!</Text>
            <Image source={{ uri: UI_ASSETS.VICTORY_ICON }} style={styles.victoryIcon} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapContainer: { flex: 1, position: 'relative' },
  teamIndicatorContainer: { position: 'absolute', top: 50, right: 20, zIndex: 100 },
  teamImg: { width: 80, height: 80 },
  switchTeamBtn: { position: 'absolute', bottom: 30, left: 20, zIndex: 100 },
  switchBtnImg: { width: 120, height: 50 },
  victoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  victoryText: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  victoryIcon: { width: 180, height: 180 }
});

export default MapGame;
