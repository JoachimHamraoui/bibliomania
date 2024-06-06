import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, ImageBackground, ScrollView, Image, Pressable, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import {EXPO_IP_ADDR} from "@env";

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [role, setRole] = useState('student');

  console.log("index.js loaded");

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    console.log('fonts not loaded');
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
        role,
        profile_picture: 'https://pbs.twimg.com/profile_images/1766781196560715776/wkw0Xiiy_400x400.jpg',
        level: 1,
        rank: 1,
      };

      console.log('User Data:', userData);

      const response = await fetch(`${EXPO_IP_ADDR}/user`, {
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
      setRole('student');
      setPasswordMatch(false);

      Alert.alert('Success', 'Registration successful');
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'An error occurred while registering. Please try again later.');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../assets/app-background-img.jpg')}
        style={styles.background}>
        <View style={styles.header}>
          <Image source={require('../../assets/header-img.png')} />
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Text style={[styles.title, styles.bold]}>Sign up</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setPasswordMatch(text === password);
              }}
              secureTextEntry={true}
            />
            {passwordMatch ? (
              <Text style={{ color: 'white', marginBottom: 10, fontSize: 12 }}>Passwords match</Text>
            ) : (
              <Text style={{ color: 'white', marginBottom: 10, fontSize: 12 }}>Passwords do not match</Text>
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => setRole(itemValue)}
                dropdownIconColor="#0B326C"
              >
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Teacher" value="teacher" />
              </Picker>
            </View>
            <Pressable style={styles.formBtn} onPress={handleSubmit}>
              <Text style={styles.formTitle}>Sign Up</Text>
            </Pressable>
            <Text style={styles.option}>Already have an account? <Link href="/login" style={styles.link}>Log in</Link></Text>
          </View>
        </ScrollView>
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
  header: {
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    paddingVertical: 20,
  },
  headerImageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerImage: {
    resizeMode: 'contain',
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
    fontFamily: 'Montserrat_400Regular',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FAF9F6',
    borderRadius: 5,
    backgroundColor: '#FAF9F6',
    marginBottom: 10,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#0B326C',
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
  },
});

export default RegistrationForm;
