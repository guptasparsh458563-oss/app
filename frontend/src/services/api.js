import axios from 'axios';

// Create or get browser-based user ID
function getUserId() {
  let userId = localStorage.getItem("vidpulse_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("vidpulse_user_id", userId);
  }
  return userId;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * Fetch YouTube channel videos from backend
 * @param {string} channelInput - YouTube channel URL or ID
 * @param {number} videoCount - Number of videos to fetch (1-500)
 * @returns {Promise<Object>} Response with video data
 */
export const fetchChannelVideos = async (channelInput, videoCount) => {
  try {
    const response = await axios.get(`${API}/youtube/channel-videos`, {
      params: {
        channel: channelInput,
        count: videoCount,
        user_id: getUserId()
      }
    });
    return response.data;
  } catch (error) {
    // Handle axios error
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        error: error.response.data.error || error.response.data.detail || 'Failed to fetch videos'
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        success: false,
        error: 'Unable to connect to server. Please try again.'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};