import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

const Header = ({ user }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerImageContainer}>
        <Image source={require('../assets/header-img.png')} style={styles.headerImage} />
      </View>
      {user.profile_picture && (
        <TouchableOpacity
          onPress={() => router.navigate('/profile')}
          style={styles.profilePictureContainer}>
          <Image
            source={{ uri: user.profile_picture }}
            style={styles.profilePicture}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#2899E0',
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
  profilePictureContainer: {
    position: 'absolute',
    right: 20,
  },
  profilePicture: {
    width: 35,
    height: 35,
    borderRadius: 6,
  },
});

export default Header;
