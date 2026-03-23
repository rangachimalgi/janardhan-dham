import API_BASE_URL from '../config/api';

/**
 * Test API connection
 * Call this function to verify the backend is accessible
 */
export const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection Successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ API Connection Failed:', response.status);
      return { success: false, error: `Status: ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API Connection Error:', error.message);
    console.log('💡 Make sure:');
    console.log('   1. Backend server is running (npm run server)');
    console.log('   2. MongoDB is connected');
    console.log('   3. API URL is correct:', API_BASE_URL);
    return { success: false, error: error.message };
  }
};

/**
 * Get all events from API
 */
export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
