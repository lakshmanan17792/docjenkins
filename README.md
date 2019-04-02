
# Intelligent Talent Acquisition

Intelligent Talent Acquisition (ITA) project is a software for recruitment agencies. It involves Artificial Intelligence to identify the matching candidates. It handles the complete workflow of the recruitment agencies from the sales team to the candidates.

## Installation

```bash
npm install
```

## Running Dev Server

```bash
npm run dev
```

## Building and Running Production Server

```bash
npm run build
npm run start
```

## Explanation

What initially gets run is `bin/server.js`, which does little more than enable ES6 and ES7 awesomeness in the server-side node code. It then initiates `server.js`. In `server.js` we proxy any requests to `/api/*` to the API server, running at `localhost:3030`. All the data fetching calls from the client go to `/api/*`. Aside from serving the favicon and static content from `/static`, the only thing `server.js` does is initiate delegate rendering to `react-router`. At the bottom of `server.js`, we listen to port `3000` and initiate the API server.

#### Client Side

The client side entry point is reasonably named `client.js`. All it does is load the routes, initiate `react-router`, rehydrate the redux state from the `window.__data` passed in from the server, and render the page over top of the server-rendered DOM. This makes React enable all its event listeners without having to re-render the DOM.

## App Constants

App constants are maintained in 

```bash
src/helpers/Constants.js
```