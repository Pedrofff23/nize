import { useReducer, useCallback } from 'react';
import {
    FlowchartState,
    FlowchartMode,
    FlowNode,
    FlowEdge,
    Tool,
    Point,
    Size,
    NodeShape,
    Viewport,
    TableColumn,
    snapToGrid,
    MIN_NODE_SIZE,
    getShapesForMode,
    calcTableHeight,
} from './flowchart-types';

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
    | { type: 'SET_MODE'; mode: FlowchartMode }
    | { type: 'SET_TOOL'; tool: Tool }
    | { type: 'ADD_NODE'; node: FlowNode }
    | { type: 'UPDATE_NODE'; id: string; changes: Partial<FlowNode> }
    | { type: 'MOVE_NODE'; id: string; position: Point }
    | { type: 'RESIZE_NODE'; id: string; position: Point; size: Size }
    | { type: 'DELETE_NODES'; ids: string[] }
    | { type: 'ADD_EDGE'; edge: FlowEdge }
    | { type: 'UPDATE_EDGE'; id: string; changes: Partial<FlowEdge> }
    | { type: 'DELETE_EDGES'; ids: string[] }
    | { type: 'SELECT_NODE'; id: string; additive?: boolean }
    | { type: 'SELECT_EDGE'; id: string; additive?: boolean }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SET_VIEWPORT'; viewport: Viewport }
    | { type: 'TOGGLE_GRID_SNAP' }
    | { type: 'DELETE_SELECTED' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function flowchartReducer(state: FlowchartState, action: Action): FlowchartState {
    switch (action.type) {
        case 'SET_MODE':
            return { ...state, mode: action.mode, activeTool: 'select' };

        case 'SET_TOOL':
            return { ...state, activeTool: action.tool };

        case 'ADD_NODE':
            return { ...state, nodes: [...state.nodes, action.node] };

        case 'UPDATE_NODE':
            return {
                ...state,
                nodes: state.nodes.map(n => n.id === action.id ? { ...n, ...action.changes } : n),
            };

        case 'MOVE_NODE':
            return {
                ...state,
                nodes: state.nodes.map(n =>
                    n.id === action.id
                        ? { ...n, position: state.gridSnap ? { x: snapToGrid(action.position.x), y: snapToGrid(action.position.y) } : action.position }
                        : n
                ),
            };

        case 'RESIZE_NODE':
            return {
                ...state,
                nodes: state.nodes.map(n =>
                    n.id === action.id
                        ? {
                            ...n,
                            position: state.gridSnap ? { x: snapToGrid(action.position.x), y: snapToGrid(action.position.y) } : action.position,
                            size: {
                                width: Math.max(MIN_NODE_SIZE, state.gridSnap ? snapToGrid(action.size.width) : action.size.width),
                                height: Math.max(MIN_NODE_SIZE, state.gridSnap ? snapToGrid(action.size.height) : action.size.height),
                            },
                        }
                        : n
                ),
            };

        case 'DELETE_NODES': {
            const ids = new Set(action.ids);
            return {
                ...state,
                nodes: state.nodes.filter(n => !ids.has(n.id)),
                edges: state.edges.filter(e => !ids.has(e.source) && !ids.has(e.target)),
                selectedNodeIds: state.selectedNodeIds.filter(id => !ids.has(id)),
            };
        }

        case 'ADD_EDGE':
            return { ...state, edges: [...state.edges, action.edge] };

        case 'UPDATE_EDGE':
            return {
                ...state,
                edges: state.edges.map(e => e.id === action.id ? { ...e, ...action.changes } : e),
            };

        case 'DELETE_EDGES': {
            const ids = new Set(action.ids);
            return {
                ...state,
                edges: state.edges.filter(e => !ids.has(e.id)),
                selectedEdgeIds: state.selectedEdgeIds.filter(id => !ids.has(id)),
            };
        }

        case 'SELECT_NODE':
            return {
                ...state,
                selectedNodeIds: action.additive
                    ? state.selectedNodeIds.includes(action.id)
                        ? state.selectedNodeIds.filter(id => id !== action.id)
                        : [...state.selectedNodeIds, action.id]
                    : [action.id],
                selectedEdgeIds: action.additive ? state.selectedEdgeIds : [],
            };

        case 'SELECT_EDGE':
            return {
                ...state,
                selectedEdgeIds: action.additive
                    ? state.selectedEdgeIds.includes(action.id)
                        ? state.selectedEdgeIds.filter(id => id !== action.id)
                        : [...state.selectedEdgeIds, action.id]
                    : [action.id],
                selectedNodeIds: action.additive ? state.selectedNodeIds : [],
            };

        case 'CLEAR_SELECTION':
            return { ...state, selectedNodeIds: [], selectedEdgeIds: [] };

        case 'SET_VIEWPORT':
            return { ...state, viewport: action.viewport };

        case 'TOGGLE_GRID_SNAP':
            return { ...state, gridSnap: !state.gridSnap };

        case 'DELETE_SELECTED': {
            const nodeIds = new Set(state.selectedNodeIds);
            const edgeIds = new Set(state.selectedEdgeIds);
            return {
                ...state,
                nodes: state.nodes.filter(n => !nodeIds.has(n.id)),
                edges: state.edges.filter(e => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target)),
                selectedNodeIds: [],
                selectedEdgeIds: [],
            };
        }

        default:
            return state;
    }
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: FlowchartState = {
    mode: 'free',
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    selectedEdgeIds: [],
    activeTool: 'select',
    viewport: { panX: 0, panY: 0, zoom: 1 },
    gridSnap: true,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface FlowchartInitialData {
    mode?: FlowchartMode;
    nodes?: FlowNode[];
    edges?: FlowEdge[];
}

export function useFlowchartState(initialData?: FlowchartInitialData) {
    const [state, dispatch] = useReducer(flowchartReducer, {
        ...initialState,
        mode: initialData?.mode ?? 'free',
        nodes: initialData?.nodes ?? [],
        edges: initialData?.edges ?? [],
    });

    const setMode = useCallback((mode: FlowchartMode) => dispatch({ type: 'SET_MODE', mode }), []);
    const setTool = useCallback((tool: Tool) => dispatch({ type: 'SET_TOOL', tool }), []);

    const addNode = useCallback((shape: NodeShape, position: Point) => {
        const shapeDef = [...getShapesForMode('er'), ...getShapesForMode('bpmn'), ...getShapesForMode('free')]
            .find(s => s.shape === shape);
        const defaultSize = shapeDef?.defaultSize ?? { width: 160, height: 100 };

        // For ER tables, create default column and calculate height
        let columns: TableColumn[] | undefined;
        let label = shapeDef?.label ?? 'Novo';
        if (shape === 'er-table') {
            label = 'nova_tabela';
            columns = [{
                id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: 'id',
                type: 'SERIAL',
                isPrimaryKey: true,
                isForeignKey: false,
                isNullable: false,
                isUnique: true,
            }];
            defaultSize.height = calcTableHeight(columns);
        }

        const node: FlowNode = {
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            shape,
            position: state.gridSnap ? { x: snapToGrid(position.x), y: snapToGrid(position.y) } : position,
            size: defaultSize,
            label,
            columns,
        };
        dispatch({ type: 'ADD_NODE', node });
        dispatch({ type: 'SET_TOOL', tool: 'select' });
        return node;
    }, [state.gridSnap]);

    const updateNode = useCallback((id: string, changes: Partial<FlowNode>) => {
        dispatch({ type: 'UPDATE_NODE', id, changes });
    }, []);

    const moveNode = useCallback((id: string, position: Point) => {
        dispatch({ type: 'MOVE_NODE', id, position });
    }, []);

    const resizeNode = useCallback((id: string, position: Point, size: Size) => {
        dispatch({ type: 'RESIZE_NODE', id, position, size });
    }, []);

    const deleteSelected = useCallback(() => {
        dispatch({ type: 'DELETE_SELECTED' });
    }, []);

    const addEdge = useCallback((source: string, target: string, sourcePort: FlowEdge['sourcePort'], targetPort: FlowEdge['targetPort']) => {
        if (source === target) return;
        // Avoid duplicates
        const exists = state.edges.some(e => e.source === source && e.target === target);
        if (exists) return;
        const edge: FlowEdge = {
            id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            source,
            target,
            sourcePort,
            targetPort,
            style: 'solid',
        };
        dispatch({ type: 'ADD_EDGE', edge });
    }, [state.edges]);

    const updateEdge = useCallback((id: string, changes: Partial<FlowEdge>) => {
        dispatch({ type: 'UPDATE_EDGE', id, changes });
    }, []);

    const selectNode = useCallback((id: string, additive = false) => {
        dispatch({ type: 'SELECT_NODE', id, additive });
    }, []);

    const selectEdge = useCallback((id: string, additive = false) => {
        dispatch({ type: 'SELECT_EDGE', id, additive });
    }, []);

    const clearSelection = useCallback(() => dispatch({ type: 'CLEAR_SELECTION' }), []);

    const setViewport = useCallback((viewport: Viewport) => dispatch({ type: 'SET_VIEWPORT', viewport }), []);

    const toggleGridSnap = useCallback(() => dispatch({ type: 'TOGGLE_GRID_SNAP' }), []);

    return {
        state,
        setMode,
        setTool,
        addNode,
        updateNode,
        moveNode,
        resizeNode,
        deleteSelected,
        addEdge,
        updateEdge,
        selectNode,
        selectEdge,
        clearSelection,
        setViewport,
        toggleGridSnap,
    };
}
