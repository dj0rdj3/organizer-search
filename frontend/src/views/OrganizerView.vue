<template>
    <header class="bg-blue-500 text-white">
        <div class="flex flex-wrap justify-between max-w-5xl mx-auto">
            <h1 class="text-3xl font-semibold pl-2 py-1 lg:pl-0">Organizer Search</h1>

            <div class="flex">
                <button @click="logout" class="hover:bg-blue-600 active:bg-blue-700 px-5 cursor-pointer">Logout</button>
                <button @click="toggleLayoutEdit" class="hover:bg-blue-600 active:bg-blue-700 px-5 cursor-pointer" :class="{ 'bg-blue-600': editingLayout }">Edit&nbsp;Layout</button>

                <select v-model="search" class="bg-blue-200 text-neutral-800 px-5 min-w-72 text-lg cursor-pointer">
                    <option value="">Select Item</option>
                    <option v-for="item in onlyItems" :value="item" v-text="item"></option>
                </select>
            </div>
        </div>
    </header>

    <main class="p-12 pt-8 flex justify-center">
        <div class="flex flex-col max-w-5xl w-full relative">
            <div class="flex">
                <div v-for="unit, index in organizers" @click="changeUnit(index)" class="z-10 flex select-none cursor-pointer text-white text-xl py-0.5 px-4 rounded-t-xl border-r border-blue-700" :class="[currentOrganizer === index ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-500']">
                    <p>{{ unit.name }}</p>

                    <transition @after-enter="addMargin" enter-active-class="transition-[width] transition-[margin-left] transform duration-300" enter-from-class="w-0 opacity-0 ml-0" enter-to-class="w-3 opacity-100 ml-2" leave-active-class="transition-[width] transition-[margin-left] transform duration-300" leave-from-class="w-3 opacity-100 ml-2" leave-to-class="w-0 opacity-0 ml-0">
                        <button v-show="editingLayout" @click.stop="removeUnit(index)" class="ml-2 text-2xl leading-3 cursor-pointer pb-1">&times;</button>
                    </transition>
                </div>

                <transition enter-active-class="transition transform duration-300" enter-from-class="-translate-x-8 opacity-0" enter-to-class="translate-x-0 opacity-100" leave-active-class="transition transform duration-300" leave-from-class="translate-x-0 opacity-100" leave-to-class="-translate-x-8 opacity-0">
                    <button @click="toggleAddUnit" v-show="editingLayout" class="bg-blue-600 hover:bg-blue-500 select-none text-white text-xl py-0.5 px-3 rounded-t-xl cursor-pointer">+</button>
                </transition>
            </div>

            <div v-for="row, y in organizers[currentOrganizer].data" class="flex min-h-26 h-full relative">
                <button @click="openContents(y, x)" v-for="column, x in row" class="z-10  w-full flex items-start cursor-pointer border-t-4 border-l-4 border-blue-500" :class="[x === row.length - 1 ? 'border-r-4' : '', y === organizers[currentOrganizer].data.length - 1 ? 'border-b-4' : '', filteredItems[y][x] ? 'bg-orange-300 hover:bg-orange-200' : 'bg-blue-100 hover:bg-blue-200']">
                    <div class="w-full select-none border-t-30 border-t-blue-500/80 border-x-20 border-x-transparent relative">
                        <p class="absolute -top-7 w-full text-white">{{ String.fromCharCode(65 + x) }}{{ y + 1 }}</p>
                    </div>
                </button>

                <transition enter-active-class="transition transform duration-300" enter-from-class="-translate-x-8 opacity-0" enter-to-class="translate-x-0 opacity-100" leave-active-class="transition transform duration-300" leave-from-class="translate-x-0 opacity-100" leave-to-class="-translate-x-8 opacity-0">
                    <div v-show="editingLayout" class="absolute -right-8 flex flex-col pt-4">
                        <button @click="addColumn(y)" class="px-2 text-2xl cursor-pointer select-none rounded-tr-lg bg-neutral-200/75 border border-b-0 border-neutral-300 pb-1">+</button>
                        <button @click="removeColumn(y)" class="px-2 text-2xl cursor-pointer select-none rounded-br-lg bg-neutral-200/75 border border-neutral-300 pb-1">-</button>
                    </div>
                </transition>
            </div>

            <transition enter-active-class="transition transform duration-300" enter-from-class="-translate-y-9 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition transform duration-300" leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-9 opacity-0">
                <div v-show="editingLayout" class="absolute -bottom-9 flex w-full justify-center pl-1.5">
                    <button @click="removeRow" class="px-10 text-2xl cursor-pointer select-none rounded-bl-lg bg-neutral-200/75 border border-r-0 border-neutral-300 pb-1">-</button>
                    <button @click="addRow" class="px-10 text-2xl cursor-pointer select-none rounded-br-lg bg-neutral-200/75 border border-neutral-300 pb-1">+</button>
                </div>
            </transition>
        </div>
    </main>

    <transition enter-active-class="transition transform duration-100" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition transform duration-50" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <p v-show="error" v-text="error" class="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-blue-100 px-4 py-2 rounded-full shadow-md"></p>
    </transition>

    <transition enter-active-class="transition transform duration-75" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition transform duration-75" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <section @click="closeContents" v-show="contents.show" class="z-50 absolute top-0 left-0 w-screen h-screen bg-black/25 backdrop-blur flex justify-center items-center p-3">
            <div @click.stop class="bg-neutral-50 p-3 rounded-xl max-w-96 w-full shadow-xl">
                <div class="flex justify-between -mt-1">
                    <h2 class="text-2xl leading-7">Items in {{ String.fromCharCode(65 + contents.column) }}{{ contents.row + 1 }}</h2>
                    <button @click="closeContents" class="text-4xl leading-3 cursor-pointer pb-1">&times;</button>
                </div>

                <ul class="mt-2 space-y-2">
                    <li v-for="item, index in organizers[currentOrganizer].data[contents.row][contents.column]" class="flex justify-between shadow bg-white border border-neutral-200 rounded-lg" :class="{ 'gap-3 px-2.5 py-1': index !== editingItemIndex }">
                        <span v-text="item" v-show="index !== editingItemIndex"></span>
                        <input v-show="index === editingItemIndex" v-model="organizers[currentOrganizer].data[contents.row][contents.column][index]" type="text" class="w-full rounded-lg rounded-r-none px-2 py-1 border-r border-neutral-200" placeholder="Edit Item" />
                        <button v-show="index === editingItemIndex" @click="saveItem(index)" class="font-bold px-2 py-1 cursor-pointer">&#10003;</button>
                        <div v-show="index !== editingItemIndex" class="flex items-center gap-3">
                            <button class="cursor-pointer" @click="editItem(index)">
                                <svg class="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="black" fill-rule="evenodd" clip-rule="evenodd" d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z" />
                                </svg>
                            </button>
                            <button @click="removeItem(index)" class="text-2xl leading-3 mb-1 cursor-pointer">&times;</button>
                        </div>
                    </li>
                </ul>

                <div class="mt-3 flex items-center">
                    <input v-model="newItem" type="text" class="w-full bg-white rounded-lg rounded-r-none px-2 py-1 shadow border border-neutral-200" placeholder="New Item" />
                    <button @click="addItem" class="text-2xl leading-5 cursor-pointer bg-white rounded-lg rounded-l-none px-2 pt-1 shadow pb-2 border border-l-0 border-neutral-200">+</button>
                </div>
            </div>
        </section>
    </transition>

    <transition enter-active-class="transition transform duration-75" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition transform duration-75" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <section @click="toggleAddUnit" v-show="addingUnit" class="z-50 absolute top-0 left-0 w-screen h-screen bg-black/25 backdrop-blur flex justify-center items-center p-3">
            <div @click.stop class="bg-neutral-50 p-3 rounded-xl max-w-96 w-full shadow-xl">
                <div class="flex justify-between -mt-1">
                    <h2 class="text-2xl leading-7">New Unit</h2>
                    <button @click="toggleAddUnit" class="text-4xl leading-3 cursor-pointer pb-1">&times;</button>
                </div>

                <input v-model="newUnit" type="text" class="w-full mt-2 bg-white rounded-lg px-2 py-1 shadow border border-neutral-200" placeholder="Name" />
                <div class="flex flex-row-reverse">
                    <button @click="addUnit" class="mt-2 bg-blue-500 active:bg-blue-600 cursor-pointer text-white rounded-lg px-2 py-1 shadow">Create</button>
                </div>
            </div>
        </section>
    </transition>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            initialized: false,
            organizers: [{
                name: 'Unit 1',
                data: [[[]]],
            }],
            currentOrganizer: 0,
            search: '',
            editingLayout: false,
            addingUnit: false,
            editingItemIndex: null,
            contents: {
                show: false,
                row: 0,
                column: 0,
            },
            newItem: '',
            newUnit: '',
            error: '',
            timer1: null,
            timer2: null,
        };
    },
    methods: {
        async logout() {
            try {
                await axios.post('/logout');
                this.$router.push('/login');
            }
            catch (e) {
                console.log(e);
            }
        },
        loadOrganizers() {
            axios.get('/organizers')
                .then(res => {
                    if (res.data.length < 1) {
                        return;
                    }

                    this.organizers = res.data;
                })
                .then(() => {
                    this.initialized = true;
                });
        },
        saveOrganizers() {
            axios.post('/organizers', { organizers: this.organizers });
        },
        changeUnit(index) {
            this.currentOrganizer = index;
        },
        toggleAddUnit() {
            this.addingUnit = !this.addingUnit;

            if (!this.addingUnit) {
                this.newUnit = '';
            }
        },
        addUnit() {
            if (this.newUnit == '') {
                return;
            }

            this.organizers.push({ name: this.newUnit, data: [[[]]] });
            this.addingUnit = false;
            this.newUnit = '';
            this.currentOrganizer = this.organizers.length - 1;
        },
        removeUnit(index) {
            if (this.organizers.length < 2) {
                this.error = 'You can not remove the only unit';
                return;
            }
            this.organizers.splice(index, 1);

            if (this.currentOrganizer >= index && this.currentOrganizer > 0) {
                this.currentOrganizer--;
            }
        },
        addColumn(row) {
            this.organizers[this.currentOrganizer].data[row].push([]);
        },
        addRow() {
            const prevRow = this.organizers[this.currentOrganizer].data[this.organizers[this.currentOrganizer].data.length - 1].map(col => []);
            this.organizers[this.currentOrganizer].data.push(prevRow);
        },
        removeColumn(row) {
            if (this.organizers[this.currentOrganizer].data[row].length < 2 && row == 0) {
                this.error = 'You can not remove the only column';
                return;
            }

            this.organizers[this.currentOrganizer].data[row].pop();
            if (this.organizers[this.currentOrganizer].data[row].length < 1) {
                this.organizers[this.currentOrganizer].data.splice(row, 1);
            }
        },
        removeRow() {
            if (this.organizers[this.currentOrganizer].data.length < 2) {
                this.error = 'You can not remove the only row';
                return;
            }

            this.organizers[this.currentOrganizer].data.pop();
        },
        openContents(row, column) {
            this.editingLayout = false;
            this.contents.row = row;
            this.contents.column = column;
            this.contents.show = true;
        },
        closeContents() {
            if (this.editingItemIndex !== null && this.organizers[this.currentOrganizer].data[this.contents.row][this.contents.column][this.editingItemIndex].length <= 0) {
                return;
            }
            this.contents.show = false;
            this.newItem = '';
            this.editingItemIndex = null;
        },
        addItem() {
            if (this.newItem == '') {
                return;
            }

            this.organizers[this.currentOrganizer].data[this.contents.row][this.contents.column].push(this.newItem);
            this.newItem = '';
        },
        editItem(index) {
            this.editingItemIndex = index;
        },
        saveItem() {
            if (this.organizers[this.currentOrganizer].data[this.contents.row][this.contents.column][this.editingItemIndex].length <= 0) {
                return;
            }
            this.editingItemIndex = null;
        },
        removeItem(index) {
            this.organizers[this.currentOrganizer].data[this.contents.row][this.contents.column].splice(index, 1);
        },
        toggleLayoutEdit() {
            this.editingLayout = !this.editingLayout;
        },
        addMargin(el) {
            el.classList.value += ' ml-2';
        },
        saveOnExit() {
            clearTimeout(this.timer1);
            this.saveOrganizers();
        },
    },
    computed: {
        filteredItems() {
            return this.organizers[this.currentOrganizer].data.map(row =>
                row.map(column =>
                    column.some(x => x == this.search)
                )
            );
        },
        onlyItems() {
            return [...new Set(this.organizers[this.currentOrganizer]?.data.flat(2))];
        },
    },
    beforeMount() {
        window.addEventListener("beforeunload", this.saveOnExit);
    },
    mounted() {
        this.loadOrganizers();
    },
    watch: {
        organizers: {
            handler() {
                if (!this.initialized) {
                    return;
                }

                clearTimeout(this.timer1);

                this.timer1 = setTimeout(() => {
                    this.saveOrganizers();
                }, 1500);
            },
            deep: true,
        },
        error() {
            clearTimeout(this.timer2);

            this.timer2 = setTimeout(() => {
                this.error = '';
            }, 2000);
        }
    },
};
</script>