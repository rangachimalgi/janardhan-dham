import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import API_BASE_URL from "../config/api";

export default function CreateEventScreen({ route, navigation }) {
  const { hall } = route.params;

  const [name, setName] = useState("");
  const [purohitName, setPurohitName] = useState("");
  const [caterername, setCatererName] = useState("");
  const [phone, setPhone] = useState("");
  const [purohitphone, setPurohitPhone] = useState("");
  const [catererphone, setCatererPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [balance, setBalance] = useState("");
  const [advance, setAdvance] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [dateConflict, setDateConflict] = useState(null); // null, false (available), or error message

  // Check if the selected date is already booked for this hall
  const checkDateAvailability = async (selectedDate) => {
    if (!selectedDate || !hall?.id) return;

    setCheckingAvailability(true);
    setDateConflict(null);

    try {
      // Get all events for this hall
      const response = await fetch(`${API_BASE_URL}/events`);
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const allEvents = await response.json();
      
      // Filter events for this hall
      const hallEvents = allEvents.filter(event => event.hall?.id === hall.id);
      
      // Check if any event is on the same day
      const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];
      
      const conflictingEvent = hallEvents.find(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr === selectedDateStr;
      });

      if (conflictingEvent) {
        const conflictMessage = `This hall is already booked on ${new Date(selectedDate).toLocaleDateString()}. Please select a different date.`;
        setDateConflict(conflictMessage);
        Alert.alert(
          "Date Already Booked",
          conflictMessage,
          [{ text: "OK" }]
        );
      } else {
        setDateConflict(false); // Date is available
      }
    } catch (error) {
      console.error("Error checking date availability:", error);
      // Don't block user if check fails, just log it
      setDateConflict(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Check availability when date changes
  useEffect(() => {
    if (date) {
      checkDateAvailability(date);
    }
  }, [date]);

  const handleSave = async () => {
    // Validation
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in devotee name and phone number");
      return;
    }

    // Check if date is already booked
    if (dateConflict && typeof dateConflict === 'string') {
      Alert.alert(
        "Date Already Booked",
        dateConflict,
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        hall: {
          id: hall.id,
          name: hall.name,
          subname: hall.subname,
        },
        name: name.trim(),
        phone: phone.trim(),
        purohitName: purohitName.trim(),
        purohitPhone: purohitphone.trim(),
        catererName: caterername.trim(),
        catererPhone: catererphone.trim(),
        advance: advance.trim(),
        balance: balance.trim(),
        notes: notes.trim(),
        date: date.toISOString(),
      };

      console.log("Creating event at:", `${API_BASE_URL}/events`);

      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `Failed to create event (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If not JSON, try text
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        // Check if it's a conflict error (hall already booked)
        if (response.status === 409) {
          Alert.alert(
            "Booking Conflict",
            errorMessage,
            [{ text: "OK" }]
          );
          return;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Event created successfully:", result);

      Alert.alert("Success", "Event created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error.name === 'AbortError') {
        Alert.alert(
          "Connection Timeout",
          "Could not connect to server. Make sure:\n1. Server is running (npm run server)\n2. Correct IP address in src/config/api.js\n3. Both devices on same network"
        );
      } else {
        Alert.alert("Error", `Failed to create event: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Card */}
      <View style={styles.topCard}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Event</Text>
        <Text style={styles.subtitle}>Add details to book {hall.name}</Text>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Event Date</Text>
          <TouchableOpacity
            style={[
              styles.input,
              dateConflict && typeof dateConflict === 'string' && styles.inputError
            ]}
            onPress={() => setShowPicker(true)}
            disabled={checkingAvailability}
          >
            <View style={styles.dateInputContainer}>
              <Text style={[
                dateConflict && typeof dateConflict === 'string' && styles.dateTextError
              ]}>
                {date.toDateString()}
              </Text>
              {checkingAvailability && (
                <ActivityIndicator size="small" color="#EF7B02" style={{ marginLeft: 8 }} />
              )}
            </View>
          </TouchableOpacity>
          {dateConflict && typeof dateConflict === 'string' && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{dateConflict}</Text>
            </View>
          )}
          {dateConflict === false && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.successText}>Date is available</Text>
            </View>
          )}
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(e, selected) => {
                setShowPicker(false);
                if (selected) {
                  setDate(selected);
                  // Availability check will happen via useEffect
                }
              }}
            />
          )}

          <Text style={styles.label}>Devotee Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#a78787"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor="#a78787"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Purohit Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#a78787"
            value={purohitName}
            onChangeText={setPurohitName}
          />

          <Text style={styles.label}>Purohit Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor="#a78787"
            keyboardType="phone-pad"
            value={purohitphone}
            onChangeText={setPurohitPhone}
          />

          <Text style={styles.label}>Caterer Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#a78787"
            value={caterername}
            onChangeText={setCatererName}
          />

          <Text style={styles.label}>Caterer Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor="#a78787"
            keyboardType="phone-pad"
            value={catererphone}
            onChangeText={setCatererPhone}
          />

          <Text style={styles.label}>Advance Paid</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#a78787"
            keyboardType="phone-pad"
            value={advance}
            onChangeText={setAdvance}
          />

          <Text style={styles.label}>Balance</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#a78787"
            keyboardType="phone-pad"
            value={balance}
            onChangeText={setBalance}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Optional..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[
            styles.createBtn, 
            (loading || checkingAvailability || (dateConflict && typeof dateConflict === 'string')) && styles.createBtnDisabled
          ]} 
          onPress={handleSave}
          disabled={loading || checkingAvailability || (dateConflict && typeof dateConflict === 'string')}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createText}>Create</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  topCard: {
    backgroundColor: "#f1e5dc",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF7B02",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    color: "#555",
  },
  form: {
    padding: 16,
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  actions: {
    marginTop: "auto",
    padding: 16,
  },
  createBtn: {
    backgroundColor: "#EF7B02",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  createText: {
    color: "#fff",
    fontWeight: "600",
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  cancel: {
    textAlign: "center",
    marginTop: 12,
    color: "#64748b",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  dateTextError: {
    color: "#dc2626",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  errorText: {
    color: "#dc2626",
    marginLeft: 6,
    fontSize: 12,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    padding: 8,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#16a34a",
  },
  successText: {
    color: "#16a34a",
    marginLeft: 6,
    fontSize: 12,
    flex: 1,
  },
});
