import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { getToken, fetchAuthenticatedUser } from '../../../../components/authService';
import Header from '../../../../components/header';
import { EXPO_IP_ADDR, ISBN_DB_API_KEY } from "@env";
import { BarCodeScanner } from "expo-barcode-scanner";
import { firebase } from "../../../../firebase-config"; // Import storage from your firebase-config.js file

const AddBook = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [isbn, setIsbn] = useState("");
  const [token, setToken] = useState(null); // Add state to store the token
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isImageFromPicker, setIsImageFromPicker] = useState(false); // Track if the image is from the picker

  const router = useRouter();

  // Fetch group info
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

  // Pick image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Limit to images only
      allowsEditing: true,
      aspect: [1.5, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setCover(result.assets[0].uri);
      setIsImageFromPicker(true); // Set the image source flag
    }
  };

  // Upload image
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
      setCover(url); // Set the cover URL to the download URL
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

  // Add book
  const addBook = async () => {
    let imageURL = cover; // Default to the current cover URL

    if (isImageFromPicker) {
      // If the image is from the picker, upload it first
      imageURL = await uploadImage(cover);
    }

    if (!imageURL) {
      console.error("Error: Image URL not obtained.");
      return; // Abort if the image URL is not available
    }

    try {
      const response = await fetch(`${EXPO_IP_ADDR}/group/${id}/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Use the token
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          author,
          cover: imageURL, // Use the imageURL obtained from Firebase
          description
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Book added successfully:', data);
      router.back();
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  // Fetch book details from ISBNDB
  const fetchBookDetails = async (isbn) => {
    try {
      const response = await fetch(`https://api2.isbndb.com/book/${isbn}`, {
        method: 'GET',
        headers: {
          'Authorization': ISBN_DB_API_KEY, // Use the API key from .env
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }

      const result = await response.json();
      const bookData = result.book;

      // Update state with fetched data
      setTitle(bookData.title || "");
      setAuthor(bookData.authors[0] || "");
      setCover(bookData.image || null);
      setIsImageFromPicker(false); // Image is from ISBN scan
      console.log('Book Data:', bookData);
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  // Handle barcode scanned
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setIsScanning(false);
    setIsbn(data);
    fetchBookDetails(data); // Fetch book details using the ISBN
    console.log(`Scanned ISBN: ${data}`);
  };

  // Fetch user data and request camera permissions
  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      setToken(token); // Store the token in state
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);
        fetchGroupInfo(token, id);
      }
    };

    const requestCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    requestCameraPermission();
    getUserData();
  }, [id]);

  // Render camera
  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        <TouchableOpacity
          style={styles.formBtnCamera}
          onPress={() => setIsScanning(false)}
        >
          <Text style={styles.formBtnText}>Close Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Check permissions and display camera
  if (isScanning && hasPermission) {
    return <View style={styles.container}>{renderCamera()}</View>;
  }

  // Display loading or main content
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../../../assets/app-background-img.jpg')}
        style={styles.background}
      >
        {user ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                {group && (
                  <Text style={styles.title}>Add Book to {group.name ? group.name : "Group"}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Author"
                  value={author}
                  onChangeText={setAuthor}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  value={description}
                  onChangeText={setDescription}
                />
                <TouchableOpacity style={styles.formBtn} onPress={pickImage}>
                  <Text style={styles.formBtnText}>Pick an Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.formBtn} onPress={addBook} disabled={uploading}>
                  <Text style={styles.formBtnText}>{uploading ? "Uploading..." : "Add Book"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.formBtn} onPress={() => {
                  setScanned(false);
                  setIsScanning(true);
                }}>
                  <Text style={styles.formBtnText}>Scan ISBN</Text>
                </TouchableOpacity>
                {isbn && (
                  <Text>ISBN: {isbn}</Text>
                )}
                {cover && (
                  <Image source={{ uri: cover }} style={styles.coverImage} />
                )}
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  input: {
    width: '100%',
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FAF9F6',
    borderRadius: 5,
    backgroundColor: '#FAF9F6',
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
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
  formBtnCamera: {
    width: "50%",
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: "#2465C7",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: "25%",
  },
  formBtnSubTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#0B326C',
    textAlign: 'center',
    marginVertical: 5,
  },
  coverImage: {
    width: 200,
    height: 300,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 5,
  },
  cameraContainer: {
    width: "70%",
    height: "90%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 40,
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  closeCameraButton: {
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  closeCameraButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddBook;
