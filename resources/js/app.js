import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

document.addEventListener('alpine:init', () => {
    Alpine.data('tiptap', (content) => {
        let editor

        return {
            content: content,
            updatedAt: Date.now(),
            init() {
                const _this = this

                editor = new Editor({
                    element: this.$refs.editor,
                    content: this.content,
                    extensions: [
                        StarterKit
                    ],
                    onCreate({ editor }) {
                        _this.updatedAt = Date.now()
                    },
                    onUpdate({ editor }) {
                        _this.content = editor.getHTML()
                        _this.updatedAt = Date.now()
                    },
                    onSelectionUpdate({ editor }) {
                        _this.updatedAt = Date.now()
                    },
                    editorProps: {
                        attributes: {
                            class: 'focus:outline-none',
                        },
                    }
                })
                this.$watch('content', (content) => {
                    if (content === editor.getHTML()) return
                    editor.commands.setContent(content, false)
                })
            },
            isLoaded() {
                return editor
            },
            isActive(type, opts = {}) {
                return editor.isActive(type, opts)
            },
            toggleBold() {
                editor.chain().focus().toggleBold().run()
            },
        }
    })
})
