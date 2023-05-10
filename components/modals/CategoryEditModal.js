/*
  * Author: Rastislav Duránik (xduran03)
  * File: CategoryEditModal.js
  * Brief: 
      The "CategoryEditModal" is a React Native functional component 
      used to display a modal for adding or editing a category. It takes
      props such as "modalVisible", "categories", and "addCategory". 
      It renders a modal with a title, text input field, and a "Save"
      button. When the button is pressed, it either adds a new category 
      or edits an existing one.
*/

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (modalVisible) {
      setCategoryName(
        categories.find((category) => category.id === editingCategoryId)
          ?.name || ""
      );
    }
  }, [modalVisible]);

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
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setModalVisible(false)}
        accessible={false}
      >
        <View style={styles.centeredModalView} pointerEvents="box-none">
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Enter Category Name</Text>
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
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2023",
    marginBottom: 15,
  },
  textInput: {
    borderColor: "#2196F3",
    borderWidth: 1,
    borderRadius: 5,
    width: "70%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default CategoryEditModal;
