import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import Svg, { Path } from "react-native-svg"; // Import SVG components
import { EXPO_IP_ADDR } from "@env";
import { getToken, fetchAuthenticatedUser } from '../../components/authService';
import { router } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Books = ({ groupId, token }) => {
  const [books, setBooks] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const fetchGroupBooks = async () => {
    try {
      const response = await fetch(
        `${EXPO_IP_ADDR}/group/${groupId}/remaining-books`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch remaining books");
      }

      const result = await response.json();
      setBooks(result.remainingBooks || []); // Correctly access and set the remainingBooks field
      console.log("Remaining Books:", result.remainingBooks);
    } catch (error) {
      console.error("Error fetching group books:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);

        setRole(userData.role);
      }
    };

    getUserData();
    fetchGroupBooks();

  }, [groupId, token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === 'teacher' && (
        <View style={styles.teacherButtonsContainer}>
          <TouchableOpacity
            onPress={() => router.navigate(`/group/${groupId}/add-book`)}
            style={styles.buttonContainer}
          >
            <MaterialIcons name="bookmark-add" size={24} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Add Book</Text>
          </TouchableOpacity>
        </View>
      )}
      {books.length > 0 ? (
        books.map((book, index) => (
          <View key={index} style={styles.bookHistoryContainer}>
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
          </View>
        ))
      ) : (
        <Text style={styles.text}>No remaining books</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  teacherButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%", // Adjusted for spacing between buttons
    alignItems: "center",
    backgroundColor: "#2465C7",
    borderRadius: 6,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    fontSize: 14, // Smaller font size for button text
    color: '#FAF9F6',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 10, // Adjusted to create space between icon and text
  },
  text: {
    fontSize: 24,
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
});

export default Books;
