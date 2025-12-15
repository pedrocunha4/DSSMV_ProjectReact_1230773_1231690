import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface CreatePlanButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function CreatePlanButton({ onPress, disabled, loading }: CreatePlanButtonProps) {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.createButton, disabled && styles.createButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>Criar plano</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

