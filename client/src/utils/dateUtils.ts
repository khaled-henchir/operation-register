/**
 * Date Utility Functions
 *
 * This file contains utility functions for working with dates.
 * These functions help format and manipulate dates throughout the application.
 */

/**
 * Formats a date string to a localized format
 * @param {string} dateString - The date string to format (YYYY-MM-DD)
 * @param {Intl.LocalesArgument} locale - The locale to use for formatting (defaults to 'fr-FR')
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString: string, locale: Intl.LocalesArgument = "fr-FR"): string => {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

/**
 * Calculates the number of days between two dates
 * @param {string | Date} startDate - The start date
 * @param {string | Date} endDate - The end date
 * @returns {number} The number of days between the dates
 */
export const daysBetween = (startDate: string | Date, endDate: string | Date = new Date()): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime())

  // Convert to days
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Checks if a date is in the past
 * @param {string | Date} date - The date to check
 * @returns {boolean} True if the date is in the past, false otherwise
 */
export const isDatePast = (date: string | Date): boolean => {
  const checkDate = new Date(date)
  const today = new Date()

  // Set time to midnight for comparison
  today.setHours(0, 0, 0, 0)
  checkDate.setHours(0, 0, 0, 0)

  return checkDate < today
}

