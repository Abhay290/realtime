<script>
    import { onMount } from "svelte";
    import { hierarchy, tree } from "d3-hierarchy";

    const data = {
        name: "col1",
        children: [
            {
                name: "firstUser",
                children: [
                    {
                        name: "firstFirstUser",
                        children: [
                            {
                                name: "some user",
                            },
                        ],
                    },
                    {
                        name: "secondUser",
                        children: [
                            {
                                name: "secondFirstUser",
                                children: [
                                    {
                                        name: "secondSecondUser",
                                        children: [
                                            {
                                                name: "secondSecondFirstUser",
                                                children: [
                                                    {
                                                        name: "some another user or repeated user from nested first user",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        name: "secondThirdUser",
                                        children: [
                                            {
                                                name: "hello user",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    let nodes = $state([]);
    let links = $state([]);

    onMount(() => {
        const root = hierarchy(data);

        const treeLayout = tree().size([900, 500]);

        treeLayout(root);

        nodes = root.descendants();
        links = root.links();


    });
</script>
<a href="/app/hierarchy/createHierarchy">Hierarchy create</a>
<div class="h-[92vh] overflow-auto">
    {#if nodes && links}
        <svg width="1200" height="700">
            <!-- LINKS -->
            {#each links as link}
                <line
                    x1={link.source.x + 100}
                    y1={link.source.y + 50}
                    x2={link.target.x + 100}
                    y2={link.target.y + 50}
                    stroke="#999"
                    stroke-width="2"
                />
            {/each}

            <!-- NODES -->
            {#each nodes as node}

    {@const textWidth = Math.max(node.data.name.length * 8, 80)}
    {@const rectWidth = textWidth + 20}

    <g transform={`translate(${node.x + 40}, ${node.y + 20})`}>

        <rect
            width={rectWidth}
            height="40"
            rx="10"
            fill="#4f46e5"
        />

        <text
            x={rectWidth / 2}
            y="25"
            text-anchor="middle"
            fill="white"
            font-size="12"
        >
            {node.data.name}
        </text>

    </g>

{/each}
        </svg>
    {/if}
</div>

<style>
    svg {
        background: #f8fafc;
        border-radius: 10px;
        width: 100%;
        overflow: auto;
    }

    text {
        pointer-events: none;
    }
</style>
