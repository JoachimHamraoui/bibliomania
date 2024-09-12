import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../components/authService';
import Header from '../../../../components/header';
import { EXPO_IP_ADDR } from "@env";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

// Import tab screens
import Questions from '../../../screens/questions';
import Likes from '../../../screens/likes';
import Comments from '../../../screens/comments';

const Group = () => {
  const { id, bookId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Questions');
  const [book, setBook] = useState(null);
  const [liked, setLiked] = useState(false);

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
    }
  };

  const fetchBookInfo = async (token, bookId) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/book/${bookId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch book info');
      }

      const result = await response.json();
      setBook(result.data);
      console.log('Book Info:', result.data);
    } catch (error) {
      console.error('Error fetching book info:', error);
    }
  };

  const checkLikedStatus = async (token, groupId, bookId) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/${groupId}/book/${bookId}/likes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch liked status');
      }

      const result = await response.json();
      const likedByUser = result.data.some(like => like.user_id === user.id);
      setLiked(likedByUser);
      console.log('Liked Status:', likedByUser);
    } catch (error) {
      console.error('Error fetching liked status:', error);
    }
  };

  const toggleLikeStatus = async () => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/update-liked`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: id,
          book_id: bookId,
          liked: !liked,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      setLiked(!liked);
      console.log('Like status updated successfully');
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      const token = await getToken();
      setToken(token);
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log('User Data:', userData);

        await fetchGroupInfo(token, id);
        await fetchBookInfo(token, bookId);
        await checkLikedStatus(token, id, bookId);
      }
      setLoading(false);
    };

    getUserData();
  }, [id, bookId]);

  const renderScreen = () => {
    switch (selectedTab) {
      case 'Questions':
        return <Questions groupId={id} bookId={bookId} token={token} />;
      case 'Likes':
        return <Likes groupId={id} bookId={bookId} token={token} />;
      case 'Comments':
        return <Comments groupId={id} bookId={bookId} token={token} userRole={user.role} />;
      default:
        return <Questions groupId={id} bookId={bookId} token={token} />;
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
        source={require('../../../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user && group && book ? (
          <>
            <Header user={user} back={true} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{book.title}</Text>
                  {user.role === 'student' && (
                    <TouchableOpacity onPress={toggleLikeStatus} style={styles.likeButton}>
                    <MaterialIcons
                      name={liked ? "favorite" : "favorite-outline"}
                      size={24}
                      color={liked ? "#FAF9F6" : "#FFF"}
                    />
                  </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tabBar}>
                  <TouchableOpacity onPress={() => setSelectedTab('Questions')} style={tabItemStyle('Questions')}>
                    <Text style={styles.tabText}>Q&A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedTab('Likes')} style={tabItemStyle('Likes')}>
                    <Text style={styles.tabText}>Likes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedTab('Comments')} style={tabItemStyle('Comments')}>
                    <Text style={styles.tabText}>Chat</Text>
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
  },
  likeButton: {
    backgroundColor: '#2465C7',
    borderRadius: 10,
    padding: 10,
  },
});

export default Group;
