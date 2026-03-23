import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new event
router.post('/', async (req, res) => {
  try {
    const { hall, date } = req.body;
    
    console.log('📥 POST /events - Request received:', {
      hall: hall ? { id: hall.id, name: hall.name } : null,
      date: date,
      bodyKeys: Object.keys(req.body)
    });
    
    // Validate required fields
    if (!hall || !hall.id || !date) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Hall and date are required' 
      });
    }

    // Check if an event already exists for this hall on this date
    // Get all events for this hall and compare dates by day
    const requestedDate = new Date(date);
    
    // Validate date
    if (isNaN(requestedDate.getTime())) {
      console.log('❌ Invalid date format');
      return res.status(400).json({ 
        message: 'Invalid date format' 
      });
    }
    
    const requestedDateStr = requestedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('🔍 Checking for existing booking:', {
      hallId: hall.id,
      hallName: hall.name,
      requestedDate: date,
      requestedDateStr,
      requestedDateObj: requestedDate.toISOString()
    });

    // Get all events for this hall
    const hallEvents = await Event.find({ 'hall.id': hall.id });
    
    console.log(`📊 Found ${hallEvents.length} events for hall ${hall.name} (id: ${hall.id})`);
    
    // Log all existing events for debugging
    hallEvents.forEach((evt, idx) => {
      const evtDate = evt.date ? new Date(evt.date) : null;
      const evtDateStr = evtDate && !isNaN(evtDate.getTime()) ? evtDate.toISOString().split('T')[0] : 'INVALID';
      console.log(`  Event ${idx + 1}: ID=${evt._id}, Date=${evt.date}, DateStr=${evtDateStr}`);
    });
    
    // Check if any event is on the same day
    const existingEvent = hallEvents.find(event => {
      if (!event.date) {
        console.log(`  ⚠️ Event ${event._id} has no date`);
        return false;
      }
      
      const eventDate = new Date(event.date);
      
      if (isNaN(eventDate.getTime())) {
        console.log(`  ⚠️ Event ${event._id} has invalid date: ${event.date}`);
        return false;
      }
      
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const isSameDay = eventDateStr === requestedDateStr;
      
      console.log(`  Comparing: ${eventDateStr} === ${requestedDateStr} ? ${isSameDay}`);
      
      if (isSameDay) {
        console.log('❌ Found conflicting event:', {
          eventId: event._id,
          eventDate: event.date,
          eventDateStr,
          requestedDateStr
        });
      }
      
      return isSameDay;
    });

    if (existingEvent) {
      console.log('🚫 BLOCKING: Booking conflict detected!');
      return res.status(409).json({ 
        message: `This hall (${hall.name}) is already booked on ${new Date(date).toLocaleDateString()}. Only one event per hall per day is allowed.`,
        conflict: true
      });
    }

    console.log('✅ No conflict found, proceeding to create event');
    const event = new Event(req.body);
    const savedEvent = await event.save();
    console.log('✅ Event created successfully:', savedEvent._id);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('❌ Error creating event:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ message: error.message });
  }
});

// DELETE event by ID
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update event by ID
router.put('/:id', async (req, res) => {
  try {
    const { hall, date } = req.body;
    const eventId = req.params.id;

    // Validate required fields
    if (!hall || !hall.id || !date) {
      return res.status(400).json({ 
        message: 'Hall and date are required' 
      });
    }

    // Check if another event already exists for this hall on this date
    // (excluding the current event being updated)
    const requestedDate = new Date(date);
    const requestedDateStr = requestedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('🔍 Checking for existing booking (update):', {
      eventId,
      hallId: hall.id,
      hallName: hall.name,
      requestedDate: date,
      requestedDateStr
    });

    // Get all events for this hall (excluding current event)
    const hallEvents = await Event.find({ 
      'hall.id': hall.id,
      _id: { $ne: eventId }
    });
    
    console.log(`Found ${hallEvents.length} events for hall ${hall.name} (excluding current)`);
    
    // Check if any event is on the same day
    const existingEvent = hallEvents.find(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const isSameDay = eventDateStr === requestedDateStr;
      
      if (isSameDay) {
        console.log('❌ Found conflicting event:', {
          eventId: event._id,
          eventDate: event.date,
          eventDateStr,
          requestedDateStr
        });
      }
      
      return isSameDay;
    });

    if (existingEvent) {
      return res.status(409).json({ 
        message: `This hall (${hall.name}) is already booked on ${new Date(date).toLocaleDateString()}. Only one event per hall per day is allowed.`,
        conflict: true
      });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
