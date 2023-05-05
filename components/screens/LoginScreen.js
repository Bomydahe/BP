/*
  * Author: Rastislav Duránik (xduran03)
  * File: LoginScreen.js
  * Brief: 
      This component allows users to input their email 
      and password for logging in or registering an account. 
      Users can toggle between the login and registration 
      forms, and the registration form allows them to choose 
      a role (either "user" or "trainer"). The component 
      also includes password visibility toggles for both the 
      password and repeat password fields. It uses Firebase 
      for authentication and stores user information in Firestore. 
      Upon successful login or registration, users are navigated 
      to the appropriate screen based on their role.
*/

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { firebase } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  // State variables for user input, user role, loading and password visibility
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Toggle password visibility in the TextInput component
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle repeat password visibility in the TextInput component
  const toggleRepeatPasswordVisibility = () => {
    setShowRepeatPassword(!showRepeatPassword);
  };

  // Handle the login process
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(username, password);

      const user = response.user;
      if (user) {
        const userRef = firebase.firestore().collection("users").doc(user.uid);
        const doc = await userRef.get();
        const userData = doc.data();

        if (userData) {
          if (userData.role === "user") {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Home" }],
              })
            );
          } else if (userData.role === "trainer") {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "TrainerHomeScreen" }],
              })
            );
          } else {
            Alert.alert("Invalid user role");
          }
        } else {
          Alert.alert("Error: User data not found");
        }
      }
    } catch (error) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        Alert.alert("Incorrect email or password");
      } else {
        Alert.alert("Error during login: " + error.message);
      }
    }
    setLoading(false);
  };

  // Handle the registration process
  const handleRegister = async () => {
    setLoading(true);

    if (password !== repeatPassword) {
      Alert.alert("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(username, password);
      const user = response.user;

      if (user) {
        // Save user to Firestore
        const userRef = firebase.firestore().collection("users").doc(user.uid);
        await userRef.set({
          role: userRole,
          email: username,
        });

        // Navigate to the appropriate screen based on the user role
        if (userRole === "user") {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        } else if (userRole === "trainer") {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "TrainerHomeScreen" }],
            })
          );
        } else {
          Alert.alert("Invalid user role");
        }
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("User not found!");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Incorrect password!");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Invalid email address!");
      } else if (error.code === "auth/email-already-in-use") {
        Alert.alert("Email already in use!");
      } else if (error.code === "auth/weak-password") {
        Alert.alert(
          "Password too short! Minimum required length is 6 characters!"
        );
      }
    }

    setLoading(false);
  };

  // Render the LoginScreen component
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.title}>
            {isRegistering ? "Register" : "Login"}
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.input}>
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={{ flex: 1, height: "100%", fontSize: 17 }}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <MaterialCommunityIcons name="eye" size={24} color="black" />
              ) : (
                <MaterialCommunityIcons
                  name="eye-off"
                  size={24}
                  color="black"
                />
              )}
            </TouchableOpacity>
          </View>
          {isRegistering && (
            <>
              <View style={styles.input}>
                <TextInput
                  onChangeText={setRepeatPassword}
                  value={repeatPassword}
                  placeholder="Repeat Password"
                  secureTextEntry={!showRepeatPassword}
                  style={{ flex: 1, height: "100%", fontSize: 17 }}
                />
                <TouchableOpacity
                  onPress={toggleRepeatPasswordVisibility}
                  style={styles.eyeIcon}
                >
                  {showRepeatPassword ? (
                    <MaterialCommunityIcons
                      name="eye"
                      size={24}
                      color="black"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="eye-off"
                      size={24}
                      color="black"
                    />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.roleSelection}>
                <Text style={styles.roleText}>Select your role:</Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => setUserRole("user")}
                    style={[
                      styles.roleButton,
                      userRole === "user" ? styles.roleButtonSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        userRole === "user"
                          ? styles.roleButtonTextSelected
                          : null,
                      ]}
                    >
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setUserRole("trainer")}
                    style={[
                      styles.roleButton,
                      userRole === "trainer" ? styles.roleButtonSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        userRole === "trainer"
                          ? styles.roleButtonTextSelected
                          : null,
                      ]}
                    >
                      Trainer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          {isRegistering ? (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
          <Pressable onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchText}>
              {isRegistering
                ? "Already have an account? Log in"
                : "Don't have an account? Register"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 30,
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 17,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  roleSelection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "80%",
  },
  roleText: {
    fontSize: 16,
    color: "#444",
  },
  roleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginLeft: 10,
  },
  roleButtonSelected: {
    backgroundColor: "#007AFF",
  },
  roleButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    color: "#007AFF",
    textDecorationLine: "underline",
    fontSize: 14,
  },

  roleButtonTextSelected: {
    color: "white",
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 12,
    paddingHorizontal: 12,
  },
});
