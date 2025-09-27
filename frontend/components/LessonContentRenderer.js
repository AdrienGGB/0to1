import React from 'react';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'; // A simple style (changed to cjs)
import {
  H1, H2, H3, H4, P, Blockquote, List, InlineCode, Lead, Large, Small, Muted,
} from '@/components/ui/typography';

// Utility to parse YAML frontmatter
const parseLessonContent = (rawContent) => {
  try {
    const { data, content } = matter(rawContent);
    return { frontmatter: data, markdownBody: content };
  } catch (e) {
    console.error("Error parsing frontmatter:", e);
    return { frontmatter: {}, markdownBody: rawContent }; // Fallback
  }
};

const LessonContentRenderer = ({ rawContent }) => {
  if (!rawContent) return <P>No lesson content to display.</P>;

  const { frontmatter, markdownBody } = parseLessonContent(rawContent);

  // Define custom components for ReactMarkdown
  const components = {
    h1: ({ node, ...props }) => <H1 {...props} />,
    h2: ({ node, ...props }) => <H2 {...props} />,
    h3: ({ node, ...props }) => <H3 {...props} />,
    h4: ({ node, ...props }) => <H4 {...props} />,
    p: ({ node, ...props }) => <P {...props} />,
    blockquote: ({ node, ...props }) => <Blockquote {...props} />,
    ul: ({ node, ...props }) => <List {...props} />,
    ol: ({ node, ...props }) => <List {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter style={docco} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <InlineCode className={className} {...props}>
          {children}
        </InlineCode>
      );
    },
  };

  return (
    <div className="font-sans max-w-full mx-auto px-4">
      {/* Basic display of YAML Frontmatter */}
      {Object.keys(frontmatter).length > 0 && (
        <div className="mb-5 pb-3 border-b border-gray-200">
          <H3>Lesson Metadata:</H3>
          {Object.entries(frontmatter).map(([key, value]) => (
            <P key={key}><strong className="text-gray-800">{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</P>
          ))}
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} // Add rehype-raw to plugins
        components={components}
      >
        {markdownBody}
      </ReactMarkdown>
    </div>
  );
};

export default LessonContentRenderer;
