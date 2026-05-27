<script>
    import { goto } from "$app/navigation";
import { apiHandler } from "$lib/middleware/apiHandler";
let email = $state('')
let password = $state('')

async function login(e) {
 e.preventDefault();
 let data = {
    email,password
 }
     let res = await apiHandler('post','/users/login',data) 
    if(!res.error){
        localStorage.setItem('userData',JSON.stringify(res.data))
        goto('/app/dashboard')
    }else{
        alert(res.message)
    }
}
</script>

<div class="divCenter form-box">
    <form action="" onsubmit={login} class="grid gap-5">
        <div>
            <label for="email"> Email </label>
            <input
            bind:value={email}
            autocomplete="email"
                type="text"
                name="email"
                id="email"
                placeholder="Enter Email"
            />
        </div>
        <div>
            <label for="pwd"> Password </label>
            <input
            bind:value={password}
                type="password"
                name="pwd"
                id="pwd"
                placeholder="Enter Password"
            />
        </div>
        <input type="submit" />
    </form>
    <p class="text-right text-xs !mt-3">Not a member? <a href="/signup">Signup</a></p>
</div>
