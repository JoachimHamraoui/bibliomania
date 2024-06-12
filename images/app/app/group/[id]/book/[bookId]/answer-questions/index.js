import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../../../components/authService';
import Header from '../../../../../../components/header';
import { EXPO_IP_ADDR } from "@env";

const answerQuestions = () => {
  const { bookId, id: groupId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        setToken(token);
        await fetchQuestions(token);
      }
      setLoading(false);
    };

    const fetchQuestions = async (token) => {
      try {
        const response = await fetch(`${EXPO_IP_ADDR}/book/${bookId}/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const result = await response.json();
        setQuestions(result.data);
        console.log('Questions Data:', result.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    getUserData();
  }, [bookId]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleNext = async () => {
    if (selectedOption === null) {
      alert('Please select an option before proceeding.');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    // Post the chosen option
    try {
      await fetch(`${EXPO_IP_ADDR}/user/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: currentQuestion.question_id,
          chosen_option_id: selectedOption,
        }),
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      return;
    }

    // If it's the last question, complete the process
    if (currentQuestionIndex === questions.length - 1) {
      try {
        // Mark book as read
        await fetch(`${EXPO_IP_ADDR}/update-read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            book_id: bookId,
            group_id: groupId,
            read: true,
          }),
        });

        // Update user level
        await fetch(`${EXPO_IP_ADDR}/update-level`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        router.back();
      } catch (error) {
        console.error('Error completing book:', error);
      }
    } else {
      // Move to the next question
      setSelectedOption(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2899E0" translucent={true} />
      <ImageBackground
        source={require('../../../../../../assets/app-background-img.jpg')}
        style={styles.background}>
        {user ? (
          <>
            <Header user={user} back={true} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{currentQuestion.question}</Text>
                </View>
                {currentQuestion.options.map(option => (
                  <TouchableOpacity
                    key={option.option_id}
                    style={[
                      styles.optionButton,
                      selectedOption === option.option_id && styles.selectedOptionButton,
                    ]}
                    onPress={() => handleOptionSelect(option.option_id)}
                  >
                    <Text style={styles.optionButtonText}>{option.option}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                >
                  <Text style={styles.nextButtonText}>
                    {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                  </Text>
                </TouchableOpacity>
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
  optionButton: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
  },
  selectedOptionButton: {
    borderWidth: 3,
    borderColor: '#0B326C',
  },
  optionButtonText: {
    fontSize: 18,
    color: '#0B326C',
    fontFamily: 'Montserrat_500Medium',
  },
  nextButton: {
    backgroundColor: '#2465C7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default answerQuestions;
