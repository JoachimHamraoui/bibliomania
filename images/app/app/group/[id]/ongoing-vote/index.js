import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../components/authService';
import Header from '../../../../components/header';
import { EXPO_IP_ADDR } from "@env";
import { router } from 'expo-router';

const OngoingVote = () => {
  const { id } = useLocalSearchParams(); // `id` is group_id
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ongoingVote, setOngoingVote] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [mostVotedBook, setMostVotedBook] = useState(null);
  const [voteId, setVoteId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]); // State to store all users in the group

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      setToken(token); // Store the token in state
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        fetchOngoingVote(token, id);
        fetchGroupUsers(token, id); // Fetch group users
      }
    };

    getUserData();
  }, [id]);

  const fetchOngoingVote = async (token, groupId) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/${groupId}/ongoing-vote`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ongoing vote data');
      }

      const result = await response.json();
      setOngoingVote(result.ongoingVote);
      setLoading(false); // Set loading to false after data is fetched
      setMostVotedBook(result.ongoingVote.mostVotedBook);
      setVoteId(result.ongoingVote.vote_id);
    } catch (error) {
      console.error('Error fetching ongoing vote data:', error);
      setLoading(false);
    }
  };

  const fetchGroupUsers = async (token, groupId) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/${groupId}/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group users');
      }

      const result = await response.json();
      setGroupUsers(result.data); // Assuming the response contains an array of users
    } catch (error) {
      console.error('Error fetching group users:', error);
    }
  };

  const endVote = async () => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/vote/${voteId}/end`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end the vote');
      }

      console.log('Vote ended successfully');

      await postMostVotedBook();
      await postUserBooks(); // Call postUserBooks after posting the most voted book
      router.back();
    } catch (error) {
      console.error('Error ending the vote:', error);
    }
  };

  const postMostVotedBook = async () => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/book/history`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: mostVotedBook,
          group_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post most voted book');
      }

      console.log('Most voted book posted successfully');
    } catch (error) {
      console.error('Error posting most voted book:', error);
    }
  };

  const postUserBooks = async () => {
    try {
      console.log('Group Users:', groupUsers); // Log groupUsers to check its structure
      for (const user of groupUsers) { // Assuming groupUsers is the response data
        if (!user || !user.id) {
          console.error('Invalid user data:', user);
          continue; // Skip to the next user if user or user_id is missing
        }
        const response = await fetch(`${EXPO_IP_ADDR}/user/book`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            book_id: mostVotedBook,
            group_id: id,
          }),
        });
  
        if (!response.ok) {
          console.error(`Failed to post book for user ${user.id}`);
          continue; // Skip to the next user on failure
        }
  
        console.log(`Book posted successfully for user ${user.id}`);
      }
    } catch (error) {
      console.error('Error posting user books:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2465C7" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Ongoing Vote</Text>
                </View>
                {ongoingVote && ongoingVote.books.map(book => (
                  <View key={book.book_id} style={styles.bookContainer}>
                    <Image source={{ uri: book.cover }} style={styles.bookCover} />
                    <View style={styles.bookInfoContainer}>
                      <Text style={styles.bookTitle}>{book.title}</Text>
                      <Text style={styles.bookAuthor}>by {book.author}</Text>
                      <View style={styles.profilePicturesContainer}>
                        {book.users.map((user, index) => (
                          <Image
                            key={index}
                            source={{ uri: user.profile_picture }}
                            style={styles.profilePicture}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={styles.formBtn} onPress={endVote}>
                  <Text style={styles.formBtnText}>End Vote</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </ImageBackground>
    </>
  );
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
  },
  content: {
    width: '90%',
    marginTop: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  bookContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
    padding: 10,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 5,
    marginRight: 10,
  },
  bookInfoContainer: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#2465C7',
  },
  bookAuthor: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#0B326C',
  },
  profilePicturesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default OngoingVote;
