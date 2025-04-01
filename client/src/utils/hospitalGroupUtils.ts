/**
 * Hospital Group Channel Utilities
 *
 * This module provides helper functions for working with hospital group channels
 * and managing hospital context in the application.
 */

import { AppDispatch } from '../redux/store'
import { setCurrentHospitalId } from '../redux/userHospitalSlice'
import request from './request'

/**
 * Detect if a channel is a hospital group channel based on its name or other properties
 * @param channelName The name of the channel to check
 * @returns True if this is a hospital group channel, false otherwise
 */
export const isHospitalGroupChannel = (channelName: string): boolean => {
  // You may need to adjust this logic based on your naming conventions
  return channelName.includes('Hospital') || channelName.includes('hospital')
}

/**
 * Find the hospital ID associated with a channel and store it in Redux
 * @param channelId The ID of the channel to check
 * @param dispatch Redux dispatch function
 */
export const loadHospitalContext = async (
  channelId: string,
  dispatch: AppDispatch
): Promise<string | null> => {
  try {
    // First get channel info
    const channelInfo = await request(`/api/channels/${channelId}`)
    
    if (!channelInfo || !isHospitalGroupChannel(channelInfo.name)) {
      return null
    }
    
    // Try to find hospital by group ID
    const hospitalData = await request(`/api/hospitals?groupId=${channelId}`)
    
    if (hospitalData && hospitalData.length > 0) {
      const hospitalId = hospitalData[0].hospitalId
      // Store in Redux
      dispatch(setCurrentHospitalId(hospitalId))
      console.log('Set hospital ID in Redux:', hospitalId)
      return hospitalId
    }
    
    return null
  } catch (error) {
    console.error('Error loading hospital context:', error)
    return null
  }
}
