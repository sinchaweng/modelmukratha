const SupplierView = {
    // รับข้อมูลอาเรย์คู่ค้ามาจากไฟล์หลัก (index.html)
    props: ['suppliers'],
    
    data() {
        return {
            showModal: false,     // ควบคุมการเปิด/ปิดหน้าต่าง Modal
            editingIndex: null,   // เก็บ Index ที่กำลังแก้ไข (null = เพิ่มใหม่)
            form: {
                name: '',
                contact: '',
                productCat: 'เนื้อสัตว์' // ค่าเริ่มต้น
            }
        }
    },

    template: `
    <section>
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-slate-800">ข้อมูลคู่ค้า (Suppliers)</h2>
            <button @click="openAddModal" class="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition flex items-center gap-2">
                <i class="fas fa-plus-circle"></i> เพิ่มคู่ค้าใหม่
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="(s, index) in suppliers" :key="s.id" class="bg-white p-6 rounded-3xl shadow-sm border hover:shadow-md transition relative group">
                
                <div class="flex justify-between items-start mb-4">
                    <div class="bg-orange-100 p-3 rounded-2xl">
                        <i class="fas fa-building text-orange-600 text-xl"></i>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 border border-slate-200 uppercase tracking-tighter shadow-sm">
                            {{ s.productCat }}
                        </span>
                        
                        <button @click="removeSupplier(index)" 
                                class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100">
                            <i class="fas fa-trash-alt text-sm"></i>
                        </button>
                    </div>
                </div>

                <h4 class="font-bold text-lg text-slate-800 mb-1">{{ s.name }}</h4>
                <p class="text-slate-500 text-sm mb-6 flex items-center gap-2">
                    <i class="fas fa-phone-alt text-slate-400 text-xs"></i> {{ s.contact }}
                </p>

                <div class="flex gap-2">
                    <a :href="'tel:' + s.contact" 
                       class="flex-1 py-2.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-xl text-center hover:bg-orange-600 hover:text-white transition shadow-sm">
                        <i class="fas fa-phone-alt mr-1"></i> โทรออก
                    </a>
                    <button @click="openEditModal(s, index)" 
                            class="px-4 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition">
                        <i class="fas fa-edit mr-1"></i> แก้ไข
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
                <div class="bg-slate-900 p-6 text-white text-xl font-bold flex justify-between items-center">
                    <span>
                        <i class="fas" :class="editingIndex !== null ? 'fa-edit text-blue-400' : 'fa-truck-loading text-orange-500'"></i> 
                        {{ editingIndex !== null ? ' แก้ไขข้อมูลคู่ค้า' : ' ลงทะเบียนคู่ค้าใหม่' }}
                    </span>
                    <button @click="showModal = false" class="text-slate-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div class="p-6 space-y-5">
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase block mb-1">ชื่อร้านคู่ค้า / บริษัท</label>
                        <input v-model="form.name" type="text" 
                               class="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-orange-500 transition text-slate-700" 
                               placeholder="ระบุชื่อคู่ค้า">
                    </div>
                    
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase block mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                        <input v-model="form.contact" type="text" 
                               class="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-orange-500 transition text-slate-700" 
                               placeholder="08X-XXX-XXXX">
                    </div>

                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase block mb-1 text-sm">หมวดหมู่สินค้าหลัก</label>
                        <select v-model="form.productCat" 
                                class="w-full border-b-2 border-slate-100 p-2 outline-none focus:border-orange-500 transition bg-white text-slate-700">
                            <option value="เนื้อสัตว์">เนื้อสัตว์</option>
                            <option value="ผักสด">ผักสด</option>
                            <option value="เครื่องปรุง">เครื่องปรุง</option>
                            <option value="เครื่องดื่ม">เครื่องดื่ม</option> </select>
                    </div>
                </div>

                <div class="p-6 bg-slate-50 flex gap-4">
                    <button @click="showModal = false" 
                            class="flex-1 py-3 text-slate-400 font-bold hover:text-slate-600 transition">
                        ยกเลิก
                    </button>
                    <button @click="saveSupplier" 
                            class="flex-1 py-3 bg-orange-600 text-white font-bold rounded-2xl shadow-lg hover:bg-orange-700 transition transform active:scale-95">
                        {{ editingIndex !== null ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล' }}
                    </button>
                </div>
            </div>
        </div>
    </section>
    `,

    methods: {
        // เปิด Modal เพื่อเพิ่มข้อมูลใหม่
        openAddModal() {
            this.editingIndex = null;
            this.form = { name: '', contact: '', productCat: 'เนื้อสัตว์' };
            this.showModal = true;
        },

        // เปิด Modal เพื่อแก้ไขข้อมูลเดิม
        openEditModal(supplier, index) {
            this.editingIndex = index;
            // ใช้การคลาย Object ({...}) เพื่อไม่ให้ค่าในตารางเปลี่ยนทันทีขณะกำลังพิมพ์
            this.form = { ...supplier };
            this.showModal = true;
        },

        // ฟังก์ชันบันทึกข้อมูล (ทั้งเพิ่มและแก้ไข)
        saveSupplier() {
            if (!this.form.name || !this.form.contact) {
                alert("กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน!");
                return;
            }

            if (this.editingIndex !== null) {
                // กรณีแก้ไข: อัปเดตข้อมูลที่ Index เดิมในอาเรย์หลัก
                this.suppliers[this.editingIndex] = { ...this.form };
            } else {
                // กรณีเพิ่มใหม่: สร้าง ID และเพิ่มลงอาเรย์
                this.suppliers.push({
                    id: Date.now(),
                    ...this.form
                });
            }

            this.showModal = false;
            // รีเซ็ตฟอร์ม
            this.form = { name: '', contact: '', productCat: 'เนื้อสัตว์' };
        },

        // ฟังก์ชันลบข้อมูล
        removeSupplier(index) {
            if (confirm("คุณต้องการลบข้อมูลคู่ค้านี้ใช่หรือไม่?")) {
                this.suppliers.splice(index, 1);
            }
        }
    }
};