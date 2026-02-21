// ─── Flowchart Types ──────────────────────────────────────────────────────────

export type FlowchartMode = 'er' | 'bpmn' | 'free';

// ER shapes (database table diagram)
export type ERShape = 'er-table' | 'er-relationship';
// BPMN shapes
export type BPMNShape = 'bpmn-start' | 'bpmn-end' | 'bpmn-task' | 'bpmn-gateway' | 'bpmn-intermediate';
// Free shapes
export type FreeShape = 'free-rect' | 'free-ellipse' | 'free-diamond' | 'free-text' | 'free-note';

export type NodeShape = ERShape | BPMNShape | FreeShape;

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

// ─── Database Column Types ────────────────────────────────────────────────────

export const DB_COLUMN_TYPES = [
    'VARCHAR', 'TEXT', 'INT', 'BIGINT', 'SMALLINT',
    'DECIMAL', 'FLOAT', 'DOUBLE', 'BOOLEAN',
    'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
    'UUID', 'SERIAL', 'JSON', 'JSONB',
    'BLOB', 'BYTEA', 'ENUM', 'ARRAY',
] as const;

export type DBColumnType = typeof DB_COLUMN_TYPES[number];

export interface TableColumn {
    id: string;
    name: string;
    type: DBColumnType;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    isNullable: boolean;
    isUnique: boolean;
    defaultValue?: string;
}

export interface FlowNode {
    id: string;
    shape: NodeShape;
    position: Point;
    size: Size;
    label: string;
    sublabel?: string;
    color?: string;
    // ER table columns
    columns?: TableColumn[];
    // BPMN-specific
    taskType?: 'user' | 'service' | 'script' | 'manual';
}

// Height constants for table rendering
export const TABLE_HEADER_HEIGHT = 36;
export const TABLE_COLUMN_ROW_HEIGHT = 26;

export function calcTableHeight(columns: TableColumn[]): number {
    return TABLE_HEADER_HEIGHT + Math.max(1, columns.length) * TABLE_COLUMN_ROW_HEIGHT + 8;
}

export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    sourcePort: PortPosition;
    targetPort: PortPosition;
    label?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    // ER cardinality
    sourceCardinality?: string;
    targetCardinality?: string;
}

export type PortPosition = 'top' | 'right' | 'bottom' | 'left';

export type ResizeHandle =
    | 'top-left' | 'top' | 'top-right'
    | 'left' | 'right'
    | 'bottom-left' | 'bottom' | 'bottom-right';

export type Tool =
    | 'select'
    | 'pan'
    | 'connect'
    | NodeShape;

export interface Viewport {
    panX: number;
    panY: number;
    zoom: number;
}

export interface FlowchartState {
    mode: FlowchartMode;
    nodes: FlowNode[];
    edges: FlowEdge[];
    selectedNodeIds: string[];
    selectedEdgeIds: string[];
    activeTool: Tool;
    viewport: Viewport;
    gridSnap: boolean;
}

// Shape definitions per mode
export interface ShapeDef {
    shape: NodeShape;
    label: string;
    icon: string; // SVG path or emoji
    defaultSize: Size;
}

export const ER_SHAPES: ShapeDef[] = [
    { shape: 'er-table', label: 'Tabela', icon: '▤', defaultSize: { width: 220, height: 140 } },
    { shape: 'er-relationship', label: 'Relacionamento', icon: '◇', defaultSize: { width: 140, height: 100 } },
];

export const BPMN_SHAPES: ShapeDef[] = [
    { shape: 'bpmn-start', label: 'Início', icon: '●', defaultSize: { width: 50, height: 50 } },
    { shape: 'bpmn-end', label: 'Fim', icon: '◉', defaultSize: { width: 50, height: 50 } },
    { shape: 'bpmn-task', label: 'Tarefa', icon: '▭', defaultSize: { width: 160, height: 80 } },
    { shape: 'bpmn-gateway', label: 'Gateway', icon: '◇', defaultSize: { width: 60, height: 60 } },
    { shape: 'bpmn-intermediate', label: 'Evento', icon: '◎', defaultSize: { width: 50, height: 50 } },
];

export const FREE_SHAPES: ShapeDef[] = [
    { shape: 'free-rect', label: 'Retângulo', icon: '▭', defaultSize: { width: 160, height: 100 } },
    { shape: 'free-ellipse', label: 'Elipse', icon: '○', defaultSize: { width: 140, height: 100 } },
    { shape: 'free-diamond', label: 'Diamante', icon: '◇', defaultSize: { width: 120, height: 120 } },
    { shape: 'free-text', label: 'Texto', icon: 'T', defaultSize: { width: 160, height: 40 } },
    { shape: 'free-note', label: 'Nota', icon: '📝', defaultSize: { width: 180, height: 120 } },
];

export function getShapesForMode(mode: FlowchartMode): ShapeDef[] {
    switch (mode) {
        case 'er': return ER_SHAPES;
        case 'bpmn': return BPMN_SHAPES;
        case 'free': return FREE_SHAPES;
    }
}

export function getPortPoint(node: FlowNode, port: PortPosition): Point {
    const { x, y } = node.position;
    const { width, height } = node.size;
    switch (port) {
        case 'top': return { x: x + width / 2, y };
        case 'right': return { x: x + width, y: y + height / 2 };
        case 'bottom': return { x: x + width / 2, y: y + height };
        case 'left': return { x, y: y + height / 2 };
    }
}

export const GRID_SIZE = 20;
export const MIN_NODE_SIZE = 40;

export function snapToGrid(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
}
