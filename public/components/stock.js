const StockView = {
  props: ["categories", "units", "userRole"],
  data() {
    return {
      stockData: [], 
      suppliersData: [], 
      showAddModal: false,
      showEditModal: false,
      showCatModal: false,
      showUnitModal: false,
      showDeleteModal: false,
      itemToDelete: null,
      newCatName: "",
      newUnitName: "",
      activeItem: null,
      editingItem: null,
      actionType: "in",
      actionQty: 0,
      search: "",
      filterCat: "",
      alertModal: {
        show: false,
        title: "",
        message: "",
        confirmAction: null,
      },
      newItem: {
        sku: "", // [เพิ่มใหม่] ฟิลด์รหัสสินค้า
        name: "",
        cat: "",
        supplier: "",
        qty: 0,
        min: 0,
        unit: "",
        price: 0,
      },
    };
  },
  template: `
    <section class="w-full text-left animate-in fade-in duration-500">
        <div class="flex justify-between items-end mb-8 no-print border-b border-slate-100 pb-6">
            <div class="text-left">
                <h2 class="text-3xl font-bold text-slate-800">จัดการคลังวัตถุดิบ</h2>
            </div>
            <div class="flex gap-2" v-if="userRole === 'Admin'">
                <button @click="promptNewCategory" class="bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200">
                    <i class="fas fa-tags"></i> + หมวดหมู่
                </button>
                <button @click="promptNewUnit" class="bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200">
                    <i class="fas fa-balance-scale"></i> + หน่วยนับ
                </button>
                
                <button @click="showAddModal = true" class="ml-2 bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg transition flex items-center gap-2 text-sm">
                    <i class="fas fa-plus-circle"></i> เพิ่มวัตถุดิบใหม่
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
                <input v-model="search" type="text" placeholder="ค้นหารหัส หรือ ชื่อวัตถุดิบ..." class="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
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
                        <th class="p-5 w-1/3">รหัส / รายการวัตถุดิบ</th>
                        <th class="p-5 w-1/6">คู่ค้า</th>
                        <th class="p-5 text-center">ราคา/หน่วย</th>
                        <th class="p-5 text-center">คงเหลือ</th>
                        <th class="p-5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr v-for="item in filteredItems" :key="item.id" class="border-b last:border-0 hover:bg-slate-50 transition group">
                        <td class="p-5 text-left">
                            <div class="text-[10px] text-orange-500 font-black mb-0.5 tracking-wider">{{ item.sku || '-' }}</div>
                            <div class="font-bold text-slate-700 text-base group-hover:text-slate-900">{{ item.name }}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ item.cat }}</div>
                        </td>
                        <td class="p-5 text-slate-600 text-xs">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-truck text-slate-300"></i>
                                {{ item.supplier || '-' }}
                            </div>
                        </td>
                        <td class="p-5 text-center text-slate-500 font-mono italic">
                            <span v-if="userRole === 'Admin'">฿ {{ (item.price || 0).toLocaleString() }}</span>
                            <span v-else>-</span>
                        </td>
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
                                
                                <div v-if="userRole === 'Admin'" class="flex gap-1 ml-1 pl-2 border-l border-slate-200">
                                    <button @click="startEdit(item)" class="text-slate-400 hover:text-blue-600 p-1.5 transition"><i class="fas fa-edit text-xs"></i></button>
                                    <button @click="deleteItem(item)" class="text-slate-300 hover:text-red-500 p-1.5 transition"><i class="fas fa-trash-alt text-xs"></i></button>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredItems.length === 0">
                        <td colspan="5" class="p-8 text-center text-slate-400">กำลังโหลด หรือ ไม่พบข้อมูลวัตถุดิบ...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white">
                <div class="bg-green-600 p-6 text-white text-lg font-bold flex justify-between items-center italic uppercase tracking-tighter">
                    <span>📦 ลงทะเบียนวัตถุดิบใหม่</span>
                    <button @click="showAddModal = false" class="text-white hover:rotate-90 transition text-2xl">&times;</button>
                </div>
                <div class="p-8 space-y-5">
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-widest">รหัสสินค้า (SKU)</label>
                            <input v-model="newItem.sku" type="text" placeholder="เช่น RM-001" class="w-full border-b-2 p-2 outline-none focus:border-green-600 font-bold text-lg transition text-orange-500">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block tracking-widest">ชื่อวัตถุดิบ</label>
                            <input v-model="newItem.name" type="text" placeholder="ระบุชื่อ..." class="w-full border-b-2 p-2 outline-none focus:border-green-600 font-bold text-lg transition">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">หมวดหมู่</label>
                            <select v-model="newItem.cat" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกหมวดหมู่</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">คู่ค้า</label>
                            <select v-model="newItem.supplier" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกคู่ค้า</option>
                                <option v-for="sup in suppliersData" :key="sup.id" :value="sup.name">{{ sup.name }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                         <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">หน่วยนับ</label>
                            <select v-model="newItem.unit" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกหน่วย</option>
                                <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                            </select>
                        </div>
                         <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block font-normal text-left">ราคาทุน (บาท)</label>
                            <input v-model.number="newItem.price" type="number" class="w-full border-b-2 p-2 outline-none text-sm font-mono">
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
                </div>
                <div class="p-6 bg-slate-50 flex gap-4 border-t">
                    <button @click="showAddModal = false" class="flex-1 py-3 text-slate-400 font-bold text-sm uppercase">ยกเลิก</button>
                    <button @click="addNewItem" class="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition text-sm uppercase">บันทึกเข้าคลัง</button>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white" v-if="editingItem">
                <div class="bg-blue-600 p-6 text-white text-lg font-bold italic uppercase tracking-tighter">✏️ แก้ไขข้อมูลวัตถุดิบ</div>
                <div class="p-8 space-y-5">
                    
                    <div class="grid grid-cols-2 gap-6 mb-2">
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">รหัสสินค้า</label>
                            <input v-model="editingItem.sku" type="text" class="w-full border-b-2 p-2 outline-none focus:border-blue-600 font-bold text-lg text-orange-500">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ชื่อวัตถุดิบ</label>
                            <input v-model="editingItem.name" type="text" class="w-full border-b-2 p-2 outline-none focus:border-blue-600 font-bold text-lg">
                        </div>
                    </div>
                    
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">คู่ค้า</label>
                        <select v-model="editingItem.supplier" class="w-full border-b-2 p-2 outline-none bg-white text-sm">
                             <option v-for="sup in suppliersData" :key="sup.id" :value="sup.name">{{ sup.name }}</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-6 text-sm">
                        <select v-model="editingItem.cat" class="w-full border-b-2 p-2 outline-none bg-white">
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                        <select v-model="editingItem.unit" class="w-full border-b-2 p-2 outline-none bg-white">
                            <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-6 text-sm">
                        <input v-model.number="editingItem.price" type="number" class="w-full border-b-2 p-2 outline-none font-mono" placeholder="ราคา">
                        <input v-model.number="editingItem.min" type="number" class="w-full border-b-2 p-2 outline-none font-bold text-red-500" placeholder="แจ้งเตือนขั้นต่ำ">
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
                    <div class="text-orange-500 font-black text-xs">{{ activeItem.sku }}</div>
                    <div class="text-slate-700 mb-4 font-bold text-lg uppercase tracking-tighter">{{ activeItem.name }}</div>
                    <div class="flex items-center justify-center gap-2">
                        <button @click="actionQty > 0 ? actionQty-- : null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-lg">-</button>
                        <input v-model.number="actionQty" type="number" class="w-24 text-center text-5xl font-black border-b-4 border-slate-100 py-2 outline-none focus:border-slate-300 font-mono" placeholder="0">
                        <button @click="actionQty++" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-lg">+</button>
                    </div>
                </div>
                <div class="p-6 flex gap-3 bg-slate-50">
                    <button @click="activeItem = null" class="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest">ยกเลิก</button>
                    <button @click="confirmAction" class="flex-1 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition text-xs uppercase tracking-widest">ตกลง</button>
                </div>
            </div>
        </div>
        
        <div v-if="showCatModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-white">
                <div class="bg-slate-800 p-6 text-white text-lg font-bold flex justify-between items-center italic uppercase">
                    <span><i class="fas fa-tags mr-2"></i> เพิ่มหมวดหมู่ใหม่</span>
                    <button @click="showCatModal = false" class="text-white hover:rotate-90 transition text-2xl">&times;</button>
                </div>
                <div class="p-8">
                    <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">ชื่อหมวดหมู่</label>
                    <input v-model="newCatName" @keyup.enter="saveCategory" type="text" placeholder="เช่น ผักสด, เครื่องปรุง..." class="w-full border-b-2 p-2 outline-none focus:border-slate-800 font-bold text-lg transition">
                </div>
                <div class="p-6 bg-slate-50 flex gap-4 border-t">
                    <button @click="showCatModal = false" class="flex-1 py-3 text-slate-400 font-bold text-xs uppercase">ยกเลิก</button>
                    <button @click="saveCategory" class="flex-1 py-3 bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition text-xs uppercase">บันทึกหมวดหมู่</button>
                </div>
            </div>
        </div>

        <div v-if="showUnitModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-white">
                <div class="bg-slate-800 p-6 text-white text-lg font-bold flex justify-between items-center italic uppercase">
                    <span><i class="fas fa-balance-scale mr-2"></i> เพิ่มหน่วยนับ</span>
                    <button @click="showUnitModal = false" class="text-white hover:rotate-90 transition text-2xl">&times;</button>
                </div>
                <div class="p-8">
                    <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">ชื่อหน่วยนับ</label>
                    <input v-model="newUnitName" @keyup.enter="saveUnit" type="text" placeholder="เช่น กิโลกรัม, ลิตร, ฟอง..." class="w-full border-b-2 p-2 outline-none focus:border-slate-800 font-bold text-lg transition">
                </div>
                <div class="p-6 bg-slate-50 flex gap-4 border-t">
                    <button @click="showUnitModal = false" class="flex-1 py-3 text-slate-400 font-bold text-xs uppercase">ยกเลิก</button>
                    <button @click="saveUnit" class="flex-1 py-3 bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition text-xs uppercase">บันทึกหน่วยนับ</button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-red-50">
                <div class="bg-red-600 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase italic tracking-tighter">ยืนยันการนำออก?</h3>
                </div>
                <div class="p-8 text-center">
                    <p class="text-slate-500 text-sm mb-1">คุณต้องการลบวัตถุดิบ:</p>
                    <div class="text-2xl font-bold text-slate-800 mb-2">{{ itemToDelete?.name }}</div>
                    <div class="bg-orange-50 text-orange-600 text-[10px] font-bold py-2 px-4 rounded-xl inline-block uppercase tracking-widest">
                        ข้อมูลที่ถูกลบจะหายไปจากระบบ
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="showDeleteModal = false" class="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition">ยกเลิก</button>
                    <button @click="confirmDelete" class="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition text-xs uppercase tracking-widest">ยืนยันนำออก</button>
                </div>
            </div>
        </div>

        <div v-if="alertModal.show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in duration-200">
                <div class="bg-amber-500 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-circle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-black uppercase italic">{{ alertModal.title }}</h3>
                </div>
                <div class="p-6 text-center text-slate-600 font-medium">
                    {{ alertModal.message }}
                </div>
                <div class="p-4 bg-slate-50">
                    <button @click="alertModal.show = false" class="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl">เข้าใจแล้ว</button>
                </div>
            </div>
        </div>
    </section>
  `,
  computed: {
    filteredItems() {
      return this.stockData.filter((i) => {
        // [อัปเดต] ให้ช่อง Search ค้นหาจาก SKU ได้ด้วย
        const matchNameOrSku = i.name.toLowerCase().includes(this.search.toLowerCase()) || 
                               (i.sku || '').toLowerCase().includes(this.search.toLowerCase());
        const matchCat = this.filterCat === "" || i.cat === this.filterCat;
        const isActive = i.active !== false; 
        return matchNameOrSku && matchCat && isActive;
      });
    },
  },
  mounted() {
    db.collection("inventory").onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      this.stockData = items;
    });

    db.collection("suppliers").onSnapshot((querySnapshot) => {
      const sups = [];
      querySnapshot.forEach((doc) => {
        sups.push({ id: doc.id, ...doc.data() });
      });
      this.suppliersData = sups;
    });
  },
  methods: {
    triggerAlert(title, message) {
      this.alertModal = { show: true, title, message };
    },
    
    logActivity(action, details) {
      const userEmail = firebase.auth().currentUser?.email || 'System';
      db.collection("activity_logs").add({
          userEmail: userEmail,
          module: 'สต๊อกสินค้า',
          action: action,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.error("Log Error:", err));
    },

    addNewItem() {
      if (this.userRole !== 'Admin') return; 

      if (!this.newItem.name || !this.newItem.cat || !this.newItem.unit) {
        return this.triggerAlert("ข้อมูลไม่ครบถ้วน", "กรุณาระบุข้อมูลให้ครบถ้วน");
      }

      const itemToSave = { ...this.newItem, active: true };

      db.collection("inventory").add(itemToSave)
        .then(() => {
          const codeInfo = this.newItem.sku ? `[${this.newItem.sku}] ` : '';
          this.logActivity('CREATE', `เพิ่มวัตถุดิบใหม่: ${codeInfo}${this.newItem.name}`);
          
          this.showAddModal = false;
          this.newItem = { sku: "", name: "", cat: "", supplier: "", qty: 0, min: 0, unit: "", price: 0 };
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          this.triggerAlert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
        });
    },

    startEdit(item) {
      if (this.userRole !== 'Admin') return; 
      this.editingItem = JSON.parse(JSON.stringify(item));
      this.showEditModal = true;
    },
    
    saveEdit() {
      if (this.userRole !== 'Admin') return;

      const updateData = { ...this.editingItem };
      delete updateData.id;

      db.collection("inventory")
        .doc(this.editingItem.id)
        .update(updateData)
        .then(() => {
          this.logActivity('UPDATE', `แก้ไขข้อมูลวัตถุดิบ: ${updateData.name}`);
          
          this.showEditModal = false;
          this.editingItem = null;
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    },

    deleteItem(item) {
      if (this.userRole !== 'Admin') return;
      this.itemToDelete = item;
      this.showDeleteModal = true;
    },

    confirmDelete() {
      if (this.userRole !== 'Admin') return;
      if (!this.itemToDelete) return;

      db.collection("inventory")
        .doc(this.itemToDelete.id)
        .update({ active: false })
        .then(() => {
          this.logActivity('DELETE', `นำวัตถุดิบออกจากระบบ: ${this.itemToDelete.name}`);
          
          this.showDeleteModal = false;
          this.itemToDelete = null;
        })
        .catch((error) => {
          console.error("Error hiding document: ", error);
          alert("เกิดข้อผิดพลาดในการนำออกข้อมูล");
        });
    },

    openAction(item, type) {
      this.activeItem = item;
      this.actionType = type;
      this.actionQty = 0;
    },
    
    confirmAction() {
      if (this.actionQty <= 0) {
        return this.triggerAlert("จำนวนไม่ถูกต้อง", "กรุณาระบุจำนวนที่มากกว่า 0");
      }

      let newQty = this.activeItem.qty;
      if (this.actionType === "in") {
        newQty += this.actionQty;
      } else {
        if (newQty < this.actionQty) {
          return this.triggerAlert("สต๊อกไม่พอ", "จำนวนวัตถุดิบในคลังมีไม่เพียงพอสำหรับการเบิกออก");
        }
        newQty -= this.actionQty;
      }

      const newHistory = {
        date: new Date().toISOString(),
        type: this.actionType,
        qty: this.actionQty,
      };

      const updatedHistory = [newHistory, ...(this.activeItem.history || [])];

      db.collection("inventory")
        .doc(this.activeItem.id)
        .update({
          qty: newQty,
          history: updatedHistory,
        })
        .then(() => {
          const actionText = this.actionType === "in" ? "รับเข้า" : "เบิกออก";
          this.logActivity('UPDATE', `${actionText}สต๊อก: ${this.activeItem.name} จำนวน ${this.actionQty} ${this.activeItem.unit}`);
          
          this.activeItem = null;
        })
        .catch((error) => {
          console.error("Error updating stock: ", error);
          alert("เกิดข้อผิดพลาดในการอัปเดตสต๊อก");
        });
    },

    promptNewCategory() {
      if (this.userRole !== 'Admin') return;
      this.newCatName = "";
      this.showCatModal = true;
    },
    promptNewUnit() {
      if (this.userRole !== 'Admin') return;
      this.newUnitName = "";
      this.showUnitModal = true;
    },

    saveCategory() {
      if (this.userRole !== 'Admin') return;
      const val = this.newCatName.trim();
      if (val) {
        this.$emit("add-category", val);
        this.logActivity('CREATE', `เพิ่มหมวดหมู่ใหม่: ${val}`);
        this.showCatModal = false;
        this.newCatName = "";
      } else {
        this.triggerAlert("ยังไม่ได้ระบุชื่อ", "กรุณาใส่ชื่อหมวดหมู่ที่ต้องการเพิ่ม");
      }
    },

    saveUnit() {
      if (this.userRole !== 'Admin') return;
      const val = this.newUnitName.trim();
      if (val) {
        this.$emit("add-unit", val);
        this.logActivity('CREATE', `เพิ่มหน่วยนับใหม่: ${val}`);
        this.showUnitModal = false;
        this.newUnitName = "";
      } else {
        this.triggerAlert("ยังไม่ได้ระบุชื่อ", "กรุณาใส่ชื่อหน่วยนับที่ต้องการเพิ่ม");
      }
    }
  },
};