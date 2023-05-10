/*
  * Author: Rastislav Duránik (xduran03)
  * File: VideoSelectionModal.js
  * Brief: 
      The VideoSelectionModal component is a React Native modal 
      that provides users with options to select a video source. 
      It has two buttons: "From Categories" and "From Device Storage".
      The first button navigates the user to the categories page while 
      the second button allows the user to select a video from their 
      device's storage. The modal appears as an overlay on top of the 
      current view when it is visible.
*/



import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

export default function VideoSelectionModal({
  modalVisible,
  setModalVisible,
  navigate,
  pickVideo,
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Video Source</Text>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalVisible(false);
              navigate("Categories");
            }}
          >
            <Text style={styles.modalButtonText}>From Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalVisible(false);
              pickVideo();
            }}
          >
            <Text style={styles.modalButtonText}>From Device Storage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});
