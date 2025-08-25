import React from 'react';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'; // A simple style (changed to cjs)

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
  if (!rawContent) return <p>No lesson content to display.</p>;

  const { frontmatter, markdownBody } = parseLessonContent(rawContent);

  // Define custom components for ReactMarkdown
  const components = {
    // Basic handling for custom blocks as paragraphs
    p: ({ node, ...props }) => {
      if (props.children && typeof props.children[0] === 'string') {
        const text = props.children[0];
        if (text.startsWith(':::tip')) {
          return <p style={{ borderLeft: '4px solid blue', paddingLeft: '10px', backgroundColor: '#e0e0ff' }}>TIP: {text.substring(6).trim()}</p>;
        }
        if (text.startsWith(':::warning')) {
          return <p style={{ borderLeft: '4px solid orange', paddingLeft: '10px', backgroundColor: '#fffbe0' }}>WARNING: {text.substring(10).trim()}</p>;
        }
        if (text.startsWith(':::hidden-answer')) {
          return <p style={{ borderLeft: '4px solid gray', paddingLeft: '10px', backgroundColor: '#f0f0f0' }}>HIDDEN ANSWER (not interactive): {text.substring(16).trim()}</p>;
        }
        if (text.startsWith(':::quiz')) {
          return <p style={{ borderLeft: '4px solid purple', paddingLeft: '10px', backgroundColor: '#f5e0ff' }}>QUIZ (not interactive): {text.substring(7).trim()}</p>;
        }
      }
      return <p {...props} />;
    },
    // Render code blocks with syntax highlighting
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter style={docco} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // If the AI generates <details> tags for hidden answers, rehype-raw might be needed.
    // For this simplified version, we're assuming it's just text.
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #eee' }}>
      {/* Basic display of YAML Frontmatter */}
      {Object.keys(frontmatter).length > 0 && (
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h3>Lesson Metadata:</h3>
          {Object.entries(frontmatter).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</p>
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