<script>
import { onMount } from "svelte";
let userData = $state({})
onMount(()=>{
    try{
        userData = JSON.parse(localStorage.getItem("userData"))
    }catch(error){
        console.log(`Error getting userData in app sidebar : ${error}`)
    }
})

</script>

<div>
{#if userData}
<div class="text-center !mt-5 !mb-3">
    <!-- AVATAR (profile pic) section-->
     <div class="flex items-center justify-center">
     <img class="w-20 h-20 border-1 border-gray-300 rounded-full" src="/male-mannequin-face.jpg" alt="Rounded avatar">
    </div>
     <h3 class="text-sm">{userData.firstName + " " + userData.lastName}</h3>
    <h4 class="text-xs">{userData.orgName}</h4>

</div>
<!-- <hr class="text-gray-300 !mt-3 !mb-3"/> -->
{/if}

    <ul class="grid !ml-2">
        <li><a href={"/app/taskManagement"}>Tasks</a></li>
        <li><a href={"/app/hierarchy"}>Hierarchy</a></li>
        <li><a href={""}>Link 3</a></li>
        <li><a href={""}>Link 4</a></li>
        <li><a href={""}>Link 5</a></li>
    </ul>
</div>
