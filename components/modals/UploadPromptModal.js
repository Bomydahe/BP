/*
  * Author: Rastislav Duránik (xduran03)
  * File: UploadPromptModal.js
  * Brief: 
      Component which displays a modal with a prompt asking the user
      if they want to share a video with a specific trainer. The modal
      has two buttons: "Yes" and "No". When the "Yes" button is pressed,
      the onYes callback function is called. When the "No" button is pressed,
      the modal is closed via the onClose callback function. The trainer's email
      is displayed in the modal's text via the trainerEmail prop. The component
      uses React Native's Modal and TouchableOpacity components for the modal 
      and buttons, respectively, and applies custom styles using the StyleSheet API.
*/


import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

export default function UploadPromptModal({
  visible,
  onClose,
  onYes,
  trainerEmail,
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backgroundOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.centeredView}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modalView}
          >
            <Text style={styles.modalText}>
              Do you want to share this video with {trainerEmail}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: "#8E8E93" }}
                onPress={onClose}
              >
                <Text style={styles.textStyle}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: "#007AFF" }}
                onPress={onYes}
              >
                <Text style={styles.textStyle}>Yes</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backgroundOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  centeredView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 35,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    minWidth: 100,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
