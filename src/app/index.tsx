import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { FiltersProvider } from "src/shared/contexts/FiltersContext";
import App from "./App";
import "./index.css";
import "./polyfills.ts";
import { store } from "./providers/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <FiltersProvider>
          <App />
        </FiltersProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
