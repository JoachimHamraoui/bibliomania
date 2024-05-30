import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Image, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "../../firebase-config"; // Import storage from your firebase-config.js file
import { getToken, fetchAuthenticatedUser } from '../../components/authService';
import Header from '../../components/header';

const Home = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);
  const [token, setToken] = useState(null); // Add state to store the token

  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (token) => {
    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(image);
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

      const filename = image.substring(image.lastIndexOf("/") + 1);
      const ref = firebase
        .storage()
        .ref()
        .child("Level/" + filename);
      const snapshot = await ref.put(blob);
      const url = await snapshot.ref.getDownloadURL(); // Get the download URL
      setDownloadURL(url); // Set the download URL to the state
      setUploading(false);
      setImage(null);
      console.log(await snapshot.ref.getDownloadURL());

      //192.168.1.10

      const response = await fetch("http://192.168.1.10:3000/group", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, image: await snapshot.ref.getDownloadURL(), code }),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);
      router.navigate("/home");
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      setToken(token); // Store the token in state
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        console.log(userData);
      }
    };

    const newString = generateRandomString(10);
    setCode(newString); 
    getUserData();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <Text style={styles.title}>Create Group</Text>
                <TextInput style={styles.input} placeholder="Group Name" onChangeText={(text) => setName(text)} />
                {/* <Button title="Pick an image from camera roll" onPress={pickImage} styles={styles.button} /> */}
                <TouchableOpacity style={styles.input} onPress={pickImage}>
                  <Text style={styles.inputText}>Pick an image from camera roll</Text>
                </TouchableOpacity>
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={{ width: "100%", height: 200, marginVertical: 20 }}
                  />
                )}
                <TextInput style={styles.input} placeholder="Group Description" onChangeText={(text) => setDescription(text)}/>
                <TouchableOpacity style={styles.formBtn} onPress={() => uploadImage(token)}>
                <Text style={styles.formBtnText}>Create Group</Text>
              </TouchableOpacity>
              </View>
              {/* <Button
                title="Upload Image"
                onPress={() => uploadImage(token)} // Pass the token to the uploadImage function
                styles={styles.button}
              /> */}
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
  inputText: {
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



export default Home;
