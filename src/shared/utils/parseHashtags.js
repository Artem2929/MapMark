export const parseHashtags = (text) => {
  if (!text) return []
  
  const parts = []
  const regex = /#[\wа-яА-ЯіІїЇєЄґҐ]+/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'hashtag', content: match[0] })
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}
