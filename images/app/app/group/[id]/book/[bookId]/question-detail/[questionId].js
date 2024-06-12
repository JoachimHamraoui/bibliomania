import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView, StatusBar, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../../../components/authService';
import Header from '../../../../../../components/header';
import { EXPO_IP_ADDR } from "@env";

const QuestionDetails = () => {
  const { id, bookId, questionId } = useLocalSearchParams();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        setToken(token); // Store the token in state
        fetchQuestionDetails(token); // Fetch question details after setting token
      }
    };

    const fetchQuestionDetails = async (token) => {
      try {
        const response = await fetch(`${EXPO_IP_ADDR}/question/${questionId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch question details');
        }

        const result = await response.json();
        setQuestionData(result);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching question details:', error);
        setLoading(false);
      }
    };

    getUserData();
  }, [questionId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2465C7" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../../../../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user && questionData ? (
          <>
            <Header user={user} back={true} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{questionData.question.question}</Text>
                </View>
                {questionData.options.map((option) => (
                  <View key={option.option_id} style={styles.optionContainer}>
                    <Text style={styles.optionText}>{option.option}</Text>
                    <View style={styles.profilePicturesContainer}>
                      {option.users.map((user, index) => (
                        <Image
                          key={index}
                          source={{ uri: user.profile_picture }}
                          style={styles.profilePicture}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        ) : (
          <Text>Loading...</Text>
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
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#0B326C',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 10,
  },
  optionContainer: {
    marginBottom: 20,
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
  },
  optionText: {
    fontSize: 18,
    color: '#0B326C',
    fontFamily: 'Montserrat_500Medium',
  },
  profilePicturesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestionDetails;
