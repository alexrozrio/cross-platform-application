import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import { getConfiguredApiBaseUrl } from "./lib/api-base-url";
import "./index.css";

setBaseUrl(getConfiguredApiBaseUrl());

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
  document.documentElement.classList.add("capacitor-android");
}

createRoot(document.getElementById("root")!).render(<App />);
