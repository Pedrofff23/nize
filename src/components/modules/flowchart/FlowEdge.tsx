import React from 'react';
import { FlowEdge as FlowEdgeType, FlowNode, getPortPoint } from './flowchart-types';

interface FlowEdgeProps {
    edge: FlowEdgeType;
    nodes: FlowNode[];
    selected: boolean;
    onClick: (e: React.MouseEvent, id: string) => void;
}

function getBezierPath(
    sx: number, sy: number, sp: string,
    tx: number, ty: number, tp: string
): string {
    const dx = Math.abs(tx - sx);
    const dy = Math.abs(ty - sy);
    const offset = Math.max(40, Math.min(dx, dy) * 0.5);

    let scx = sx, scy = sy, tcx = tx, tcy = ty;

    switch (sp) {
        case 'top': scy = sy - offset; break;
        case 'bottom': scy = sy + offset; break;
        case 'left': scx = sx - offset; break;
        case 'right': scx = sx + offset; break;
    }

    switch (tp) {
        case 'top': tcy = ty - offset; break;
        case 'bottom': tcy = ty + offset; break;
        case 'left': tcx = tx - offset; break;
        case 'right': tcx = tx + offset; break;
    }

    return `M ${sx} ${sy} C ${scx} ${scy}, ${tcx} ${tcy}, ${tx} ${ty}`;
}

function getArrowPoints(tx: number, ty: number, tp: string): string {
    const size = 8;
    switch (tp) {
        case 'top':
            return `${tx},${ty} ${tx - size / 2},${ty - size} ${tx + size / 2},${ty - size}`;
        case 'bottom':
            return `${tx},${ty} ${tx - size / 2},${ty + size} ${tx + size / 2},${ty + size}`;
        case 'left':
            return `${tx},${ty} ${tx - size},${ty - size / 2} ${tx - size},${ty + size / 2}`;
        case 'right':
            return `${tx},${ty} ${tx + size},${ty - size / 2} ${tx + size},${ty + size / 2}`;
        default:
            return `${tx},${ty} ${tx - size / 2},${ty - size} ${tx + size / 2},${ty - size}`;
    }
}

export function FlowEdgeComponent({ edge, nodes, selected, onClick }: FlowEdgeProps) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const sourcePoint = getPortPoint(sourceNode, edge.sourcePort);
    const targetPoint = getPortPoint(targetNode, edge.targetPort);

    const path = getBezierPath(
        sourcePoint.x, sourcePoint.y, edge.sourcePort,
        targetPoint.x, targetPoint.y, edge.targetPort
    );

    const arrowPoints = getArrowPoints(targetPoint.x, targetPoint.y, edge.targetPort);

    // Mid-point for label
    const midX = (sourcePoint.x + targetPoint.x) / 2;
    const midY = (sourcePoint.y + targetPoint.y) / 2;

    const strokeDasharray = edge.style === 'dashed' ? '8 4' : edge.style === 'dotted' ? '3 3' : undefined;

    return (
        <g className={`flowchart-edge ${selected ? 'selected' : ''}`} onClick={(e) => onClick(e, edge.id)}>
            {/* Hit area */}
            <path className="edge-hit-area" d={path} />

            {/* Path */}
            <path d={path} strokeDasharray={strokeDasharray} />

            {/* Arrow */}
            <polygon className="edge-arrow" points={arrowPoints} />

            {/* Label */}
            {edge.label && (
                <g>
                    <rect
                        className="edge-label-bg"
                        x={midX - edge.label.length * 3.5 - 6}
                        y={midY - 10}
                        width={edge.label.length * 7 + 12}
                        height={20}
                    />
                    <text className="edge-label-text" x={midX} y={midY}>
                        {edge.label}
                    </text>
                </g>
            )}

            {/* Cardinality labels for ER */}
            {edge.sourceCardinality && (
                <text className="edge-label-text" x={sourcePoint.x + 12} y={sourcePoint.y - 12}>
                    {edge.sourceCardinality}
                </text>
            )}
            {edge.targetCardinality && (
                <text className="edge-label-text" x={targetPoint.x + 12} y={targetPoint.y - 12}>
                    {edge.targetCardinality}
                </text>
            )}
        </g>
    );
}

// ─── Connection Preview (while dragging) ──────────────────────────────────────

interface ConnectionPreviewProps {
    from: { x: number; y: number };
    to: { x: number; y: number };
    fromPort: string;
}

export function ConnectionPreview({ from, to, fromPort }: ConnectionPreviewProps) {
    const path = getBezierPath(
        from.x, from.y, fromPort,
        to.x, to.y, 'top'
    );

    return <path className="connection-preview" d={path} />;
}
