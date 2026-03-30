<template>
    <main class="min-h-dvh flex justify-center items-center bg-linear-to-br from-blue-400 to-white">
        <form @submit.prevent="login" class="flex flex-col gap-3 w-full max-w-64 bg-blue-100 border border-blue-400 shadow-lg rounded-xl p-3">
            <h1 class="text-center text-2xl font-semibold">Organizer Search</h1>
            <input v-model="username" class="w-full bg-blue-200 px-2 py-1 border border-blue-400 rounded-lg" autofocus type="text" autocomplete="username" name="username" placeholder="Username" />
            <input v-model="password" class="w-full bg-blue-200 px-2 py-1 border border-blue-400 rounded-lg" type="password" autocomplete="current-password" name="password" placeholder="Password" />
            <p v-if="error" v-text="error" class="text-center text-red-500 leading-5"></p>
            <button type="submit" class="w-full bg-blue-500 text-white px-2 py-1 rounded-lg shadow-sm cursor-pointer active:bg-blue-600">Log In</button>
        </form>
    </main>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            username: '',
            password: '',
            error: ''
        };
    },
    methods: {
        async login() {
            try {
                await axios.post('/login', {
                    username: this.username,
                    password: this.password,
                });
                this.$router.push('/');
            }
            catch (e) {
                this.error = e.response?.data?.error;
            }
        }
    },
};
</script>