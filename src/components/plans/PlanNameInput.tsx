import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface PlanNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function PlanNameInput({ value, onChangeText, placeholder }: PlanNameInputProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Nome do Plano</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder={placeholder || 'Ex: Peito, Costas, Pernas...'}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#999"
        />
        <View style={styles.inputUnderline} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  nameInput: {
    paddingVertical: 16,
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputUnderline: {
    height: 3,
    backgroundColor: '#FF8C00',
    borderRadius: 2,
    marginTop: -2,
  },
});

