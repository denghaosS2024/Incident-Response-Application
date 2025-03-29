[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=18111852)

# SEM Incident Response App

## _!Important!_ Setup `.env` before starting apps!

your `client/.env` should look like this

```bash
VITE_BACKEND_URL=http://localhost:3001 # TODO: change to your backend url, but by default it's localhost:3001
VITE_LAUNCHDARKLY_SDK_KEY="LaunchDarkly SDK Key, find it in confluence (From Celina?)"
VITE_MAPBOX_TOKEN="Mapbox Token, find it in confluence"
```

And `server/.env` should look like this

```bash
MONGODB_URL="MongoDB URL, find it in confluence"
MONGODB_DB_NAME="MongoDB DB Name, find it in confluence"
MONGODB_TLS=0 # Or 1 if you have TLS enabled on a standalone MongoDB server instance
```

Otherwise your locally started app might have unwanted behaviors

## 🚀 Quick Start with Docker

```bash
# Build and start all services (first time or after changes)
docker compose up --build

# Access the applications:
# - Frontend: http://localhost:3000
# - Backend API: http://localhosgitt:3001
# - MongoDB: mongodb://localhost:27018
```

That's it! Your development environment is ready. 🎉

Need to stop? Run: `docker compose down`

## Project Overiew

The SEM Incident Response App is a Mobile Web Application designed to facilitate effective management and communication between First Responders (Nurses, Fire Fighters, Police, Dispatcher, etc) and Citizens during incident response scenarios.

## Features Implemented

The project is brownfield development, which means you will be developing on top of existing codebase. The features implemented are

-   User login and registration
-   Real time messaging using Socket.IO
-   Channel based messaging
-   Integration with Redux for state management
-   Storybook for UI component development and documentation

## Tools and Technologies Used

-   **Frontend**: React, Redux, Material-UI, TypeScript
-   **Backend**: Node.js, Express, MongoDB, Mongoose
-   **Real-time Communication**: Socket.IO
-   **Testing**: Jest, React Testing Library
-   **Development Tools**: Storybook, ESLint, Prettier
-   **Version Control**: Git, GitHub
-   **Containerization**: Docker, Docker Compose

Check for package.json in `/client` and `/server` to check additional libraries used

## Docker Development Guide

### Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Ensure Docker Desktop is running before starting the application

### Docker Commands for Daily Use

-   `docker compose up --build` - Build and start all containers (use for first time setup or after changes)
-   `docker compose up` - Start existing containers without rebuilding (daily development)
-   `docker compose down` - Stop and remove all containers
-   `docker compose logs -f` - Watch logs from all containers (add service name to watch specific service)
-   `docker compose ps` - List running containers and their status

### Docker Tips

-   Use Docker Desktop to:
    -   Monitor container status
    -   View container logs
    -   Manage containers and images
-   First time setup might take a few minutes to download and build images
-   Changes to your code will automatically reflect in the running containers
-   If you add new dependencies, you'll need to rebuild using `docker compose up --build`

### When to Use Each Command

#### First Time & Major Changes

```bash
# Full rebuild and start
docker compose up --build
```

Use this when:

-   Setting up the project for the first time
-   After changing Dockerfiles or docker-compose.yml
-   After adding/updating dependencies
-   If you're experiencing strange issues

#### Daily Development

```bash
# Start existing containers
docker compose up

# Start in detached mode (run in background)
docker compose up -d
```

Use this when:

-   Starting your work day
-   No configuration changes were made

#### Stopping Work

```bash
# Stop and remove containers
docker compose down

# Stop, remove containers, AND remove volumes (careful!)
docker compose down -v
```

#### Viewing Logs

```bash
# Watch all logs
docker compose logs -f

# Watch specific service
docker compose logs -f client
docker compose logs -f server
```

### Troubleshooting Docker

1. If containers won't start:

    ```bash
    docker compose down
    docker compose up --build
    ```

2. If changes aren't reflecting:

    - Ensure your files are being properly mounted
    - Check logs: `docker compose logs -f`

3. For dependency issues:

    ```bash
    # Stop and remove everything
    docker compose down

    # Remove node_modules volumes (if needed)
    rm -rf client/node_modules server/node_modules

    # Full rebuild
    docker compose up --build
    ```

4. To run commands in a container:
    ```bash
    docker compose exec client sh
    docker compose exec server sh
    ```

## Get Started without Docker

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

-   You can install client and server dependencies from the root folder itself.
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

6. **Run Tests**:

-   All test suits
    ```
    npm run test
    ```
-   Individual test suit, eg `channel.spec.ts`
    ```
    npx jest server/test/routers/channel.spec.ts
    ```

## Notes:

-   When installing packages for `client` or `server` without Docker, make sure you are using correct node version and in the correct directory

## Attribution

Codebase by Ojas Suhas Kapre, CMU MS-SE Class of Spring 2024.
