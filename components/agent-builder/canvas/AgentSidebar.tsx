"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStore } from "@/store/agent-builder";
import {
  Bot,
  Send,
  X,
  Plus,
  ArrowRight,
  Settings,
  Trash2,
  CircleHelp,
  Loader2,
  Zap,
} from "lucide-react";
import clsx from "clsx";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TextMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  isThinking?: boolean; // streaming but not yet done — shows thinking style
}

interface ToolCallMessage {
  id: string;
  role: "tool_call";
  toolName: string;
  args: Record<string, unknown>;
  status: "running" | "done" | "error";
}

interface AskUserMessage {
  id: string;
  role: "ask_user";
  question: string;
  answered?: string;
}

type Message = TextMessage | ToolCallMessage | AskUserMessage;

interface ApiMessage {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }[];
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading ## / ###
    if (line.startsWith("### ")) {
      result.push(
        <p key={i} className="text-white font-semibold text-[11px] mt-2 mb-0.5">
          {inlineMarkdown(line.slice(4))}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      result.push(
        <p key={i} className="text-white font-semibold text-xs mt-2.5 mb-1">
          {inlineMarkdown(line.slice(3))}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      result.push(
        <p key={i} className="text-white font-bold text-xs mt-2.5 mb-1">
          {inlineMarkdown(line.slice(2))}
        </p>,
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <ul key={`ul_${i}`} className="space-y-0.5 my-1 pl-1">
          {items.map((item, j) => (
            <li
              key={j}
              className="flex gap-1.5 text-[11px] text-white/80 leading-relaxed"
            >
              <span className="text-purple-400 mt-px shrink-0">•</span>
              <span>{inlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      result.push(
        <ol key={`ol_${i}`} className="space-y-0.5 my-1 pl-1">
          {items.map((item, j) => (
            <li
              key={j}
              className="flex gap-1.5 text-[11px] text-white/80 leading-relaxed"
            >
              <span className="text-purple-400 shrink-0 font-mono text-[10px] mt-px">
                {j + 1}.
              </span>
              <span>{inlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>,
      );
      num;
      continue;
    }

    // Empty line → spacer
    if (line.trim() === "") {
      result.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Regular paragraph
    result.push(
      <p key={i} className="text-[11px] text-white/85 leading-relaxed">
        {inlineMarkdown(line)}
      </p>,
    );
    i++;
  }

  return result;
}

function inlineMarkdown(text: string): React.ReactNode {
  // Process **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="text-white/70 not-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-white/10 text-purple-300 px-1 py-0.5 rounded text-[10px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── Tool call metadata ───────────────────────────────────────────────────────

const TOOL_META: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
    label: (args: Record<string, unknown>) => string;
    verb: string;
  }
> = {
  add_node: {
    icon: <Plus size={10} />,
    color: "text-emerald-400 border-emerald-500/25 bg-emerald-950/30",
    label: (a) => `${String(a.type ?? "").replace(/_/g, " ")}`,
    verb: "Placing",
  },
  connect_nodes: {
    icon: <ArrowRight size={10} />,
    color: "text-sky-400 border-sky-500/25 bg-sky-950/30",
    label: (a) =>
      `${String(a.sourceHandle ?? "")} → ${String(a.targetHandle ?? "")}`,
    verb: "Connecting",
  },
  configure_node: {
    icon: <Settings size={10} />,
    color: "text-amber-400 border-amber-500/25 bg-amber-950/30",
    label: (a) => `${String(a.nodeId ?? "")}`,
    verb: "Configuring",
  },
  ask_user: {
    icon: <CircleHelp size={10} />,
    color: "text-purple-400 border-purple-500/25 bg-purple-950/30",
    label: () => "clarification",
    verb: "Asking for",
  },
  clear_canvas: {
    icon: <Trash2 size={10} />,
    color: "text-rose-400 border-rose-500/25 bg-rose-950/30",
    label: () => "",
    verb: "Clearing canvas",
  },
};

// ─── SSE parser ───────────────────────────────────────────────────────────────

async function* parseSSE(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data);
        } catch {}
      }
    }
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgentSidebar() {
  const {
    nodes,
    edges,
    nodeInstances,
    addNodeToCanvas,
    onConnect,
    updateNodeConfig,
    clearCanvas,
    setAgentOpen,
  } = useStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your **AVAX bot builder agent**.\n\nTell me what trading strategy you want and I'll build it on the canvas.\n\n*For example: \"Build a BTC momentum tracker that marks the chart when price rises\"*",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nodeIdMapRef = useRef<Record<string, string>>({});
  const apiHistoryRef = useRef<ApiMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getCanvasState() {
    return {
      nodeCount: nodes.length,
      nodes: nodes.map((n) => {
        const inst = nodeInstances.get(n.id);
        return {
          id: n.id,
          type: (n.data as Record<string, unknown>).nodeType,
          config: inst?.config ?? {},
        };
      }),
      edges: edges.map((e) => ({
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle,
      })),
    };
  }

  async function executeTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    await new Promise((r) => setTimeout(r, 420));

    if (name === "clear_canvas") {
      clearCanvas();
      nodeIdMapRef.current = {};
      return JSON.stringify({ success: true });
    }
    if (name === "add_node") {
      const type = String(args.type ?? "");
      const x = typeof args.x === "number" ? args.x : 0;
      const y = typeof args.y === "number" ? args.y : 0;
      try {
        const nodeId = addNodeToCanvas(type, { x, y });
        if (args.label) nodeIdMapRef.current[String(args.label)] = nodeId;
        nodeIdMapRef.current[nodeId] = nodeId;
        return JSON.stringify({ nodeId });
      } catch (e) {
        return JSON.stringify({ error: String(e) });
      }
    }
    if (name === "connect_nodes") {
      const resolvedSource =
        nodeIdMapRef.current[String(args.sourceId ?? "")] ??
        String(args.sourceId ?? "");
      const resolvedTarget =
        nodeIdMapRef.current[String(args.targetId ?? "")] ??
        String(args.targetId ?? "");
      onConnect({
        source: resolvedSource,
        sourceHandle: String(args.sourceHandle ?? ""),
        target: resolvedTarget,
        targetHandle: String(args.targetHandle ?? ""),
      });
      return JSON.stringify({ success: true });
    }
    if (name === "configure_node") {
      const resolved =
        nodeIdMapRef.current[String(args.nodeId ?? "")] ??
        String(args.nodeId ?? "");
      updateNodeConfig(resolved, args.config as Record<string, unknown>);
      return JSON.stringify({ success: true });
    }
    if (name === "ask_user") return "__ask_user__";
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }

  const addMsg = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastAssistant = useCallback((patch: Partial<TextMessage>) => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant") {
          copy[i] = { ...copy[i], ...patch } as TextMessage;
          break;
        }
      }
      return copy;
    });
  }, []);

  async function sendMessage(userText: string) {
    if (!userText.trim() || loading) return;
    setLoading(true);
    setInput("");
    addMsg({ id: `u_${Date.now()}`, role: "user", content: userText });
    apiHistoryRef.current.push({ role: "user", content: userText });
    await streamCompletion();
    setLoading(false);
  }

  async function streamCompletion() {
    abortRef.current = new AbortController();
    const assistantId = `a_${Date.now()}`;
    addMsg({
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
      isThinking: true,
    });

    let assistantText = "";
    const toolCallAccum: Record<
      number,
      { id: string; name: string; args: string }
    > = {};

    try {
      const res = await fetch("/api/agent-builder/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: apiHistoryRef.current,
          canvasState: getCanvasState(),
        }),
      });

      if (!res.ok || !res.body) {
        updateLastAssistant({
          content: "Error connecting to agent. Check your API key.",
          streaming: false,
          isThinking: false,
        });
        return;
      }

      for await (const chunk of parseSSE(res.body)) {
        const delta = chunk?.choices?.[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          assistantText += delta.content;
          updateLastAssistant({ content: assistantText, isThinking: true });
        }

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCallAccum[tc.index]) {
              toolCallAccum[tc.index] = {
                id: tc.id ?? "",
                name: tc.function?.name ?? "",
                args: "",
              };
            }
            if (tc.id) toolCallAccum[tc.index].id = tc.id;
            if (tc.function?.name)
              toolCallAccum[tc.index].name = tc.function.name;
            if (tc.function?.arguments)
              toolCallAccum[tc.index].args += tc.function.arguments;
          }
        }
      }

      // Done streaming — mark thinking complete
      updateLastAssistant({ streaming: false, isThinking: false });
      if (assistantText) {
        apiHistoryRef.current.push({
          role: "assistant",
          content: assistantText,
        });
      }

      const toolCalls = Object.values(toolCallAccum);
      if (toolCalls.length > 0) {
        apiHistoryRef.current.push({
          role: "assistant",
          content: assistantText || "",
          tool_calls: toolCalls.map((tc) => ({
            id: tc.id,
            type: "function",
            function: { name: tc.name, arguments: tc.args },
          })),
        });

        for (const tc of toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.args);
          } catch {}

          if (tc.name === "ask_user") {
            const askId = `ask_${Date.now()}`;
            addMsg({
              id: askId,
              role: "ask_user",
              question: args.question as string,
            });
            apiHistoryRef.current.push({
              role: "tool",
              tool_call_id: tc.id,
              content: "__waiting_for_user__",
            });
            setLoading(false);
            return;
          }

          const tcMsgId = `tc_${tc.id}_${Date.now()}`;
          addMsg({
            id: tcMsgId,
            role: "tool_call",
            toolName: tc.name,
            args,
            status: "running",
          });
          const result = await executeTool(tc.name, args);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tcMsgId
                ? ({ ...m, status: "done" } as ToolCallMessage)
                : m,
            ),
          );
          apiHistoryRef.current.push({
            role: "tool",
            tool_call_id: tc.id,
            content: result,
          });
        }

        await streamCompletion();
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        updateLastAssistant({
          content: assistantText || "Something went wrong.",
          streaming: false,
          isThinking: false,
        });
      }
    }
  }

  async function handleAskUserAnswer(question: string, answer: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.role === "ask_user" && (m as AskUserMessage).question === question
          ? ({ ...m, answered: answer } as AskUserMessage)
          : m,
      ),
    );
    const history = apiHistoryRef.current;
    for (let i = history.length - 1; i >= 0; i--) {
      if (
        history[i].role === "tool" &&
        history[i].content === "__waiting_for_user__"
      ) {
        history[i] = { ...history[i], content: answer };
        break;
      }
    }
    addMsg({ id: `u_ask_${Date.now()}`, role: "user", content: answer });
    apiHistoryRef.current.push({ role: "user", content: answer });
    setLoading(true);
    await streamCompletion();
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([
      {
        id: "welcome2",
        role: "assistant",
        content: "Chat cleared. What would you like to build?",
      },
    ]);
    apiHistoryRef.current = [];
    nodeIdMapRef.current = {};
    abortRef.current?.abort();
    setLoading(false);
  }

  return (
    <aside
      className="w-[340px] shrink-0 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)",
        borderLeft: "1px solid rgba(82,39,255,0.2)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(82,39,255,0.2)" }}
      >
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
        >
          <Bot size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold leading-none">
            AI Agent
          </p>
          <p className="text-white/30 text-[10px] mt-0.5 leading-none">
            AVAX Bot Builder
          </p>
        </div>
        {loading && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[9px] text-purple-400 font-medium">
              thinking
            </span>
          </div>
        )}
        <button
          onClick={clearChat}
          className="text-white/20 hover:text-white/50 transition-colors p-1 rounded"
          title="Clear chat"
        >
          <Trash2 size={12} />
        </button>
        <button
          onClick={() => setAgentOpen(false)}
          className="text-white/20 hover:text-white/50 transition-colors p-1 rounded"
        >
          <X size={13} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {messages.map((msg) => {
          // ── User message ──────────────────────────────────────────────────
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div
                  className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-[11px] text-white leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: "rgba(124,58,237,0.2)",
                    border: "1px solid rgba(124,58,237,0.25)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          // ── Assistant message (thinking / final) ──────────────────────────
          if (msg.role === "assistant") {
            const m = msg as TextMessage;
            const isEmpty = !m.content;
            return (
              <div key={m.id} className="flex gap-2.5">
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed55, #2563eb55)",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                >
                  <Bot size={9} className="text-purple-300" />
                </div>
                <div className="flex-1 min-w-0">
                  {m.isThinking && m.streaming && (
                    // Thinking header — shown while streaming
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap size={9} className="text-purple-500" />
                      <span className="text-[9px] text-purple-500 font-medium uppercase tracking-wider">
                        Thinking
                      </span>
                      <ThinkingDots />
                    </div>
                  )}
                  <div
                    className={clsx(
                      "rounded-2xl rounded-tl-sm px-3.5 py-2.5 space-y-0.5",
                      m.isThinking && m.streaming
                        ? "bg-transparent" // no card while thinking
                        : "bg-transparent",
                    )}
                  >
                    {isEmpty ? (
                      <span className="text-white/20 text-[11px]">...</span>
                    ) : m.isThinking && m.streaming ? (
                      // Thinking mode: grayish, slightly dimmed, streaming char-by-char
                      <div
                        className="text-[11px] text-white/45 leading-relaxed italic whitespace-pre-wrap"
                        style={{ fontVariantLigatures: "none" }}
                      >
                        {m.content}
                        <span
                          className="inline-block w-[1px] h-3 bg-purple-400/60 ml-0.5 align-middle"
                          style={{ animation: "blink 1s step-end infinite" }}
                        />
                      </div>
                    ) : (
                      // Final mode: rendered markdown
                      <div className="space-y-0.5">
                        {renderMarkdown(m.content)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // ── Tool call card ────────────────────────────────────────────────
          if (msg.role === "tool_call") {
            const m = msg as ToolCallMessage;
            const meta = TOOL_META[m.toolName];
            if (!meta) return null;
            const label = meta.label(m.args);
            return (
              <div
                key={m.id}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-mono ml-7",
                  meta.color,
                )}
              >
                <span className="shrink-0 opacity-70">{meta.icon}</span>
                <span className="opacity-60 shrink-0">{meta.verb}</span>
                {label && <span className="font-medium truncate">{label}</span>}
                <div className="ml-auto shrink-0">
                  {m.status === "running" ? (
                    <Loader2 size={9} className="animate-spin opacity-60" />
                  ) : (
                    <span className="opacity-40">✓</span>
                  )}
                </div>
              </div>
            );
          }

          // ── Ask user bubble ───────────────────────────────────────────────
          if (msg.role === "ask_user") {
            const m = msg as AskUserMessage;
            return (
              <div
                key={m.id}
                className="ml-7 rounded-2xl p-3.5"
                style={{
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <CircleHelp size={10} className="text-purple-400 shrink-0" />
                  <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider">
                    Agent Question
                  </span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                  {m.question}
                </p>
                {m.answered ? (
                  <p className="text-[10px] text-white/30 italic">
                    You answered: {m.answered}
                  </p>
                ) : (
                  <AskUserInput
                    onAnswer={(ans) => handleAskUserAnswer(m.question, ans)}
                  />
                )}
              </div>
            );
          }

          return null;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-3 pb-3 pt-2.5"
        style={{ borderTop: "1px solid rgba(82,39,255,0.2)" }}
      >
        <div
          className="flex gap-2 items-end rounded-2xl px-3 py-2"
          style={{
            background: "rgba(82,39,255,0.08)",
            border: "1px solid rgba(82,39,255,0.25)",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Describe your trading strategy…"
            rows={2}
            className="flex-1 bg-transparent text-[11px] text-white placeholder-white/20 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center disabled:opacity-20 transition-all hover:scale-105"
            style={{
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                  : "rgba(255,255,255,0.08)",
            }}
          >
            {loading ? (
              <Loader2 size={12} className="text-white/50 animate-spin" />
            ) : (
              <Send size={11} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-[9px] text-white/15 mt-1.5 text-center">
          ↵ send · shift+↵ newline
        </p>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </aside>
  );
}

// ─── Thinking dots animation ──────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="flex items-center gap-0.5 ml-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-purple-500/60"
          style={{ animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  );
}

// ─── AskUser input ────────────────────────────────────────────────────────────

function AskUserInput({ onAnswer }: { onAnswer: (answer: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) {
            onAnswer(val);
            setVal("");
          }
        }}
        placeholder="Type your answer…"
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-white/25 focus:outline-none focus:border-purple-500/50"
        autoFocus
      />
      <button
        onClick={() => {
          if (val.trim()) {
            onAnswer(val);
            setVal("");
          }
        }}
        className="px-3 py-1.5 rounded-xl text-[10px] text-purple-300 font-medium transition-colors hover:text-white"
        style={{
          background: "rgba(124,58,237,0.2)",
          border: "1px solid rgba(124,58,237,0.3)",
        }}
      >
        Send
      </button>
    </div>
  );
}
