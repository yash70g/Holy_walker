import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase/config';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Simple Snowflakes for the background
const Snowflakes = () => {
  return [...Array(20)].map((_, i) => (
    <Text
      key={i}
      style={[
        styles.snowflake,
        {
          left: Math.random() * width,
          top: Math.random() * height,
          opacity: Math.random(),
          fontSize: Math.random() * 10 + 10,
        },
      ]}
    >
      ❄
    </Text>
  ));
};

const TeamSelect = ({ onTeamSelected }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  const teams = [
    { name: 'RED', color: '#ff4444', label: '🔴 Santa' },
    { name: 'BLUE', color: '#4444ff', label: '🔵 Snowman' },
    { name: 'GREEN', color: '#44ff44', label: '🟢 Elf' }
  ];
  const handleTeamSelect = async (teamName) => {
    setSelectedTeam(teamName);
    setLoading(true);

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const userId = auth.currentUser.uid;
      await AsyncStorage.setItem('@team', teamName);
      await AsyncStorage.setItem('@userId', userId);
      await setDoc(doc(db, 'users', userId), {
        team: teamName,
        lastLocation: { lat: 0, lng: 0 },
        joinedAt: new Date().toISOString(),
        isActive: true
      });
      onTeamSelected(teamName, userId);

    } catch (error) {
      console.error('Error selecting team:', error);
      Alert.alert('Error', 'Failed to join team.');
      setLoading(false);
      setSelectedTeam(null);
    }
  };

  return (
    <View style={styles.container}>
      <Snowflakes />
      
      <View style={styles.content}>
        <Text style={styles.title}>NORTH POLE WARS</Text>
        <Text style={styles.subtitle}>Select Your Allegiance</Text>

        <View style={styles.teamGrid}>
          {Object.keys(teamButtons).map((team) => (
            <Pressable
              key={team}
              style={({ pressed }) => [
                styles.teamButton,
                { opacity: (loading && selectedTeam !== team) ? 0.5 : (pressed ? 0.8 : 1) }
              ]}
              onPress={() => handleTeamSelect(team)}
              disabled={loading}
            >
              <Image 
                source={{ uri: teamButtons[team] }} 
                style={styles.buttonImage}
                resizeMode="contain"
              />
              {loading && selectedTeam === team && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>JOINING...</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.instructions}>
          Claim territory for your team by walking in the real world.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a0f', // Very dark blue/black
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10, // Ensure content is above snow
  },
  snowflake: {
    position: 'absolute',
    color: '#fff',
    zIndex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 5,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#88aaff',
    marginBottom: 40,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  teamGrid: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
  },
  teamButton: {
    width: width * 0.9, // 90% of screen width
    height: (width * 0.9) * (170 / 940), // Maintains the ~940x170 aspect ratio
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  instructions: {
    fontSize: 13,
    color: '#556677',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 18,
    maxWidth: '80%',
  },
});

export default TeamSelect;
