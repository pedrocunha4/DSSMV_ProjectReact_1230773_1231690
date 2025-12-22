import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DayCard({ day, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIndicator} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {day.description && day.description.trim() !== "" 
              ? day.description 
              : "Dia Sem Nome"}
          </Text>
          <Text style={styles.cardSubtitle}>Toca para adicionar exercícios</Text>
        </View>
      </View>
      <View style={styles.cardArrow}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIndicator: {
    width: 4,
    height: 60,
    backgroundColor: '#007AFF',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  cardArrow: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  arrow: {
    fontSize: 24,
    color: '#C7C7CC',
    fontWeight: '400',
  },
});



