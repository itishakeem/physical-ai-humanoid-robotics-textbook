// src/theme/Root.js
import React from "react";
import { AuthProvider } from "@site/src/contexts/AuthContext";
const ChatWidget = React.lazy(() => import("@site/src/components/ChatWidget"));

export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
      <React.Suspense fallback={null}>
        <ChatWidget />
      </React.Suspense>
    </AuthProvider>
  );
}