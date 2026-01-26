const StockView = {
    // รับข้อมูลจากไฟล์ index.html
    props: ['stockData', 'categories', 'units'], 
    data() {
        return {
            showAddModal: false,
            showEditModal: false,
            activeItem: null,
            editingItem: null,
            actionType: 'in',
            actionQty: 0,
            search: '',
            filterCat: '',
            newItem: { 
                name: '', 
                cat: '', 
                qty: 0, // สำหรับเก็บจำนวนเริ่มต้น
                min: 0, 
                unit: '', 
                price: 0 
            }
        }
    },
    template: `
    <section class="w-full text-left">
        <div class="flex justify-between items-end mb-8 no-print border-b border-slate-100 pb-6">
            <div class="text-left">
                <h2 class="text-3xl font-bold text-slate-800">จัดการคลังวัตถุดิบ</h2>
            </div>
            <div class="flex gap-2">
                <button @click="promptNewCategory" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200">
                    <i class="fas fa-tags"></i> + เพิ่มหมวดหมู่
                </button>
                <button @click="promptNewUnit" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200">
                    <i class="fas fa-balance-scale"></i> + เพิ่มหน่วยนับ
                </button>
                <button @click="showAddModal = true" class="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg transition flex items-center gap-2 text-sm">
                    <i class="fas fa-plus-circle"></i> เพิ่มวัตถุดิบใหม่
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
                <input v-model="search" type="text" placeholder="ค้นหาชื่อวัตถุดิบ..." class="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
            </div>
            <select v-model="filterCat" class="px-4 py-2 border rounded-xl outline-none text-sm bg-white cursor-pointer font-medium">
                <option value="">ทุกหมวดหมู่ (ทั้งหมด)</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
        </div>

        <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b">
                    <tr>
                        <th class="p-5">รายการวัตถุดิบ / ประเภท</th>
                        <th class="p-5 text-center">ราคา/หน่วย</th>
                        <th class="p-5 text-center">คงเหลือ</th>
                        <th class="p-5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-for="item in filteredItems" :key="item.id" class="border-b last:border-0 hover:bg-slate-50 transition group">
                        <td class="p-5 text-left">
                            <div class="font-bold text-slate-700 text-base group-hover:text-slate-900">{{ item.name }}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ item.cat }}</div>
                        </td>
                        <td class="p-5 text-center text-slate-500 font-mono italic">฿ {{ (item.price || 0).toLocaleString() }}</td>
                        <td class="p-5 text-center">
                            <div :class="item.qty <= item.min ? 'text-red-600' : 'text-slate-700'" class="text-xl font-black font-mono">
                                {{ item.qty }} <span class="text-[10px] font-normal text-slate-400 uppercase ml-1">{{ item.unit }}</span>
                            </div>
                            <div v-if="item.qty <= item.min" class="mt-1">
                                <span class="bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-sm">⚠️ ควรซื้อเพิ่ม</span>
                            </div>
                        </td>
                        <td class="p-5">
                            <div class="flex justify-center gap-1.5">
                                <button @click="openAction(item, 'in')" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-blue-700 transition">รับเข้า</button>
                                <button @click="openAction(item, 'out')" class="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-orange-700 transition">เบิกออก</button>
                                <div class="flex gap-1 ml-1 pl-2 border-l border-slate-200">
                                    <button @click="startEdit(item)" class="text-slate-400 hover:text-blue-600 p-1.5 transition"><i class="fas fa-edit text-xs"></i></button>
                                    <button @click="deleteItem(item)" class="text-slate-300 hover:text-red-500 p-1.5 transition"><i class="fas fa-trash-alt text-xs"></i></button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div class="bg-green-600 p-6 text-white text-lg font-bold flex justify-between items-center italic uppercase tracking-tighter">
                    <span>📦 ลงทะเบียนวัตถุดิบใหม่</span>
                    <button @click="showAddModal = false" class="text-white hover:rotate-90 transition text-2xl">&times;</button>
                </div>
                <div class="p-8 space-y-5">
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-widest">ชื่อวัตถุดิบ</label>
                        <input v-model="newItem.name" type="text" placeholder="ระบุชื่อวัตถุดิบ เช่น ไก่, หมู" class="w-full border-b-2 p-2 outline-none focus:border-green-600 font-bold text-lg transition">
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">หมวดหมู่</label>
                            <select v-model="newItem.cat" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกประเภท</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">หน่วยนับ</label>
                            <select v-model="newItem.unit" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกหน่วย</option>
                                <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-[10px] font-bold text-blue-500 uppercase mb-1 block">จำนวนเริ่มต้น</label>
                            <input v-model.number="newItem.qty" type="number" class="w-full border-b-2 p-2 outline-none text-sm font-black bg-blue-50/30">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-red-400 uppercase mb-1 block">แจ้งเตือนต่ำกว่า</label>
                            <input v-model.number="newItem.min" type="number" class="w-full border-b-2 p-2 outline-none text-sm font-black text-red-500">
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block font-normal text-left">ราคาทุนต่อหน่วย (บาท)</label>
                        <input v-model.number="newItem.price" type="number" class="w-full border-b-2 p-2 outline-none text-sm font-mono">
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-4 border-t">
                    <button @click="showAddModal = false" class="flex-1 py-3 text-slate-400 font-bold text-sm uppercase">ยกเลิก</button>
                    <button @click="addNewItem" class="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition text-sm uppercase">บันทึกเข้าคลัง</button>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200" v-if="editingItem">
                <div class="bg-blue-600 p-6 text-white text-lg font-bold italic uppercase tracking-tighter">✏️ แก้ไขข้อมูลวัตถุดิบ</div>
                <div class="p-8 space-y-5">
                    <input v-model="editingItem.name" type="text" class="w-full border-b-2 p-2 outline-none focus:border-blue-600 font-bold text-lg">
                    <div class="grid grid-cols-2 gap-6 text-sm">
                        <select v-model="editingItem.cat" class="w-full border-b-2 p-2 outline-none bg-white">
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                        <select v-model="editingItem.unit" class="w-full border-b-2 p-2 outline-none bg-white">
                            <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-6 text-sm">
                        <input v-model.number="editingItem.price" type="number" class="w-full border-b-2 p-2 outline-none font-mono">
                        <input v-model.number="editingItem.min" type="number" class="w-full border-b-2 p-2 outline-none font-bold text-red-500">
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-4 border-t">
                    <button @click="showEditModal = false" class="flex-1 py-3 text-slate-400 font-bold text-sm uppercase">ยกเลิก</button>
                    <button @click="saveEdit" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition text-sm uppercase">อัปเดตข้อมูล</button>
                </div>
            </div>
        </div>

        <div v-if="activeItem" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden text-center border-2 border-white animate-in zoom-in duration-200">
                <div :class="actionType === 'in' ? 'bg-blue-600' : 'bg-orange-600'" class="p-6 text-white text-xl font-black uppercase italic tracking-widest">
                    {{ actionType === 'in' ? '📥 รับเข้าสินค้า' : '📤 เบิกจ่ายสินค้า' }}
                </div>
                <div class="p-10 text-center">
                    <div class="text-slate-400 mb-2 font-bold text-xs uppercase tracking-tighter">{{ activeItem.name }}</div>
                    <input v-model.number="actionQty" type="number" class="w-full text-center text-6xl font-black border-b-4 border-slate-100 py-4 outline-none focus:border-slate-300 font-mono" placeholder="0">
                </div>
                <div class="p-6 flex gap-3 bg-slate-50">
                    <button @click="activeItem = null" class="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest">ยกเลิก</button>
                    <button @click="confirmAction" class="flex-1 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition text-xs uppercase tracking-widest">ตกลง</button>
                </div>
            </div>
        </div>
    </section>
    `,
    computed: {
        filteredItems() {
            return this.stockData.filter(i => {
                const matchName = i.name.toLowerCase().includes(this.search.toLowerCase());
                const matchCat = this.filterCat === '' || i.cat === this.filterCat;
                return matchName && matchCat;
            });
        }
    },
    methods: {
        addNewItem() {
            if (!this.newItem.name || !this.newItem.cat || !this.newItem.unit) return alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
            this.stockData.push({
                ...this.newItem,
                id: Date.now(),
                // บันทึกประวัติเริ่มต้นพร้อมจำนวนที่กรอกมา
                history: [{ date: new Date().toLocaleString(), type: 'in', qty: this.newItem.qty }]
            });
            this.showAddModal = false;
            this.newItem = { name: '', cat: '', qty: 0, min: 0, unit: '', price: 0 };
        },
        promptNewCategory() {
            const name = prompt("ระบุชื่อหมวดหมู่ใหม่:");
            if (name && name.trim()) this.$emit('add-category', name.trim());
        },
        promptNewUnit() {
            const name = prompt("ระบุชื่อหน่วยนับใหม่:");
            if (name && name.trim()) this.$emit('add-unit', name.trim());
        },
        startEdit(item) {
            this.editingItem = JSON.parse(JSON.stringify(item));
            this.showEditModal = true;
        },
        saveEdit() {
            const index = this.stockData.findIndex(i => i.id === this.editingItem.id);
            if (index !== -1) {
                this.stockData[index] = { ...this.editingItem };
                this.showEditModal = false;
                this.editingItem = null;
            }
        },
        deleteItem(item) {
            if (confirm(`คุณต้องการลบ "${item.name}"? ประวัติจะหายไปถาวร!`)) {
                const index = this.stockData.findIndex(i => i.id === item.id);
                if (index !== -1) this.stockData.splice(index, 1);
            }
        },
        openAction(item, type) {
            this.activeItem = item;
            this.actionType = type;
            this.actionQty = 0;
        },
        confirmAction() {
            if (this.actionQty <= 0) return alert("กรุณาระบุจำนวนที่ถูกต้อง!");
            if (this.actionType === 'in') {
                this.activeItem.qty += this.actionQty;
            } else {
                if (this.activeItem.qty < this.actionQty) return alert("สินค้าในคลังไม่เพียงพอ!");
                this.activeItem.qty -= this.actionQty;
            }
            // บันทึกประวัติการเบิกจ่าย
            this.activeItem.history.unshift({ date: new Date().toLocaleString(), type: this.actionType, qty: this.actionQty });
            this.activeItem = null;
        }
    }
};