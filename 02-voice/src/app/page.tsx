"use client";

import { useRef, useState } from "react";
import {
  RealtimeAgent,
  RealtimeItem,
  RealtimeSession,
  tool,
} from "@openai/agents/realtime";
import { getSessionToken } from "./server/token";
import z from "zod";

const getWeather = tool({
  name: "getWeather",
  description: "Get the weather in a given location",
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
});

const weatherAgent = new RealtimeAgent({
  name: "Weather Agent",
  instructions: "Talk with a New York accent",
  handoffDescription: "This agent is an expert in weather",
  tools: [getWeather],
});

const agent = new RealtimeAgent({
  name: "Voice Agent",
  instructions:
    "You are a voice agent that can answer questions and help with tasks.",
  handoffs: [weatherAgent],
});

export default function Home() {
  const session = useRef<RealtimeSession | null>(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState<RealtimeItem[]>([]);

  async function onConnect() {
    if (connected) {
      setConnected(false);
      await session.current?.close();
    } else {
      const token = await getSessionToken();
      session.current = new RealtimeSession(agent, {
        model: "gpt-4o-realtime-preview-2025-06-03",
      });
      session.current.on("transport_event", (event) => {
        console.log(event);
      });
      session.current.on("history_updated", (history) => {
        setHistory(history);
      });
      session.current.on(
        "tool_approval_requested",
        async (context, agent, approvalRequest) => {
          const response = prompt("Approve or deny the tool call?");
          session.current?.approve(approvalRequest.approvalItem);
        }
      );
      await session.current.connect({
        apiKey: token,
      });
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
      <ul>
        {history
          .filter((item) => item.type === "message")
          .map((item) => (
            <li key={item.itemId}>
              {item.role}: {JSON.stringify(item.content)}
            </li>
          ))}
      </ul>
    </div>
  );
}
