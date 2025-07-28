# PennyLane Support Frontend

This is the frontend for the PennyLane Support Platform, built with React and Material-UI. It provides a user interface for browsing coding challenges and participating in support conversations.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn package manager
- Backend API server (see backend README for setup instructions)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pennylane-support.git
   cd pennylane-support/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open in browser**
   The application will open automatically in your default browser at [http://localhost:3000](http://localhost:3000)

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Project Structure

```
src/
  ├── api/                  # API client and service functions
  │   └── client.ts         # API client configuration
  │
  ├── components/           # Reusable UI components
  │   ├── ChallengeList.tsx # List of coding challenges
  │   └── ChallengeDetail.tsx # Challenge details and discussion
  │
  ├── App.tsx              # Main application component with routing
  └── index.tsx            # Application entry point
```

## Features

- Browse coding challenges with filtering options
- View challenge details including description, difficulty, and tags
- Participate in discussions through threaded conversations
- Real-time updates for new posts
- Responsive design that works on desktop and mobile

## Configuration

By default, the frontend expects the backend API to be running at `http://localhost:8000`. To change this, modify the `API_BASE_URL` in `src/api/client.ts`.

## Dependencies

- React 18
- React Router 6
- Material-UI 5
- TypeScript
- Axios (for HTTP requests)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
