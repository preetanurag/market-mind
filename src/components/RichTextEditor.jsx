import { useEffect, useRef, useState } from 'react'

const toolbarButtons = [
  ['bold', 'B'],
  ['italic', 'I'],
  ['underline', 'U'],
  ['insertUnorderedList', 'Bullets'],
  ['insertOrderedList', 'Numbers'],
]

function normalizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function RichTextEditor({ value, onChange, onUploadImage, onStatus }) {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  function emitChange() {
    onChange(editorRef.current?.innerHTML || '')
  }

  function format(command, option = null) {
    editorRef.current?.focus()
    document.execCommand(command, false, option)
    emitChange()
  }

  function setBlock(tag) {
    format('formatBlock', tag)
  }

  function addLink() {
    const url = window.prompt('Paste the link URL')
    if (!url) return
    format('createLink', url)
  }

  async function uploadAndInsert(file) {
    if (!file?.type?.startsWith('image/')) return

    setIsUploading(true)
    onStatus?.('Uploading image...')

    try {
      const url = await onUploadImage(file, normalizeFileName(file.name || `image-${Date.now()}.png`))
      editorRef.current?.focus()
      document.execCommand(
        'insertHTML',
        false,
        `<figure><img src="${url}" alt="${file.name || 'Post image'}" /><figcaption>${file.name || ''}</figcaption></figure><p><br></p>`,
      )
      emitChange()
      onStatus?.('Image uploaded and inserted.')
    } catch (error) {
      onStatus?.(error.message || 'Could not upload image.')
    } finally {
      setIsUploading(false)
    }
  }

  async function uploadFiles(files) {
    const images = [...files].filter((file) => file.type.startsWith('image/'))
    for (const image of images) {
      await uploadAndInsert(image)
    }
  }

  function handlePaste(event) {
    const files = [...(event.clipboardData?.files || [])]
    const hasImages = files.some((file) => file.type.startsWith('image/'))

    if (!hasImages) return

    event.preventDefault()
    uploadFiles(files)
  }

  function handleDrop(event) {
    const files = [...(event.dataTransfer?.files || [])]
    const hasImages = files.some((file) => file.type.startsWith('image/'))

    if (!hasImages) return

    event.preventDefault()
    uploadFiles(files)
  }

  return (
    <div className="rich-editor-shell">
      <div className="editor-toolbar" aria-label="Editor toolbar">
        <button type="button" onClick={() => setBlock('p')}>Text</button>
        <button type="button" onClick={() => setBlock('h2')}>Heading</button>
        <button type="button" onClick={() => setBlock('blockquote')}>Quote</button>
        {toolbarButtons.map(([command, label]) => (
          <button key={command} type="button" onClick={() => format(command)}>{label}</button>
        ))}
        <button type="button" onClick={addLink}>Link</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload image'}
        </button>
      </div>
      <div
        className="rich-editor"
        contentEditable
        onInput={emitChange}
        onPaste={handlePaste}
        onDrop={handleDrop}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        data-placeholder="Write your post here. Paste screenshots, drag images, or use the toolbar."
        suppressContentEditableWarning
      />
      <input
        accept="image/*"
        hidden
        multiple
        onChange={(event) => {
          uploadFiles(event.target.files || [])
          event.target.value = ''
        }}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}
