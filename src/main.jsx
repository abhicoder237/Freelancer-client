import React              from "react";
import ReactDOM           from "react-dom/client";
import { BrowserRouter }  from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster }        from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";

import App                from "./App.jsx";
import { AuthProvider }   from "@context/AuthContext.jsx";
import { ClientProvider } from "@context/ClientContext.jsx";
import "./index.css";

// ─────────────────────────────────────────
// QUERY CLIENT
// ─────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,
      gcTime:               10 * 60 * 1000,
      retry:                1,
      retryDelay:           1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
    },
    mutations: { retry: 0 },
  },
});

// ─────────────────────────────────────────
// TOAST OPTIONS
// ─────────────────────────────────────────

const toastOptions = {
  duration: 4000,
  style: {
    background:   "var(--color-surface, #ffffff)",
    color:        "var(--color-text-primary, #111827)",
    border:       "1px solid var(--color-border, #E5E7EB)",
    borderRadius: "10px",
    fontSize:     "0.875rem",
    boxShadow:    "0 4px 20px rgba(0,0,0,0.1)",
    padding:      "12px 16px",
    maxWidth:     "380px",
  },
  success: {
    duration:  3000,
    iconTheme: { primary: "#10B981", secondary: "#ffffff" },
  },
  error: {
    duration:  5000,
    iconTheme: { primary: "#EF4444", secondary: "#ffffff" },
  },
};

// ─────────────────────────────────────────
// ROOT RENDER
// ─────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ClientProvider>

              <App />

              <Toaster
                position="top-right"
                toastOptions={toastOptions}
                containerStyle={{
                  top:   "1rem",
                  right: "1rem",
                }}
              />

            </ClientProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);