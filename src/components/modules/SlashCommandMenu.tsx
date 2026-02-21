import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    useCallback,
    createContext,
    useContext,
} from 'react';

interface CommandItem {
    title: string;
    description: string;
    icon: string;
    command: (editor: any) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
    {
        title: 'Text',
        description: 'Texto simples',
        icon: 'T',
        command: (editor) => {
            editor.chain().focus().setNode('paragraph').run();
        },
    },
    {
        title: 'Heading 1',
        description: 'Título grande',
        icon: 'H1',
        command: (editor) => {
            editor.chain().focus().setNode('heading', { level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Título médio',
        icon: 'H2',
        command: (editor) => {
            editor.chain().focus().setNode('heading', { level: 2 }).run();
        },
    },
    {
        title: 'Heading 3',
        description: 'Título pequeno',
        icon: 'H3',
        command: (editor) => {
            editor.chain().focus().setNode('heading', { level: 3 }).run();
        },
    },
    {
        title: 'Bulleted list',
        description: 'Lista com marcadores',
        icon: '•',
        command: (editor) => {
            editor.chain().focus().toggleBulletList().run();
        },
    },
    {
        title: 'Numbered list',
        description: 'Lista numerada',
        icon: '1.',
        command: (editor) => {
            editor.chain().focus().toggleOrderedList().run();
        },
    },
    {
        title: 'To-do list',
        description: 'Lista de tarefas',
        icon: '☐',
        command: (editor) => {
            editor.chain().focus().toggleTaskList().run();
        },
    },
    {
        title: 'Quote',
        description: 'Citação em bloco',
        icon: '❝',
        command: (editor) => {
            editor.chain().focus().toggleBlockquote().run();
        },
    },
    {
        title: 'Code',
        description: 'Bloco de código',
        icon: '</>',
        command: (editor) => {
            editor.chain().focus().toggleCodeBlock().run();
        },
    },
    {
        title: 'Divider',
        description: 'Linha horizontal',
        icon: '—',
        command: (editor) => {
            editor.chain().focus().setHorizontalRule().run();
        },
    },
];

// Simple slash command extension — just exports the commands list
// The actual menu rendering is handled in NoteEditor via state
export const SlashCommands = Extension.create({
    name: 'slashCommands',
});
