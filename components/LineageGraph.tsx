'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Loader2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  image: string;
  type: 'root' | 'parent' | 'child';
}

interface GraphEdge {
  source: string;
  target: string;
}

interface LineageGraphProps {
  ipId: string;
  onNodeClick?: (nodeId: string) => void;
}

// Custom node component
function IPNode({ data }: { data: { label: string; image: string; type: string } }) {
  const borderColor = {
    root: 'border-indigo-500',
    parent: 'border-purple-500',
    child: 'border-green-500',
  }[data.type] || 'border-zinc-500';

  const bgColor = {
    root: 'bg-indigo-500/20',
    parent: 'bg-purple-500/20',
    child: 'bg-green-500/20',
  }[data.type] || 'bg-zinc-500/20';

  return (
    <div className={`p-2 rounded-xl border-2 ${borderColor} ${bgColor} backdrop-blur-sm min-w-[120px]`}>
      <img
        src={data.image}
        alt={data.label}
        className="w-20 h-20 rounded-lg object-cover mx-auto mb-2"
      />
      <p className="text-xs text-white text-center font-medium truncate px-1">
        {data.label}
      </p>
      <p className="text-[10px] text-zinc-400 text-center capitalize">
        {data.type === 'root' ? 'Current' : data.type}
      </p>
    </div>
  );
}

const nodeTypes = {
  ipNode: IPNode,
};

export default function LineageGraph({ ipId, onNodeClick }: LineageGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLineage();
  }, [ipId]);

  const fetchLineage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lineage/${ipId}?extended=true&maxDepth=3`);
      const data = await res.json();
      
      if (data.graphData) {
        const { nodes: graphNodes, edges: graphEdges } = data.graphData;
        
        // Convert to ReactFlow format with layout
        const flowNodes: Node[] = layoutNodes(graphNodes, ipId);
        const flowEdges: Edge[] = graphEdges.map((edge: GraphEdge, index: number) => ({
          id: `e${index}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
          },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Failed to fetch lineage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple layout algorithm
  const layoutNodes = (graphNodes: GraphNode[], rootId: string): Node[] => {
    const root = graphNodes.find(n => n.id === rootId);
    const parents = graphNodes.filter(n => n.type === 'parent');
    const children = graphNodes.filter(n => n.type === 'child');

    const flowNodes: Node[] = [];
    const nodeWidth = 140;
    const nodeHeight = 140;
    const horizontalSpacing = 180;
    const verticalSpacing = 200;

    // Position parents at top
    parents.forEach((node, index) => {
      const x = (index - (parents.length - 1) / 2) * horizontalSpacing;
      flowNodes.push({
        id: node.id,
        type: 'ipNode',
        position: { x, y: 0 },
        data: { label: node.label, image: node.image, type: node.type },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });

    // Position root in middle
    if (root) {
      flowNodes.push({
        id: root.id,
        type: 'ipNode',
        position: { x: 0, y: verticalSpacing },
        data: { label: root.label, image: root.image, type: 'root' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    }

    // Position children at bottom
    children.forEach((node, index) => {
      const x = (index - (children.length - 1) / 2) * horizontalSpacing;
      flowNodes.push({
        id: node.id,
        type: 'ipNode',
        position: { x, y: verticalSpacing * 2 },
        data: { label: node.label, image: node.image, type: node.type },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });

    return flowNodes;
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No lineage data available
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Controls className="bg-zinc-800 border-zinc-700" />
        <Background color="#27272a" gap={20} />
      </ReactFlow>
    </div>
  );
}
