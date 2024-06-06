import AsyncStorage from '@react-native-async-storage/async-storage';
import {EXPO_IP_ADDR} from "@env";

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('User Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const fetchAuthenticatedUser = async (token) => {
  try {
    const response = await fetch(`${EXPO_IP_ADDR}/loggedInUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.authenticatedUserData;
    } else {
      throw new Error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};
