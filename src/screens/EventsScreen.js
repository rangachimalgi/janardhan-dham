import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import EventCard from "../components/EventCard.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import API_BASE_URL from "../config/api";

export default function EventsScreen() {
  const navigation = useNavigation();
  const [allEvents, setAllEvents] = useState([]); // Store all events
  const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events to display
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDate, setFilterDate] = useState(null); // Selected filter date
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchEvents = async () => {
    try {
      console.log("Fetching events from:", `${API_BASE_URL}/events`);
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      console.log("Response status:", response.status);
      console.log("Response content-type:", contentType);
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error("Error response body:", errorText);
          // If it's HTML, it's likely a 404 or server error page
          if (errorText.trim().startsWith('<')) {
            errorMessage = `Server returned HTML instead of JSON. This usually means:\n1. The API endpoint doesn't exist\n2. The server isn't running properly\n3. Check if the URL is correct: ${API_BASE_URL}/events`;
          } else {
            errorMessage = errorText;
          }
        } catch (e) {
          console.error("Could not read error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 200));
        throw new Error(
          `Server returned ${contentType || 'unknown content type'} instead of JSON.\n` +
          `This usually means the API endpoint is incorrect or the server is returning an error page.\n` +
          `Expected: ${API_BASE_URL}/events`
        );
      }
      
      const data = await response.json();
      console.log("Events fetched successfully:", data.length);
      
      // Format events for display
      const formattedEvents = data.map((event) => ({
        ...event, // Keep all original data first
        id: event._id,
        hallDisplay: event.hall?.name || "Unknown Hall", // String for display
        // Keep original hall object for editing
        dateDisplay: new Date(event.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        // Keep original date for editing
      }))
      // Sort events by date (earliest first)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // Ascending order (earliest first)
      });
      
      setAllEvents(formattedEvents);
      applyFilter(formattedEvents, filterDate);
    } catch (error) {
      console.error("Error fetching events:", error);
      if (error.name === 'AbortError') {
        Alert.alert(
          "Connection Timeout", 
          "Could not connect to server. Make sure:\n1. Server is running (npm run server)\n2. Correct IP address in src/config/api.js\n3. Both devices on same network"
        );
      } else if (error.message.includes('JSON') || error.message.includes('Unexpected character')) {
        Alert.alert(
          "API Connection Error", 
          `${error.message}\n\nThis usually means:\n1. The backend server isn't running on Render\n2. The API URL is incorrect\n3. The server is returning an error page\n\nCheck Render dashboard to ensure the service is running.`
        );
      } else {
        Alert.alert(
          "Error", 
          `Failed to load events: ${error.message}\n\nAPI URL: ${API_BASE_URL}/events`
        );
      }
      setAllEvents([]); // Set empty array on error
      setFilteredEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events by date
  const applyFilter = (eventsToFilter, selectedDate) => {
    if (!selectedDate) {
      // Sort filtered events by date when no filter is applied
      const sorted = [...eventsToFilter].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // Ascending order (earliest first)
      });
      setFilteredEvents(sorted);
      return;
    }

    // Format selected date to YYYY-MM-DD for comparison
    const filterDateStr = selectedDate.toISOString().split('T')[0];
    
    const filtered = eventsToFilter.filter((event) => {
      const eventDate = new Date(event.date);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === filterDateStr;
    });

    // Sort filtered results by date
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB; // Ascending order (earliest first)
    });

    setFilteredEvents(sorted);
  };

  // Handle date filter change
  const handleFilterDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    // Check if user dismissed/canceled the picker
    // On Android: event.type === 'dismissed' or selectedDate is undefined
    // On iOS: selectedDate is undefined when canceled
    if (event.type === 'dismissed' || !selectedDate) {
      // User canceled, don't change filter
      return;
    }
    
    // User selected a date
    setFilterDate(selectedDate);
    applyFilter(allEvents, selectedDate);
  };

  // Clear filter
  const clearFilter = () => {
    setFilterDate(null);
    setFilteredEvents(allEvents);
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // Reapply filter when allEvents changes
  useEffect(() => {
    if (allEvents.length > 0) {
      applyFilter(allEvents, filterDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents]);

  const handleEdit = (event) => {
    // TODO: Navigate to edit screen
    console.log("Edit:", event);
  };

  const handleDelete = (event) => {
    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${event.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting event:", `${API_BASE_URL}/events/${event.id}`);
              
              // Add timeout to fetch
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
              
              const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
                method: "DELETE",
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              if (!response.ok) {
                throw new Error(`Failed to delete event: ${response.status}`);
              }

              // Refresh events list
              fetchEvents();
              Alert.alert("Success", "Event deleted successfully");
            } catch (error) {
              console.error("Error deleting event:", error);
              if (error.name === 'AbortError') {
                Alert.alert("Connection Timeout", "Could not connect to server. Please try again.");
              } else {
                Alert.alert("Error", `Failed to delete event: ${error.message}`);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.topCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>
              {filterDate 
                ? `Filtered: ${filterDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "All events"}
            </Text>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterBtn, filterDate && styles.filterBtnActive]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons 
                name={filterDate ? "calendar" : "calendar-outline"} 
                size={20} 
                color={filterDate ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
            {filterDate && (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={clearFilter}
              >
                <Ionicons name="close-circle" size={20} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={handleFilterDateChange}
        />
      )}

      {/* Scrollable List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF7B02" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {filterDate ? "No events on this date" : "No events found"}
          </Text>
          <Text style={styles.emptySubtext}>
            {filterDate 
              ? "Try selecting a different date or clear the filter"
              : "Create your first event from the home screen"}
          </Text>
          {filterDate && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilter}>
              <Text style={styles.clearFilterButtonText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
              onPress={() => navigation.navigate("EventDetails", { event: item })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  topCard: {
    backgroundColor: "#f1e5dc",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  subtitle: {
    marginTop: 6,
    color: "#555",
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterBtnActive: {
    backgroundColor: "#EF7B02",
    borderColor: "#EF7B02",
  },
  clearFilterBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  clearFilterButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#EF7B02",
    borderRadius: 8,
  },
  clearFilterButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
});
