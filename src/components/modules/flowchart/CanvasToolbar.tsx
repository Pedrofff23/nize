import React from 'react';
import {
    FlowchartMode,
    Tool,
    getShapesForMode,
    NodeShape,
} from './flowchart-types';
import {
    MousePointer2,
    Hand,
    Link2,
    Trash2,
    Grid3X3,
    ZoomIn,
    ZoomOut,
    RotateCcw,
} from 'lucide-react';

interface CanvasToolbarProps {
    mode: FlowchartMode;
    activeTool: Tool;
    gridSnap: boolean;
    zoom: number;
    hasSelection: boolean;
    onModeChange: (mode: FlowchartMode) => void;
    onToolChange: (tool: Tool) => void;
    onToggleGrid: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    onDeleteSelected: () => void;
}

const MODE_LABELS: Record<FlowchartMode, string> = {
    er: 'ER',
    bpmn: 'BPMN',
    free: 'Livre',
};

export function CanvasToolbar({
    mode,
    activeTool,
    gridSnap,
    zoom,
    hasSelection,
    onModeChange,
    onToolChange,
    onToggleGrid,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onDeleteSelected,
}: CanvasToolbarProps) {
    const shapes = getShapesForMode(mode);

    return (
        <>
            {/* Top Toolbar */}
            <div className="flowchart-toolbar">
                {/* Mode selector */}
                <div className="mode-selector">
                    {(['er', 'bpmn', 'free'] as FlowchartMode[]).map(m => (
                        <button
                            key={m}
                            className={mode === m ? 'active' : ''}
                            onClick={() => onModeChange(m)}
                            title={`Modo ${MODE_LABELS[m]}`}
                        >
                            {MODE_LABELS[m]}
                        </button>
                    ))}
                </div>

                <div className="toolbar-separator" />

                {/* Tool buttons */}
                <button
                    className={activeTool === 'select' ? 'active' : ''}
                    onClick={() => onToolChange('select')}
                    title="Selecionar (V)"
                >
                    <MousePointer2 size={15} />
                </button>

                <button
                    className={activeTool === 'pan' ? 'active' : ''}
                    onClick={() => onToolChange('pan')}
                    title="Mover Canvas (H)"
                >
                    <Hand size={15} />
                </button>

                <button
                    className={activeTool === 'connect' ? 'active' : ''}
                    onClick={() => onToolChange('connect')}
                    title="Conectar (C)"
                >
                    <Link2 size={15} />
                </button>

                <div className="toolbar-separator" />

                <button
                    className={gridSnap ? 'active' : ''}
                    onClick={onToggleGrid}
                    title="Snap to Grid"
                >
                    <Grid3X3 size={15} />
                </button>

                {hasSelection && (
                    <>
                        <div className="toolbar-separator" />
                        <button
                            onClick={onDeleteSelected}
                            title="Excluir Selecionados (Delete)"
                            style={{ color: 'hsl(0 70% 55%)' }}
                        >
                            <Trash2 size={15} />
                        </button>
                    </>
                )}
            </div>

            {/* Shape Palette */}
            <ShapePalette
                shapes={shapes}
                activeTool={activeTool}
                onToolChange={onToolChange}
            />

            {/* Zoom Controls */}
            <div className="zoom-controls">
                <button onClick={onZoomOut} title="Zoom Out">
                    <ZoomOut size={14} />
                </button>
                <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                <button onClick={onZoomIn} title="Zoom In">
                    <ZoomIn size={14} />
                </button>
                <button onClick={onZoomReset} title="Reset Zoom">
                    <RotateCcw size={12} />
                </button>
            </div>
        </>
    );
}

// ─── Shape Palette ────────────────────────────────────────────────────────────

function ShapePalette({
    shapes,
    activeTool,
    onToolChange,
}: {
    shapes: ReturnType<typeof getShapesForMode>;
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
}) {
    return (
        <div className="shape-palette">
            {shapes.map(shapeDef => (
                <button
                    key={shapeDef.shape}
                    className={activeTool === shapeDef.shape ? 'active' : ''}
                    onClick={() => onToolChange(shapeDef.shape as NodeShape)}
                    title={shapeDef.label}
                >
                    <span className="shape-icon">{shapeDef.icon}</span>
                    <span>{shapeDef.label}</span>
                </button>
            ))}
        </div>
    );
}
