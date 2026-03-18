const StockView = {
  props: ["categories", "units", "userRole"],
  data() {
    return {
      stockData: [],
      suppliersData: [],
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      itemToDelete: null,

      // สำหรับเก็บเหตุผลการเบิก
      actionNote: "",

      // ตัวจัดการ Modal หมวดหมู่และหน่วยนับ
      showCatModal: false,
      showUnitModal: false,
      newCatName: "",
      newUnitName: "",

      // ตัวแปรสำหรับสถานะการแก้ไข (Edit)
      editingCatIndex: null,
      editingCatValue: "",
      editingUnitIndex: null,
      editingUnitValue: "",

      // ตัวจัดการ Modal ยืนยันการลบการตั้งค่า
      settingToDelete: { show: false, type: "", name: "" },

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
        sku: "",
        name: "",
        cat: "",
        supplier: "",
        qty: 0,
        min: 0,
        unit: "",
        price: 0,
      },

      currentPage: 1,
      itemsPerPage: 20,
    };
  },
  watch: {
    search() {
      this.currentPage = 1;
    },
    filterCat() {
      this.currentPage = 1;
    },
  },
  template: `
    <section class="w-full text-left animate-in fade-in duration-500">
        <div class="flex justify-between items-end mb-8 no-print border-b pb-6">
            <div class="text-left">
                <h2 class="text-3xl font-bold text-slate-800">จัดการวัตถุดิบ</h2>
            </div>
            <div class="flex gap-2" v-if="userRole === 'Admin'">
                <button @click="openCatManager" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200 flex items-center gap-2">
                    <i class="fas fa-cog"></i> จัดการหมวดหมู่
                </button>
                <button @click="openUnitManager" class="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition text-xs border border-slate-200 flex items-center gap-2">
                    <i class="fas fa-cog"></i> จัดการหน่วยนับ
                </button>
                
                <button @click="openAddModal" class="ml-2 bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg transition flex items-center gap-2 text-sm">
                    <i class="fas fa-plus-circle"></i> เพิ่มวัตถุดิบใหม่
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-3 text-slate-600 text-sm"></i>
                <input v-model="search" type="text" placeholder="ค้นหารหัส หรือ ชื่อวัตถุดิบ..." class="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
            </div>
            <select v-model="filterCat" class="px-4 py-2 border rounded-xl outline-none text-sm bg-white cursor-pointer font-medium">
                <option value="">ทุกหมวดหมู่ (ทั้งหมด)</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
        </div>

        <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase font-bold border-b sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th class="p-5 w-1/3 font-semibold text-slate-600">รหัส / รายการวัตถุดิบ</th>
                        <th class="p-5 w-1/6 font-semibold text-slate-600">คู่ค้า</th>
                        <th class="p-5 text-center font-semibold text-slate-600">ราคา/หน่วย</th>
                        <th class="p-5 text-center font-semibold text-slate-600">คงเหลือ</th>
                        <th class="p-5 text-center font-semibold text-slate-600">จัดการ</th>
                    </tr>
                </thead>
                
                <tbody v-for="group in paginatedGroupedItems" :key="group.name" class="text-sm">
                    <tr v-for="item in group.items" :key="item.id" class="border-b last:border-0 hover:bg-slate-50 transition group">
                        <td class="p-5 text-left">
                            <div class="text-[10px] text-orange-500 font-black mb-0.5 tracking-wider">{{ item.sku || '-' }}</div>
                            <div class="font-bold text-slate-700 text-base group-hover:text-slate-900">{{ item.name }}</div>
                        </td>
                        <td class="p-5 text-slate-600 text-sm">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-truck text-slate-600"></i>
                                {{ item.supplier || '-' }}
                            </div>
                        </td>
                        <td class="p-5 text-center text-slate-700 font-mono">
                            <span v-if="userRole === 'Admin'">฿ {{ (item.price || 0).toLocaleString() }}</span>
                            <span v-else>-</span>
                        </td>
                        <td class="p-5 text-center">
                            <div :class="item.qty <= item.min ? 'text-red-600' : 'text-slate-700'" class="text-xl font-black font-mono">
                                {{ item.qty }} <span class="text-[10px] font-normal text-slate-600 uppercase ml-1">{{ item.unit }}</span>
                            </div>
                            <div v-if="item.qty <= item.min" class="mt-1">
                                <span class="bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-sm">ควรซื้อเพิ่ม!</span>
                            </div>
                        </td>
                        <td class="p-5">
    <div class="flex justify-center gap-1.5">
        <button v-if="userRole === 'Admin'" 
                @click="openAction(item, 'in')" 
                class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-blue-700 transition">
            รับเข้า
        </button>

        <button v-if="userRole !== 'Admin'" 
                @click="openAction(item, 'out')" 
                class="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-orange-700 transition">
            เบิกออก
        </button>
        
        <div v-if="userRole === 'Admin'" class="flex gap-1 ml-1 pl-2 border-l border-slate-200">
            <button @click="startEdit(item)" class="text-slate-600 hover:text-blue-600 p-1.5 transition"><i class="fas fa-edit text-xs"></i></button>
            <button @click="deleteItem(item)" class="text-slate-600 hover:text-red-500 p-1.5 transition"><i class="fas fa-trash-alt text-xs"></i></button>
        </div>
    </div>
</td>
                    </tr>
                </tbody>
                
                <tbody v-if="paginatedGroupedItems.length === 0">
                    <tr>
                        <td colspan="5" class="p-8 text-center text-slate-600">กำลังโหลด หรือ ไม่พบข้อมูลวัตถุดิบ...</td>
                    </tr>
                </tbody>
            </table>

            <div v-if="totalStockPages > 1" class="flex flex-col sm:flex-row justify-between items-center mt-4 border-t pt-4 pb-6 px-6">
                <div class="text-sm font-bold text-slate-500 mb-4 sm:mb-0">
                    แสดงรายการที่ {{ ((currentPage - 1) * itemsPerPage) + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, totalStockItems) }} จากทั้งหมด {{ totalStockItems }} รายการ
                </div>
                <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button @click="currentPage--" :disabled="currentPage === 1" class="px-5 py-2 bg-white hover:bg-slate-50 disabled:bg-transparent disabled:opacity-40 text-slate-700 font-bold rounded-xl transition shadow-sm disabled:shadow-none">
                        <i class="fas fa-chevron-left mr-1 text-xs"></i> ก่อนหน้า
                    </button>
                    <div class="flex items-center px-4 font-black text-slate-800 text-sm">
                        หน้า {{ currentPage }} / {{ totalStockPages }}
                    </div>
                    <button @click="currentPage++" :disabled="currentPage === totalStockPages" class="px-5 py-2 bg-white hover:bg-slate-50 disabled:bg-transparent disabled:opacity-40 text-slate-700 font-bold rounded-xl transition shadow-sm disabled:shadow-none">
                        ถัดไป <i class="fas fa-chevron-right ml-1 text-xs"></i>
                    </button>
                </div>
            </div>
            
        </div>

        <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white">
                <div class="bg-green-600 p-6 text-white text-lg font-bold uppercase tracking-tighter">
                    ลงทะเบียนวัตถุดิบใหม่
                </div>
                <div class="p-8 space-y-5">
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block tracking-widest">รหัสสินค้า (SKU)</label>
                            <input v-model="newItem.sku" type="text" placeholder="เช่น RM-001" class="w-full border-b-2 p-2 outline-none focus:border-green-600 font-bold text-lg transition text-orange-500">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block tracking-widest">ชื่อวัตถุดิบ</label>
                            <input v-model="newItem.name" type="text" placeholder="ระบุชื่อ..." class="w-full border-b-2 p-2 outline-none focus:border-green-600 font-bold text-lg transition">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block">หมวดหมู่</label>
                            <select v-model="newItem.cat" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกหมวดหมู่</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block">คู่ค้า</label>
                            <select v-model="newItem.supplier" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกคู่ค้า</option>
                                <option v-for="sup in suppliersData" :key="sup.id" :value="sup.name">{{ sup.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                         <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block">หน่วยนับ</label>
                            <select v-model="newItem.unit" class="w-full border-b-2 p-2 outline-none bg-white text-sm font-medium">
                                <option value="" disabled>เลือกหน่วย</option>
                                <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                            </select>
                        </div>
                         <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block font-normal text-left">ราคาทุน (บาท)</label>
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
                    <button @click="closeAddModal" class="flex-1 py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="addNewItem" class="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition text-sm uppercase">บันทึกเข้าคลัง</button>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white" v-if="editingItem">
                <div class="bg-blue-600 p-6 text-white text-lg font-bold uppercase tracking-tighter">
                    แก้ไขข้อมูลวัตถุดิบ
                </div>
                <div class="p-8 space-y-5">
                    <div class="grid grid-cols-2 gap-6 mb-2">
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block">รหัสสินค้า</label>
                            <input v-model="editingItem.sku" type="text" class="w-full border-b-2 p-2 outline-none focus:border-blue-600 font-bold text-lg text-orange-500">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block">ชื่อวัตถุดิบ</label>
                            <input v-model="editingItem.name" type="text" class="w-full border-b-2 p-2 outline-none focus:border-blue-600 font-bold text-lg">
                        </div>
                    </div>
                    
                    <div>
                        <label class="text-[10px] font-bold text-slate-600 uppercase mb-1 block">คู่ค้า</label>
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
                    <button @click="showEditModal = false; editingItem = null" class="flex-1 py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="saveEdit" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition text-sm uppercase">อัปเดตข้อมูล</button>
                </div>
            </div>
        </div>

        <div v-if="activeItem" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden text-center border-2 border-white animate-in zoom-in duration-200">
                <div :class="actionType === 'in' ? 'bg-blue-600' : 'bg-orange-600'" class="p-6 text-white text-xl font-black uppercase tracking-widest">
                    {{ actionType === 'in' ? 'รับเข้าวัตถุดิบ' : 'เบิกจ่ายวัตถุดิบ' }}
                </div>
                <div class="p-10 text-center">
                    <div class="text-orange-500 font-black text-xs">{{ activeItem.sku }}</div>
                    <div class="text-slate-700 mb-4 font-bold text-lg uppercase tracking-tighter">{{ activeItem.name }}</div>
                    <div class="flex items-center justify-center gap-2">
                        <button @click="actionQty > 0 ? actionQty-- : null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg">-</button>
                        <input v-model.number="actionQty" type="number" class="w-24 text-center text-5xl font-black border-b-4 border-slate-100 py-2 outline-none focus:border-slate-300 font-mono" placeholder="0">
                        <button @click="actionQty++" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg">+</button>
                    </div>
                </div>
                 <div v-if="actionType === 'out'" class="px-10 pb-6">
        <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2 text-left">ระบุรายละเอียด/เหตุผลการเบิก</label>
        <textarea v-model="actionNote" 
                  placeholder="เช่น เบิกไปใช้ในครัว, ของจัดเลี้ยง ฯลฯ"
                  class="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-orange-500 text-sm font-medium resize-none"
                  rows="2"></textarea>
                </div>
                <div class="p-6 flex gap-3 bg-slate-50">
                    <button @click="activeItem = null" class="flex-1 py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="confirmAction" class="flex-1 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black transition text-sm uppercase tracking-widest">ตกลง</button>
                </div>
            </div>
        </div>
        
        <div v-if="showCatModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white flex flex-col max-h-[85vh]">
                <div class="bg-slate-800 p-6 text-white text-lg font-bold flex justify-between items-center uppercase">
                    <span><i class="fas fa-tags mr-2"></i> จัดการหมวดหมู่</span>
                    <button @click="showCatModal = false" class="text-slate-400 hover:text-white hover:rotate-90 transition text-2xl leading-none">&times;</button>
                </div>
                
                <div class="p-6 bg-slate-50 border-b flex gap-2">
                    <input v-model="newCatName" @keyup.enter="saveCategory" type="text" placeholder="พิมพ์ชื่อหมวดหมู่ใหม่..." class="flex-1 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-slate-800 font-bold text-sm transition">
                    <button @click="saveCategory" class="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition shadow-md whitespace-nowrap"><i class="fas fa-plus mr-1"></i> เพิ่ม</button>
                </div>

                <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <ul class="space-y-3">
                        <li v-for="(cat, index) in categories" :key="index" class="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow transition group">
                            <template v-if="editingCatIndex !== index">
                                <span class="font-bold text-slate-700 pl-2">{{ cat }}</span>
                                <div class="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="startEditCat(index, cat)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><i class="fas fa-edit text-xs"></i></button>
                                    <button @click="confirmDeleteSetting('cat', cat)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><i class="fas fa-trash-alt text-xs"></i></button>
                                </div>
                            </template>
                            <template v-else>
                                <input v-model="editingCatValue" @keyup.enter="saveEditCat(cat)" class="flex-1 border-b-2 border-blue-500 bg-blue-50 p-1 pl-2 outline-none font-bold text-blue-800 text-sm mr-2" autofocus>
                                <div class="flex gap-1">
                                    <button @click="saveEditCat(cat)" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center"><i class="fas fa-check text-xs"></i></button>
                                    <button @click="editingCatIndex = null" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-500 hover:text-white transition flex items-center justify-center"><i class="fas fa-times text-xs"></i></button>
                                </div>
                            </template>
                        </li>
                        <li v-if="categories.length === 0" class="text-center text-slate-400 font-bold py-6">ยังไม่มีข้อมูลหมวดหมู่</li>
                    </ul>
                </div>
            </div>
        </div>

        <div v-if="showUnitModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white flex flex-col max-h-[85vh]">
                <div class="bg-slate-800 p-6 text-white text-lg font-bold flex justify-between items-center uppercase">
                    <span><i class="fas fa-balance-scale mr-2"></i> จัดการหน่วยนับ</span>
                    <button @click="showUnitModal = false" class="text-slate-400 hover:text-white hover:rotate-90 transition text-2xl leading-none">&times;</button>
                </div>
                
                <div class="p-6 bg-slate-50 border-b flex gap-2">
                    <input v-model="newUnitName" @keyup.enter="saveUnit" type="text" placeholder="พิมพ์หน่วยนับใหม่..." class="flex-1 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-slate-800 font-bold text-sm transition">
                    <button @click="saveUnit" class="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition shadow-md whitespace-nowrap"><i class="fas fa-plus mr-1"></i> เพิ่ม</button>
                </div>

                <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <ul class="space-y-3">
                        <li v-for="(u, index) in units" :key="index" class="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow transition group">
                            <template v-if="editingUnitIndex !== index">
                                <span class="font-bold text-slate-700 pl-2">{{ u }}</span>
                                <div class="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click="startEditUnit(index, u)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><i class="fas fa-edit text-xs"></i></button>
                                    <button @click="confirmDeleteSetting('unit', u)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><i class="fas fa-trash-alt text-xs"></i></button>
                                </div>
                            </template>
                            <template v-else>
                                <input v-model="editingUnitValue" @keyup.enter="saveEditUnit(u)" class="flex-1 border-b-2 border-blue-500 bg-blue-50 p-1 pl-2 outline-none font-bold text-blue-800 text-sm mr-2" autofocus>
                                <div class="flex gap-1">
                                    <button @click="saveEditUnit(u)" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center"><i class="fas fa-check text-xs"></i></button>
                                    <button @click="editingUnitIndex = null" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-500 hover:text-white transition flex items-center justify-center"><i class="fas fa-times text-xs"></i></button>
                                </div>
                            </template>
                        </li>
                        <li v-if="units.length === 0" class="text-center text-slate-400 font-bold py-6">ยังไม่มีข้อมูลหน่วยนับ</li>
                    </ul>
                </div>
            </div>
        </div>

        <div v-if="settingToDelete.show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-red-50">
                <div class="bg-red-600 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase tracking-tighter">ยืนยันการลบ?</h3>
                </div>
                <div class="p-8 text-center">
                    <p class="text-slate-700 text-sm mb-2">คุณต้องการลบข้อมูลนี้ใช่หรือไม่?</p>
                    <div class="text-2xl font-bold text-red-600 mb-4 border-2 border-red-100 bg-red-50 py-2 rounded-xl">{{ settingToDelete.name }}</div>
                    
                    <div class="bg-orange-50 text-orange-600 text-xs font-bold py-3 px-4 rounded-xl inline-block text-left leading-relaxed">
                        ⚠️ <span class="underline">ผลกระทบ : </span> หากวัตถุดิบใดกำลังใช้งานข้อมูลนี้อยู่ ระบบจะปรับให้เป็นค่า <b>"ไม่ระบุ"</b> โดยอัตโนมัติ
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="settingToDelete.show = false" class="flex-1 py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="executeDeleteSetting" class="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition text-sm uppercase tracking-widest">ยืนยันลบ</button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-red-50">
                <div class="bg-red-600 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase tracking-tighter">ยืนยันการนำออก?</h3>
                </div>
                <div class="p-8 text-center">
                    <p class="text-slate-700 text-sm mb-1">คุณต้องการลบวัตถุดิบ:</p>
                    <div class="text-2xl font-bold text-slate-800 mb-2">{{ itemToDelete?.name }}</div>
                    <div class="bg-orange-50 text-orange-600 text-[10px] font-bold py-2 px-4 rounded-xl inline-block uppercase tracking-widest">
                        ข้อมูลที่ถูกลบจะหายไปจากระบบ
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="showDeleteModal = false; itemToDelete = null" class="flex-1 py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="confirmDelete" class="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition text-sm uppercase tracking-widest">ยืนยันนำออก</button>
                </div>
            </div>
        </div>

        <div v-if="alertModal.show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in duration-200">
                <div class="bg-amber-500 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-circle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-black uppercase">{{ alertModal.title }}</h3>
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
    // 1. ตัวเดิม: กรองและจัดกลุ่มทั้งหมด
    filteredAndGroupedItems() {
      const filtered = this.stockData.filter((i) => {
        const matchNameOrSku =
          (i.name || "").toLowerCase().includes(this.search.toLowerCase()) ||
          (i.sku || "").toLowerCase().includes(this.search.toLowerCase());
        const matchCat = this.filterCat === "" || i.cat === this.filterCat;
        return matchNameOrSku && matchCat;
      });

      const groups = {};
      filtered.forEach((item) => {
        const cat = item.cat || item.type || "ทั่วไป (ไม่ระบุหมวด)";
        if (!groups[cat]) {
          groups[cat] = { name: cat, items: [] };
        }
        groups[cat].items.push(item);
      });

      const sorted = Object.values(groups).sort((a, b) =>
        a.name.localeCompare(b.name, "th"),
      );
      sorted.forEach((g) =>
        g.items.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "th"),
        ),
      );
      return sorted;
    },

    // 2. [เพิ่มใหม่] นับจำนวนรายการทั้งหมดที่ค้นหาเจอ
    totalStockItems() {
      let count = 0;
      this.filteredAndGroupedItems.forEach((g) => (count += g.items.length));
      return count;
    },

    // 3. [เพิ่มใหม่] คำนวณว่ามีทั้งหมดกี่หน้า
    totalStockPages() {
      return Math.ceil(this.totalStockItems / this.itemsPerPage) || 1;
    },

    // 4. [เพิ่มใหม่] ตัวนี้คือตัวที่จะส่งไปโชว์ใน HTML (ตัดมาแค่ 20 รายการ)
    paginatedGroupedItems() {
      let startIndex = (this.currentPage - 1) * this.itemsPerPage;
      let endIndex = startIndex + this.itemsPerPage;
      let currentIndex = 0;
      let result = [];

      this.filteredAndGroupedItems.forEach((group) => {
        let itemsInPage = [];
        group.items.forEach((item) => {
          // เช็คว่ารายการนี้อยู่ในช่วงหน้าที่เรากำลังดูอยู่ไหม
          if (currentIndex >= startIndex && currentIndex < endIndex) {
            itemsInPage.push(item);
          }
          currentIndex++;
        });

        if (itemsInPage.length > 0) {
          result.push({ ...group, items: itemsInPage });
        }
      });
      return result;
    },
  },
  mounted() {
    db.collection("inventory").onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.active !== false) {
          items.push({ id: doc.id, ...data });
        }
      });
      this.stockData = items;
    });

    db.collection("suppliers").onSnapshot((querySnapshot) => {
      const sups = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.active !== false) {
          sups.push({ id: doc.id, ...data });
        }
      });
      this.suppliersData = sups;
    });
  },
  methods: {
    triggerAlert(title, message) {
      this.alertModal = { show: true, title, message };
    },

    logActivity(action, details) {
      const userEmail = firebase.auth().currentUser?.email || "System";
      db.collection("activity_logs")
        .add({
          userEmail: userEmail,
          module: "สต๊อกสินค้า",
          action: action,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch((err) => console.error("Log Error:", err));
    },

    openAddModal() {
      this.newItem = {
        sku: "",
        name: "",
        cat: "",
        supplier: "",
        qty: 0,
        min: 0,
        unit: "",
        price: 0,
      };
      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
      this.newItem = {
        sku: "",
        name: "",
        cat: "",
        supplier: "",
        qty: 0,
        min: 0,
        unit: "",
        price: 0,
      };
    },

    addNewItem() {
      if (this.userRole !== "Admin") return;

      // 1. ตรวจสอบค่าว่างพื้นฐาน
      if (!this.newItem.name || !this.newItem.cat || !this.newItem.unit) {
        return this.triggerAlert(
          "ข้อมูลไม่ครบถ้วน",
          "กรุณาระบุข้อมูลให้ครบถ้วน (ชื่อ, หมวดหมู่ และหน่วยนับ)",
        );
      }

      // 2. [เพิ่มใหม่] ดักรหัสสินค้า (SKU) ซ้ำ
      if (this.newItem.sku) {
        const isDuplicate = this.stockData.some(
          (item) =>
            item.sku.toLowerCase().trim() ===
            this.newItem.sku.toLowerCase().trim(),
        );

        if (isDuplicate) {
          return this.triggerAlert(
            "รหัสสินค้าซ้ำ",
            `รหัส SKU "${this.newItem.sku}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`,
          );
        }
      }

      // 3. บันทึกข้อมูล (Logic เดิมของน้อง)
      const itemToSave = { ...this.newItem, active: true };

      db.collection("inventory")
        .add(itemToSave)
        .then(() => {
          const codeInfo = this.newItem.sku ? `[${this.newItem.sku}] ` : "";
          this.logActivity(
            "CREATE",
            `เพิ่มวัตถุดิบใหม่: ${codeInfo}${this.newItem.name}`,
          );
          this.closeAddModal();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
          this.triggerAlert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
        });
    },

    startEdit(item) {
      if (this.userRole !== "Admin") return;
      this.editingItem = JSON.parse(JSON.stringify(item));
      this.showEditModal = true;
    },

    saveEdit() {
      if (this.userRole !== "Admin") return;

      const updateData = { ...this.editingItem };
      delete updateData.id;

      db.collection("inventory")
        .doc(this.editingItem.id)
        .update(updateData)
        .then(() => {
          this.logActivity("UPDATE", `แก้ไขข้อมูลวัตถุดิบ: ${updateData.name}`);
          this.showEditModal = false;
          this.editingItem = null;
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    },

    deleteItem(item) {
      if (this.userRole !== "Admin") return;
      this.itemToDelete = item;
      this.showDeleteModal = true;
    },

    confirmDelete() {
      if (this.userRole !== "Admin") return;
      if (!this.itemToDelete) return;

      db.collection("inventory")
        .doc(this.itemToDelete.id)
        .update({ active: false })
        .then(() => {
          this.logActivity(
            "DELETE",
            `นำวัตถุดิบออกจากระบบ: ${this.itemToDelete.name}`,
          );
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
        return this.triggerAlert(
          "จำนวนไม่ถูกต้อง",
          "กรุณาระบุจำนวนที่มากกว่า 0",
        );
      }

      if (this.actionType === "out" && !this.actionNote.trim()) {
        return this.triggerAlert(
          "ข้อมูลไม่ครบ",
          "กรุณาระบุเหตุผลหรือรายละเอียดการเบิกออก",
        );
      }

      let newQty = this.activeItem.qty;
      if (this.actionType === "in") {
        newQty += this.actionQty;
      } else {
        if (newQty < this.actionQty) {
          return this.triggerAlert(
            "สต๊อกไม่พอ",
            "จำนวนวัตถุดิบในคลังมีไม่เพียงพอสำหรับการเบิกออก",
          );
        }
        newQty -= this.actionQty;
      }

      const newHistory = {
        date: new Date().toISOString(),
        type: this.actionType,
        qty: this.actionQty,
        note: this.actionNote.trim() || "-",
        user: firebase.auth().currentUser?.email || "System",
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
          const detailText = this.actionNote
            ? ` (เหตุผล: ${this.actionNote})`
            : "";

          this.logActivity(
            "UPDATE",
            `${actionText}สต๊อก: ${this.activeItem.name} จำนวน ${this.actionQty} ${this.activeItem.unit}${detailText}`,
          );
          this.activeItem = null;
          this.actionNote = "";
        })
        .catch((error) => {
          console.error("Error updating stock: ", error);
          alert("เกิดข้อผิดพลาดในการอัปเดตสต๊อก");
        });
    },

    openCatManager() {
      if (this.userRole !== "Admin") return;
      this.newCatName = "";
      this.editingCatIndex = null;
      this.showCatModal = true;
    },

    openUnitManager() {
      if (this.userRole !== "Admin") return;
      this.newUnitName = "";
      this.editingUnitIndex = null;
      this.showUnitModal = true;
    },

    saveCategory() {
      if (this.userRole !== "Admin") return;
      const val = this.newCatName.trim();
      if (!val) {
        return this.triggerAlert(
          "ข้อมูลไม่ครบถ้วน",
          "กรุณาระบุชื่อหมวดหมู่ที่ต้องการเพิ่ม",
        );
      }

      if (this.categories.includes(val)) {
        return this.triggerAlert("ข้อมูลซ้ำ", "มีชื่อหมวดหมู่นี้ในระบบแล้ว");
      }

      this.$emit("add-category", val);
      this.logActivity("CREATE", `เพิ่มหมวดหมู่: ${val}`);
      this.newCatName = "";
    },

    saveUnit() {
      if (this.userRole !== "Admin") return;
      const val = this.newUnitName.trim();
      if (!val) {
        return this.triggerAlert(
          "ข้อมูลไม่ครบถ้วน",
          "กรุณาระบุชื่อหน่วยนับที่ต้องการเพิ่ม",
        );
      }
      if (this.units.includes(val)) {
        return this.triggerAlert("ข้อมูลซ้ำ", "มีชื่อหน่วยนับนี้ในระบบแล้ว");
      }
      this.$emit("add-unit", val);
      this.logActivity("CREATE", `เพิ่มหน่วยนับ: ${val}`);
      this.newUnitName = "";
    },

    startEditCat(index, name) {
      this.editingCatIndex = index;
      this.editingCatValue = name;
    },
    saveEditCat(oldName) {
      const newName = this.editingCatValue.trim();
      if (!newName || newName === oldName) {
        this.editingCatIndex = null;
        return;
      }

      this.$emit("edit-category", { old: oldName, new: newName });

      const batch = db.batch();
      this.stockData.forEach((item) => {
        if (item.cat === oldName) {
          const ref = db.collection("inventory").doc(item.id);
          batch.update(ref, { cat: newName });
        }
      });
      batch.commit();

      this.logActivity(
        "UPDATE",
        `เปลี่ยนชื่อหมวดหมู่: ${oldName} เป็น ${newName}`,
      );
      this.editingCatIndex = null;
    },

    startEditUnit(index, name) {
      this.editingUnitIndex = index;
      this.editingUnitValue = name;
    },
    saveEditUnit(oldName) {
      const newName = this.editingUnitValue.trim();
      if (!newName || newName === oldName) {
        this.editingUnitIndex = null;
        return;
      }

      this.$emit("edit-unit", { old: oldName, new: newName });

      const batch = db.batch();
      this.stockData.forEach((item) => {
        if (item.unit === oldName) {
          const ref = db.collection("inventory").doc(item.id);
          batch.update(ref, { unit: newName });
        }
      });
      batch.commit();

      this.logActivity(
        "UPDATE",
        `เปลี่ยนชื่อหน่วยนับ: ${oldName} เป็น ${newName}`,
      );
      this.editingUnitIndex = null;
    },

    confirmDeleteSetting(type, name) {
      this.settingToDelete = { show: true, type: type, name: name };
    },

    executeDeleteSetting() {
      const type = this.settingToDelete.type;
      const name = this.settingToDelete.name;

      if (type === "cat") {
        this.$emit("delete-category", name);
        const batch = db.batch();
        this.stockData.forEach((item) => {
          if (item.cat === name) {
            const ref = db.collection("inventory").doc(item.id);
            batch.update(ref, { cat: "ทั่วไป (ไม่ระบุหมวด)" });
          }
        });
        batch.commit();
        this.logActivity("DELETE", `ลบหมวดหมู่: ${name}`);
      } else if (type === "unit") {
        this.$emit("delete-unit", name);
        const batch = db.batch();
        this.stockData.forEach((item) => {
          if (item.unit === name) {
            const ref = db.collection("inventory").doc(item.id);
            batch.update(ref, { unit: "-" });
          }
        });
        batch.commit();
        this.logActivity("DELETE", `ลบหน่วยนับ: ${name}`);
      }

      this.settingToDelete = { show: false, type: "", name: "" };
    },
  },
};
