<script>
    import AppSidebar from "$lib/components/AppSidebar.svelte";
    import AppTopbar from "$lib/components/AppTopbar.svelte";
    import { onMount } from "svelte";
    import { apiHandler } from "$lib/middleware/apiHandler";
    import { goto } from "$app/navigation";
    let userData = $state({});
    let { children } = $props();
    onMount(() => {
        let x = setInterval(async () => {
            try {
                userData = JSON.parse(localStorage.getItem("userData"));
                let res = await apiHandler("post", "/users/verifyToken", {
                    token: userData.token,
                });
                // console.log(res)
                if (res.error) {
                    alert(res.message);
                    goto("/login");
                    return () => {
                        clearInterval(x);
                    };
                }
            } catch (error) {
                console.log(`Error in dashboard layout onMount : ${error}`);
                localStorage.removeItem('userData')
                goto("/login");
            }
        }, 600000);
    });
</script>

<div class="flex">
    <div class="appSidebar">
        <AppSidebar />
    </div>
    <div class="w-full">
        <AppTopbar />
        {@render children()}
    </div>
</div>

<style>
    .appSidebar {
        min-width: 150px;
        border-right: 1px solid lightgray;
        height: 100vh;
    }
</style>
