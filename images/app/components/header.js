import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Modal, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Header = ({ user, back = false }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleProfilePress = () => {
    setMenuVisible(false);
    router.navigate('/profile');
  };

  const handleLogoutPress = async () => {
    await AsyncStorage.removeItem('token');
    setMenuVisible(false);
    router.navigate('/login');
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      {back && (
        <TouchableOpacity style={styles.backArrowContainer} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={30} color="#FAF9F6" />
        </TouchableOpacity>
      )}
      <View style={styles.headerImageContainer}>
        <Image source={require('../assets/header-img.png')} style={styles.headerImage} />
      </View>
      {user?.profile_picture && (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.profilePictureContainer}>
          <Image
            source={{ uri: user.profile_picture }}
            style={styles.profilePicture}
          />
        </TouchableOpacity>
      )}
      {menuVisible && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress}>
                <Text style={styles.menuText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    paddingHorizontal: 20,
    position: 'relative',
    paddingVertical: 20,
  },
  backArrowContainer: {
    position: 'absolute',
    left: 20,
  },
  headerImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    backgroundColor: '#2465C7',
    padding: 10,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
  },
  menuItem: {
    padding: 10,
  },
  menuText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#FAF9F6',
  },
});

export default Header;
