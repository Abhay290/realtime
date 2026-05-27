import { PUBLIC_BACKEND_URL } from "$env/static/public";

export async function apiHandler(method = "GET", url, data = null) {
    method = method.toUpperCase();

    try {
        let options = {
            method,
            headers: {}
        };

        const isAuthRoute = url === '/login' || url === '/signup';

        if (!isAuthRoute) {
            const userData = JSON.parse(localStorage.getItem('userData'));

            if (userData?.token) {
                options.headers['authorization'] = userData.token;
            }
        }

        if (method === 'POST' || method === 'PUT') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }

        const res = await fetch(`${PUBLIC_BACKEND_URL}${url}`, options);

        const result = await res.json();

        return result;

    } catch (error) {
        console.log(`Error in api handler : ${error}`);

        return {
            message: error.message,
            error: true,
            data: null
        };
    }
}