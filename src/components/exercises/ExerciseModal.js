import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { cleanDescription, getCategoryColor } from '../../utils/exerciseUtils';

export default function ExerciseModal({ exercise, visible, onClose, onEdit }) {
  if (!exercise) return null;

  const categoryColor = getCategoryColor(exercise.category_name);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {exercise.name || 'Detalhes do Exercício'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Categoria</Text>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                  <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                  <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                    {exercise.category_name || 'Sem categoria'}
                  </Text>
                </View>
              </View>

              {exercise.description ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Descrição</Text>
                  <Text style={styles.detailValue}>
                    {cleanDescription(exercise.description)}
                  </Text>
                </View>
              ) : (
                <View style={styles.detailSection}>
                  <Text style={styles.noDescriptionText}>
                    Nenhuma descrição disponível para este exercício.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Botões de Ação */}
            {onEdit && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalBodyContent: {
    paddingBottom: 50,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
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
  noDescriptionText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  editButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

