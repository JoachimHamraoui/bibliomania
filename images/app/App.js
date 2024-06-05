import React, { useState } from "react";
import { View, Button, Image, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "./firebase-config"; // Import storage from your firebase-config.js file

const FirebaseImageUploader = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);

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

  const uploadImage = async () => {
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
      Alert.alert("Photo uploaded!");
      setImage(null);
      console.log(await snapshot.ref.getDownloadURL());

      const response = await fetch("http://10.0.2.2:3000/upload", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ image_url: await snapshot.ref.getDownloadURL() }),
});

const responseData = await response.json();
console.log("Response:", responseData);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, marginVertical: 20 }}
        />
      )}
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      {downloadURL && (
        <Image
          source={{ uri: downloadURL }}
          style={{ width: 200, height: 200, marginVertical: 20 }}
        />
      )}
      <Button
        title="Upload Image"
        onPress={uploadImage}
        disabled={!image || uploading}
      />
    </View>
  );
};

export default FirebaseImageUploader;
