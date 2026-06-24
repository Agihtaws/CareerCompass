"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }) {
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p className="mb-2 last:mb-0" {...props} />,
          strong: (props) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: (props) => <em className="italic" {...props} />,
          ul: (props) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
          ),
          li: (props) => <li className="leading-relaxed" {...props} />,
          h1: (props) => (
            <h3 className="mb-2 mt-1 font-display text-base font-bold" {...props} />
          ),
          h2: (props) => (
            <h3 className="mb-2 mt-1 font-display text-base font-bold" {...props} />
          ),
          h3: (props) => (
            <h4 className="mb-1 mt-1 font-display text-sm font-semibold" {...props} />
          ),
          a: (props) => (
            <a
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: (props) => (
            <code
              className="rounded bg-muted px-1 py-0.5 text-[0.85em]"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-border pl-3 text-muted-foreground"
              {...props}
            />
          ),
          hr: () => <hr className="my-3 border-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}