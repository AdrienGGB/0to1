import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'; // A simple style (changed to cjs)

// Utility to parse YAML frontmatter
const parseLessonContent = (rawContent) => {
  // Remove AI-specific comments before parsing frontmatter
  let cleanedContent = rawContent.replace(/\/\/\/\/\/\s*Only write code below this line\s*\/\/\/\/\/\//g, '');

  // Robustly remove leading/trailing '---' if gray-matter didn't catch them
  // This handles cases where AI might put them in the body
  if (cleanedContent.startsWith('---')) {
    const firstDash = cleanedContent.indexOf('---\n');
    const secondDash = cleanedContent.indexOf('---\n', firstDash + 4);
    if (firstDash === 0 && secondDash > 0) {
      // Check if it looks like a frontmatter block
      const potentialFrontmatter = cleanedContent.substring(firstDash + 4, secondDash);
      if (potentialFrontmatter.includes(':')) { // Simple heuristic for YAML
        cleanedContent = cleanedContent.substring(secondDash + 4).trim();
      }
    }
  }

  try {
    const { data, content } = matter(cleanedContent);
    return { frontmatter: data, markdownBody: content };
  } catch (e) {
    console.error("Error parsing frontmatter:", e);
    return { frontmatter: {}, markdownBody: cleanedContent }; // Fallback
  }
};

const LessonContentRenderer = ({ rawContent }) => {
  if (!rawContent) return <p>No lesson content to display.</p>;

  const { frontmatter, markdownBody } = parseLessonContent(rawContent);

  const [inMiniPractice, setInMiniPractice] = useState(false);
  const [miniPracticeContent, setMiniPracticeContent] = useState([]);

  // Define custom components for ReactMarkdown
  const components = {
    // Basic handling for custom blocks as paragraphs
    p: ({ node, ...props }) => {
      const text = props.children && typeof props.children[0] === 'string' ? props.children[0] : '';

      if (text.includes('Mini Practice')) {
        setInMiniPractice(true);
        setMiniPracticeContent([]); // Reset content for new practice
        return <p style={{ borderLeft: '4px solid green', paddingLeft: '10px', backgroundColor: '#e6ffe6' }}><strong>Mini Practice:</strong> {text.replace('Mini Practice', '').trim()}</p>;
      }

      if (inMiniPractice) {
        // Collect content until a new heading or end of content
        // This is a simplified approach; a more robust solution would parse AST
        setMiniPracticeContent(prev => [...prev, <p {...props} />]);
        return null; // Don't render immediately
      }

      // Handle TIP: and WARNING: callouts
      if (text.startsWith('TIP:')) {
        return <p style={{ borderLeft: '4px solid blue', paddingLeft: '10px', backgroundColor: '#e0e0ff' }}><strong>TIP:</strong> {text.substring(4).trim()}</p>;
      }
      if (text.startsWith('WARNING:')) {
        return <p style={{ borderLeft: '4px solid orange', paddingLeft: '10px', backgroundColor: '#fffbe0' }}><strong>WARNING:</strong> {text.substring(8).trim()}</p>;
      }
      // Handle Knowledge Check
      if (text.includes('Knowledge Check')) {
        return <p style={{ borderLeft: '4px solid purple', paddingLeft: '10px', backgroundColor: '#f5e0ff' }}><strong>Knowledge Check:</strong> {text.replace('Knowledge Check', '').trim()}</p>;
      }
      return <p {...props} />;
    },
    h1: (props) => { setInMiniPractice(false); return <h1 {...props} />;
    },
    h2: (props) => { setInMiniPractice(false); return <h2 {...props} />;
    },
    h3: (props) => { setInMiniPractice(false); return <h3 {...props} />;
    },
    h4: (props) => { setInMiniPractice(false); return <h4 {...props} />;
    },
    h5: (props) => { setInMiniPractice(false); return <h5 {...props} />;
    },
    h6: (props) => { setInMiniPractice(false); return <h6 {...props} />;
    },

    // Render code blocks with syntax highlighting
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      // Filter out TIP: or WARNING: lines from code blocks
      const filteredCodeContent = codeContent.split('\n').filter(line => 
        !line.trim().startsWith('TIP:') && !line.trim().startsWith('WARNING:')
      ).join('\n');

      if (inMiniPractice) {
        setMiniPracticeContent(prev => [...prev, 
          <SyntaxHighlighter style={docco} language={match ? match[1] : 'text'} PreTag="div" {...props}>
            {filteredCodeContent}
          </SyntaxHighlighter>
        ]);
        return null; // Don't render immediately
      }

      return !inline && match ? (
        <SyntaxHighlighter style={docco} language={match[1]} PreTag="div" {...props}>
          {filteredCodeContent}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Add other components as needed for Mini Practice content
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

      {inMiniPractice && miniPracticeContent.length > 0 && (
        <details style={{ border: '1px solid #ccc', borderRadius: '5px', marginTop: '20px' }}>
          <summary style={{ padding: '10px', backgroundColor: '#f0f0f0', cursor: 'pointer' }}>Show Mini Practice Solution</summary>
          <div style={{ padding: '10px' }}>
            {miniPracticeContent}
          </div>
        </details>
      )}
    </div>
  );
};

export default LessonContentRenderer;
