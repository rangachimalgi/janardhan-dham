import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EventCard({ event, onEdit, onDelete, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {event.hallDisplay || (typeof event.hall === 'string' 
              ? event.hall 
              : event.hall?.name || 'Unknown Hall')}
          </Text>
        </View>

        <View style={styles.actions}>
          {/* <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={18} color="#2563eb" />
          </TouchableOpacity> */}

          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <Text style={styles.title}>{event.name}</Text>
      {event.phone ? (
        <Text style={styles.phone}>{event.phone}</Text>
      ) : null}
      <Text style={styles.date}>{event.dateDisplay || event.date || 'No date'}</Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,

    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },

  phone: {
    color: '#1e293b',
    marginTop: 4,
    fontSize: 14,
  },

  date: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 13,
  },

  actions: {
    flexDirection: 'row',
  },

  iconBtn: {
    marginLeft: 10,
  },
});
