function parseImageBlock(block) {
  return block.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/)
}

function looksLikeHtml(content) {
  return /<\/?[a-z][\s\S]*>/i.test(content)
}

function sanitizeHtml(content) {
  if (typeof window === 'undefined') return content

  const allowedTags = new Set(['A', 'B', 'BLOCKQUOTE', 'BR', 'DIV', 'EM', 'FIGCAPTION', 'FIGURE', 'H2', 'H3', 'I', 'IMG', 'LI', 'OL', 'P', 'STRONG', 'U', 'UL'])
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')

  doc.body.querySelectorAll('*').forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes)
      return
    }

    ;[...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value
      const isSafeUrl = value.startsWith('https://') || value.startsWith('http://') || value.startsWith('/')
      const keep =
        (node.tagName === 'A' && name === 'href' && isSafeUrl) ||
        (node.tagName === 'IMG' && ['src', 'alt'].includes(name) && (name === 'alt' || isSafeUrl))

      if (!keep) node.removeAttribute(attribute.name)
    })

    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noreferrer')
    }
  })

  return doc.body.innerHTML
}

export default function RichContent({ content }) {
  if (!content) return null

  if (looksLikeHtml(content)) {
    return <article className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
  }

  return (
    <article className="rich-content">
      {content.split(/\n{2,}/).map((block, index) => {
        const trimmed = block.trim()
        const image = parseImageBlock(trimmed)

        if (image) {
          const [, alt, src] = image
          return (
            <figure className="content-image" key={`${src}-${index}`}>
              <img src={src} alt={alt} />
              {alt ? <figcaption>{alt}</figcaption> : null}
            </figure>
          )
        }

        return <p key={`${trimmed.slice(0, 24)}-${index}`}>{trimmed}</p>
      })}
    </article>
  )
}
