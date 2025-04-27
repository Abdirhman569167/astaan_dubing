"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="top-center" 
      toastOptions={{
        success: {
          style: {
            background: "#ff4e00",
            color: "white",
          },
        },
        error: {
          style: {
            background: "red",
            color: "white",
          },
        },
      }}
    />
  );
}
