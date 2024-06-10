import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Icon library
import { EXPO_IP_ADDR } from "@env";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { firebase } from "../../firebase-config";
const Comments = ({ groupId, bookId, token, userRole }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [characterCount, setCharacterCount] = useState(0);

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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Limit to images only
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setCommentImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri) => {
    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(imageUri); // Get file info
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (e) => reject(new TypeError("Network request failed"));
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);
      const ref = firebase.storage().ref().child("books/" + filename);
      const snapshot = await ref.put(blob);
      const url = await snapshot.ref.getDownloadURL(); // Get the download URL

      setDownloadURL(url); // Set the download URL to the state
      setUploading(false);
      console.log("Image uploaded and URL obtained:", url);

      blob.close(); // Close the blob
      return url; // Return the URL for further use
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
      return null; // Return null in case of an error
    }
  };

  const postComment = async () => {
    // Validate comment length
    if (commentText.length > 280) {
      Alert.alert("Comment is too long. Please keep it under 280 characters.");
      return;
    }

    let imageUrl = commentImage ? await uploadImage(commentImage) : null;

    const newComment = {
      group_id: groupId,
      book_id: bookId,
      comment: commentText,
      image: imageUrl,
    };

    try {
      const response = await fetch(
        `${EXPO_IP_ADDR}/book/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newComment),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const result = await response.json();
      setComments([result.data, ...comments]); // Prepend the new comment
      setCommentText(""); // Clear the input
      setCommentImage(null); // Clear the image
      setDownloadURL(null);
      console.log("Comment posted successfully:", result.data);
      fetchBookComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      Alert.alert("Error posting comment:", error.message);
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
    <ScrollView style={styles.container}>
      {/* If user is a student, show the comment form */}
      {userRole === "student" && (
        <View style={styles.commentFormContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write a comment..."
            multiline
            value={commentText}
            onChangeText={(text) => {
              setCommentText(text);
              setCharacterCount(text.length);
            }}
            maxLength={280}
          />
          <Text style={styles.characterCounter}>{characterCount}/280</Text>
          {commentImage && (
            <Image source={{ uri: commentImage }} style={styles.selectedImage} />
          )}
          <TouchableOpacity onPress={pickImage} style={styles.pickImageButton}>
            <Text style={styles.pickImageText}>Pick an image</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={postComment} style={styles.postButton}>
            <Text style={styles.postButtonText}>Post Comment</Text>
          </TouchableOpacity>
        </View>
      )}
      {comments.map((comment, index) => (
        <TouchableOpacity
          key={comment.user_id + index}
          style={styles.commentContainer}
        >
          <View style={styles.topSection}>
            <Image source={{ uri: comment.profile_picture }} style={styles.image} />
            <View style={styles.userInfo}>
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
            </View>
          </View>
          <View style={styles.commentContentContainer}>
            <Text style={styles.commentText}>{comment.comment}</Text>
            {comment.image && (
              <Image source={{ uri: comment.image }} style={styles.commentImage} />
            )}
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{comment.date}</Text>
              <Text style={styles.timeText}>{comment.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
    padding: 10,
    backgroundColor: "#FAF9F6",
    borderRadius: 10,
    marginBottom: 10,
   shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10, // Add margin to separate from the comment content
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  username: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#0B326C",
    marginRight: 5,
  },
  bookmarkIcon: {
    marginLeft: 10,
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
    color: "#FAF9F6",
    fontFamily: "Montserrat_700Bold",
  },
  commentContentContainer: {
    flexDirection: 'column',
    width: '100%', // Take full width
  },
  commentText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "Montserrat_400Regular",
    marginBottom: 10, // Add margin to separate from the image
  },
  commentImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10, // Add margin to separate from the date/time
  },
  dateContainer: {
    alignItems: "flex-start",
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
  // New styles for the comment form
  commentFormContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 10,
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#333",
  },
  characterCounter: {
    textAlign: "right",
    fontSize: 12,
    color: "#555",
    fontFamily: "Montserrat_500Medium",
  },
  pickImageButton: {
    backgroundColor: "#2899E0",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  pickImageText: {
    color: "#FAF9F6",
    fontFamily: "Montserrat_500Medium",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#0B326C",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  postButtonText: {
    color: "#FAF9F6",
    fontFamily: "Montserrat_500Medium",
  },
});

export default Comments;
