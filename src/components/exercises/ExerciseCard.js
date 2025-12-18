import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getCategoryColor } from '../../utils/exerciseUtils';

export default function ExerciseCard({ exercise, onPress }) {
  if (!exercise || !exercise.name) return null;
  
  const categoryColor = getCategoryColor(exercise.category_name);
  
  return (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseCardLeft}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {exercise.category_name || 'Sem categoria'}
            </Text>
          </View>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseCardLeft: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  arrowIcon: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '300',
    marginLeft: 12,
  },
});

