# Expense Tracker App

A cross-platform mobile and web application for tracking personal and shared expenses, built with Expo and React Native.

## Overview

This expense tracker application allows users to record, categorize, and analyze their expenses. It supports group expense tracking, making it easy to split bills and keep track of who owes whom. The app includes features like receipt scanning, expense categorization, and statistical analysis of spending patterns.

## Features

- **Receipt Scanning**: Take photos of receipts to automatically extract expense information
- **Expense Recording**: Add, edit, and delete expenses with descriptions, amounts, and categories
- **Group Expense Management**: Create groups to share expenses with friends, family, or colleagues
- **Expense Splitting**: Split expenses equally or unevenly among group members
- **Debt Calculation**: Automatically calculate who owes whom within a group
- **Expense Statistics**: View spending patterns and trends by category and time period
- **Cross-Platform**: Works on iOS, Android, and web platforms

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   API_URL=http://localhost:3000 # URL to your backend service
   ```

4. Start the development server
   ```bash
   npx expo start
   ```

### Running the App

After starting the development server, you can:

- Run on iOS simulator: Press `i` in the terminal or click "Run on iOS simulator" in the Expo DevTools
- Run on Android emulator: Press `a` in the terminal or click "Run on Android device/emulator" in the Expo DevTools
- Run on web: Press `w` in the terminal or click "Run in web browser" in the Expo DevTools
- Run on your device: Scan the QR code with the Expo Go app (available on [iOS](https://apps.apple.com/app/expo-go/id982107779) and [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Project Structure

- `/app`: Main application code using Expo Router for navigation
  - `/(apps)`: Main application screens
  - `/(apps)/(tabs)`: Tab-based navigation screens
- `/components`: Reusable UI components
- `/context`: React context providers
- `/dto`: Data transfer objects
- `/hooks`: Custom React hooks
- `/service`: API service functions
- `/constants`: Application constants
- `/assets`: Images, fonts, and other static assets

## Backend Integration

This frontend application communicates with a NestJS backend service (`expense-tracker-backend`) that provides:

- User authentication and management
- Expense data storage and retrieval
- Group management
- Receipt image processing

Make sure the backend service is running before using the full features of the app.

## Technologies Used

- [Expo](https://expo.dev/): Development framework for React Native
- [React Native](https://reactnative.dev/): Framework for building native apps using React
- [Expo Router](https://docs.expo.dev/router/introduction/): File-based routing for Expo apps
- [React Context](https://reactjs.org/docs/context.html): For state management
- [Axios](https://axios-http.com/): For API requests
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/): For camera and image library access
- [React Native UI DatePicker](https://www.npmjs.com/package/react-native-ui-datepicker): For date selection
- [Day.js](https://day.js.org/): For date manipulation
- [date-fns](https://date-fns.org/): For date formatting

## License

This project is licensed under the MIT License.
