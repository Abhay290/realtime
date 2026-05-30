<script>
    let { data, selectedOption = $bindable() } = $props();

    function selectedTarget(item) {
        // console.log(item,'item in input selct');
        selectedOption = item;
        let options = document.getElementById("options");
        options.classList.add("hidden");
    }

    function displayOptions() {
        let options = document.getElementById("options");
        if (options.classList.contains("hidden")) {
            options.classList.remove("hidden");
        } else {
            options.classList.add("hidden");
        }
    }
</script>

<div class="select-container relative">
    <button class="selected-target" onclick={displayOptions}>
        {#if selectedOption.name}
            {selectedOption.name}
        {:else}
            Click me
        {/if}
    </button>
    <div class="hidden fixed" id="options">
        {#each data as item, index}
            <!--  -->
            <button
                type="button"
                class="select-item"
                onclick={() => selectedTarget(item)}>{item.name}</button
            >
        {/each}
    </div>
</div>

<style>
    #options {
        max-width: 200px;
        padding: 5px;
        word-break: break-all;
    }
</style>
