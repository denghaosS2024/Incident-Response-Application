import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const DEFAULT_DURATION_MS = 1500

export enum SnackbarType {
  INFO = 'INFO',
  GOOD = 'GOOD',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CLOSED = 'CLOSED',
}

export interface SnackbarState {
  type: SnackbarType
  message: string
  durationMs: number | undefined
}

const initialState: SnackbarState = {
  type: SnackbarType.CLOSED,
  message: '',
  durationMs: 0,
}

const snackbarState = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    /**
     * Set the snackbar state. Use this to show a snackbar message.
     * @param state - The current state
     * @param action - The action to set the snackbar state
     */
    setSnackbar: (state, action: PayloadAction<SnackbarState>) => {
      const payload = action.payload
      if (payload.durationMs === undefined) {
        payload.durationMs = DEFAULT_DURATION_MS
      }

      // Do not open a snackbar if the message is empty
      if (payload.message === undefined || payload.message.length === 0) {
        console.warn(`SnackbarState: Cannot show empty message!`)
        payload.type = SnackbarType.CLOSED
      }

      console.debug(`Snackbar fired! Payload: ${JSON.stringify(payload)}`)

      state.type = payload.type
      state.message = payload.message
      state.durationMs = payload.durationMs
    },
    clearSnackbar: (state) => {
      state.type = SnackbarType.CLOSED
      state.message = ''
      state.durationMs = 0
    },
  },
})

export const { setSnackbar, clearSnackbar } = snackbarState.actions

export default snackbarState.reducer
