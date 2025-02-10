import _ from 'lodash'

/**
 * Request Utility
 *
 * This module provides a wrapper around the fetch API to simplify HTTP requests.
 */

/**
 * Interface for request errors
 */
export interface IRequestError {
  status: number // HTTP status code of the error
  message: string // Error message
}

/**
 * Enhanced fetch function with automatic header addition and error handling
 *
 * @param url - The URL to send the request to
 * @param options - Optional RequestInit object to customize the request
 * @param multipart - Boolean flag to indicate if the request is multipart/form-data
 * @returns A promise that resolves to the response body, or rejects with an IRequestError
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const request = async <T = any>(
  url: RequestInfo,
  options?: RequestInit | undefined,
  multipart = false,
) => {
  // Merge default headers with provided options
  const fetchOptions = _.merge(
    {
      headers: {
        'Content-Type': 'application/json',
        'x-application-token': localStorage.getItem('token'),
        'x-application-uid': localStorage.getItem('uid'),
      },
    },
    options,
  )

  // Handle multipart requests
  if (multipart) {
    fetchOptions.headers['Content-Type'] = ''
  }

  // Send the request and handle the response
  return fetch(`${process.env.REACT_APP_BACKEND_URL}${url}`, fetchOptions).then(
    async (response) => {
      const body = (await response.json()) as Promise<T>

      if (response.ok) {
        return body
      } else {
        throw { status: response.status, ...body } as unknown as IRequestError
      }
    },
  )
}

export default request
