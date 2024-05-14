import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { getToken, fetchAuthenticatedUser } from '../../components/authService'; // Import the functions

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData)
      }
    };

    getUserData();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/app-background-img.jpg')}
      style={styles.background}>
      {user ? (
        <>
          <View style={styles.header}>
            <Image source={require('../../assets/header-img.png')} />
          </View>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
              <Text style={[styles.title, styles.bold]}>Home, {user.username}</Text>
              <View style={styles.userInfo}>
                {user.profile_picture && (
                  <Image 
                    source={{ uri: user.profile_picture }} 
                    style={styles.profilePicture} 
                  />
                )}
                <Text style={{ fontSize: 20, color: '#0B326C', marginTop: 10 }}>Welcome, {user.username} !</Text>
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginTop: 80,
    alignItems: 'center',
    backgroundColor: '#2899E0',
  },
  content: {
    width: '90%',
    marginTop: 40,
    paddingBottom: 20,
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: -24,
    right: 0,
    bottom: 0,
    left: 0,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#0B326C',
  },
  bold: {
    fontFamily: 'Montserrat_700Bold',
  },
  userInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  user: {
    fontSize: 20,
    color: '#0B326C',
    marginTop: 10,
    zIndex: 1,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginBottom: 10,
  },
});

export default Home;
