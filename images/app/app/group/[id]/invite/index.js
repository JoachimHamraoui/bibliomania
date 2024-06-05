import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../components/authService';
import Header from '../../../../components/header';
import QRCode from 'react-native-qrcode-svg';

const Invite = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('History');

  const fetchGroupInfo = async (token, id) => {
    try {
      const response = await fetch(`http://192.168.1.10:3000/group/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group info');
      }

      const result = await response.json();
      setGroup(result.data);
      console.log('Group Info:', result.data);
    } catch (error) {
      console.error('Error fetching group info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      setToken(token);
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);

        fetchGroupInfo(token, id);
      }
    };

    getUserData();
  }, [id]);

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
        source={require('../../../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user && group ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{group.name}</Text>
                </View>
                <View style={styles.inviteInfo}>
                    <Text style={styles.inviteText}>
                        Scan QR Code or enter code
                    </Text>
                    <View style={styles.qrCodeContainer}>
                      <QRCode
                        value={group.code}
                        size={150} // adjust this to the largest dimension you want
                      />
                    </View>
                    <Text style={styles.inviteCode}>
                        {group.code}
                    </Text>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 10,
  },
  inviteText: {
    fontSize: 12,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 10,
  },
  inviteCode: {
    fontSize: 24,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
    marginTop: 10,
  },
  qrCodeContainer: {
    width: 150, // specify width
    height: 150, // specify height
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default Invite;
