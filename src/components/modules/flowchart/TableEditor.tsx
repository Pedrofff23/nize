import React, { useState } from 'react';
import {
    TableColumn,
    DBColumnType,
    DB_COLUMN_TYPES,
    FlowNode,
    calcTableHeight,
} from './flowchart-types';
import { Plus, Trash2, Key, Link2, X } from 'lucide-react';

interface TableEditorProps {
    node: FlowNode;
    onUpdate: (id: string, changes: Partial<FlowNode>) => void;
    onClose: () => void;
    style: React.CSSProperties;
}

function createColumn(name = '', type: DBColumnType = 'VARCHAR'): TableColumn {
    return {
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        type,
        isPrimaryKey: false,
        isForeignKey: false,
        isNullable: true,
        isUnique: false,
    };
}

export function TableEditor({ node, onUpdate, onClose, style }: TableEditorProps) {
    const [tableName, setTableName] = useState(node.label);
    const [columns, setColumns] = useState<TableColumn[]>(node.columns ?? []);

    const save = () => {
        const newHeight = calcTableHeight(columns);
        onUpdate(node.id, {
            label: tableName.trim() || 'tabela',
            columns: [...columns],
            size: { width: Math.max(node.size.width, 220), height: newHeight },
        });
    };

    const addColumn = () => {
        const newColumns = [...columns, createColumn()];
        setColumns(newColumns);
    };

    const updateColumn = (colId: string, changes: Partial<TableColumn>) => {
        setColumns(prev => prev.map(c => c.id === colId ? { ...c, ...changes } : c));
    };

    const removeColumn = (colId: string) => {
        setColumns(prev => prev.filter(c => c.id !== colId));
    };

    const togglePK = (colId: string) => {
        setColumns(prev => prev.map(c =>
            c.id === colId
                ? { ...c, isPrimaryKey: !c.isPrimaryKey, isNullable: c.isPrimaryKey ? c.isNullable : false }
                : c
        ));
    };

    const toggleFK = (colId: string) => {
        setColumns(prev => prev.map(c =>
            c.id === colId ? { ...c, isForeignKey: !c.isForeignKey } : c
        ));
    };

    const toggleNullable = (colId: string) => {
        setColumns(prev => prev.map(c =>
            c.id === colId ? { ...c, isNullable: !c.isNullable } : c
        ));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="table-editor-panel"
            style={style}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="table-editor-header">
                <div className="table-editor-title">
                    <span className="table-editor-icon">🗄️</span>
                    <span>Editar Tabela</span>
                </div>
                <button className="table-editor-close" onClick={onClose}>
                    <X size={14} />
                </button>
            </div>

            {/* Table Name */}
            <div className="table-editor-section">
                <label className="table-editor-label">Nome da Tabela</label>
                <input
                    type="text"
                    className="table-editor-input"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="nome_tabela"
                    autoFocus
                />
            </div>

            {/* Columns */}
            <div className="table-editor-section">
                <div className="table-editor-label-row">
                    <label className="table-editor-label">Campos</label>
                    <button className="table-editor-add-btn" onClick={addColumn}>
                        <Plus size={12} /> Adicionar
                    </button>
                </div>

                <div className="table-editor-columns">
                    {columns.length === 0 && (
                        <p className="table-editor-empty">Nenhum campo. Clique em Adicionar.</p>
                    )}
                    {columns.map((col) => (
                        <div key={col.id} className="table-editor-column-row">
                            <div className="table-editor-column-main">
                                <input
                                    type="text"
                                    className="table-editor-col-name"
                                    value={col.name}
                                    onChange={(e) => updateColumn(col.id, { name: e.target.value })}
                                    placeholder="nome_campo"
                                />
                                <select
                                    className="table-editor-col-type"
                                    value={col.type}
                                    onChange={(e) => updateColumn(col.id, { type: e.target.value as DBColumnType })}
                                >
                                    {DB_COLUMN_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="table-editor-column-flags">
                                <button
                                    className={`table-editor-flag ${col.isPrimaryKey ? 'active pk' : ''}`}
                                    onClick={() => togglePK(col.id)}
                                    title="Primary Key"
                                >
                                    <Key size={11} />
                                    <span>PK</span>
                                </button>
                                <button
                                    className={`table-editor-flag ${col.isForeignKey ? 'active fk' : ''}`}
                                    onClick={() => toggleFK(col.id)}
                                    title="Foreign Key"
                                >
                                    <Link2 size={11} />
                                    <span>FK</span>
                                </button>
                                <button
                                    className={`table-editor-flag ${!col.isNullable ? 'active nn' : ''}`}
                                    onClick={() => toggleNullable(col.id)}
                                    title="Not Null"
                                >
                                    <span style={{ fontSize: 9, fontWeight: 700 }}>NN</span>
                                </button>
                                <button
                                    className="table-editor-delete-col"
                                    onClick={() => removeColumn(col.id)}
                                    title="Remover campo"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save */}
            <div className="table-editor-footer">
                <button className="table-editor-cancel" onClick={onClose}>Cancelar</button>
                <button className="table-editor-save" onClick={() => { save(); onClose(); }}>
                    Salvar
                </button>
            </div>
        </div>
    );
}
