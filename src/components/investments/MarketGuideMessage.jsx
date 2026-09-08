import ReactMarkdown from "react-markdown";

export default function MarketGuideMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-[#C9A84C] text-[#1A1A2E]" : "bg-muted text-foreground"}`}>
        {message.content && (isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{message.content}</ReactMarkdown>)}
        {message.tool_calls?.map((call, index) => {
          const active = ["pending", "running", "in_progress"].includes(call.status);
          const failed = ["failed", "error"].includes(call.status);
          const projection = call.display_projection || {};
          const label = active ? projection.active_label : failed ? projection.error_label : projection.label;
          return <p key={index} className="mt-2 text-xs opacity-60">{label || (active ? "Checking market information…" : failed ? "Market check failed" : "Market information checked")}</p>;
        })}
      </div>
    </div>
  );
}