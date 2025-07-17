import { JSX, useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import data from './clusters_graph.json';
import createGraph from 'ngraph.graph';
import ngraph from 'ngraph.forcelayout';

const App: () => JSX.Element = () => {
    const fgRef = useRef<any>();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState<any>(null);

    useEffect(() => {
        setGraphData({ nodes: data.nodes, links: data.links });
    }, []);

    useEffect(() => {
        const controls = fgRef.current?.controls();
        if (controls) {
            controls.minDistance = 1;
            controls.maxDistance = 999999;
        }
    }, [graphData]);

    const customLayout = () => {
        const g = createGraph();

        data.nodes.forEach((node: any) => {
            g.addNode(node.id);
        });

        data.links.forEach((link: any) => {
            g.addLink(link.source, link.target);
        });

        return ngraph(g, {
            springLength: 80,
            springCoefficient: 0.0002,
            gravity: -10,
            dragCoefficient: 0.1,
            theta: 0.8
        });
    };


    const handleBackgroundClick = (event: any) => {
        if (event.target.id === 'popup-overlay') {
            setSelectedNode(null);
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                forceEngine="ngraph"
                ngraphPhysicsEngine={customLayout}
                enableNodeDrag={false}
                linkOpacity={0.3}
                cooldownTicks={100}
                onEngineStop={() => {
                    setTimeout(() => {
                        fgRef.current.zoomToFit(100);
                    }, 100);
                }}

                nodeAutoColorBy="cluster"
                onNodeClick={(node) => setSelectedNode(node)}
                nodeThreeObjectExtend={true}
                nodeThreeObject={(node) => {
                    const cameraDistance = fgRef.current?.camera().position.length();
                    const geometry = cameraDistance > 1000
                        ? new THREE.SphereGeometry(0.8, 2, 2)
                        : new THREE.SphereGeometry(1.5, 8, 8);
                    const material = new THREE.MeshBasicMaterial({ color: 'lightblue' });
                    return new THREE.Mesh(geometry, material);
                }}

                linkDirectionalParticles={0}
                linkDirectionalArrowLength={0}
                backgroundColor="#000011"
                rendererConfig={{
                    antialias: false,
                    powerPreference: 'low-power',
                    alpha: false,
                    logarithmicDepthBuffer: true,
                    pixelRatio: window.devicePixelRatio < 1.5 ? 1 : 1.5
                }}
            />

            {selectedNode && (
                <div
                    id="popup-overlay"
                    onClick={handleBackgroundClick}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        padding: 20
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '400px',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            color: 'white',
                            padding: '15px',
                            borderRadius: '10px'
                        }}
                    >
                        <h3>Node: {selectedNode.id}</h3>
                        <h3>Сluster: {selectedNode.cluster}</h3>
                        <p style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                            {selectedNode.description}
                        </p>
                        <button onClick={() => setSelectedNode(null)} style={{ marginTop: '10px' }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
