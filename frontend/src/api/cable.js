import { createConsumer } from "@rails/actioncable";

const CABLE_URL = import.meta.env.VITE_CABLE_URL || "ws://localhost:9000/cable";

let consumer = null;

export function getConsumer() {
  if (!consumer) {
    const token = localStorage.getItem("authToken");
    consumer = createConsumer(`${CABLE_URL}?token=${token}`);
  }
  return consumer;
}

export function resetConsumer() {
  consumer?.disconnect();
  consumer = null;
}
