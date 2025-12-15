import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ExerciseCategory } from '../../store/exercisesSlice';

interface CategoryDropdownProps {
  visible: boolean;
  categories: ExerciseCategory[];
  onSelectCategory: (categoryId: number | null) => void;
  onClose: () => void;
}

export default function CategoryDropdown({
  visible,
  categories,
  onSelectCategory,
  onClose,
}: CategoryDropdownProps) {
  if (!visible) return null;

  return (
    <View style={styles.dropdown}>
      <ScrollView 
        style={styles.dropdownScroll}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => {
            onSelectCategory(null);
            onClose();
          }}
        >
          <Text style={styles.dropdownItemText}>Todas as categorias</Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.dropdownItem}
            onPress={() => {
              onSelectCategory(category.id);
              onClose();
            }}
          >
            <Text style={styles.dropdownItemText}>
              {category.name_pt || category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    elevation: 4,
    maxHeight: 300,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
});

