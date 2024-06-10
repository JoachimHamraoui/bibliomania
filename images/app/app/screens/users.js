import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {EXPO_IP_ADDR} from "@env";

const Users = ({groupId, token}) => {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroupUsers = async () => {
    try {
      const response = await fetch(
        `${EXPO_IP_ADDR}/group/${groupId}/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group history info");
      }

      const result = await response.json();
      setUsers(result.data);
      console.log("Group Info:", result.data);
    } catch (error) {
      console.error("Error fetching group info:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupUsers();
  }, [groupId, token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {users.map((user) => (
        <TouchableOpacity key={user.id} onPress={() => router.push(`/user/${user.id}`)} style={styles.userContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: user.profile_picture }} style={styles.image} />
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.rank}>
              <Text style={styles.rankText}>{user.rank}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FAF9F6",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  userInfoContainer: {
    flexDirection: "column",
  },
  username: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#0B326C",
  },
  email: {
    fontSize: 12,
    color: "#0B326C",
    fontFamily: "Montserrat_500Medium",
  },
  rank: {
    alignSelf: 'flex-start', // Ensure background is only as wide as the text
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: "#2899E0",
  },
  rankText: {
    fontSize: 12,
    color: "#FAFAFA",
    fontFamily: "Montserrat_700Bold",
  },
  text: {
    fontSize: 24,
  },
});

export default Users;
