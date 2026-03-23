import { useState, useCallback, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API_BASE_URL from "../config/api";

// Color constants based on booking count
const COLORS = {
  GREEN: "#22c55e",   // 0-1 bookings (Available)
  YELLOW: "#f59e0b",  // 2-3 bookings (Medium)
  RED: "#ff4444",     // 4+ bookings (Full)
};

export default function CalendarScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const abortRef = useRef(null);

  // Fetch events from API (only one trigger via useFocusEffect)
  const fetchEvents = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      processEventsForCalendar(data);
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Error fetching events for calendar:", error);
      setEvents([]);
      setMarkedDates({});
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }, []);

  // Process events and create marked dates based on booking count
  const processEventsForCalendar = (eventsData) => {
    const dateCounts = {};
    
    // Count events per date
    eventsData.forEach((event) => {
      const eventDate = new Date(event.date);
      // Format date as YYYY-MM-DD
      const dateKey = eventDate.toISOString().split('T')[0];
      
      if (dateCounts[dateKey]) {
        dateCounts[dateKey]++;
      } else {
        dateCounts[dateKey] = 1;
      }
    });

    // Create marked dates with colors based on count
    const marked = {};
    Object.keys(dateCounts).forEach((date) => {
      const count = dateCounts[date];
      let color;
      
      if (count <= 1) {
        color = COLORS.GREEN; // 0-1 bookings: Green (Available)
      } else if (count <= 3) {
        color = COLORS.YELLOW; // 2-3 bookings: Yellow (Medium)
      } else {
        color = COLORS.RED; // 4+ bookings: Red (Full)
      }

      marked[date] = {
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 12,
            elevation: 2,
          },
          text: { color: "#fff", fontWeight: "700" },
        },
      };
    });

    setMarkedDates(marked);
  };

  // Fetch events when screen comes into focus; abort in-flight request when leaving
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      return () => abortRef.current?.abort();
    }, [fetchEvents])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Card Header */}
      <View style={styles.topCard}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>View your upcoming hall bookings</Text>
      </View>

      <View style={styles.calendarWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF7B02" />
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        ) : (
          <Calendar
            markingType={"custom"}
            markedDates={markedDates}
            theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",

            // 🟢 Green for Day Headers (Mon, Tue, etc.)
            textSectionTitleColor: "#2ecc71",

            // 🟠 Orange for "Today" and Interactive elements
            todayTextColor: "#EF7B02",
            arrowColor: "#EF7B02",
            selectedDayBackgroundColor: "#EF7B02",

            // 🔴 Red for the Month Title (June 2026)
            monthTextColor: "#ff7675",

            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "700", // Made bolder to show color better
            textDayFontSize: 14,
            textMonthFontSize: 20,
            }}
            style={styles.calendar}
          />
        )}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.GREEN }]} />
            <Text style={styles.legendText}>Available (1)</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.YELLOW }]} />
            <Text style={styles.legendText}>Medium (2-3)</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.RED }]} />
            <Text style={styles.legendText}>Full (4+)</Text>
          </View>
        </View>
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
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF7B02",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
  },
  calendarWrapper: {
    paddingHorizontal: 10,
  },
  calendar: {
    borderRadius: 20,
    paddingBottom: 10,
    // Add a slight shadow to make it pop like the image
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 25,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6, // Circular dot
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
  },
});
