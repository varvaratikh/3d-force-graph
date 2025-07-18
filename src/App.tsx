import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import data from './clusters_graph.json';
import { generateLayout } from './layout';

const App: () => JSX.Element = () => {
    const fgRef = useRef<any>();
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const graphData = useMemo(() => generateLayout(data), []);

    useEffect(() => {
        const controls = fgRef.current?.controls();
        if (controls) {
            controls.minDistance = 1;
            controls.maxDistance = 999999;
        }
    }, []);

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
                enableNodeDrag={false}
                linkOpacity={0.3}
                cooldownTicks={80}
                onEngineStop={() => {
                    setTimeout(() => {
                        fgRef.current.zoomToFit(100);
                    }, 100);
                }}
                nodeAutoColorBy="cluster"
                nodeRelSize={2.5}
                onNodeClick={(node) => setSelectedNode(node)}
                linkDirectionalParticles={0}
                linkDirectionalArrowLength={0}
                backgroundColor="#000011"
                rendererConfig={{
                    antialias: false,
                    powerPreference: 'high-performance',
                    alpha: false,
                    logarithmicDepthBuffer: true,
                    precision: 'mediump',
                    pixelRatio: 1
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
                        <h3>Cluster: {selectedNode.cluster}</h3>
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
