# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Development Setup

To run this project in development mode, you'll need to configure your Home Assistant connection:

1. **Set up your Home Assistant proxy**: The project is configured to use a proxy in development mode (see `package.json` proxy setting)

2. **Configure your Home Assistant connection**: Create a `.env.development` file in the project root:
   ```
   # Home Assistant Configuration for Local Development
   REACT_APP_HASS_URL=http://your-home-assistant-ip:8123
   REACT_APP_HASS_TOKEN=your-long-lived-access-token-here
   ```

3. **Generate a Long-Lived Access Token**:
   - Go to your Home Assistant instance
   - Navigate to Profile > Security > Long-Lived Access Tokens
   - Create a new token and copy it to your `.env.development` file

4. **Update the proxy** (if needed): Edit the `proxy` setting in `package.json` to match your Home Assistant URL

**Note**: The `REACT_APP_HASS_URL` in your `.env.development` file should match the `proxy` setting in `package.json`. This URL is used for WebSocket connections, while HTTP API calls use the proxy for routing.

The development setup uses relative API calls that are proxied to your Home Assistant instance, while production uses the runtime configuration from `public/config.js`.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
