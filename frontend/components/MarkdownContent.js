"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed whitespace-pre-wrap break-words">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-black text-current">
      {children}
    </strong>
  ),
  ul: ({ children }) => (
    <ul className="my-3 ml-5 list-disc space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 ml-5 list-decimal space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 leading-relaxed">
      {children}
    </li>
  ),
};

export default function MarkdownContent({ children, className = "" }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {String(children || "")}
      </ReactMarkdown>
    </div>
  );
}
