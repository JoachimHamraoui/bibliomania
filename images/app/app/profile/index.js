import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, TextInput, StatusBar, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../components/authService';
import Header from '../../components/header';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {EXPO_IP_ADDR} from "@env";
import { firebase } from "../../firebase-config"; // Import storage from your firebase-config.js file 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const Profile = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newBio, setNewBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      setToken(token);
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);
        setNewBio(userData.bio);
      }
    };
    getUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setNewProfilePicture(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (imageURI) => {
    try {
      // Get info about the image file
      const { uri } = await FileSystem.getInfoAsync(imageURI);
  
      // Create a Blob from the image URI
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network Request Failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
  
      // Extract filename from URI
      const filename = uri.substring(uri.lastIndexOf("/") + 1);
  
      // Reference to Firebase Storage
      const storageRef = firebase.storage().ref().child(`Level/` + filename);
  
      // Upload Blob to Firebase Storage
      const snapshot = await storageRef.put(blob);
  
      // Get the download URL for the uploaded image
      const downloadURL = await snapshot.ref.getDownloadURL();
  
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image to Firebase:", error);
      throw error;
    }
  };

  const saveProfilePicture = async () => {
    if (!newProfilePicture) return;

    try {
      const downloadURL = await uploadImageToFirebase(newProfilePicture);

      const response = await fetch(`${EXPO_IP_ADDR}/update-profile-picture`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_picture: downloadURL }),
      });

      if (response.ok) {
        const updatedUser = await fetchAuthenticatedUser(token);
        setUser(updatedUser);
        setNewProfilePicture(null);
        setEditing(false);
        // Optionally, show success message
        Alert.alert("Success", "Profile picture updated successfully.");
      } else {
        throw new Error('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error saving profile picture:', error);
      // Optionally, show error message
      Alert.alert("Error", "Failed to update profile picture.");
    }
  };

  const saveBio = async () => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/update-bio`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (response.ok) {
        const updatedUser = await fetchAuthenticatedUser(token);
        setUser(updatedUser);
        setEditing(false);
        // Alert.alert("Profile updated", "Your bio has been updated successfully.");
      } else {
        throw new Error('Failed to update bio');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    //   Alert.alert("Error", "Failed to update bio.");
    }
  };

  const handleSave = () => {
    if (newProfilePicture) saveProfilePicture();
    if (newBio !== user.bio) saveBio();
    // getUserData();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user ? (
          <>
            <Header user={user} back={true} />
            <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileContainer}>
  <View style={styles.profileInfo}>
    <TouchableOpacity onPress={pickImage}>
      <Image
        source={{ uri: newProfilePicture || user.profile_picture }}
        style={styles.profileImage}
      />
    </TouchableOpacity>
    <View style={styles.levelContainer}>
      <Text style={styles.levelPrefix}>Lvl.</Text>
      <Text style={styles.level}>{user.level}</Text>
    </View>
    <View style={styles.textInfo}>
      <View style={styles.nameRow}>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{user.rank}</Text>
        </View>
      </View>
      <Text style={styles.email}>{user.email}</Text>
      {editing ? (
        <TextInput
          style={styles.bioInput}
          value={newBio}
          onChangeText={setNewBio}
          multiline
        />
      ) : (
        <Text style={styles.bio}>{user.bio || 'No bio yet.'}</Text>
      )}
    </View>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => setEditing(!editing)}
    >
      <MaterialIcons name="edit" size={16} color="#FFF" />
    </TouchableOpacity>
  </View>
  {editing && (
    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
      <Text style={styles.saveButtonText}>Save Changes</Text>
    </TouchableOpacity>
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
    paddingTop: 20,
  },
  profileContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
  },
  textInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#0B326C',
    marginRight: 10,
    marginBottom: 5,
  },
  rankContainer: {
    backgroundColor: '#2899E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  rankText: {
    fontSize: 8,
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  email: {
    fontSize: 8,
    color: '#0B326C',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 2,
  },
  bio: {
    fontSize: 10,
    color: '#0B326C',
    fontFamily: 'Montserrat_400Regular',
    height: 60,
    width: '100%',
  },
  bioInput: {
    fontSize: 10,
    color: '#0B326C',
    fontFamily: 'Montserrat_400Regular',
    borderColor: '#0B326C',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    height: 60,
    textAlignVertical: 'top',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#0B326C',
    borderRadius: 5,
    padding: 5,
  },
  levelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  levelPrefix: {
    fontSize: 12,
    color: '#0B326C',
    fontFamily: 'Montserrat_500Medium',
    marginRight: 2,
  },
  level: {
    fontSize: 18,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#2465C7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

export default Profile;
