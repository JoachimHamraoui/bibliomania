import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../components/authService';
import Header from '../../components/header';

const JoinGroup = () => {
  const [user, setUser] = useState(null);
  const [QRCode, setQRCode] = useState("");
  const [token, setToken] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingGroup, setFetchingGroup] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      setToken(token);
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);
      }
    };

    getUserData();
  }, []);

  const fetchGroupData = async () => {
    setFetchingGroup(true);
    setError(null);
    try {
      const response = await fetch(`http://192.168.1.10:3000/group/find/${QRCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group');
      }

      const result = await response.json();
      setGroup(result.data);
      console.log('Group Info:', result.data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching group:', error);
    } finally {
      setFetchingGroup(false);
    }
  };

  const joinGroup = async () => {
    try {
      const response = await fetch(`http://192.168.1.10:3000/user/group`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group_id: group.id, code: QRCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to join group');
      }

      router.navigate('/home');
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <Text style={styles.title}>Join a Group</Text>
                <TextInput style={styles.input} placeholder="Group Code" onChangeText={(text) => setQRCode(text)} />
                <TouchableOpacity style={styles.formBtn} onPress={fetchGroupData}>
                  <Text style={styles.formBtnText}>Find Group</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.formBtn}>
                  <Text style={styles.formBtnText}>Scan QR code</Text>
                </TouchableOpacity>
                {fetchingGroup && <Text>Fetching group data...</Text>}
                {error && <Text style={styles.errorText}>{error}</Text>}
                {group && (
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Image source={{ uri: group.image }} style={styles.groupImage} />
                    <TouchableOpacity style={styles.formBtn} onPress={joinGroup}>
                      <Text style={styles.joinBtnText}>Join Group</Text>
                    </TouchableOpacity>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '90%',
    marginTop: 20,
    paddingBottom: 20,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  input: {
    width: '100%',
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FAF9F6',
    borderRadius: 5,
    backgroundColor: '#FAF9F6',
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
  },
  formBtn: {
    width: '100%',
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: '#2465C7',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  formBtnText: {
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
    color: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  groupInfo: {
    backgroundColor: '#FAF9F6',
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
  },
  groupName: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#0B326C',
  },
  groupImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  joinBtn: {
    width: '100%',
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: '#28a745',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  joinBtnText: {
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
    color: '#FAF9F6',
  },
});

export default JoinGroup;