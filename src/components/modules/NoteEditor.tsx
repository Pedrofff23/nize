import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { JSONContent } from '@tiptap/react';
import { SLASH_COMMANDS } from './SlashCommandMenu';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Highlighter,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Minus,
    CodeSquare,
} from 'lucide-react';
import './note-editor.css';

interface NoteEditorProps {
    content: JSONContent;
    onUpdate: (content: JSONContent) => void;
    editable?: boolean;
}

export function NoteEditor({ content, onUpdate, editable = true }: NoteEditorProps) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [slashOpen, setSlashOpen] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [slashPos, setSlashPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const filteredCommands = SLASH_COMMANDS.filter(
        (cmd) =>
            cmd.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
            cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: {},
                blockquote: {},
                bulletList: {},
                orderedList: {},
                horizontalRule: {},
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return `Heading ${node.attrs.level}`;
                    }
                    return 'Digite "/" para ver os comandos...';
                },
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight,
            Typography,
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: 'focus:outline-none',
            },
            handleKeyDown: (view, event) => {
                if (slashOpen) {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
                        return true;
                    }
                    if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setSelectedIndex((prev) => (prev + filteredCommands.length - 1) % filteredCommands.length);
                        return true;
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        executeCommand(selectedIndex);
                        return true;
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        setSlashOpen(false);
                        return true;
                    }
                }
                return false;
            },
        },
        onUpdate: ({ editor: ed }) => {
            // Auto-save with debounce
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onUpdate(ed.getJSON());
            }, 800);

            // Slash command detection
            const { state } = ed;
            const { $from } = state.selection;
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
            const match = textBefore.match(/\/([^\s]*)$/);

            if (match && $from.parent.type.name === 'paragraph') {
                setSlashQuery(match[1]);
                setSelectedIndex(0);

                // Get position for menu
                const coords = ed.view.coordsAtPos($from.pos);
                const containerRect = editorContainerRef.current?.getBoundingClientRect();
                if (containerRect) {
                    setSlashPos({
                        top: coords.bottom - containerRect.top + 4,
                        left: coords.left - containerRect.left,
                    });
                }
                setSlashOpen(true);
            } else {
                setSlashOpen(false);
            }
        },
    });

    const executeCommand = useCallback(
        (index: number) => {
            if (!editor) return;
            const cmd = filteredCommands[index];
            if (!cmd) return;

            // Remove the slash and query text
            const { state } = editor;
            const { $from } = state.selection;
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
            const match = textBefore.match(/\/([^\s]*)$/);

            if (match) {
                const from = $from.pos - match[0].length;
                const to = $from.pos;
                editor.chain().focus().deleteRange({ from, to }).run();
            }

            cmd.command(editor);
            setSlashOpen(false);
        },
        [editor, filteredCommands]
    );

    // Update content if note changes externally
    useEffect(() => {
        if (editor && content) {
            const currentContent = JSON.stringify(editor.getJSON());
            const newContent = JSON.stringify(content);
            if (currentContent !== newContent) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // Close slash menu on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setSlashOpen(false);
            }
        };
        if (slashOpen) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [slashOpen]);

    if (!editor) return null;

    return (
        <div className="note-editor" ref={editorContainerRef} style={{ position: 'relative' }}>
            {/* Formatting Toolbar */}
            <div className="editor-toolbar">
                <div className="toolbar-group">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'is-active' : ''}
                        title="Negrito (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'is-active' : ''}
                        title="Itálico (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'is-active' : ''}
                        title="Tachado"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={editor.isActive('code') ? 'is-active' : ''}
                        title="Código inline"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={editor.isActive('highlight') ? 'is-active' : ''}
                        title="Destaque"
                    >
                        <Highlighter className="w-4 h-4" />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'is-active' : ''}
                        title="Lista com marcadores"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'is-active' : ''}
                        title="Lista numerada"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={editor.isActive('taskList') ? 'is-active' : ''}
                        title="To-do list"
                    >
                        <CheckSquare className="w-4 h-4" />
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'is-active' : ''}
                        title="Citação"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editor.isActive('codeBlock') ? 'is-active' : ''}
                        title="Bloco de código"
                    >
                        <CodeSquare className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Linha horizontal"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Slash Command Menu */}
            {slashOpen && filteredCommands.length > 0 && (
                <div
                    ref={menuRef}
                    className="slash-command-menu"
                    style={{
                        position: 'absolute',
                        top: slashPos.top,
                        left: slashPos.left,
                        zIndex: 50,
                    }}
                >
                    <div className="slash-command-label">Blocos básicos</div>
                    {filteredCommands.map((cmd, i) => (
                        <button
                            key={cmd.title}
                            className={`slash-command-item ${i === selectedIndex ? 'is-selected' : ''}`}
                            onClick={() => executeCommand(i)}
                            onMouseEnter={() => setSelectedIndex(i)}
                        >
                            <div className="slash-command-item-icon">{cmd.icon}</div>
                            <div className="slash-command-item-text">
                                <div className="slash-command-item-title">{cmd.title}</div>
                                <div className="slash-command-item-desc">{cmd.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
