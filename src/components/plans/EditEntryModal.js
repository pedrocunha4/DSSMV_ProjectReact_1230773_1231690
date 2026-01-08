import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateEntryDetails } from '../../store/setsSlice';

export default function EditEntryModal({ visible, entry, onClose }) {
  const dispatch = useDispatch();
  const initial = useMemo(() => {
    const setsCount = typeof entry?.sets === 'number' ? entry.sets : 0;
    const reps = typeof entry?.reps === 'number' ? entry.reps : 0;
    const comment = entry?.comment || '';
    return { setsCount, reps, comment };
  }, [entry]);

  const [setsCount, setSetsCount] = useState(String(initial.setsCount || ''));
  const [reps, setReps] = useState(String(initial.reps || ''));
  const [comment, setComment] = useState(initial.comment || '');
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (visible) {
      setSetsCount(String(initial.setsCount || ''));
      setReps(String(initial.reps || ''));
      setComment(initial.comment || '');
      setSaving(false);
      setErrorText('');
    }
  }, [visible, initial]);

  const onSave = async () => {
    if (!entry?.id) return;
    setSaving(true);
    setErrorText('');
    try {
      const payload = {
        entryId: entry.id,
        sets: setsCount === '' ? 0 : parseInt(setsCount, 10),
        reps: reps === '' ? 0 : parseInt(reps, 10),
        comment: comment,
      };
      await dispatch(updateEntryDetails(payload)).unwrap();
      onClose && onClose();
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e?.detail || 'Não foi possível guardar. Tenta novamente.');
      setErrorText(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar exercício</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.body}>
            <Text style={styles.label}>Sets</Text>
            <TextInput
              value={setsCount}
              onChangeText={(t) => setSetsCount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              style={styles.input}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Repetições</Text>
            <TextInput
              value={reps}
              onChangeText={(t) => setReps(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              style={styles.input}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Notas para este exercício..."
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            {errorText ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose} disabled={saving}>
              <Text style={[styles.btnText, styles.cancelText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.save]} onPress={onSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayTouchable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 20, color: '#8E8E93' },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  label: { fontSize: 13, color: '#6B7280', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827' },
  textArea: { minHeight: 80 },
  errorText: { color: '#DC2626', marginTop: 10 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  btn: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
  cancel: { backgroundColor: '#F3F4F6' },
  cancelText: { color: '#111827' },
  save: { backgroundColor: '#007AFF' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
