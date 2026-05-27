<script>
    import { goto } from "$app/navigation";
    import { apiHandler } from "$lib/middleware/apiHandler";
    let email = $state("");
    let password = $state("");
    let firstName = $state("");
    let lastName = $state("");
    let gender = $state("male");
    let dob = $state("");
    let orgName = $state("");

    async function signup(e) {
        e.preventDefault();
        let data = {
            email,
            password,
            firstName,
            lastName,
            gender,
            dob,
            orgName,
        };
        let res = await apiHandler("post", "/users/signup", data);
        // console.log(res,'===>res')
        if (!res.error) {
            alert(res.message);
            goto("/login");
        } else {
            alert(res.message);
        }
    }
</script>

<div class="divCenter form-box">
    <form action="" onsubmit={signup} class="grid gap-5">
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
        <div>
            <label for="firstName"> First Name </label>
            <input
                bind:value={firstName}
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter first name"
            />
        </div>
        <div>
            <label for="lastName"> Last Name </label>
            <input
                bind:value={lastName}
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter last name"
            />
        </div>
        <div>
            <label for="gender"> Gender </label>
            <select
                bind:value={gender}
                name="gender"
                id="gender"
                placeholder="Enter age"
            >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
            </select>
        </div>
        <div>
            <label for="DOB"> DOB </label>
            <input
                bind:value={dob}
                type="date"
                name="DOB"
                id="DOB"
                placeholder="Enter DOB"
            />
        </div>
        <div>
            <label for="orgName"> Organisation Name </label>
            <input
                bind:value={orgName}
                type="text"
                name="orgName"
                id="orgName"
                placeholder="Enter organisation name"
            />
            <p class="text-right"><span class="text-xs text-gray-400 ">Case-Sensitive</span></p>
        </div>
        <input type="submit" />
    </form>
    <p class="text-right text-xs !mt-3">
        Already have an account? <a href="/login">Login</a>
    </p>
</div>
