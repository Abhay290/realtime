<script>
    import { onMount } from "svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    let spinner = $state(true);
    let errorObject = $state({});
    let userData = $state({});
    let status = $state(200)
    onMount(() => {
        try {
            userData = JSON.parse(localStorage.getItem("userData"));

            status = 200
        } catch (error) {
            console.log(`Error in dashboard onmount : ${error}`);
            status = 501
            return (errorObject = {
                message: error.message,
                error: true,
                data: null,
            });
        } finally {
            spinner = false;
        }
    });
</script>
{#if spinner}
    <Spinner />
{:else if userData && status == 200}
    <h1 class="divCenter">Dashboard</h1>
    
{:else if status === 501}
    <h1 class="font-bold text-lg">{errorObject.message}</h1>
{/if}
