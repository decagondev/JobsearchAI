import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-3 mb-2 first:mt-0" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 first:mt-0" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-2 mb-1.5 first:mt-0" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-sm font-semibold mt-2 mb-1 first:mt-0" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mt-1 mb-1 first:mt-0" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-xs font-medium mt-1 mb-1 first:mt-0" {...props} />,
          
          // Paragraphs
          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed last:mb-0" {...props} />,
          
          // Lists
          ul: ({ node, ...props }) => <ul className="list-disc list-outside mb-2 space-y-1 ml-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside mb-2 space-y-1 ml-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
          
          // Code blocks
          code: ({ node, className: codeClassName, children, ...props }: any) => {
            const isInline = !codeClassName
            return isInline ? (
              <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono border border-border/50" {...props}>
                {children}
              </code>
            ) : (
              <div className="my-2">
                <pre className="bg-background/50 p-3 rounded-md overflow-x-auto border border-border/50">
                  <code className="text-xs font-mono block" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            )
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-background/50 p-3 rounded-md overflow-x-auto mb-2 border border-border/50" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a className="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground/80" {...props} />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => <hr className="my-3 border-border" {...props} />,
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-border rounded-md" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-background/50" {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-border hover:bg-background/30" {...props} />,
          th: ({ node, ...props }) => (
            <th className="border border-border px-3 py-2 text-left font-semibold text-xs" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-border px-3 py-2 text-xs" {...props} />
          ),
          
          // Strong and emphasis
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          
          // Images
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-md my-2" {...props} />
          ),
          
          // Line breaks
          br: ({ node, ...props }) => <br {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

