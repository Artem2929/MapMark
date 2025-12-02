import React, { memo } from 'react';
import DOMPurify from 'dompurify';

const SafeHtml = memo(({  html, className = '', tag = 'div'  }) => {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });

  const Tag = tag;

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
});

SafeHtml.displayName = 'SafeHtml';

export default SafeHtml;