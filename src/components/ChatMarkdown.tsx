import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo } from "react";

type Props = {
  content: string;
  variant?: "user" | "assistant";
};

function ChatMarkdownBase({ content, variant = "assistant" }: Props) {
  const isUser = variant === "user";

  return (
    <div
      className={`chat-md text-sm leading-relaxed break-words ${
        isUser ? "chat-md--user" : "chat-md--assistant"
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="m-0 [&:not(:last-child)]:mb-2">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline underline-offset-2 font-medium ${
                isUser ? "text-accent-foreground" : "text-accent hover:text-accent/80"
              }`}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1 marker:text-accent">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1 marker:text-accent marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          h1: ({ children }) => (
            <h3 className="font-heading text-base font-bold mt-2 mb-1">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="font-heading text-base font-bold mt-2 mb-1">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="font-heading text-sm font-bold mt-2 mb-1">{children}</h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-accent/60 pl-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-border/60" />,
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code
                  className="block w-full overflow-x-auto rounded-lg bg-background/80 border border-border/60 p-3 text-xs font-mono leading-relaxed"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-background/70 border border-border/50 px-1.5 py-0.5 text-[0.85em] font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-lg bg-background/80 border border-border/60">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-2 -mx-1 overflow-x-auto rounded-lg border border-border/60 bg-background/60">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/60 text-foreground">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border/50 last:border-b-0">{children}</tr>
          ),
          th: ({ children, style }) => (
            <th
              className="px-3 py-2 text-left font-semibold whitespace-nowrap"
              style={style}
            >
              {children}
            </th>
          ),
          td: ({ children, style }) => (
            <td className="px-3 py-2 align-top" style={style}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

const ChatMarkdown = memo(ChatMarkdownBase);
export default ChatMarkdown;