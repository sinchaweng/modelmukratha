const StockView = {
    props: ['stockData'],
    data() {
        return {
            showAddModal: false,
            activeItem: null,
            actionType: 'in',
            actionQty: 0,
            search: '',
            filterCat: '',
            newItem: { 
                name: '', 
                cat: 'เนื้อสัตว์', 
                qty: 0, 
                min: 0, 
                unit: 'กก.',
                price: 0 // เพิ่มฟิลด์ราคาต้นทุน
            }
        }
    },
    template: `
    <section>
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-slate-800">จัดการคลังวัตถุดิบ</h2>
            <button @click="showAddModal = true" class="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg transition flex items-center gap-2">
                <i class="fas fa-plus-circle"></i> เพิ่มวัตถุดิบใหม่
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input v-model="search" type="text" placeholder="ค้นหาวัตถุดิบ..." class="px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
            <select v-model="filterCat" class="px-4 py-2 border rounded-xl outline-none">
                <option value="">ทุกหมวดหมู่</option>
                <option value="เนื้อสัตว์">เนื้อสัตว์</option>
                <option value="ผักสด">ผักสด</option>
                <option value="เครื่องปรุง">เครื่องปรุง</option>
                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
            </select>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                        <th class="p-4">ชื่อวัตถุดิบ</th>
                        <th class="p-4">ต้นทุน/หน่วย</th>
                        <th class="p-4">คงเหลือ</th>
                        <th class="p-4">สถานะ</th>
                        <th class="p-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredItems" :key="item.id" class="border-b hover:bg-slate-50 transition">
                        <td class="p-4 font-bold text-slate-700">{{ item.name }}</td>
                        <td class="p-4 text-slate-500">฿ {{ item.price }}</td>
                        <td class="p-4 font-bold">{{ item.qty }} {{ item.unit }}</td>
                        <td class="p-4">
                            <span :class="item.qty <= item.min ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'" class="px-2 py-1 rounded-full text-[10px] font-bold">
                                {{ item.qty <= item.min ? 'ควรสั่งเพิ่ม' : 'ปกติ' }}
                            </span>
                        </td>
                        <td class="p-4 flex justify-center gap-2">
                            <button @click="openAction(item, 'in')" class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-600 hover:text-white">รับเข้า</button>
                            <button @click="openAction(item, 'out')" class="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100 hover:bg-orange-600 hover:text-white">เบิกจ่าย</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-green-600 p-6 text-white text-xl font-bold uppercase italic">เพิ่มวัตถุดิบใหม่</div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase block mb-1">ชื่อวัตถุดิบ</label>
                        <input v-model="newItem.name" type="text" class="w-full border-b-2 p-2 outline-none focus:border-green-600">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase block mb-1">ราคาต้นทุน (บาท)</label>
                            <input v-model.number="newItem.price" type="number" class="w-full border-b-2 p-2 outline-none focus:border-green-600">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase block mb-1">หน่วยนับ</label>
                            <input v-model="newItem.unit" type="text" class="w-full border-b-2 p-2 outline-none focus:border-green-600" placeholder="กก./ชิ้น">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase block mb-1">จำนวนเริ่มต้น</label>
                            <input v-model.number="newItem.qty" type="number" class="w-full border-b-2 p-2 outline-none focus:border-green-600">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase block mb-1">แจ้งเตือนขั้นต่ำ</label>
                            <input v-model.number="newItem.min" type="number" class="w-full border-b-2 p-2 outline-none focus:border-green-600">
                        </div>
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-4">
                    <button @click="showAddModal = false" class="flex-1 py-3 text-slate-400 font-bold">ยกเลิก</button>
                    <button @click="addNewItem" class="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg">บันทึกข้อมูล</button>
                </div>
            </div>
        </div>

        <div v-if="activeItem" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center">
                <div :class="actionType === 'in' ? 'bg-blue-600' : 'bg-orange-600'" class="p-6 text-white text-xl font-bold uppercase">
                    {{ actionType === 'in' ? 'รับเข้าวัตถุดิบ' : 'เบิกจ่ายวัตถุดิบ' }}
                </div>
                <div class="p-8">
                    <div class="text-slate-500 mb-2 font-bold">{{ activeItem.name }}</div>
                    <input v-model.number="actionQty" type="number" class="w-full text-center text-5xl font-bold border-b-4 border-slate-100 py-4 outline-none focus:border-slate-300" placeholder="0">
                    <div class="mt-4 text-slate-400">ระบุจำนวนที่ต้องการ {{ actionType === 'in' ? 'เพิ่ม' : 'ลด' }}</div>
                </div>
                <div class="p-6 flex gap-4">
                    <button @click="activeItem = null" class="flex-1 py-3 font-bold text-slate-400">ยกเลิก</button>
                    <button @click="confirmAction" class="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition">ตกลง</button>
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
            if (!this.newItem.name) return alert("กรุณากรอกชื่อวัตถุดิบ!");
            this.stockData.push({
                ...this.newItem,
                id: Date.now(),
                history: [{ date: new Date().toLocaleString(), type: 'in', qty: this.newItem.qty }]
            });
            this.showAddModal = false;
            this.newItem = { name: '', cat: 'เนื้อสัตว์', qty: 0, min: 0, unit: 'กก.', price: 0 };
        },
        openAction(item, type) {
            this.activeItem = item;
            this.actionType = type;
            this.actionQty = 0;
        },
        confirmAction() {
            if (this.actionQty <= 0) return alert("กรุณาระบุจำนวน!");
            
            if (this.actionType === 'in') {
                this.activeItem.qty += this.actionQty;
            } else {
                if (this.activeItem.qty < this.actionQty) return alert("สินค้าไม่พอเบิก!");
                this.activeItem.qty -= this.actionQty;
            }

            // บันทึกลงประวัติ (สำคัญมาก: รายงานจะดึงจากตรงนี้ไปคำนวณ)
            this.activeItem.history.unshift({
                date: new Date().toLocaleString(),
                type: this.actionType,
                qty: this.actionQty
            });
            this.activeItem = null;
        }
    }
};