import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ImageBackground, ScrollView, Image } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);

  console.log("index.js loaded");

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return null; // or a loading indicator
  }

  const handleSubmit = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userData = {
        username,
        email,
        password,
        profile_picture: 'https://pbs.twimg.com/profile_images/1766781196560715776/wkw0Xiiy_400x400.jpg',
        level: 1,
        rank: 1,
      };

      console.log('User Data:', userData);

      const response = await fetch('http://10.0.2.2:3000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPasswordMatch(false);

      Alert.alert('Success', 'Registration successful');
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'An error occurred while registering. Please try again later.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/app-background-img.jpg')}
      style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../assets/header-img.png')}/>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.title}>Registration</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    // width: '100%',
    // flex: 1,
    // justifyContent: 'center',
    // backgroundColor: 'green',
    width: '100%',
    marginTop: 80,
    alignItems: 'center',
    backgroundColor: '#2899E0',
  },
  content: {
    width: '90%',
    // backgroundColor: 'red',
    marginTop: 40,
    paddingBottom: 20,
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: -24,
    right: 0,
    bottom: 0,
    left: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0B326C',
  },
  bold: {
    fontFamily: 'Montserrat_700Bold',
  }
});


export default RegistrationForm;

