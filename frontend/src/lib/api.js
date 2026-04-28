import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
})

export const getApiErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  const status = error?.response?.status
  const serverMessage = error?.response?.data?.error

  if (status === 503) {
    return "The database is temporarily unavailable. Once MongoDB is connected, this page will load normally."
  }

  if (serverMessage) {
    return serverMessage
  }

  return error?.message || fallbackMessage
}

export const isServiceUnavailableError = (error) => error?.response?.status === 503
