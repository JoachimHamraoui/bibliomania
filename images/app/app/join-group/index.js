import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { getToken, fetchAuthenticatedUser } from "../../components/authService";
import Header from "../../components/header";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";

const JoinGroup = () => {
  const [user, setUser] = useState(null);
  const [QRCode, setQRCode] = useState("");
  const [token, setToken] = useState(null);
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState({
    loading: true,
    fetchingGroup: false,
    error: null,
  });
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = await getToken();
        setToken(token);
        if (token) {
          const userData = await fetchAuthenticatedUser(token);
          setUser(userData);
        }
      } catch (error) {
        setStatus({
          ...status,
          error: "Failed to fetch user data",
          loading: false,
        });
      } finally {
        setStatus({ ...status, loading: false });
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    requestCameraPermission();
  }, []);

  const fetchGroupData = async () => {
    setStatus({ ...status, fetchingGroup: true, error: null });
    try {
      const response = await fetch(
        `http://192.168.1.10:3000/group/find/${QRCode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group");
      }

      const result = await response.json();
      setGroup(result.data);
    } catch (error) {
      setStatus({ ...status, error: error.message });
    } finally {
      setStatus({ ...status, fetchingGroup: false });
    }
  };

  const joinGroup = async () => {
    try {
      const response = await fetch(`http://192.168.1.10:3000/user/group`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_id: group.id, code: QRCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to join group");
      }

      router.navigate("/home");
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setIsScanning(false);
    setQRCode(data);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (status.loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        <TouchableOpacity
          style={styles.formBtnCamera}
          onPress={() => setIsScanning(false)}
        >
          <Text style={styles.formBtnText}>Close Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isScanning) {
    return <View style={styles.container}>{renderCamera()}</View>;
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2899E0"
        translucent={true}
      />
      <ImageBackground
        source={require("../../assets/app-background-img.jpg")}
        style={styles.background}
      >
        {user ? (
          <>
            <Header user={user} />
            <ScrollView contentContainerStyle={styles.container}>
              <View style={styles.content}>
                <Text style={styles.title}>Join a Group</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Group Code"
                  onChangeText={(text) => setQRCode(text)}
                  value={QRCode}
                />
                <TouchableOpacity
                  style={styles.formBtn}
                  onPress={fetchGroupData}
                >
                  <Text style={styles.formBtnText}>Find Group</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.formBtn}
                  onPress={() => {
                    setScanned(false);
                    setIsScanning(true);
                  }}
                >
                  <Text style={styles.formBtnText}>Scan QR code</Text>
                </TouchableOpacity>
                {status.fetchingGroup && <Text>Fetching group data...</Text>}
                {status.error && (
                  <Text style={styles.errorText}>{status.error}</Text>
                )}
                {group && (
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Image
                      source={{ uri: group.image }}
                      style={styles.groupImage}
                    />
                    <TouchableOpacity
                      style={styles.formBtn}
                      onPress={joinGroup}
                    >
                      <Text style={styles.joinBtnText}>Join Group</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        )}
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
  },
  content: {
    width: "90%",
    marginTop: 20,
    paddingBottom: 20,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#0B326C",
    fontFamily: "Montserrat_700Bold",
  },
  input: {
    width: "100%",
    paddingLeft: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FAF9F6",
    borderRadius: 5,
    backgroundColor: "#FAF9F6",
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 5,
  },
  formBtn: {
    width: "100%",
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: "#2465C7",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  formBtnCamera: {
    width: "50%",
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: "#2465C7",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: "25%",
  },
  formBtnText: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    color: "#FAF9F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  groupInfo: {
    backgroundColor: "#FAF9F6",
    padding: 10,
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
  groupName: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#0B326C",
  },
  groupImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  joinBtn: {
    width: "100%",
    paddingLeft: 10,
    paddingVertical: 14,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  joinBtnText: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    color: "#FAF9F6",
  },
  cameraContainer: {
    width: "70%",
    height: "90%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
    marginBottom: 40,
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  closeCameraButton: {
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  closeCameraButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default JoinGroup;
