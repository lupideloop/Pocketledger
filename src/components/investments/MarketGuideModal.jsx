import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MarketGuideMessage from "@/components/investments/MarketGuideMessage";
import useMarketGuide from "@/hooks/useMarketGuide";

export default function MarketGuideModal({ open, onOpenChange }) {
  const { messages, input, setInput, send, loading, error } = useMarketGuide(open);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-h-[720px] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2"><Bot className="text-[#C9A84C]" /> Investment Market Guide</DialogTitle>
          <p className="text-left text-xs text-muted-foreground">Educational market context, not personalized financial advice.</p>
        </DialogHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
          {!loading && messages.length === 0 && !error && (
            <MarketGuideMessage message={{ role: "assistant", content: "Ask how current market trends may affect any investment account you have added." }} />
          )}
          {messages.map((message, index) => <MarketGuideMessage key={message.id || index} message={message} />)}
          {loading && <p className="text-sm text-muted-foreground">Reviewing your investments…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t p-4">
          <label htmlFor="market-guide-message" className="sr-only">Message the investment market guide</label>
          <input id="market-guide-message" value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about a holding or market trend…" className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]" />
          <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Send message" className="h-11 w-11 bg-[#C9A84C] text-[#1A1A2E] hover:bg-[#b8963f]"><Send /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}