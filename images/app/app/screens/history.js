import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Svg, Path } from 'react-native-svg';
import {EXPO_IP_ADDR} from "@env";
const History = ({ groupId, token }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const fetchGroupHistory = async () => {
    try {
      const response = await fetch(
        `${EXPO_IP_ADDR}/group/${groupId}/book_history`,
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
      setHistory(result.data);
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

  // Filter completed and incomplete books
  const completedBooks = history.filter((book) => book.completed);
  const incompleteBooks = history.filter((book) => !book.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Books we are reading</Text>
      {incompleteBooks.length > 0 ? (
        incompleteBooks.map((book, index) => (
          <TouchableOpacity
            key={index}
            style={styles.bookHistoryContainer}
            onPress={() =>
              router.push(`/group/${groupId}/book/${book.book_id}`)
            }
          >
            <View style={styles.bookCoverContainer}>
              <Image source={{ uri: book.cover }} style={styles.bookCover} />
            </View>
            <View style={styles.bookInfoContainer}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>
                By <Text style={styles.bookAuthorName}>{book.author}</Text>
              </Text>
              <View style={styles.bookInfo}>
                <View style={styles.bookInfoItem}>
                  <Svg style={[styles.bookInfoIcon, { width: 18, height: 18 }]} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <Path fill="none" d="M0 0h24v24H0z"/>
  <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</Svg>

                  <Text style={styles.bookInfoText}>
                    {book.likes}
                  </Text>
                </View>
                <View style={styles.bookInfoItem}>
                <Svg style={styles.bookInfoIcon}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <Path fill="none" d="M0 0h24v24H0z"/>
  <Path d="M17.656 2H6.343A2.256 2.256 0 0 0 4 4.236v15.528l7.475-3.574 7.482 3.574V4.236A2.256 2.256 0 0 0 17.656 2z"/>
</Svg>


                  <Text style={styles.bookInfoText}>
                    {book.reads}
                  </Text>
                </View>
                <View style={styles.bookInfoItem}>
                  <Svg style={styles.bookInfoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <Path fill="none" d="M0 0h24v24H0z"/>
                    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 20l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H7v-2h13v2zm0-3H7V9h13v2zm0-3H7V6h13v2z"/>
                  </Svg>

                  <Text style={styles.bookInfoText}>
                    {book.comments}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.text}>No books in progress</Text>
      )}

      <Text style={styles.statusText}>Books we have read</Text>
      {completedBooks.length > 0 ? (
        completedBooks.map((book, index) => (
          <TouchableOpacity
            key={index}
            style={styles.bookHistoryContainer}
            onPress={() =>
              router.push(`/group/${groupId}/book/${book.book_id}`)
            }
          >
            <View style={styles.bookCoverContainer}>
              <Image source={{ uri: book.cover }} style={styles.bookCover} />
            </View>
            <View style={styles.bookInfoContainer}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>
                By <Text style={styles.bookAuthorName}>{book.author}</Text>
              </Text>
              <View style={styles.bookInfo}>
                <View style={styles.bookInfoItem}>
                  <Svg style={[styles.bookInfoIcon, { width: 18, height: 18 }]} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <Path fill="none" d="M0 0h24v24H0z"/>
  <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</Svg>

                  <Text style={styles.bookInfoText}>
                    {book.likes}
                  </Text>
                </View>
                <View style={styles.bookInfoItem}>
                <Svg style={styles.bookInfoIcon}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <Path fill="none" d="M0 0h24v24H0z"/>
  <Path d="M17.656 2H6.343A2.256 2.256 0 0 0 4 4.236v15.528l7.475-3.574 7.482 3.574V4.236A2.256 2.256 0 0 0 17.656 2z"/>
</Svg>


                  <Text style={styles.bookInfoText}>
                    {book.reads}
                  </Text>
                </View>
                <View style={styles.bookInfoItem}>
                  <Svg style={styles.bookInfoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <Path fill="none" d="M0 0h24v24H0z"/>
                    <Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 20l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H7v-2h13v2zm0-3H7V9h13v2zm0-3H7V6h13v2z"/>
                  </Svg>

                  <Text style={styles.bookInfoText}>
                    {book.comments}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.text}>No completed books available</Text>
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
});

export default History;
