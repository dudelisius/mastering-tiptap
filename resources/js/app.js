import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import Image from '@tiptap/extension-image'

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
                        StarterKit,
                        Table.configure({
                            resizable: true,
                        }),
                        TableCell,
                        TableHeader,
                        TableRow,
                        BubbleMenu.configure({
                            element: document.getElementById('table-bubble-menu'),
                            tippyOptions: {
                                theme: 'customTheme',
                                arrow: false,
                                offset: [0, 15],
                            },
                            shouldShow: ({ editor }) => {
                                return editor.isActive('table') || editor.isActive('tableCell') || editor.isActive('tableHeader') || editor.isActive('tableRow');
                            }
                        }),
                        Image.configure({
                            inline: true,
                        })
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
            insertTable() {
                editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            },
            addColumnBefore() {
                editor.chain().focus().addColumnBefore().run()
            },
            addColumnAfter() {
                editor.chain().focus().addColumnBefore().run()
            },
            deleteColumn() {
                editor.chain().focus().deleteColumn().run()
            },
            addRowBefore() {
                editor.chain().focus().addRowBefore().run()
            },
            addRowAfter() {
                editor.chain().focus().addRowBefore().run()
            },
            deleteRow() {
                editor.chain().focus().deleteRow().run()
            },
            toggleHeaderColumn() {
                editor.chain().focus().toggleHeaderColumn().run()
            },
            toggleHeaderRow() {
                editor.chain().focus().toggleHeaderRow().run()
            },
            toggleHeaderCell() {
                editor.chain().focus().toggleHeaderCell().run()
            },
            mergeCells() {
                editor.chain().focus().mergeCells().run()
            },
            splitCell() {
                editor.chain().focus().splitCell().run()
            },
            deleteTable() {
                editor.chain().focus().deleteTable().run()
            },
            insertImage() {
                const url = window.prompt('Image URL');
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
    })
})
