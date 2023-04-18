import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  StyleSheet,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const TrainerSelectModal = ({
  modalVisible,
  toggleModal,
  trainers,
  filteredTrainers,
  searchText,
  setSearchText,
  filterTrainers,
  handleTrainerSelect,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleModal}
    >
      <TouchableOpacity
        style={styles.modalBackground}
        onPress={toggleModal}
        activeOpacity={1}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalView}>
            <TextInput
              style={styles.searchInput}
              onChangeText={setSearchText}
              value={searchText}
              placeholder="Search trainers"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={filterTrainers}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
            <FlatList
              data={filteredTrainers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleTrainerSelect(item.email, item.uid)}
                  style={styles.trainerListItem}
                >
                  <Text style={styles.trainerListItemText}>{item.email}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.uid}
              style={styles.trainerList}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={toggleModal}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 0.3,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: "30%",
    width: "90%",
    maxHeight: "80%",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
  },
  trainerList: {
    width: "100%",
  },
  trainerListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  trainerListItemText: {
    fontSize: 16,
  },
  closeModalButton: {
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});

export default TrainerSelectModal;
