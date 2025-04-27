"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="bottom-right" 
      toastOptions={{
        success: {
          style: {
            background: "black",
            color: "white",
          },
        },
        error: {
          style: {
            background: "black",
            color: "white",
          },
        },
      }}
    />
  );
}
