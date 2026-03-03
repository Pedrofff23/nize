import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useFlowchartState } from './useFlowchartState';
import { FlowNodeComponent } from './FlowNode';
import { FlowEdgeComponent, ConnectionPreview } from './FlowEdge';
import { CanvasToolbar } from './CanvasToolbar';
import { TableEditor } from './TableEditor';
import {
    Point,
    NodeShape,
    ResizeHandle,
    PortPosition,
    GRID_SIZE,
    getPortPoint,
    Tool,
    MIN_NODE_SIZE,
} from './flowchart-types';
import './flowchart.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isShapeTool(tool: Tool): tool is NodeShape {
    return typeof tool === 'string' && (
        tool.startsWith('er-') || tool.startsWith('bpmn-') || tool.startsWith('free-')
    );
}

function getToolCursorClass(tool: Tool): string {
    if (tool === 'pan') return 'tool-pan';
    if (tool === 'connect') return 'tool-connect';
    if (isShapeTool(tool)) return 'tool-shape';
    return '';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FlowchartCanvasProps {
    initialData?: {
        mode?: string;
        nodes?: any[];
        edges?: any[];
    };
    onSave?: (data: { mode: string; nodes: any[]; edges: any[] }) => void;
}

export function FlowchartCanvas({ initialData, onSave }: FlowchartCanvasProps) {
    const {
        state,
        setMode,
        setTool,
        addNode,
        updateNode,
        moveNode,
        resizeNode,
        deleteSelected,
        addEdge,
        selectNode,
        selectEdge,
        clearSelection,
        setViewport,
        toggleGridSnap,
        updateEdge,
    } = useFlowchartState(initialData as any);

    // ─── Auto-save (debounced) ─────────────────────────────────────────────
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevDataRef = useRef<string>('');

    useEffect(() => {
        if (!onSave) return;
        const currentData = JSON.stringify({ mode: state.mode, nodes: state.nodes, edges: state.edges });
        // Skip initial render
        if (prevDataRef.current === '') {
            prevDataRef.current = currentData;
            return;
        }
        // Only save if data changed
        if (currentData === prevDataRef.current) return;
        prevDataRef.current = currentData;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            onSave({ mode: state.mode, nodes: state.nodes, edges: state.edges });
        }, 1500);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [state.mode, state.nodes, state.edges, onSave]);

    const svgRef = useRef<SVGSVGElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // ─── Dragging State ───────────────────────────────────────────────────────

    const [dragging, setDragging] = useState<{
        type: 'node' | 'pan' | 'resize' | 'connect';
        nodeId?: string;
        handle?: ResizeHandle;
        port?: PortPosition;
        startMouseX: number;
        startMouseY: number;
        startNodeX?: number;
        startNodeY?: number;
        startNodeW?: number;
        startNodeH?: number;
    } | null>(null);

    const [connectPreview, setConnectPreview] = useState<{
        from: Point;
        to: Point;
        fromPort: string;
        sourceId: string;
        sourcePort: PortPosition;
    } | null>(null);

    const [editingNode, setEditingNode] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editingTable, setEditingTable] = useState<string | null>(null);

    const [editingEdge, setEditingEdge] = useState<string | null>(null);
    const [editEdgeValue, setEditEdgeValue] = useState('');

    // ─── SVG Coordinate Transform ────────────────────────────────────────────

    const screenToCanvas = useCallback((clientX: number, clientY: number): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: (clientX - rect.left - state.viewport.panX) / state.viewport.zoom,
            y: (clientY - rect.top - state.viewport.panY) / state.viewport.zoom,
        };
    }, [state.viewport]);

    // ─── Canvas Mouse Events ─────────────────────────────────────────────────

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as SVGElement;
        const isBackground = target === svgRef.current || target.classList.contains('canvas-bg');

        if (state.activeTool === 'pan' || (e.button === 0 && e.altKey)) {
            setDragging({
                type: 'pan',
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startNodeX: state.viewport.panX,
                startNodeY: state.viewport.panY,
            });
            e.preventDefault();
            return;
        }

        if (isShapeTool(state.activeTool) && isBackground) {
            const canvasPos = screenToCanvas(e.clientX, e.clientY);
            addNode(state.activeTool, {
                x: canvasPos.x - 80,
                y: canvasPos.y - 50,
            });
            return;
        }

        if (isBackground && state.activeTool === 'select') {
            clearSelection();
        }
    }, [state.activeTool, state.viewport, screenToCanvas, addNode, clearSelection]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;

        e.preventDefault();
        const dx = e.clientX - dragging.startMouseX;
        const dy = e.clientY - dragging.startMouseY;

        if (dragging.type === 'pan') {
            setViewport({
                ...state.viewport,
                panX: (dragging.startNodeX ?? 0) + dx,
                panY: (dragging.startNodeY ?? 0) + dy,
            });
        }

        if (dragging.type === 'node' && dragging.nodeId) {
            moveNode(dragging.nodeId, {
                x: (dragging.startNodeX ?? 0) + dx / state.viewport.zoom,
                y: (dragging.startNodeY ?? 0) + dy / state.viewport.zoom,
            });
        }

        if (dragging.type === 'resize' && dragging.nodeId && dragging.handle) {
            const scDx = dx / state.viewport.zoom;
            const scDy = dy / state.viewport.zoom;
            const sx = dragging.startNodeX ?? 0;
            const sy = dragging.startNodeY ?? 0;
            const sw = dragging.startNodeW ?? 100;
            const sh = dragging.startNodeH ?? 100;

            let newX = sx, newY = sy, newW = sw, newH = sh;

            const handle = dragging.handle;
            if (handle.includes('left')) {
                newX = sx + scDx;
                newW = sw - scDx;
            }
            if (handle.includes('right')) {
                newW = sw + scDx;
            }
            if (handle === 'top' || handle === 'top-left' || handle === 'top-right') {
                newY = sy + scDy;
                newH = sh - scDy;
            }
            if (handle === 'bottom' || handle === 'bottom-left' || handle === 'bottom-right') {
                newH = sh + scDy;
            }

            // Enforce min size
            if (newW < MIN_NODE_SIZE) {
                if (handle.includes('left')) newX = sx + sw - MIN_NODE_SIZE;
                newW = MIN_NODE_SIZE;
            }
            if (newH < MIN_NODE_SIZE) {
                if (handle === 'top' || handle === 'top-left' || handle === 'top-right') newY = sy + sh - MIN_NODE_SIZE;
                newH = MIN_NODE_SIZE;
            }

            resizeNode(dragging.nodeId, { x: newX, y: newY }, { width: newW, height: newH });
        }

        if (dragging.type === 'connect' && connectPreview) {
            const canvasPos = screenToCanvas(e.clientX, e.clientY);
            setConnectPreview({
                ...connectPreview,
                to: canvasPos,
            });
        }
    }, [dragging, state.viewport, connectPreview, moveNode, resizeNode, setViewport, screenToCanvas]);

    const handleMouseUp = useCallback(() => {
        if (dragging?.type === 'connect' && connectPreview) {
            // Find target node/port under mouse
            const { to, sourceId, sourcePort } = connectPreview;
            const targetNode = state.nodes.find(n => {
                if (n.id === sourceId) return false;
                return (
                    to.x >= n.position.x &&
                    to.x <= n.position.x + n.size.width &&
                    to.y >= n.position.y &&
                    to.y <= n.position.y + n.size.height
                );
            });
            if (targetNode) {
                // Find nearest port
                const ports: PortPosition[] = ['top', 'right', 'bottom', 'left'];
                let nearest = ports[0];
                let minDist = Infinity;
                for (const p of ports) {
                    const pp = getPortPoint(targetNode, p);
                    const dist = Math.hypot(pp.x - to.x, pp.y - to.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = p;
                    }
                }
                addEdge(sourceId, targetNode.id, sourcePort, nearest);
            }
            setConnectPreview(null);
        }
        setDragging(null);
    }, [dragging, connectPreview, state.nodes, addEdge]);

    // ─── Node Handlers ───────────────────────────────────────────────────────

    const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (state.activeTool === 'connect') return;

        selectNode(id, e.shiftKey);
        const node = state.nodes.find(n => n.id === id);
        if (!node) return;

        setDragging({
            type: 'node',
            nodeId: id,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startNodeX: node.position.x,
            startNodeY: node.position.y,
        });
    }, [state.activeTool, state.nodes, selectNode]);

    const handleResizeStart = useCallback((e: React.MouseEvent, id: string, handle: ResizeHandle) => {
        e.stopPropagation();
        const node = state.nodes.find(n => n.id === id);
        if (!node) return;

        selectNode(id);
        setDragging({
            type: 'resize',
            nodeId: id,
            handle,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startNodeX: node.position.x,
            startNodeY: node.position.y,
            startNodeW: node.size.width,
            startNodeH: node.size.height,
        });
    }, [state.nodes, selectNode]);

    const handlePortMouseDown = useCallback((e: React.MouseEvent, nodeId: string, port: PortPosition) => {
        e.stopPropagation();
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const portPoint = getPortPoint(node, port);

        setDragging({
            type: 'connect',
            nodeId,
            port,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
        });

        setConnectPreview({
            from: portPoint,
            to: portPoint,
            fromPort: port,
            sourceId: nodeId,
            sourcePort: port,
        });
    }, [state.nodes]);

    const handleNodeDoubleClick = useCallback((_e: React.MouseEvent, id: string) => {
        const node = state.nodes.find(n => n.id === id);
        if (!node) return;
        // For ER tables, open the table editor
        if (node.shape === 'er-table') {
            setEditingTable(id);
            return;
        }
        setEditingNode(id);
        setEditValue(node.label);
    }, [state.nodes]);

    const finishEdit = useCallback(() => {
        if (editingNode && editValue.trim()) {
            updateNode(editingNode, { label: editValue.trim() });
        }
        setEditingNode(null);
    }, [editingNode, editValue, updateNode]);

    // ─── Edge Click ───────────────────────────────────────────────────────────

    const handleEdgeClick = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        selectEdge(id, e.shiftKey);
    }, [selectEdge]);

    const handleEdgeDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const edge = state.edges.find(e => e.id === id);
        if (!edge) return;
        setEditingEdge(id);
        setEditEdgeValue(edge.label || '');
    }, [state.edges]);

    const finishEdgeEdit = useCallback(() => {
        if (editingEdge) {
            updateEdge(editingEdge, { label: editEdgeValue.trim() });
        }
        setEditingEdge(null);
    }, [editingEdge, editEdgeValue, updateEdge]);

    // ─── Zoom ─────────────────────────────────────────────────────────────────

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, state.viewport.zoom * delta));

        // Zoom toward mouse position
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        setViewport({
            zoom: newZoom,
            panX: mx - (mx - state.viewport.panX) * (newZoom / state.viewport.zoom),
            panY: my - (my - state.viewport.panY) * (newZoom / state.viewport.zoom),
        });
    }, [state.viewport, setViewport]);

    const zoomIn = useCallback(() => {
        const newZoom = Math.min(3, state.viewport.zoom * 1.2);
        setViewport({ ...state.viewport, zoom: newZoom });
    }, [state.viewport, setViewport]);

    const zoomOut = useCallback(() => {
        const newZoom = Math.max(0.1, state.viewport.zoom / 1.2);
        setViewport({ ...state.viewport, zoom: newZoom });
    }, [state.viewport, setViewport]);

    const zoomReset = useCallback(() => {
        setViewport({ panX: 0, panY: 0, zoom: 1 });
    }, [setViewport]);

    // ─── Keyboard ─────────────────────────────────────────────────────────────

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (editingNode) return; // Don't handle when editing

            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    deleteSelected();
                    break;
                case 'Escape':
                    clearSelection();
                    setTool('select');
                    break;
                case 'v':
                case 'V':
                    setTool('select');
                    break;
                case 'h':
                case 'H':
                    setTool('pan');
                    break;
                case 'c':
                case 'C':
                    if (!e.ctrlKey && !e.metaKey) setTool('connect');
                    break;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [editingNode, deleteSelected, clearSelection, setTool]);

    // ─── Grid ─────────────────────────────────────────────────────────────────

    const gridSize = GRID_SIZE;
    const gridPatternId = 'flowchart-grid-pattern';
    const majorGridPatternId = 'flowchart-major-grid-pattern';

    // ─── Render ───────────────────────────────────────────────────────────────

    const hasSelection = state.selectedNodeIds.length > 0 || state.selectedEdgeIds.length > 0;
    const cursorClass = getToolCursorClass(state.activeTool);

    // Get editing node position for inline edit
    const editNode = editingNode ? state.nodes.find(n => n.id === editingNode) : null;
    const editTableNode = editingTable ? state.nodes.find(n => n.id === editingTable) : null;

    // Get editing edge position
    const editEdgeObj = editingEdge ? state.edges.find(e => e.id === editingEdge) : null;
    let editEdgePos: Point | null = null;
    if (editEdgeObj) {
        const sourceNode = state.nodes.find(n => n.id === editEdgeObj.source);
        const targetNode = state.nodes.find(n => n.id === editEdgeObj.target);
        if (sourceNode && targetNode) {
            const sp = getPortPoint(sourceNode, editEdgeObj.sourcePort);
            const tp = getPortPoint(targetNode, editEdgeObj.targetPort);
            editEdgePos = {
                x: (sp.x + tp.x) / 2,
                y: (sp.y + tp.y) / 2
            };
        }
    }

    return (
        <div className="flowchart-wrapper" ref={wrapperRef}>
            <CanvasToolbar
                mode={state.mode}
                activeTool={state.activeTool}
                gridSnap={state.gridSnap}
                zoom={state.viewport.zoom}
                hasSelection={hasSelection}
                onModeChange={setMode}
                onToolChange={setTool}
                onToggleGrid={toggleGridSnap}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onZoomReset={zoomReset}
                onDeleteSelected={deleteSelected}
            />

            <svg
                ref={svgRef}
                className={`flowchart-canvas ${cursorClass}`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                tabIndex={0}
            >
                {/* Defs */}
                <defs>
                    <pattern
                        id={gridPatternId}
                        width={gridSize}
                        height={gridSize}
                        patternUnits="userSpaceOnUse"
                    >
                        <line className="flowchart-grid-line" x1={gridSize} y1={0} x2={gridSize} y2={gridSize} />
                        <line className="flowchart-grid-line" x1={0} y1={gridSize} x2={gridSize} y2={gridSize} />
                    </pattern>
                    <pattern
                        id={majorGridPatternId}
                        width={gridSize * 5}
                        height={gridSize * 5}
                        patternUnits="userSpaceOnUse"
                    >
                        <rect width={gridSize * 5} height={gridSize * 5} fill={`url(#${gridPatternId})`} />
                        <line className="flowchart-grid-line-major" x1={gridSize * 5} y1={0} x2={gridSize * 5} y2={gridSize * 5} />
                        <line className="flowchart-grid-line-major" x1={0} y1={gridSize * 5} x2={gridSize * 5} y2={gridSize * 5} />
                    </pattern>
                </defs>

                {/* Background */}
                <rect
                    className="canvas-bg"
                    x={-10000}
                    y={-10000}
                    width={20000}
                    height={20000}
                    fill="transparent"
                />

                {/* Viewport transform group */}
                <g transform={`translate(${state.viewport.panX}, ${state.viewport.panY}) scale(${state.viewport.zoom})`}>
                    {/* Grid */}
                    {state.gridSnap && (
                        <rect
                            x={-5000}
                            y={-5000}
                            width={10000}
                            height={10000}
                            fill={`url(#${majorGridPatternId})`}
                            pointerEvents="none"
                        />
                    )}

                    {/* Edges */}
                    {state.edges.map(edge => (
                        <FlowEdgeComponent
                            key={edge.id}
                            edge={edge}
                            nodes={state.nodes}
                            selected={state.selectedEdgeIds.includes(edge.id)}
                            onClick={handleEdgeClick}
                            onDoubleClick={handleEdgeDoubleClick}
                        />
                    ))}

                    {/* Connection Preview */}
                    {connectPreview && (
                        <ConnectionPreview
                            from={connectPreview.from}
                            to={connectPreview.to}
                            fromPort={connectPreview.fromPort}
                        />
                    )}

                    {/* Nodes */}
                    {state.nodes.map(node => (
                        <FlowNodeComponent
                            key={node.id}
                            node={node}
                            selected={state.selectedNodeIds.includes(node.id)}
                            onMouseDown={handleNodeMouseDown}
                            onResizeStart={handleResizeStart}
                            onPortMouseDown={handlePortMouseDown}
                            onDoubleClick={handleNodeDoubleClick}
                        />
                    ))}
                </g>
            </svg>

            {/* Inline Label Edit */}
            {editNode && (
                <div
                    className="node-inline-edit"
                    style={{
                        left: editNode.position.x * state.viewport.zoom + state.viewport.panX + (editNode.size.width * state.viewport.zoom / 2) - 60,
                        top: editNode.position.y * state.viewport.zoom + state.viewport.panY + (editNode.size.height * state.viewport.zoom / 2) - 14,
                    }}
                >
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') finishEdit();
                            if (e.key === 'Escape') setEditingNode(null);
                        }}
                        onBlur={finishEdit}
                        autoFocus
                        style={{ width: 120 }}
                    />
                </div>
            )}

            {/* Table Editor */}
            {editTableNode && (
                <TableEditor
                    node={editTableNode}
                    onUpdate={updateNode}
                    onClose={() => setEditingTable(null)}
                    style={{
                        left: Math.min(
                            editTableNode.position.x * state.viewport.zoom + state.viewport.panX + editTableNode.size.width * state.viewport.zoom + 12,
                            (wrapperRef.current?.clientWidth ?? 800) - 380
                        ),
                        top: Math.max(12, editTableNode.position.y * state.viewport.zoom + state.viewport.panY),
                    }}
                />
            )}

            {/* Inline Edge Edit */}
            {editEdgeObj && editEdgePos && (
                <div
                    className="absolute z-20 pointer-events-auto shadow-2xl"
                    style={{
                        left: editEdgePos.x * state.viewport.zoom + state.viewport.panX - 60,
                        top: editEdgePos.y * state.viewport.zoom + state.viewport.panY - 14,
                    }}
                >
                    <input
                        type="text"
                        value={editEdgeValue}
                        onChange={(e) => setEditEdgeValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') finishEdgeEdit();
                            if (e.key === 'Escape') setEditingEdge(null);
                        }}
                        onBlur={finishEdgeEdit}
                        autoFocus
                        style={{ width: 120 }}
                        className="bg-background/80 backdrop-blur-md border border-primary/50 rounded-md text-foreground text-xs font-medium px-2 py-1 text-center outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
                    />
                </div>
            )}
        </div>
    );
}
