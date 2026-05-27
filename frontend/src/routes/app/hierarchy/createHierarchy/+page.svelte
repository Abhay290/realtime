<script>
    import { apiHandler } from "$lib/middleware/apiHandler";
    import Spinner from "$lib/components/Spinner.svelte";
    let users = $state([]);
    let spinner = $state(true)
    import { onMount } from "svelte";
    import InputSelect from "$lib/components/InputSelect.svelte";
    let selectedOption = $state({})
    onMount(async () => {
        try {
           let userData = JSON.parse(localStorage.getItem("userData"));
            let res = await apiHandler(
                "get",
                `/users/getAllUsers?orgId=${userData.organisationId}`,
            );
            users = res.data
            // console.log(users)
        } catch (error) {
            console.log(`Error in onmount : ${error}`);
        }finally{
            spinner = false
        }
    });

    let nodeId = $state(1);

    let nodes = $state([{ id: 1, name: "Root", x: 300, y: 200 }]);

    // edges: { id, fromId, toId }
    let edges = $state([]);
    let edgeId = $state(0);

    let selectedNodeId = $state(null);

    // Drag a node
    let dragState = $state(null);
    // { nodeId, startMouseX, startMouseY, startNodeX, startNodeY }

    // Pan canvas
    let panState = $state(null);
    // { startMouseX, startMouseY, startPanX, startPanY }
    let panX = $state(0);
    let panY = $state(0);

    // Drawing a new edge
    let connectingFrom = $state(null);
    // { nodeId, x, y }
    let mousePos = $state({ x: 0, y: 0 });

    // SVG ref
    let svgEl = $state(null);

    // Node dimensions
    const NW = 180;
    const NH = 56;
    const R = 12;

    // ─── HELPERS ─────────────────────────────────────────────────────────────
    function svgPoint(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pt = svgEl.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svgEl.getScreenCTM().inverse());
    }

    function getNode(id) {
        return nodes.find((n) => n.id === id);
    }

    // Port positions (center-bottom and center-top of node)
    function outPort(node) {
        return { x: node.x + NW / 2, y: node.y + NH };
    }
    function inPort(node) {
        return { x: node.x + NW / 2, y: node.y };
    }

    // Curved path between two points
    function curvePath(x1, y1, x2, y2) {
        const dy = Math.abs(y2 - y1);
        const curve = Math.max(60, dy * 0.5);
        return `M ${x1} ${y1} C ${x1} ${y1 + curve}, ${x2} ${y2 - curve}, ${x2} ${y2}`;
    }

    // ─── NODES ───────────────────────────────────────────────────────────────
    function addNode() {
        nodeId++;
        nodes = [
            ...nodes,
            {
                id: nodeId,
                name: `Node ${nodeId}`,
                x: 100 + Math.random() * 400,
                y: 100 + Math.random() * 300,
            },
        ];
        selectedNodeId = nodeId;
    }

    function deleteNode(id) {
        nodes = nodes.filter((n) => n.id !== id);
        edges = edges.filter((e) => e.fromId !== id && e.toId !== id);
        if (selectedNodeId === id) selectedNodeId = null;
    }

    function updateName(id, value) {
        nodes = nodes.map((n) => (n.id === id ? { ...n, name: value } : n));
    }

    // ─── EDGES ────────────────────────────────────────────────────────────────
    function deleteEdge(id) {
        edges = edges.filter((e) => e.id !== id);
    }

    // ─── DRAG NODE ───────────────────────────────────────────────────────────
    function onNodeMouseDown(e, node) {
        e.stopPropagation();
        selectedNodeId = node.id;
        connectingFrom = null;

        if (e.button !== 0) return;
        const pt = svgPoint(e);
        dragState = {
            nodeId: node.id,
            startMouseX: pt.x,
            startMouseY: pt.y,
            startNodeX: node.x,
            startNodeY: node.y,
        };
    }

    // ─── OUTPUT PORT (bottom circle) ─────────────────────────────────────────
    function onOutPortMouseDown(e, node) {
        e.stopPropagation();
        const p = outPort(node);
        connectingFrom = { nodeId: node.id, x: p.x, y: p.y };
        const pt = svgPoint(e);
        mousePos = { x: pt.x, y: pt.y };
    }

    // ─── INPUT PORT (top circle) ──────────────────────────────────────────────
    function onInPortMouseUp(e, node) {
        e.stopPropagation();
        if (!connectingFrom) return;
        if (connectingFrom.nodeId === node.id) {
            connectingFrom = null;
            return;
        }

        // Prevent duplicate
        const exists = edges.find(
            (ed) => ed.fromId === connectingFrom.nodeId && ed.toId === node.id,
        );
        if (!exists) {
            edgeId++;
            edges = [
                ...edges,
                { id: edgeId, fromId: connectingFrom.nodeId, toId: node.id },
            ];
        }
        connectingFrom = null;
    }

    // ─── CANVAS MOUSE EVENTS ─────────────────────────────────────────────────
    function onCanvasMouseDown(e) {
        if (e.button !== 0) return;
        selectedNodeId = null;
        connectingFrom = null;
        panState = {
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPanX: panX,
            startPanY: panY,
        };
    }

    function onMouseMove(e) {
        if (dragState) {
            const pt = svgPoint(e);
            const dx = pt.x - dragState.startMouseX;
            const dy = pt.y - dragState.startMouseY;
            nodes = nodes.map((n) =>
                n.id === dragState.nodeId
                    ? {
                          ...n,
                          x: dragState.startNodeX + dx,
                          y: dragState.startNodeY + dy,
                      }
                    : n,
            );
        } else if (panState) {
            panX = panState.startPanX + (e.clientX - panState.startMouseX);
            panY = panState.startPanY + (e.clientY - panState.startMouseY);
        }

        if (connectingFrom) {
            const pt = svgPoint(e);
            mousePos = { x: pt.x, y: pt.y };
        }
    }

    function onMouseUp(e) {
        dragState = null;
        panState = null;
        if (connectingFrom) connectingFrom = null;
    }
</script>

{#if spinner}
<Spinner/>

{:else}
<div class="wrap">
    <!-- ── TOOLBAR ──────────────────────────────────────────────────────── -->
    <div class="toolbar">
        <span class="logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="3" cy="9" r="2.5" fill="#6366f1" />
                <circle cx="9" cy="3" r="2.5" fill="#6366f1" />
                <circle cx="15" cy="9" r="2.5" fill="#6366f1" />
                <circle cx="9" cy="15" r="2.5" fill="#6366f1" />
                <line
                    x1="3"
                    y1="9"
                    x2="9"
                    y2="3"
                    stroke="#a5b4fc"
                    stroke-width="1.5"
                />
                <line
                    x1="9"
                    y1="3"
                    x2="15"
                    y2="9"
                    stroke="#a5b4fc"
                    stroke-width="1.5"
                />
                <line
                    x1="3"
                    y1="9"
                    x2="9"
                    y2="15"
                    stroke="#a5b4fc"
                    stroke-width="1.5"
                />
            </svg>
            Hierarchy Editor
        </span>

        <div class="toolbar-right">
            <button class="btn primary" onclick={addNode}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                        d="M6.5 1v11M1 6.5h11"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
                Add node
            </button>

            {#if selectedNodeId !== null}
                {@const sel = getNode(selectedNodeId)}
                {#if sel && sel.id !== 1}
                    <button
                        class="btn danger"
                        onclick={() => deleteNode(selectedNodeId)}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                        >
                            <path
                                d="M2 3.5h9M4.5 3.5V2h4v1.5M5 6v4M8 6v4M2.5 3.5l.7 7.5h7.6l.7-7.5"
                                stroke="currentColor"
                                stroke-width="1.4"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        Delete node
                    </button>
                {/if}
            {/if}

            <button
                class="btn ghost"
                onclick={() => {
                    panX = 0;
                    panY = 0;
                }}
                title="Reset pan"
            >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                        d="M1.5 6.5A5 5 0 1 0 3 3"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                    />
                    <path
                        d="M1.5 1.5v2.5H4"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                Reset view
            </button>
        </div>
    </div>

    <!-- ── HINT ─────────────────────────────────────────────────────────── -->
    <div class="hint">
        Drag node to move &nbsp;·&nbsp;
        <span class="hint-pill out">●</span> Drag from bottom port to connect
        &nbsp;·&nbsp;
        <span class="hint-pill in">●</span> Drop onto top port &nbsp;·&nbsp; Drag
        canvas to pan &nbsp;·&nbsp; Click edge to delete
    </div>

    <!-- ── CANVAS ────────────────────────────────────────────────────────── -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <svg
        bind:this={svgEl}
        class="canvas"
        class:is-panning={!!panState}
        class:is-dragging={!!dragState}
        class:is-connecting={!!connectingFrom}
        role="img"
        aria-label="Flow editor canvas"
        onmousedown={onCanvasMouseDown}
        onmousemove={onMouseMove}
        onmouseup={onMouseUp}
        onmouseleave={onMouseUp}
    >
        <defs>
            <!-- Arrow marker for edges -->
            <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
            >
                <path
                    d="M2 2L8 5L2 8"
                    fill="none"
                    stroke="#818cf8"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </marker>
            <!-- Arrow for active connecting line -->
            <marker
                id="arrow-live"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
            >
                <path
                    d="M2 2L8 5L2 8"
                    fill="none"
                    stroke="#22d3ee"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </marker>
        </defs>

        <g transform="translate({panX},{panY})">
            <!-- ── GRID ───────────────────────────────────────────────── -->
            {#each { length: 80 } as _, i}
                <line
                    x1={-2000 + i * 40}
                    y1="-2000"
                    x2={-2000 + i * 40}
                    y2="4000"
                    stroke="#e2e8f0"
                    stroke-width="0.5"
                />
            {/each}
            {#each { length: 80 } as _, i}
                <line
                    x1="-2000"
                    y1={-2000 + i * 40}
                    x2="4000"
                    y2={-2000 + i * 40}
                    stroke="#e2e8f0"
                    stroke-width="0.5"
                />
            {/each}

            <!-- ── EDGES ─────────────────────────────────────────────── -->
            {#each edges as edge (edge.id)}
                {@const src = getNode(edge.fromId)}
                {@const tgt = getNode(edge.toId)}
                {#if src && tgt}
                    {@const p1 = outPort(src)}
                    {@const p2 = inPort(tgt)}
                    <!-- Wider invisible hit area -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <path
                        d={curvePath(p1.x, p1.y, p2.x, p2.y)}
                        fill="none"
                        stroke="transparent"
                        stroke-width="14"
                        class="edge-hit"
                        onclick={() => deleteEdge(edge.id)}
                        onkeydown={() => deleteEdge(edge.id)}
                        style="cursor: pointer;"
                    />
                    <path
                        d={curvePath(p1.x, p1.y, p2.x, p2.y)}
                        fill="none"
                        stroke="#818cf8"
                        stroke-width="2"
                        stroke-linecap="round"
                        marker-end="url(#arrow)"
                        class="edge-line"
                        pointer-events="none"
                    />
                {/if}
            {/each}

            <!-- ── LIVE CONNECTING LINE ──────────────────────────────── -->
            {#if connectingFrom}
                {@const src = getNode(connectingFrom.nodeId)}
                {@const p = outPort(src)}
                <path
                    d={curvePath(p.x, p.y, mousePos.x, mousePos.y)}
                    fill="none"
                    stroke="#22d3ee"
                    stroke-width="2"
                    stroke-dasharray="6 4"
                    stroke-linecap="round"
                    marker-end="url(#arrow-live)"
                    pointer-events="none"
                />
            {/if}

            <!-- ── NODES ─────────────────────────────────────────────── -->
            {#each nodes as node (node.id)}
                {@const isSelected = selectedNodeId === node.id}
                {@const isRoot = node.id === 1}
                {@const sel = selectedNodeId === node.id}

                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <g
                    class="node-g"
                    transform="translate({node.x},{node.y})"
                    onmousedown={(e) => onNodeMouseDown(e, node)}
                >
                    <!-- Shadow -->
                    <rect
                        x="3"
                        y="5"
                        width={NW}
                        height={NH}
                        rx={R}
                        fill="rgba(0,0,0,0.18)"
                    />

                    <!-- Body -->
                    <rect
                        width={NW}
                        height={NH}
                        rx={R}
                        fill={sel ? "#2563eb" : isRoot ? "#7c3aed" : "#4f46e5"}
                        stroke={sel ? "#93c5fd" : "rgba(255,255,255,0.18)"}
                        stroke-width={sel ? 2.5 : 1}
                    />

                    <!-- Label input -->
                    <foreignObject x="10" y="9" width={NW - 20} height="24">
                        <!-- <input
                            class="node-input"
                            value={node.name}
                            oninput={(e) => updateName(node.id, e.target.value)}
                            onmousedown={(e) => e.stopPropagation()}
                        /> -->

                        <InputSelect data={users} bind:selectedOption/>
                    </foreignObject>

                    <!-- ID badge -->
                    <text
                        x={NW / 2}
                        y={NH - 8}
                        text-anchor="middle"
                        fill="rgba(255,255,255,0.38)"
                        font-size="9"
                        font-family="monospace"
                        pointer-events="none">#{node.id}</text
                    >

                    <!-- ── INPUT PORT (top) ──────────────────────────── -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <circle
                        cx={NW / 2}
                        cy="0"
                        r="7"
                        fill="#1e293b"
                        stroke="#38bdf8"
                        stroke-width="2"
                        class="port in-port"
                        onmouseup={(e) => onInPortMouseUp(e, node)}
                        onmousedown={(e) => e.stopPropagation()}
                    />
                    <text
                        x={NW / 2}
                        y="4"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#38bdf8"
                        font-size="9"
                        font-weight="700"
                        pointer-events="none">▲</text
                    >

                    <!-- ── OUTPUT PORT (bottom) ──────────────────────── -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <circle
                        cx={NW / 2}
                        cy={NH}
                        r="7"
                        fill="#1e293b"
                        stroke="#a78bfa"
                        stroke-width="2"
                        class="port out-port"
                        onmousedown={(e) => onOutPortMouseDown(e, node)}
                    />
                    <text
                        x={NW / 2}
                        y={NH + 4}
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#a78bfa"
                        font-size="9"
                        font-weight="700"
                        pointer-events="none">▼</text
                    >
                </g>
            {/each}
        </g>
    </svg>

    <!-- ── STATUS BAR ────────────────────────────────────────────────────── -->
    <div class="statusbar">
        <span>{nodes.length} node{nodes.length !== 1 ? "s" : ""}</span>
        <span>{edges.length} connection{edges.length !== 1 ? "s" : ""}</span>
        {#if selectedNodeId !== null}
            {@const sel = getNode(selectedNodeId)}
            {#if sel}
                <span class="sel-info"
                    >Selected: <strong>{sel.name}</strong></span
                >
            {/if}
        {/if}
        {#if connectingFrom}
            <span class="connecting-info"
                >🔗 Connecting — drag to a top port (▲)</span
            >
        {/if}
    </div>
</div>
{/if}

<style>
    :global(html, body) {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }

    .wrap {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100dvh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        background: #f1f5f9;
    }

    /* ── TOOLBAR ─────────────────────────────────────────────────────── */
    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px 16px;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
        z-index: 20;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 7px;
        font-weight: 700;
        font-size: 15px;
        color: #1e293b;
        user-select: none;
    }

    .toolbar-right {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 13px;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition:
            background 0.12s,
            transform 0.08s;
    }
    .btn:active {
        transform: scale(0.97);
    }
    .btn.primary {
        background: #4f46e5;
        color: #fff;
    }
    .btn.primary:hover {
        background: #4338ca;
    }
    .btn.danger {
        background: #fee2e2;
        color: #dc2626;
    }
    .btn.danger:hover {
        background: #fecaca;
    }
    .btn.ghost {
        background: #f1f5f9;
        color: #64748b;
    }
    .btn.ghost:hover {
        background: #e2e8f0;
    }

    /* ── HINT ────────────────────────────────────────────────────────── */
    .hint {
        padding: 5px 16px;
        font-size: 11.5px;
        color: #94a3b8;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
    }
    .hint-pill {
        font-size: 10px;
    }
    .hint-pill.out {
        color: #a78bfa;
    }
    .hint-pill.in {
        color: #38bdf8;
    }

    /* ── CANVAS ──────────────────────────────────────────────────────── */
    .canvas {
        flex: 1;
        width: 100%;
        background: #f8fafc;
        cursor: default;
        display: block;
        touch-action: none;
    }
    .canvas.is-panning {
        cursor: grabbing;
    }
    .canvas.is-dragging {
        cursor: grabbing;
    }
    .canvas.is-connecting {
        cursor: crosshair;
    }

    /* ── EDGES ───────────────────────────────────────────────────────── */
    :global(.edge-line) {
        transition: stroke 0.1s;
    }
    :global(.edge-hit:hover + .edge-line) {
        stroke: #f87171 !important;
    }

    /* ── NODE ────────────────────────────────────────────────────────── */
    .node-g {
        cursor: grab;
        user-select: none;
    }
    .node-g:active {
        cursor: grabbing;
    }

    .node-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        text-align: center;
        cursor: text;
        padding: 0;
        line-height: 1;
    }
    .node-input::selection {
        background: rgba(255, 255, 255, 0.28);
    }

    /* ── PORTS ───────────────────────────────────────────────────────── */
    .port {
        cursor: crosshair;
        transition: r 0.1s;
    }
    .port:hover {
        r: 9;
    }
    .out-port {
        cursor: crosshair;
    }
    .in-port {
        cursor: cell;
    }

    /* ── STATUS BAR ──────────────────────────────────────────────────── */
    .statusbar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 5px 16px;
        background: #fff;
        border-top: 1px solid #e2e8f0;
        font-size: 12px;
        color: #94a3b8;
        user-select: none;
    }
    .sel-info {
        color: #4f46e5;
    }
    .sel-info strong {
        font-weight: 600;
    }
    .connecting-info {
        color: #0891b2;
        font-weight: 500;
    }

    /* ── RESPONSIVE ──────────────────────────────────────────────────── */
    @media (max-width: 600px) {
        .toolbar {
            padding: 8px 10px;
        }
        .btn {
            padding: 5px 9px;
            font-size: 12px;
        }
        .logo {
            font-size: 13px;
        }
        .statusbar {
            font-size: 11px;
            gap: 10px;
        }
        .hint {
            font-size: 10.5px;
        }
    }
    @media (max-width: 400px) {
        .toolbar-right {
            gap: 4px;
        }
        .btn {
            padding: 4px 7px;
            font-size: 11px;
        }
    }
</style>
