"use client";

import { useState } from "react";

export default function Home() {
  const [connected, setConnected] = useState(false);

  async function onConnect() {
    if (connected) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Voice Agent Demo</h1>
      <button
        onClick={onConnect}
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 cursor-pointer"
      >
        {connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}
