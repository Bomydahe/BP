/*
  * Author: Rastislav Duránik (xduran03)
  * File: VideoAddModal.js
  * Brief: 
      Component allows the user to select a category 
      from a list of categories. It receives the following 
      props: modalVisible, a boolean that determines if the modal is
      visible or not; setModalVisible, a function that sets the 
      modalVisible prop to either true or false; categories, an 
      array of objects representing the available categories; 
      handleAddVideo, a function that handles the addition of a 
      video with a selected category to the database; and 
      selectedVideoUri, a string representing the URI of the 
      video to be added. The component displays a list
      of category buttons, each with the category name as its 
      label. When a category is selected, the handleAddVideo
      function is called with the selectedVideoUri and the
      selected category's ID.
*/


import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";

const CategoryModal = ({
  modalVisible,
  setModalVisible,
  categories,
  handleAddVideo,
  selectedVideoUri,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <Pressable
        style={styles.backgroundOverlay}
        onPress={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredModalView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select a category</Text>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={styles.modalButton}
                onPress={() => handleAddVideo(selectedVideoUri, category.id)}
              >
                <Text style={styles.modalButtonText}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backgroundOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  centeredModalView: {
    alignSelf: "center",
  },
  modalView: {
    width: "70%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "stretch",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CategoryModal;
