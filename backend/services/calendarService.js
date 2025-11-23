const { google } = require('googleapis');
const axios = require('axios');
const logger = require('../utils/logger');

class CalendarService {
  
  async createGoogleMeet(meetingData) {
    try {
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        logger.warn('Google Calendar not configured');
        return null;
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary: meetingData.summary,
        description: meetingData.description,
        start: {
          dateTime: meetingData.start,
          timeZone: meetingData.timeZone || 'UTC'
        },
        end: {
          dateTime: new Date(new Date(meetingData.start).getTime() + (meetingData.duration || 30) * 60000).toISOString(),
          timeZone: meetingData.timeZone || 'UTC'
        },
        attendees: meetingData.attendees || [],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      return response.data;
    } catch (error) {
      logger.error('Create Google Meet error:', error.message);
      return null;
    }
  }

  async createZoomMeeting(meetingData) {
    try {
      if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
        logger.warn('Zoom not configured');
        return null;
      }

      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: meetingData.topic,
          type: 2, // Scheduled meeting
          start_time: meetingData.start_time,
          duration: meetingData.duration || 30,
          timezone: meetingData.timezone || 'UTC',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ZOOM_JWT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Create Zoom meeting error:', error.message);
      return null;
    }
  }

  async updateGoogleMeetEvent(eventId, updateData) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: updateData
      });

      return response.data;
    } catch (error) {
      logger.error('Update Google Meet event error:', error.message);
      return null;
    }
  }

  async cancelGoogleMeetEvent(eventId) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId
      });

      return true;
    } catch (error) {
      logger.error('Cancel Google Meet event error:', error.message);
      return false;
    }
  }
}

module.exports = new CalendarService();