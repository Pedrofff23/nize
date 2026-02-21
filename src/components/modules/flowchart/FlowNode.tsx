import React from 'react';
import {
    FlowNode as FlowNodeType,
    ResizeHandle,
    PortPosition,
    NodeShape,
    TableColumn,
    TABLE_HEADER_HEIGHT,
    TABLE_COLUMN_ROW_HEIGHT,
} from './flowchart-types';

interface FlowNodeProps {
    node: FlowNodeType;
    selected: boolean;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onResizeStart: (e: React.MouseEvent, id: string, handle: ResizeHandle) => void;
    onPortMouseDown: (e: React.MouseEvent, nodeId: string, port: PortPosition) => void;
    onDoubleClick: (e: React.MouseEvent, id: string) => void;
}

// ─── ER Table Renderer ────────────────────────────────────────────────────────

function renderERTable(width: number, height: number, label: string, columns: TableColumn[]) {
    const headerH = TABLE_HEADER_HEIGHT;
    const rowH = TABLE_COLUMN_ROW_HEIGHT;

    return (
        <g>
            {/* Shadow */}
            <rect
                x={2} y={2} width={width} height={height}
                rx={8}
                fill="hsl(0 0% 0% / 0.3)"
            />
            {/* Body */}
            <rect
                className="node-shape"
                x={0} y={0} width={width} height={height}
                rx={8}
                fill="hsl(220 30% 13%)"
                stroke="hsl(210 60% 35%)"
                strokeWidth={2}
            />
            {/* Header */}
            <rect
                x={0} y={0} width={width} height={headerH}
                rx={8}
                fill="hsl(210 70% 25%)"
            />
            {/* Header bottom rect to fill rounded corners */}
            <rect
                x={0} y={headerH - 8} width={width} height={8}
                fill="hsl(210 70% 25%)"
            />
            {/* Header divider */}
            <line
                x1={0} y1={headerH}
                x2={width} y2={headerH}
                stroke="hsl(210 60% 35%)"
                strokeWidth={1}
            />
            {/* Table icon in header */}
            <g transform={`translate(10, ${headerH / 2 - 6})`}>
                <rect x={0} y={0} width={12} height={12} rx={2} fill="none" stroke="hsl(210 80% 65%)" strokeWidth={1.2} />
                <line x1={0} y1={4} x2={12} y2={4} stroke="hsl(210 80% 65%)" strokeWidth={0.8} />
                <line x1={0} y1={8} x2={12} y2={8} stroke="hsl(210 80% 65%)" strokeWidth={0.8} />
                <line x1={5} y1={0} x2={5} y2={12} stroke="hsl(210 80% 65%)" strokeWidth={0.8} />
            </g>
            {/* Table name */}
            <text
                x={28} y={headerH / 2}
                fill="hsl(0 0% 98%)"
                fontSize={13}
                fontWeight={700}
                fontFamily="'Inter', sans-serif"
                dominantBaseline="central"
            >
                {label}
            </text>

            {/* Columns */}
            {columns.length === 0 && (
                <text
                    x={width / 2} y={headerH + 20}
                    fill="hsl(210 20% 45%)"
                    fontSize={11}
                    fontFamily="'Inter', sans-serif"
                    textAnchor="middle"
                    fontStyle="italic"
                >
                    duplo-clique para adicionar campos
                </text>
            )}
            {columns.map((col, i) => {
                const y = headerH + i * rowH;
                return (
                    <g key={col.id}>
                        {/* Row hover bg */}
                        <rect
                            x={1} y={y + 1}
                            width={width - 2} height={rowH - 1}
                            fill={i % 2 === 0 ? 'transparent' : 'hsl(220 30% 15%)'}
                            rx={0}
                        />
                        {/* PK icon */}
                        {col.isPrimaryKey && (
                            <text
                                x={10} y={y + rowH / 2}
                                fill="hsl(45 90% 55%)"
                                fontSize={11}
                                fontFamily="'Inter', sans-serif"
                                fontWeight={700}
                                dominantBaseline="central"
                            >
                                🔑
                            </text>
                        )}
                        {/* FK icon */}
                        {col.isForeignKey && !col.isPrimaryKey && (
                            <text
                                x={10} y={y + rowH / 2}
                                fill="hsl(200 70% 55%)"
                                fontSize={10}
                                fontFamily="'Inter', sans-serif"
                                dominantBaseline="central"
                            >
                                🔗
                            </text>
                        )}
                        {/* Column name */}
                        <text
                            x={col.isPrimaryKey || col.isForeignKey ? 30 : 12}
                            y={y + rowH / 2}
                            fill={col.isPrimaryKey ? 'hsl(45 80% 75%)' : 'hsl(0 0% 85%)'}
                            fontSize={12}
                            fontWeight={col.isPrimaryKey ? 600 : 400}
                            fontFamily="'Inter', sans-serif"
                            dominantBaseline="central"
                            textDecoration={col.isPrimaryKey ? 'underline' : 'none'}
                        >
                            {col.name}
                        </text>
                        {/* Column type */}
                        <text
                            x={width - 10}
                            y={y + rowH / 2}
                            fill="hsl(175 60% 50%)"
                            fontSize={10}
                            fontWeight={500}
                            fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                            dominantBaseline="central"
                            textAnchor="end"
                        >
                            {col.type}
                        </text>
                        {/* Nullable / Unique badges */}
                        {!col.isNullable && !col.isPrimaryKey && (
                            <text
                                x={width - 10 - col.type.length * 6.5 - 8}
                                y={y + rowH / 2}
                                fill="hsl(0 60% 55%)"
                                fontSize={8}
                                fontWeight={700}
                                fontFamily="'Inter', sans-serif"
                                dominantBaseline="central"
                                textAnchor="end"
                            >
                                NN
                            </text>
                        )}
                    </g>
                );
            })}
        </g>
    );
}

// ─── Generic Shape Renderers ──────────────────────────────────────────────────

function renderNodeShape(shape: NodeShape, width: number, height: number) {
    switch (shape) {
        // ER - table is handled separately
        case 'er-table':
            // Just render background, table content is handled in FlowNodeComponent
            return null;
        case 'er-relationship':
            return (
                <polygon
                    className="node-shape er-relationship-shape"
                    points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
                />
            );

        // BPMN
        case 'bpmn-start':
            return (
                <circle
                    className="node-shape bpmn-start-shape"
                    cx={width / 2} cy={height / 2}
                    r={Math.min(width, height) / 2}
                />
            );
        case 'bpmn-end':
            return (
                <circle
                    className="node-shape bpmn-end-shape"
                    cx={width / 2} cy={height / 2}
                    r={Math.min(width, height) / 2}
                />
            );
        case 'bpmn-task':
            return (
                <rect className="node-shape bpmn-task-shape" x={0} y={0} width={width} height={height} rx={10} />
            );
        case 'bpmn-gateway':
            return (
                <polygon
                    className="node-shape bpmn-gateway-shape"
                    points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
                />
            );
        case 'bpmn-intermediate':
            return (
                <g>
                    <circle
                        className="node-shape bpmn-intermediate-shape"
                        cx={width / 2} cy={height / 2}
                        r={Math.min(width, height) / 2}
                    />
                    <circle
                        fill="none"
                        stroke="hsl(30 70% 50%)"
                        strokeWidth={1.5}
                        cx={width / 2} cy={height / 2}
                        r={Math.min(width, height) / 2 - 4}
                    />
                </g>
            );

        // Free
        case 'free-rect':
            return (
                <rect className="node-shape free-rect-shape" x={0} y={0} width={width} height={height} rx={8} />
            );
        case 'free-ellipse':
            return (
                <ellipse
                    className="node-shape free-ellipse-shape"
                    cx={width / 2} cy={height / 2}
                    rx={width / 2} ry={height / 2}
                />
            );
        case 'free-diamond':
            return (
                <polygon
                    className="node-shape free-diamond-shape"
                    points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
                />
            );
        case 'free-text':
            return (
                <rect className="node-shape free-text-shape" x={0} y={0} width={width} height={height} />
            );
        case 'free-note':
            return (
                <g>
                    <rect className="node-shape free-note-shape" x={0} y={0} width={width} height={height} rx={6} />
                    {/* Folded corner */}
                    <polygon
                        fill="hsl(50 50% 25%)"
                        points={`${width - 16},0 ${width},16 ${width - 16},16`}
                    />
                </g>
            );

        default:
            return <rect className="node-shape" x={0} y={0} width={width} height={height} rx={4} fill="hsl(190 25% 18%)" stroke="hsl(190 25% 30%)" />;
    }
}

// ─── Resize Handles ───────────────────────────────────────────────────────────

const HANDLES: { handle: ResizeHandle; getPos: (w: number, h: number) => { cx: number; cy: number } }[] = [
    { handle: 'top-left', getPos: () => ({ cx: 0, cy: 0 }) },
    { handle: 'top', getPos: (w) => ({ cx: w / 2, cy: 0 }) },
    { handle: 'top-right', getPos: (w) => ({ cx: w, cy: 0 }) },
    { handle: 'left', getPos: (_, h) => ({ cx: 0, cy: h / 2 }) },
    { handle: 'right', getPos: (w, h) => ({ cx: w, cy: h / 2 }) },
    { handle: 'bottom-left', getPos: (_, h) => ({ cx: 0, cy: h }) },
    { handle: 'bottom', getPos: (w, h) => ({ cx: w / 2, cy: h }) },
    { handle: 'bottom-right', getPos: (w, h) => ({ cx: w, cy: h }) },
];

// ─── Port Positions ───────────────────────────────────────────────────────────

const PORTS: { port: PortPosition; getPos: (w: number, h: number) => { cx: number; cy: number } }[] = [
    { port: 'top', getPos: (w) => ({ cx: w / 2, cy: 0 }) },
    { port: 'right', getPos: (w, h) => ({ cx: w, cy: h / 2 }) },
    { port: 'bottom', getPos: (w, h) => ({ cx: w / 2, cy: h }) },
    { port: 'left', getPos: (_, h) => ({ cx: 0, cy: h / 2 }) },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FlowNodeComponent({
    node,
    selected,
    onMouseDown,
    onResizeStart,
    onPortMouseDown,
    onDoubleClick,
}: FlowNodeProps) {
    const { position, size, label, sublabel } = node;
    const isTable = node.shape === 'er-table';

    return (
        <g
            className={`flowchart-node ${selected ? 'selected' : ''}`}
            transform={`translate(${position.x}, ${position.y})`}
            onMouseDown={(e) => onMouseDown(e, node.id)}
            onDoubleClick={(e) => onDoubleClick(e, node.id)}
        >
            {/* Table shape or generic shape */}
            {isTable
                ? renderERTable(size.width, size.height, label, node.columns ?? [])
                : (
                    <>
                        {renderNodeShape(node.shape, size.width, size.height)}
                        {/* Label */}
                        <text className="node-label" x={size.width / 2} y={sublabel ? size.height / 2 - 8 : size.height / 2}>
                            {label}
                        </text>
                        {sublabel && (
                            <text className="node-sublabel" x={size.width / 2} y={size.height / 2 + 10}>
                                {sublabel}
                            </text>
                        )}
                    </>
                )}

            {/* Selection outline */}
            {selected && (
                <rect
                    className="node-selection-outline"
                    x={-4} y={-4}
                    width={size.width + 8} height={size.height + 8}
                    rx={6}
                />
            )}

            {/* Resize handles */}
            {HANDLES.map(({ handle, getPos }) => {
                const { cx, cy } = getPos(size.width, size.height);
                return (
                    <circle
                        key={handle}
                        className={`resize-handle handle-${handle}`}
                        cx={cx} cy={cy}
                        r={4}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart(e, node.id, handle);
                        }}
                    />
                );
            })}

            {/* Connection ports */}
            {PORTS.map(({ port, getPos }) => {
                const { cx, cy } = getPos(size.width, size.height);
                return (
                    <circle
                        key={port}
                        className="port-circle"
                        cx={cx} cy={cy}
                        r={5}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onPortMouseDown(e, node.id, port);
                        }}
                    />
                );
            })}
        </g>
    );
}
