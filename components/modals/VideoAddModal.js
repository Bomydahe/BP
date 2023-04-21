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
