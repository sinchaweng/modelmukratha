const SupplierView = {
    // รับข้อมูลคู่ค้าและหมวดหมู่มาจากไฟล์หลัก
    props: ['suppliers', 'categories'], 
    
    data() {
        return {
            showModal: false,
            editingIndex: null,
            form: {
                name: '',
                contact: '',
                productCat: '' // เปลี่ยนเป็นค่าว่างเพื่อให้เลือกจากหมวดหมู่ที่มี
            }
        }
    },

    template: `
    <section class="w-full text-left animate-in fade-in duration-500">
        <div class="flex justify-between items-center mb-8 border-b pb-6">
            <div class="text-left">
                <h2 class="text-3xl font-bold text-slate-800">ข้อมูลคู่ค้า (Suppliers)</h2>
            </div>
            <div class="flex gap-2">
                <button @click="promptNewCategory" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200">
                    <i class="fas fa-tags"></i> + เพิ่มหมวดหมู่
                </button>
                <button @click="openAddModal" class="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition flex items-center gap-2 text-sm">
                    <i class="fas fa-plus-circle"></i> เพิ่มคู่ค้าใหม่
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="(s, index) in suppliers" :key="s.id" class="bg-white p-6 rounded-[2rem] shadow-sm border hover:shadow-md transition relative group">
                
                <div class="flex justify-between items-start mb-4">
                    <div class="bg-orange-100 p-3 rounded-2xl">
                        <i class="fas fa-building text-orange-600 text-xl"></i>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black bg-slate-50 px-3 py-1.5 rounded-full text-slate-500 border border-slate-200 uppercase tracking-tighter shadow-sm">
                            {{ s.productCat }}
                        </span>
                        
                        <button @click="removeSupplier(index)" 
                                class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                </div>

                <h4 class="font-black text-xl text-slate-800 mb-1">{{ s.name }}</h4>
                <p class="text-slate-400 text-sm mb-6 flex items-center gap-2 font-medium">
                    <i class="fas fa-phone-alt text-xs"></i> {{ s.contact }}
                </p>

                <div class="flex gap-2">
                    <a :href="'tel:' + s.contact" 
                       class="flex-1 py-3 bg-orange-50 text-orange-600 text-[11px] font-black rounded-2xl text-center hover:bg-orange-600 hover:text-white transition shadow-sm uppercase">
                        <i class="fas fa-phone-alt mr-1"></i> โทรติดต่อ
                    </a>
                    <button @click="openEditModal(s, index)" 
                            class="px-5 py-3 bg-slate-100 text-slate-600 text-[11px] font-black rounded-2xl hover:bg-slate-200 transition uppercase">
                        <i class="fas fa-edit mr-1"></i> แก้ไข
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div class="bg-slate-900 p-6 text-white text-lg font-bold flex justify-between items-center italic uppercase tracking-tighter">
                    <span>
                        <i class="fas" :class="editingIndex !== null ? 'fa-edit text-blue-400' : 'fa-truck-loading text-orange-500'"></i> 
                        {{ editingIndex !== null ? ' แก้ไขข้อมูลคู่ค้า' : ' ลงทะเบียนคู่ค้าใหม่' }}
                    </span>
                    <button @click="showModal = false" class="text-slate-400 hover:text-white text-2xl transition hover:rotate-90">&times;</button>
                </div>
                
                <div class="p-8 space-y-6">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">ชื่อร้านคู่ค้า / บริษัท</label>
                        <input v-model="form.name" type="text" 
                               class="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-orange-500 transition text-slate-800 font-bold text-lg" 
                               placeholder="ระบุชื่อบริษัท">
                    </div>
                    
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">เบอร์โทรศัพท์ติดต่อ</label>
                        <input v-model="form.contact" type="text" 
                               class="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-orange-500 transition text-slate-700 font-mono" 
                               placeholder="08X-XXX-XXXX">
                    </div>

                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">หมวดหมู่สินค้าหลัก</label>
                        <select v-model="form.productCat" 
                                class="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-orange-500 transition bg-white text-slate-700 font-bold text-sm cursor-pointer">
                            <option value="" disabled>กรุณาเลือกหมวดหมู่</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                </div>

                <div class="p-6 bg-slate-50 flex gap-4 border-t">
                    <button @click="showModal = false" 
                            class="flex-1 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition">
                        ยกเลิก
                    </button>
                    <button @click="saveSupplier" 
                            class="flex-1 py-3 bg-orange-600 text-white font-black rounded-2xl shadow-lg hover:bg-orange-700 transition uppercase text-xs tracking-widest transform active:scale-95">
                        {{ editingIndex !== null ? 'ยืนยันการแก้ไข' : 'บันทึกข้อมูล' }}
                    </button>
                </div>
            </div>
        </div>
    </section>
    `,

    methods: {
        // ฟังก์ชันเรียกใช้การเพิ่มหมวดหมู่ใหม่ไปยัง index.html
        promptNewCategory() {
            const name = prompt("ระบุชื่อหมวดหมู่สินค้าใหม่:");
            if (name && name.trim()) {
                this.$emit('add-category', name.trim());
            }
        },

        openAddModal() {
            this.editingIndex = null;
            this.form = { name: '', contact: '', productCat: '' };
            this.showModal = true;
        },

        openEditModal(supplier, index) {
            this.editingIndex = index;
            this.form = { ...supplier };
            this.showModal = true;
        },

        saveSupplier() {
            if (!this.form.name || !this.form.contact || !this.form.productCat) {
                alert("กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงเลือกหมวดหมู่สินค้า!");
                return;
            }

            if (this.editingIndex !== null) {
                this.suppliers[this.editingIndex] = { ...this.form };
            } else {
                this.suppliers.push({
                    id: Date.now(),
                    ...this.form
                });
            }

            this.showModal = false;
            this.form = { name: '', contact: '', productCat: '' };
        },

        removeSupplier(index) {
            if (confirm("คุณต้องการลบข้อมูลคู่ค้านี้ใช่หรือไม่? ประวัติการติดต่อจะหายไปทันที")) {
                this.suppliers.splice(index, 1);
            }
        }
    }
};