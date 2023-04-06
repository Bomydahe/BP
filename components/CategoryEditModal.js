import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TextInput,
} from "react-native";

const CategoryEditModal = ({
  modalVisible,
  setModalVisible,
  categories,
  handleEditCategory,
  editingCategoryId,
  action,
  addCategory,
}) => {
  const [categoryName, setCategoryName] = useState(
    categories.find((category) => category.id === editingCategoryId)?.name || ""
  );

  const handleSubmit = () => {
    if (action === "add") {
      addCategory(categoryName);
    } else {
      handleEditCategory(editingCategoryId, categoryName);
    }
    setModalVisible(false);
  };

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
          <Text style={styles.modalTitle}>Edit Category Name</Text>
          <TextInput
            style={styles.textInput}
            value={categoryName}
            onChangeText={setCategoryName}
            autoFocus
          />
          <Pressable style={styles.modalButton} onPress={handleSubmit}>
            <Text style={styles.modalButtonText}>Save</Text>
          </Pressable>
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
  textInput: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    width: "100%",
    paddingHorizontal: 10,
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

export default CategoryEditModal;
