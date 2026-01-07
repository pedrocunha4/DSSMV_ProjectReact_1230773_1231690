import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DayCard({ day, onPress }) {
  const dayName = day.description && day.description.trim() !== "" 
    ? day.description 
    : "Dia Sem Nome";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIndicator} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {dayName}
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
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },
  cardIndicator: {
    width: 5,
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 0,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 18,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  cardArrow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 28,
    color: '#C7C7CC',
    fontWeight: '300',
  },
});



