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
import { EXPO_IP_ADDR } from "@env";
import { Ionicons } from "@expo/vector-icons"; // Icon library

const Comments = ({ groupId, bookId, token }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookComments = async () => {
    try {
      const response = await fetch(
        `${EXPO_IP_ADDR}/group/${groupId}/book/${bookId}/comments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch book comments");
      }

      const result = await response.json();
      setComments(result.data);
      console.log("Book Comments Info:", result.data);
    } catch (error) {
      console.error("Error fetching book comments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookComments();
  }, [groupId, bookId, token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {comments.map((comment) => (
        <TouchableOpacity
          key={comment.user_id}
          style={styles.commentContainer}
        >
          <View style={styles.profileContainer}>
            <Image source={{ uri: comment.profile_picture }} style={styles.image} />
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{comment.date}</Text>
              <Text style={styles.timeText}>{comment.time}</Text>
            </View>
          </View>
          <View style={styles.commentInfoContainer}>
            <View style={styles.header}>
              <Text style={styles.username}>
                {comment.username}
                {comment.you && <Ionicons name="checkmark-circle" size={16} color="#2465C7" />}
              </Text>
              <Ionicons
                name={comment.has_read_book ? "bookmark" : "bookmark-outline"}
                size={16}
                color={comment.has_read_book ? "#2465C7" : "#555"}
                style={styles.bookmarkIcon}
              />
            </View>
            <Text style={styles.email}>{comment.email}</Text>
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{comment.rank}</Text>
            </View>
            <Text style={styles.commentText}>{comment.comment}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 24,
  },
  commentContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  profileContainer: {
    marginRight: 10,
    alignItems: "center",
  },
  dateContainer: {
    alignItems: "flex-start",
    marginVertical: 5,
  },
  dateText: {
    fontSize: 9,
    color: "#555",
    fontFamily: "Montserrat_500Medium",
  },
  timeText: {
    fontSize: 9,
    color: "#555",
    fontFamily: "Montserrat_500Medium",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  commentInfoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distribute space between elements
  },
  username: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#0B326C",
    marginRight: 5,
  },
  bookmarkIcon: {
    marginLeft: 10, // Ensure some space between username and the bookmark icon
  },
  email: {
    fontSize: 12,
    color: "#0B326C",
    fontFamily: "Montserrat_500Medium",
  },
  rankContainer: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#2899E0",
  },
  rankText: {
    fontSize: 8,
    color: "#FAFAFA",
    fontFamily: "Montserrat_700Bold",
  },
  commentText: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
    fontFamily: "Montserrat_400Regular",
  },
});

export default Comments;
