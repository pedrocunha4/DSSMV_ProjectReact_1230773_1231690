import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GoalSelector({ selectedGoal, onSelectGoal }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Objetivo</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[
            styles.radioOption,
            selectedGoal === 'Ganhar massa muscular' && styles.radioOptionSelected,
          ]}
          onPress={() => onSelectGoal('Ganhar massa muscular')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.radioCircle,
            selectedGoal === 'Ganhar massa muscular' && styles.radioCircleSelected,
          ]}>
            {selectedGoal === 'Ganhar massa muscular' && <View style={styles.radioSelected} />}
          </View>
          <View style={styles.radioContent}>
            <Text style={[
              styles.radioText,
              selectedGoal === 'Ganhar massa muscular' && styles.radioTextSelected,
            ]}>
              💪 Ganhar massa muscular
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.radioOption,
            selectedGoal === 'Perder peso' && styles.radioOptionSelected,
          ]}
          onPress={() => onSelectGoal('Perder peso')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.radioCircle,
            selectedGoal === 'Perder peso' && styles.radioCircleSelected,
          ]}>
            {selectedGoal === 'Perder peso' && <View style={styles.radioSelected} />}
          </View>
          <View style={styles.radioContent}>
            <Text style={[
              styles.radioText,
              selectedGoal === 'Perder peso' && styles.radioTextSelected,
            ]}>
              🔥 Perder peso
            </Text>
          </View>
        </TouchableOpacity>
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
  radioContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 6,
  },
  radioOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  radioSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
  },
  radioContent: {
    flex: 1,
  },
  radioText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  radioTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

