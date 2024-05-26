import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { View, TextInput, Text, Alert, StyleSheet, ImageBackground, ScrollView, Image, Pressable } from 'react-native';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../assets/header-img-svg.svg';



const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  console.log("index.js loaded");

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return null; // or a loading indicator
    console.log('fonts not loaded');
  }

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const loginData = {
        username,
        password,
      };

      console.log('Login Data:', loginData);

      const response = await fetch('http://192.168.1.10:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error('Invalid Credentials');
      }

      const { token } = await response.json();
      
      // Store token securely
      await AsyncStorage.setItem('token', token);
      console.log('Token:', token);

      setUsername('');
      setPassword('');
 
      // Alert.alert('Success', 'Registration successful');
      router.navigate('/home');
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'An error occurred while registering. Please try again later.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/app-background-img.jpg')}
      style={styles.background}>
      <View style={styles.header}>
        <Image source={require('../../assets/header-img.png')} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, styles.bold]}>Login</Text>
          <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <Pressable style={styles.formBtn} onPress={handleSubmit}>
          <Text style={styles.formTitle}>Sign Up</Text>
        </Pressable>

        <Text style={styles.option}>Don't have an account? <Link href="/signup" style={styles.link}>Sign up</Link></Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginTop: 80,
    alignItems: 'center',
    backgroundColor: '#2899E0',
  },
  content: {
    width: '90%',
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
    marginBottom: 20,
    color: '#0B326C',
  },
  bold: {
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
    fontFamily: 'Montserrat_400Regular'
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
  formTitle: {
    color: '#FAF9F6',
    fontSize: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  option: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  link: {
    color: '#2465C7',
    fontFamily: 'Montserrat_700Bold',
  }
});


export default LoginForm;

