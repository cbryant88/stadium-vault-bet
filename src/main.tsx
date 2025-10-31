import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import './lib/ethereum-fix'; // Fix ethereum injection conflicts - must load first
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
