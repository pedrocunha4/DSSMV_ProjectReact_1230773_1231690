import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { isPlanActiveToday } from '../../utils/planUtils';

export default function PlanCard({ plan, onPress, onEdit, onDelete, formatDate }) {
  const isActive = isPlanActiveToday(plan);

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.planIcon, isActive && styles.planIconActive]}>
            <Text style={styles.planIconText}>📋</Text>
          </View>
          <View style={styles.planInfo}>
            <View style={styles.planNameRow}>
              <Text style={styles.planName} numberOfLines={1}>{plan.name}</Text>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>● Ativo</Text>
                </View>
              )}
            </View>
            <Text style={styles.planDesc} numberOfLines={1}>
              Objetivo: {plan.description ? plan.description.replace('Objetivo: ', '') : 'Sem objetivo'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.planDate}>
            {formatDate(plan.start || plan.start_date)} - {formatDate(plan.end || plan.end_date)}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, styles.editBtn]} onPress={onEdit}>
              <Text style={styles.actionText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteBtn]} onPress={onDelete}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    marginBottom: 15, 
    elevation: 3, 
    borderLeftWidth: 0 
  },
  cardActive: { 
    borderLeftWidth: 4, 
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  cardContent: { 
    padding: 15 
  },
  cardHeader: { 
    flexDirection: 'row', 
    marginBottom: 10 
  },
  planIcon: { 
    backgroundColor: '#E3F2FD', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 10 
  },
  planIconActive: { 
    backgroundColor: '#C8E6C9' 
  },
  planIconText: { 
    fontSize: 20 
  },
  planInfo: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  planNameRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  planName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    flex: 1 
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planDesc: { 
    fontSize: 13, 
    color: '#666' 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#EEE', 
    paddingTop: 10 
  },
  planDate: { 
    fontSize: 12, 
    color: '#999' 
  },
  actions: { 
    flexDirection: 'row' 
  },
  actionButton: { 
    padding: 8, 
    borderRadius: 8, 
    marginLeft: 10 
  },
  editBtn: { 
    backgroundColor: '#FFF3E0' 
  },
  deleteBtn: { 
    backgroundColor: '#FFEBEE' 
  },
  actionText: { 
    fontSize: 16 
  },
});

