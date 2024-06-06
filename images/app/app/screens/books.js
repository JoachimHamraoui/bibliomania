import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import {EXPO_IP_ADDR} from "@env";

const Books = ({ groupId, token }) => {
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroupHistory = async () => {
    try {
      const response = await fetch(
        `${EXPO_IP_ADDR}/group/${groupId}/books`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group history info");
      }

      const result = await response.json();
      setBooks(result.data);
      console.log("Group Info:", result.data);
    } catch (error) {
      console.error("Error fetching group info:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupHistory();
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
      {books && books.length > 0 ? (
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
        <Text style={styles.text}>No books in Group</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    // alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 12,
    marginBottom: 10,
    color: "#0B326C",
    fontFamily: "Montserrat_700Bold",
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
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    bottom: -50,
  },
  bookInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  bookInfoIcon: {
    fill: "#2465C7",
  },
  bookInfoText: {
    fontSize: 12,
    fontFamily: "Montserrat_500Medium",
    color: "#0B326C",
    marginRight: 10,
    marginLeft: 5,
  },
  bookDescription: {
    fontSize: 8,
    fontFamily: "Montserrat_400Regular",
    color: "#0B326C",
    marginTop: 10,
  },
});

export default Books;
