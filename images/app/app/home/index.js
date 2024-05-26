import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { getToken, fetchAuthenticatedUser } from '../../components/authService'; // Import the functions

const Home = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);
  
        if (userData.role === 'teacher') {
          fetchGroups(token, 'teacher');
        } else if (userData.role === 'student') {
          fetchGroups(token, 'student');
        }
      }
    };
  
    getUserData();
  
    const interval = setInterval(() => {
      getUserData();
    }, 30000); // Fetch data every minute (adjust as needed)
  
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const fetchGroups = async (token, role) => {
    const url = role === 'teacher' ? 'http://192.168.1.10:3000/teacher/created-groups' : 'http://192.168.1.10:3000/student/groups';
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const result = await response.json();
      setGroups(result.data); // Ensure we correctly set the 'data' array
      console.log('Groups:', result);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/app-background-img.jpg')}
      style={styles.background}>
      {user ? (
        <>
          <View style={styles.header}>
            <View style={styles.headerImageContainer}>
              <Image source={require('../../assets/header-img.png')} style={styles.headerImage} />
            </View>
            {user.profile_picture && (
              <TouchableOpacity
                onPress={() => router.navigate('/profile')}
                style={styles.profilePictureContainer}>
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles.profilePicture}
                />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>
              {groups.length > 0 ? (
                <View>
                  {user.role === "teacher" ? (
                    <TouchableOpacity onPress={() => router.navigate('/create-group')} style={styles.createGroupButtonContainer}>
                      <Svg style={styles.createGroupIcon} width="32" height="32" viewBox="0 0 24 24">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" fill="white"/>
                      </Svg>
                      <Text style={styles.createGroupButton}>Create Group</Text>
                    </TouchableOpacity>
                  ) : <TouchableOpacity onPress={() => router.navigate('/join-group')} style={styles.createGroupButtonContainer}>
                      <Svg style={styles.createGroupIcon} width="32" height="32" viewBox="0 0 24 24">
                        <Path fillRule="evenodd" clipRule="evenodd" d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" fill="white"/>
                      </Svg>
                      <Text style={styles.createGroupButton}>Join Group</Text>
                    </TouchableOpacity>}
                  {groups.map((group, index) => (
                    <TouchableOpacity key={index} onPress={() => router.navigate(`/group/${group.id}`)} style={styles.groupContainer}>
                      <Image source={{ uri: group.image }} style={styles.groupImage} />
                      <View>
                        <Text style={styles.groupTitle}>{group.name}</Text>
                        <Text style={styles.groupCreator}>By <Text style={styles.groupCreatorUsername}>{group.creator_username}</Text></Text>
                        <Text style={styles.groupDescription}>{group.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noGroupsContainer}>
                  <Image source={require('../../assets/book-world.png')} style={styles.noGroupsImage} />
                  {user.role === "teacher" ? (
                   <>
                   <Text style={styles.noGroupsText}>No groups created yet</Text>
                    <TouchableOpacity onPress={() => router.navigate('/create-group')} style={styles.createGroupButtonContainerSmall}><Text style={styles.createGroupButtonSmall}>Create Group</Text></TouchableOpacity>
                   </>
                  ) : (
                    <>
                    <Text style={styles.noGroupsText}>No groups joined yet</Text>
                    <TouchableOpacity onPress={() => router.navigate('/join-group')} style={styles.createGroupButtonContainerSmall}><Text style={styles.createGroupButtonSmall}>Join Group</Text></TouchableOpacity>
                    </>
                  )}
                </View>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2899E0',
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerImageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerImage: {
    resizeMode: 'contain',
  },
  profilePictureContainer: {
    position: 'absolute',
    right: 20,
  },
  profilePicture: {
    width: 35,
    height: 35,
    borderRadius: 6,
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
  createGroupButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#FAF9F6',
    borderWidth: 2,
    borderRadius: 6,
    padding: 10,
  },
  createGroupButton: {
    fontSize: 16,
    color: '#DAF9F6',
    fontFamily: 'Montserrat_700Bold',
    marginVertical: 10,
  },
  createGroupIcon: {
    marginTop: 10,
  },
  createGroupButtonContainerSmall: {
    width: '100%',
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: '#2465C7',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 32,
  },
  createGroupButtonSmall: {
    color: '#FAF9F6',
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  groupContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#FAF9F6',
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginRight: 12,
  },
  groupTitle: {
    fontSize: 18,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  groupCreator: {
    fontSize: 12,
    color: '#0B326C',
    fontFamily: 'Montserrat_400Regular',
  },
  groupCreatorUsername: {
    color: '#2899E0',
    fontFamily: 'Montserrat_500Medium',
  },
  groupDescription: {
    width: 220,
    fontSize: 12,
    marginTop: 5,
    color: '#0B326C',
    fontFamily: 'Montserrat_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGroupsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGroupsText: {
    fontSize: 18,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
    marginTop: 40,
  },
  noGroupsImage: {
    width: 150,
    height: 150,
    marginTop: 20,
  },
});

export default Home;
