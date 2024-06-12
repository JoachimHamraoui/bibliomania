import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../components/authService';
import Header from '../../../../components/header';
import { EXPO_IP_ADDR } from "@env";

const voteBook = () => {
  const { id, voteId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [group, setGroup] = useState(null);
  const [remainingBooks, setRemainingBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRemainingBooks = async (token, id) => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/${id}/remaining-books`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch group remaining books');
      }
  
      const result = await response.json();
      setRemainingBooks(result.remainingBooks);
      console.log('Group Info:', remainingBooks);
    } catch (error) {
      console.error('Error fetching group remaining books:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async () => {
    if (!selectedBook) {
      console.warn('No book selected');
      return;
    }
  
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/vote/group/book`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: id, // Group's ID from useLocalSearchParams
          book_id: selectedBook, // ID of the selected book
          vote_id: voteId, // Vote's ID from useLocalSearchParams
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
  
      console.log('Vote submitted successfully');
      router.back();
    } catch (error) {
      console.error('Error submitting vote:', error);
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

        fetchRemainingBooks(token, id);
      }
    };

    console.log('Vote ID:', voteId);

    getUserData();
  }, [id]);

  const handleBookSelection = (bookId) => {
    setSelectedBook(bookId);
    console.log("Selected Book:", bookId);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user ? (
          <>
            <Header user={user} back={true} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Vote on next book</Text>
                </View>
                <View style={styles.bookList}>
  {remainingBooks.map((book, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.bookHistoryContainer,
        selectedBook === book.id && styles.selectedBookContainer,
      ]}
      onPress={() => handleBookSelection(book.id)}
    >
      <View style={styles.bookCoverContainer}>
        <Image source={{ uri: book.cover }} style={styles.bookCover} />
      </View>
      <View style={styles.bookInfoContainer}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.bookAuthor}>
          By <Text style={styles.bookAuthorName}>{book.author}</Text>
        </Text>
        <Text style={styles.bookDescription}>
          {book.description}
        </Text>
      </View>
    </TouchableOpacity>
  ))}
  <TouchableOpacity onPress={submitVote} style={styles.formBtn}>
  <Text style={styles.formBtnText}>Submit Vote</Text>
</TouchableOpacity>

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
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      justifyContent: 'center',
    },
    container: {
      flexGrow: 1,
      alignItems: 'center',
    },
    content: {
      width: '90%',
      marginTop: 20,
      paddingBottom: 20,
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
    bookList: {
      marginTop: 20,
      width: '100%',
    },
    bookHistoryContainer: {
      flexDirection: "row",
      backgroundColor: "#fff",
      marginBottom: 20,
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
    selectedBookContainer: {
      borderWidth: 5,
      borderColor: "#2465C7",
    },
    bookCoverContainer: {
      marginRight: 10,
    },
    bookCover: {
      width: 80,
      height: 120,
      borderRadius: 10,
    },
    bookInfoContainer: {
      flex: 1,
    },
    bookTitle: {
      fontSize: 14,
      fontFamily: "Montserrat_700Bold",
      color: "#2465C7",
    },
    bookAuthor: {
      fontSize: 12,
      fontFamily: "Montserrat_500Medium",
      color: "#0B326C",
    },
    bookAuthorName: {
      fontFamily: "Montserrat_700Bold",
    },
    bookDescription: {
      fontSize: 8,
      fontFamily: "Montserrat_400Regular",
      color: "#0B326C",
      marginTop: 10,
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
  

export default voteBook;
