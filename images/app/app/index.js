import React, { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const RegistrationForm = () => {
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convert to seconds
          if (decodedToken.exp > currentTime) {
            router.navigate('/home');
          } else {
            await AsyncStorage.removeItem('token');
            router.navigate('/login');
          }
        } else {
          router.navigate('/login');
        }
      } catch (error) {
        // console.error('Error checking token:', error);
        router.navigate('/login');
      }
    };

    checkToken();
  }, []);

  return null; // This component doesn't render anything
};

export default RegistrationForm;
