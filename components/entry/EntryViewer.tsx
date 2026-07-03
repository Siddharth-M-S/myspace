'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from './CodeBlock'
import 'highlight.js/styles/github-dark.css'

interface EntryViewerProps {
  content: string
}

export function EntryViewer({ content }: EntryViewerProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white
      prose-code:text-violet-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
      prose-pre:bg-transparent prose-pre:p-0
      prose-blockquote:border-violet-500 prose-blockquote:text-gray-400
      prose-table:text-sm
      prose-thead:text-white
      prose-th:border-white/20 prose-td:border-white/10
      prose-hr:border-white/10
      prose-ul:text-gray-300 prose-ol:text-gray-300
      prose-li:marker:text-violet-400
      prose-img:rounded-lg"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
          code({ node: _n, className, children, ...props }: any) {
            const isBlock = className?.startsWith('language-')
            if (isBlock) {
              return (
                <CodeBlock className={className}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              )
            }
            return <code className={className} {...props}>{children}</code>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
