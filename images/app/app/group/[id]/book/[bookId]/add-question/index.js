import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView, StatusBar, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getToken, fetchAuthenticatedUser } from '../../../../../../components/authService';
import Header from '../../../../../../components/header';
import { EXPO_IP_ADDR } from "@env";

const addQuestion = () => {
  const { id, bookId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');
  const [questionId, setQuestionId] = useState(null);
  const [options, setOptions] = useState(['']); // Start with one empty option

  useEffect(() => {
    const getUserData = async () => {
      const token = await getToken();
      if (token) {
        const userData = await fetchAuthenticatedUser(token);
        setUser(userData);
        setToken(token); // Store the token in state
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const postQuestion = async () => {
    try {
      const response = await fetch(`${EXPO_IP_ADDR}/book/${bookId}/question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const { id } = result.data[0];
        setQuestionId(id); // Store the question ID
        postOptions(id); // Post options after the question is posted
      }
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  const postOptions = async (questionId) => {
    try {
      await Promise.all(options.map(async (optionText) => {
        const response = await fetch(`${EXPO_IP_ADDR}/question/${questionId}/option`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            option: optionText,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add option');
        }
      }));
      router.back();
    } catch (error) {
      console.error('Error posting options:', error);
    }
  };

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = () => {
    if (options.length > 1) {
      setOptions(options.slice(0, -1)); // Remove the last option
    }
  };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

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
                  <Text style={styles.title}>Add a question</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your question"
                  value={questionText}
                  onChangeText={setQuestionText}
                />
                {options.map((option, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...options];
                      newOptions[index] = text;
                      setOptions(newOptions);
                    }}
                  />
                ))}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAddOption}
                >
                  <Text style={styles.buttonText}>Add Option</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRemoveOption}
                >
                  <Text style={styles.buttonText}>Remove Option</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={postQuestion}
                >
                  <Text style={styles.buttonText}>Post Question</Text>
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
    input: {
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
      fontSize: 18,
      fontFamily: 'Montserrat_500Medium',
      color: '#0B326C',
    },
    button: {
      backgroundColor: '#2465C7',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
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
  

export default addQuestion;
