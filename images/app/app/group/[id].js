import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../components/authService';
import Header from '../../components/header';
import { Svg, Path } from 'react-native-svg';
import {EXPO_IP_ADDR} from "@env";

// Import tab screens
import History from '../screens/history';
import Users from '../screens/users';
import Books from '../screens/books';

const Group = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('History');

  const fetchGroupInfo = async (token, id) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/${id}`, {
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

  const renderScreen = () => {
    switch (selectedTab) {
      case 'History':
        return <History groupId={id} token={token} />;
      case 'Books':
        return <Books groupId={id} token={token} />;
      case 'Students':
        return <Users groupId={id} token={token} />;
      default:
        return <History groupId={id} token={token} />;
    }
  };

  const tabItemStyle = (tabName) => ({
    ...styles.tabItem,
    borderBottomWidth: selectedTab === tabName ? 2 : 0,
    fontWeight: selectedTab === tabName ? 'bold' : 'normal',
  });

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
        {user && group ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{group.name}</Text>
                  <TouchableOpacity onPress={() => router.navigate(`/group/${id}/invite`)}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path
                        d="M12 5C13.1046 5 14 4.10457 14 3C14 1.89543 13.1046 1 12 1C10.8954 1 10 1.89543 10 3C10 4.10457 10.8954 5 12 5Z"
                        fill="#0B326C"
                      />
                      <Path
                        d="M16 14C16 11.7909 14.2091 10 12 10C9.79086 10 8 11.7909 8 14V16H16V14Z"
                        fill="#0B326C"
                      />
                      <Path
                        d="M21 7H19V5H17V7H15V9H17V11H19V9H21V7Z"
                        fill="#0B326C"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
                <View style={styles.tabBar}>
                  <TouchableOpacity onPress={() => setSelectedTab('History')} style={tabItemStyle('History')}>
                    <Text style={styles.tabText}>History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedTab('Books')} style={tabItemStyle('Books')}>
                    <Text style={styles.tabText}>Books</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedTab('Students')} style={tabItemStyle('Students')}>
                    <Text style={styles.tabText}>Students</Text>
                  </TouchableOpacity>
                </View>
                {renderScreen()}
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#2899E0',
    width: '100%', 
    marginBottom: 24,
  },
  tabItem: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderBottomColor: '#FAF9F6', // Default color for border-bottom
  },
  tabText: {
    fontSize: 16,
    color: '#FAF9F6',
    fontFamily: 'Montserrat_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Group;
