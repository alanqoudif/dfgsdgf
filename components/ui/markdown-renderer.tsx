import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  return (
    <div className={cn(
      "prose prose-neutral dark:prose-invert max-w-none",
      "prose-pre:p-0 prose-pre:bg-transparent",
      "prose-headings:font-medium prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100",
      "prose-p:text-neutral-700 dark:prose-p:text-neutral-300",
      "prose-li:text-neutral-700 dark:prose-li:text-neutral-300",
      "prose-code:text-neutral-800 dark:prose-code:text-neutral-200",
      "text-base leading-relaxed"
    )}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={isDarkTheme ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={cn(
                className,
                "font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded"
              )} {...props}>
                {children}
              </code>
            );
          },
          // Customize other components here if needed
          a: ({ href, children, ...props }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 