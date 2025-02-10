# SEM Incident Response App

## Project Overiew

The SEM Incident Response App is a Mobile Web Application designed to facilitate effective management and communication between First Responders (Nurses, Fire Fighters, Police, Dispatcher, etc) and Citizens during incident response scenarios.

## Features Implemented

The project is brownfield development, which means you will be developing on top of existing codebase. The features implemented are

- User login and registration
- Real time messaging using Socket.IO
- Channel based messaging
- Integration with Redux for state management
- Storybook for UI component development and documentation

## Tools and Technologies Used

- **Frontend**: React, Redux, Material-UI, TypeScript
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Real-time Communication**: Socket.IO
- **Testing**: Jest, React Testing Library
- **Development Tools**: Storybook, ESLint, Prettier
- **Version Control**: Git, GitHub

Check for package.json in `/client` and `/server` to check additional libraries used

## Prerequisites

1. Install node ([Offcial Site](https://nodejs.org/en/download/package-manager))
2. Install nvm ([Follow Steps](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating))
3. Create MongoDB instance locally or on cloud using MongoDB Atlas

## Get Started

1. Go to the repository. Before installing dependencies, make sure you are using correct node version. This project uses `v18.17.0`. To ensure, correct node version, run the following command

   ```bash
   nvm use
   ```

   Above command, finds the `.nvmrc` and uses the version mentioned in the file

   If the version is not installed, simply run

   ```bash
   nvm install
   ```

   **\*Note**: Node Version Manager should be installed as mentioned in Prerequisites section of readme\*

2. **Install dependencies**:

- You can install client and server dependencies from the root folder itself.
  ```bash
  npm install
  ```

3. **Set up environment variables**:

   - Create a `.env` file in the both `client` and `server` directories based on the `.env.sample` files prensent in respective folders.
   - For `/client/.env`, enter the value for `REACT_APP_BACKEND_URL`. For local development, the value will be `http://localhost:3001`, the value will be different once you deploy it.
   - For `/server/.env`, enter the value for `MONGODB_URL`, and `MONGODB_DB_NAME`. The URL can be your locally hosted MongoDB or the URL for MongoDB Atlas.

4. **Run the application**:

   - Start both the client and server:

   ```bash
   npm run dev
   ```

   - The application will be available at `http://localhost:3000` for the client and `http://localhost:3001` for the server.

   - You may also try running the client and server separately using below commands :

     1. Run `npm start` in the `client` directory.
     2. Run `npm run dev` in the `server` directory simultaneously in a different terminal.

5. **Run Storybook**:

```bash
cd client
npm run storybook
```

Storybook will be running on `http://localhost:6006`

## Notes:

- When installing, packages for `client` or `server`, make sure you are using correct node version and in the correct directory


## Attribution

Codebase by Ojas Suhas Kapre, CMU MS-SE Class of Spring 2024.
