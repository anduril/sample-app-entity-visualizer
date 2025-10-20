# Entity Map Visualizer

![Sample App](images/app.png)

## Description

This web application implements a custom UI with JavaScript + [Vite](https://vite.dev/) that leverages the Lattice SDK's gRPC streaming capabilities. It uses the JavaScript types generated in the [Lattice SDK Buf Repository] alongside ConnectRPC to update simulated Entity positions on a map in real-time. 

The project uses the following dependencies:
* `Connect RPC` - To make the gRPC+Web requests
* `Material UI` - For styling and basic components
* `React` - UI Framework
* `React Leaflet` - A React wrapper around the [Leaflet](https://leafletjs.com/) open-source Javascript map library
* `React Leaflet MarkerCluster` - Clusters Leaflet markers. 

## How to run locally

### Pre-Requisites

This sample app requires that you have:

* [NodeJS](https://nodejs.org/en/download)

### Clone the repository

```bash
git clone https://github.com/anduril/sample-app-entity-visualizer
cd sample-app-entity-visualizer
```

### Set variables

You now need to provide the sample application with the endpoint to get data from. To do so please create a `.env` file at the root of this project folder and populate it with:

```bash
VITE_ENVIRONMENT_TOKEN=""
VITE_SANDBOX_TOKEN=""
VITE_LATTICE_URL=""
```

For information on how to obtain these tokens, see the [Sandboxes documentation](https://developer.anduril.com/guides/getting-started/sandboxes#get-the-tokens).

Please contact your Anduril representative if you need assistance with populating these values or run into any authentication issues.

### Run the application

```bash
npm install
npm run dev
```

In the terminal window, open the local link to view the application. You should now see the application in your web browser.

![Terminal](images/terminal.png)

## Learn More

To learn more about the Lattice SDK, please visit our [documentation site](https://docs.anduril.com).

## Support

For support with this library please file an issue or reach out to your Anduril representative.
