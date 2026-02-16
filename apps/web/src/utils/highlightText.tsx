import React from 'react';

/**
 * Highlights matching text in a string
 * @param text - The full text to search in
 * @param query - The search query to highlight
 * @returns React elements with highlighted matches
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncates text and highlights matches
 * @param text - The full text
 * @param query - The search query
 * @param maxLength - Maximum length before truncation
 */
export function highlightAndTruncate(
  text: string,
  query: string,
  maxLength = 200
): React.ReactNode {
  if (!text) return '';

  // If text is short enough, just highlight
  if (text.length <= maxLength) {
    return highlightText(text, query);
  }

  // Find the position of the query in the text
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryIndex = lowerText.indexOf(lowerQuery);

  let truncated: string;
  
  if (queryIndex === -1) {
    // Query not found, just truncate from start
    truncated = text.substring(0, maxLength) + '...';
  } else {
    // Show context around the match
    const contextLength = Math.floor((maxLength - query.length) / 2);
    const start = Math.max(0, queryIndex - contextLength);
    const end = Math.min(text.length, queryIndex + query.length + contextLength);
    
    truncated = 
      (start > 0 ? '...' : '') +
      text.substring(start, end) +
      (end < text.length ? '...' : '');
  }

  return highlightText(truncated, query);
}
