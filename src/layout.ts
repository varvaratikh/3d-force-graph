import createGraph from 'ngraph.graph';
import ngraph from 'ngraph.forcelayout';

export function generateLayout(data: { nodes: any[]; links: any[] }) {
    const g = createGraph();
    data.nodes.forEach((node) => g.addNode(node.id));
    data.links.forEach((link) => g.addLink(link.source, link.target));

    const layout = ngraph(g, {
        springLength: 80,
        springCoefficient: 0.0002,
        gravity: -10,
        dragCoefficient: 0.1,
        theta: 0.8
    });

    for (let i = 0; i < 100; i++) layout.step();

    const nodePositions: Record<string, { x: number; y: number; z: number }> = {};
    g.forEachNode((node) => {
        const pos = layout.getNodePosition(node.id);
        nodePositions[node.id] = pos;
    });

    return {
        nodes: data.nodes.map((n) => ({
            ...n,
            ...nodePositions[n.id]
        })),
        links: data.links
    };
}