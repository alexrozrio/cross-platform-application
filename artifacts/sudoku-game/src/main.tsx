import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import { getConfiguredApiBaseUrl } from "./lib/api-base-url";
import "./index.css";

setBaseUrl(getConfiguredApiBaseUrl());

createRoot(document.getElementById("root")!).render(<App />);
