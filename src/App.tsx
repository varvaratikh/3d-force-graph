import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import rawData from './clusters_graph.json';

type Node = {
    id: string;
    cluster?: number;
    description?: string;
    isClusterParent?: boolean;
    expanded?: boolean;
};

type Link = { source: string; target: string };

export default function App() {
    const fgRef = useRef<any>(null);
    const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
    const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set());

    const fullData = useRef<{ clusterMap: Map<number, Node[]>, clusterParents: Node[] }>({
        clusterMap: new Map(),
        clusterParents: []
    });

    useEffect(() => {
        const clusterMap = new Map<number, Node[]>();
        rawData.nodes.forEach((node: Node) => {
            if (!clusterMap.has(node.cluster!)) clusterMap.set(node.cluster!, []);
            clusterMap.get(node.cluster!)!.push(node);
        });

        const clusterParents: Node[] = Array.from(clusterMap.entries()).map(([clusterId]) => ({
            id: `cluster-${clusterId}`,
            isClusterParent: true,
            cluster: clusterId,
            expanded: false
        }));

        fullData.current = { clusterMap, clusterParents };
        setGraphData({ nodes: clusterParents, links: [] });
    }, []);

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge')?.strength(-40);
        }
    }, [graphData]);

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge')?.strength(-40);
            fgRef.current.d3Force('link')?.distance(40);
        }
    }, [graphData]);



    const toggleCluster = (clusterId: number) => {
        const { clusterMap, clusterParents } = fullData.current;
        const isExpanded = expandedClusters.has(clusterId);
        const newSet = new Set(expandedClusters);

        if (isExpanded) {
            newSet.delete(clusterId);
        } else {
            newSet.add(clusterId);
        }

        const newNodes: Node[] = [...clusterParents];
        const newLinks: Link[] = [];

        newSet.forEach(clusterId => {
            const nodes = clusterMap.get(clusterId)!;
            newNodes.push(...nodes);
            nodes.forEach(n => {
                newLinks.push({ source: `cluster-${clusterId}`, target: n.id });
            });
        });

        setExpandedClusters(newSet);
        setGraphData({ nodes: newNodes, links: newLinks });
    };


    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                nodeAutoColorBy="cluster"
                nodeLabel={(node: Node) =>
                    node.isClusterParent
                        ? `Кластер ${node.cluster}`
                        : `ID: ${node.id}\n${node.description}`
                }

                nodeThreeObject={(node: any) => {
                    const isCluster = node.isClusterParent;
                    const clusterId = node.cluster ?? 0;

                    const color = `hsl(${(clusterId * 137.508) % 360}, 70%, 50%)`;

                    const sphere = new THREE.Mesh(
                        new THREE.SphereGeometry(isCluster ? 11 : 5),
                        new THREE.MeshBasicMaterial({ color })
                    );
                    return sphere;
                }}

                onNodeClick={(node: Node) => {
                    if (node.isClusterParent && node.cluster !== undefined) {
                        toggleCluster(node.cluster);
                    }
                }}
                backgroundColor="#000011"
                d3VelocityDecay={0.3}
                d3AlphaDecay={0.03}
                cooldownTicks={100}
                linkOpacity={0.2}
                nodeRelSize={2.5}
            />
        </div>
    );
}
