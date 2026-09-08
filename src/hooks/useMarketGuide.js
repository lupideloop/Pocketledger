import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const AGENT_NAME = "investment_market_guide";

export default function useMarketGuide(open) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || conversation) return;
    setLoading(true);
    base44.agents.createConversation({ agent_name: AGENT_NAME, metadata: { name: "Investment market guide" } })
      .then(created => { setConversation(created); setMessages(created.messages || []); })
      .catch(err => setError(err.message || "Unable to start the market guide."))
      .finally(() => setLoading(false));
  }, [open, conversation]);

  useEffect(() => {
    if (!conversation?.id) return;
    return base44.agents.subscribeToConversation(conversation.id, data => setMessages(data.messages || []));
  }, [conversation?.id]);

  const send = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || !conversation || loading) return;
    setInput(""); setError(""); setLoading(true);
    setMessages(current => [...current, { role: "user", content }]);
    await base44.agents.addMessage(conversation, { role: "user", content })
      .catch(err => setError(err.message || "Unable to send your message."))
      .finally(() => setLoading(false));
  };

  return { messages, input, setInput, send, loading, error };
}