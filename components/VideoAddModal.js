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
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CategoryModal;
