import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DAYS_OF_WEEK = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

interface DaysSelectorProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
}

export default function DaysSelector({ selectedDays, onToggleDay }: DaysSelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Seleciona os dias</Text>
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayOption,
              selectedDays.includes(day) && styles.dayOptionSelected,
              index === DAYS_OF_WEEK.length - 1 && styles.dayOptionLast,
            ]}
            onPress={() => onToggleDay(day)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              selectedDays.includes(day) && styles.checkboxSelected,
            ]}>
              {selectedDays.includes(day) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(day) && styles.dayTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
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
  daysContainer: {
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
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 4,
  },
  dayOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  dayOptionLast: {
    marginBottom: 0,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dayTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

