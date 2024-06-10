import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { EXPO_IP_ADDR } from '@env'; // Assuming EXPO_IP_ADDR is set in your environment variables

const Questions = () => {
    const { id, bookId } = useLocalSearchParams(); // Use these params to fetch questions
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`${EXPO_IP_ADDR}/book/${bookId}/questions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
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
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [bookId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {questions.map((question) => (
                <TouchableOpacity
                    key={question.question_id}
                    style={styles.questionContainer}
                    onPress={() => {
                        // Handle the press event here
                        console.log(`Question ID: ${question.question_id}`);
                        // Additional logic can be added here
                    }}
                >
                    <Text style={styles.questionText}>{question.question}</Text>
                    {question.options.map((option) => (
                        <View key={option.option_id} style={styles.optionContainer}>
                            <Text style={styles.optionText}>{option.option}</Text>
                            <View style={styles.percentageBarContainer}>
                                <View style={{ ...styles.percentageBar, width: `${option.percentage}%` }}>
                                    {/* Display percentage value at the start of the bar */}
                                    <Text style={styles.percentageText}>{`${option.percentage}%`}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
    questionContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FAF9F6',
        borderRadius: 10,
        shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
    },
    questionText: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#0B326C',
        marginBottom: 10,
    },
    optionContainer: {
        marginBottom: 10,
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Montserrat_500Medium',
        color: '#333',
    },
    percentageBarContainer: {
        width: '100%',
        height: 20,
        backgroundColor: '#ddd',
        borderRadius: 6, // Adjusted border radius
        overflow: 'hidden',
        marginTop: 5,
        justifyContent: 'center', // Center content vertically
    },
    percentageBar: {
        height: '100%',
        backgroundColor: '#2465C7',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align text to the start of the bar
        paddingLeft: 5, // Add padding to keep text inside the bar
        borderRadius: 6, // Adjusted border radius
    },
    percentageText: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
    },
});

export default Questions;
