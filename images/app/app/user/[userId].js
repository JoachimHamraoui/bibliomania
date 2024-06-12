import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, StatusBar, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../components/authService';
import Header from '../../components/header';
import { EXPO_IP_ADDR } from "@env";

const UserProfile = () => {
  const { userId } = useLocalSearchParams();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [token, setToken] = useState(null);
  const [fetchedUser, setFetchedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        // Fetch the token
        const token = await getToken();
        setToken(token);
        console.log('Token:', token); // Log token for debugging

        // Fetch logged-in user data
        if (token) {
          const loggedInUserData = await fetchAuthenticatedUser(token);
          setLoggedInUser(loggedInUserData);
          console.log('Logged-in user data:', loggedInUserData); // Log for debugging

          // Fetch the specific user's data by userId
          await fetchUserById(token, userId);
        } else {
          console.error('Token is null');
        }
      } catch (error) {
        console.error('Error in getUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [userId]);

  const fetchUserById = async (token, userId) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData); // Log for debugging
        setFetchedUser(userData.user);
      } else {
        console.error('Failed to fetch user data, Status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../assets/app-background-img.jpg')}
        style={styles.background}>
        {loggedInUser && fetchedUser ? (
          <>
            <Header user={loggedInUser} back={true} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.profileContainer}>
                <View style={styles.profileInfo}>
                  <Image
                    source={{ uri: fetchedUser.profile_picture }}
                    style={styles.profileImage}
                  />
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelPrefix}>Lvl.</Text>
                    <Text style={styles.level}>{fetchedUser.level}</Text>
                  </View>
                  <View style={styles.textInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.username}>{fetchedUser.username}</Text>
                      <View style={styles.rankContainer}>
                        <Text style={styles.rankText}>{fetchedUser.rank}</Text>
                      </View>
                    </View>
                    <Text style={styles.email}>{fetchedUser.email}</Text>
                    <Text style={styles.bio}>{fetchedUser.bio || 'No bio yet.'}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text>User not found</Text>
          </View>
        )}
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  profileContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  textInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#0B326C',
    marginRight: 10,
    marginBottom: 5,
  },
  rankContainer: {
    backgroundColor: '#2899E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  rankText: {
    fontSize: 8,
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  email: {
    fontSize: 8,
    color: '#0B326C',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 2,
  },
  bio: {
    fontSize: 10,
    color: '#0B326C',
    fontFamily: 'Montserrat_400Regular',
    height: 60,
    width: '100%',
  },
  levelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  levelPrefix: {
    fontSize: 12,
    color: '#0B326C',
    fontFamily: 'Montserrat_500Medium',
    marginRight: 2,
  },
  level: {
    fontSize: 18,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

export default UserProfile;
