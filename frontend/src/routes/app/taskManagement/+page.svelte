<script>
    import InputSelect from "$lib/components/InputSelect.svelte";

    let data = $state([
        {
            id: 1,
            email: "ksdjsakdkjkhkjhkjkjkj@gmail.com",
        },
    ]);

    let selectedOption = $state({})

    function getSelectedOption(){
        // console.log(selectedOption,'====>in main page')
    }
</script>

<!-- <div class="divCenter">View All Tasks</div> -->
<InputSelect {data} bind:selectedOption />

<button onclick={getSelectedOption} class="divCenter">
get selected option
</button>