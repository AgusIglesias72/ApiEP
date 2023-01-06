import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

const { GOOGLE_SPREADSHEET_ID, GOOGLE_APPLICATION_CREDENTIALS } = process.env

const auth = new google.auth.GoogleAuth({
  keyFile: GOOGLE_APPLICATION_CREDENTIALS,
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
})

const spreadsheetId = GOOGLE_SPREADSHEET_ID

const client = async () => {
  return await auth.getClient()
}

const googleSheets = google.sheets({
  version: 'v4',
  auth: client,
})

export const getRows = async (table_name) => {
  const response = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: table_name,
  })

  return response
}

export const appendData = async (table_name, values) => {
  try {
    googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: spreadsheetId,
      range: table_name,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    })
    return 'Ok'
  } catch (error) {
    return 'Error'
  }
}

export const clearData = async (table_name) => {
  try {
    googleSheets.spreadsheets.values.clear({
      auth,
      spreadsheetId: spreadsheetId,
      range: `${table_name}`,
    })
    return 'Ok'
  } catch (error) {
    return 'Error'
  }
}
