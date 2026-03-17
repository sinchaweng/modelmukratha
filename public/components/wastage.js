const WastageView = {
  template: `
    <section class="animate-in fade-in duration-500">
        <h2 class="text-3xl font-bold text-slate-800 mb-8">บันทึกของเสีย</h2>
        
        <div class="bg-white p-8 rounded-3xl shadow-sm border mb-8">
            <h3 class="font-bold text-slate-700 mb-6 italic"><i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>บันทึกของเสียใหม่</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div class="relative w-full">
                    <input 
                        v-model="searchQuery" 
                        @focus="showDropdown = true" 
                        @blur="showDropdown = false" 
                        type="text" 
                        placeholder="ชื่อหรือรหัสวัตถุดิบ" 
                        class="w-full p-3 border rounded-xl outline-none focus:border-red-500 font-bold text-slate-700 bg-white transition"
                    >
                    <ul v-if="showDropdown && filteredInventoryForSearch.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                        <li v-for="item in filteredInventoryForSearch" :key="item.id" 
                            @mousedown.prevent="selectItem(item)"
                            class="p-3 border-b last:border-none cursor-pointer hover:bg-red-50 transition text-left"
                        >
                            <div class="font-bold text-slate-800 text-sm">{{ item.name }}</div>
                            <div class="text-[10px] text-slate-500 font-bold mt-0.5">
                                คงเหลือ: <span :class="item.qty <= 0 ? 'text-red-500' : 'text-emerald-600'">{{ item.qty }}</span> {{ item.unit }}
                            </div>
                        </li>
                    </ul>
                    <div v-if="showDropdown && filteredInventoryForSearch.length === 0" class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-center text-slate-500 text-sm font-bold">
                        ไม่พบวัตถุดิบที่ค้นหา
                    </div>
                </div>

                <input v-model.number="form.qty" type="number" placeholder="จำนวนที่เสีย" class="p-3 border rounded-xl outline-none focus:border-red-500 font-bold text-slate-700">
                
                <input v-model="form.reason" type="text" placeholder="สาเหตุ (เช่น หมดอายุ, เน่าเสีย)" class="p-3 border rounded-xl outline-none focus:border-red-500 font-bold text-slate-700">
                
                <button @click="saveWastage" class="bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2">
                    <i class="fas fa-save"></i> บันทึกและตัดสต็อก
                </button>
            </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                        <th class="p-5">วัน-เวลาที่บันทึก</th>
                        <th class="p-5">รายการวัตถุดิบ</th>
                        <th class="p-5">จำนวนที่เสีย</th>
                        <th class="p-5">สาเหตุ</th>
                        <th class="p-5 text-right">มูลค่าความเสียหาย</th>
                        <th class="p-5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in formattedLogs" :key="log.id" class="border-b hover:bg-red-50/50 transition">
                        <td class="p-5 text-sm text-slate-500 font-mono">{{ log.displayDate }}</td>
                        <td class="p-5 font-bold text-slate-800">{{ log.itemName }}</td>
                        <td class="p-5 font-bold text-red-600">{{ log.qty }} <span class="text-xs font-normal text-slate-400">{{ log.unit }}</span></td>
                        <td class="p-5"><span class="text-slate-600 text-sm"><i class="fas fa-info-circle text-red-400 mr-1"></i>{{ log.reason }}</span></td>
                        <td class="p-5 text-right font-black text-red-600">฿ {{ (log.cost || 0).toLocaleString() }}</td>
                        <td class="p-5 text-center">
                            <button @click="removeLog(log)" class="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="formattedLogs.length === 0">
                        <td colspan="6" class="p-10 text-center text-slate-400 font-bold">ยังไม่มีประวัติการบันทึกของเสีย</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showConfirmModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-red-50">
                <div class="bg-red-600 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase tracking-tighter">ยืนยันการตัดสต็อกเสีย</h3>
                </div>
                
                <div class="p-8 text-center" v-if="pendingData">
                    <p class="text-slate-500 text-sm mb-1">วัตถุดิบที่เสียหาย:</p>
                    <div class="text-2xl font-bold text-slate-800 mb-2">{{ pendingData.itemName }}</div>
                    <div class="bg-red-50 text-red-600 text-[10px] font-bold py-2 px-4 rounded-xl inline-block uppercase tracking-widest">
                        จำนวน {{ pendingData.qty }} {{ pendingData.unit }} มูลค่า ฿{{ pendingData.cost.toLocaleString() }}
                    </div>
                </div>

                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="showConfirmModal = false" class="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition">ยกเลิก</button>
                    <button @click="executeSave" class="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition text-xs uppercase tracking-widest">ยืนยัน</button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border-2 border-red-50">
                <div class="bg-red-600 p-6 text-white text-center relative">
                    <button @click="showDeleteModal = false; itemToDelete = null" class="absolute top-4 right-6 text-white hover:rotate-90 transition text-2xl leading-none">&times;</button>
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase tracking-tighter">ยกเลิกรายการนี้?</h3>
                </div>
                <div class="p-8 text-center" v-if="itemToDelete">
                    <p class="text-slate-500 text-sm mb-1">ต้องการยกเลิกประวัติของเสีย:</p>
                    <div class="text-xl font-bold text-slate-800 mb-2">{{ itemToDelete.itemName }} ({{ itemToDelete.qty }} {{ itemToDelete.unit }})</div>
                    <div class="bg-orange-50 text-orange-600 text-[10px] font-bold py-2 px-4 rounded-xl inline-block uppercase tracking-widest mb-4">
                        ระบบจะทำการคืนสต๊อกกลับเข้าคลังให้โดยอัตโนมัติ
                    </div>
                    
                    <div class="text-left mt-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ระบุเหตุผลที่ยกเลิก <span class="text-red-500">*</span></label>
                        <input v-model="deleteReason" @keyup.enter="confirmDelete" type="text" placeholder="เช่น บันทึกผิด, ใส่จำนวนผิด..." class="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-red-500 text-sm transition font-medium text-slate-700 bg-slate-50">
                    </div>
                </div>
                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="showDeleteModal = false; itemToDelete = null" class="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition">ปิด</button>
                    <button @click="confirmDelete" class="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition text-xs uppercase tracking-widest">ยืนยันการยกเลิก</button>
                </div>
            </div>
        </div>

        <div v-if="showErrorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in duration-200">
                <div class="bg-amber-500 p-6 text-white text-center relative">
                    <button @click="showErrorModal = false" class="absolute top-4 right-6 text-white hover:rotate-90 transition text-2xl leading-none">&times;</button>
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-circle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-black uppercase">แจ้งเตือนจากระบบ</h3>
                </div>
                <div class="p-6 text-center text-slate-600 font-medium">
                    {{ errorMessage }}
                </div>
                <div class="p-4 bg-slate-50">
                    <button @click="showErrorModal = false" class="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl">เข้าใจแล้ว</button>
                </div>
            </div>
        </div>
    </section>
  `,
  data() {
    return {
      inventoryData: [],
      wastageLogs: [],
      form: { itemId: "", qty: "", reason: "" },
      showConfirmModal: false,
      pendingData: null,
      showErrorModal: false,
      errorMessage: "",
      showDeleteModal: false,
      itemToDelete: null,
      deleteReason: "", 
      searchQuery: "",
      showDropdown: false,
    };
  },
  watch: {
    searchQuery(newVal) {
        if (!newVal) {
            this.form.itemId = "";
        }
    }
  },
  computed: {
    activeInventory() {
      return this.inventoryData.filter(item => item.active !== false);
    },
    filteredInventoryForSearch() {
        if (!this.searchQuery) return this.activeInventory;
        
        const query = this.searchQuery.toLowerCase();
        return this.activeInventory.filter(item => 
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.sku && item.sku.toLowerCase().includes(query))
        );
    },

    formattedLogs() {
      return this.wastageLogs
        .filter(log => log.active !== false)
        .map((log) => {
          const dateObj = new Date(log.date);
          return {
            ...log,
            displayDate: dateObj.toLocaleString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
      });
    },
  },
  mounted() {
    db.collection("inventory").onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      this.inventoryData = items.sort((a,b) => (a.name||'').localeCompare(b.name||'','th'));
    });

    db.collection("wastage")
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
        const logs = [];
        snapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        this.wastageLogs = logs;
      });
  },
  methods: {
    selectItem(item) {
        this.form.itemId = item.id;
        // โชว์ชื่อวัตถุดิบในช่องค้นหาให้ชัดเจน
        this.searchQuery = `${item.name}`;
        this.showDropdown = false;
    },

    logActivity(action, details) {
      const userEmail = firebase.auth().currentUser?.email || 'System';
      db.collection("activity_logs").add({
          userEmail: userEmail,
          module: 'ของเสีย',
          action: action,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.error("Log Error:", err));
    },

    saveWastage() {
      // ดักเคสว่าถ้ายังไม่เลือกวัตถุดิบ (ไม่มี itemId)
      if (!this.form.itemId || !this.form.qty || this.form.qty <= 0) {
        this.errorMessage = "กรุณาระบุข้อมูลให้ครบถ้วน และเลือกวัตถุดิบจากรายชื่อ";
        this.showErrorModal = true;
        return;
      }

      const selectedItem = this.inventoryData.find(i => i.id === this.form.itemId);
      if (!selectedItem) {
        this.errorMessage = "ไม่พบวัตถุดิบนี้ในระบบ กรุณาค้นหาใหม่"; 
        this.showErrorModal = true;
        return;
      }

      if (selectedItem.qty < this.form.qty) {
        this.errorMessage = "จำนวนในสต๊อกมีไม่เพียงพอสำหรับการตัดของเสีย"; 
        this.showErrorModal = true;
        return;
      }

      this.pendingData = {
        id: selectedItem.id,
        itemName: selectedItem.name,
        qty: this.form.qty,
        unit: selectedItem.unit || "",
        reason: this.form.reason || "ไม่ระบุสาเหตุ",
        cost: this.form.qty * (selectedItem.price || 0),
        currentQty: selectedItem.qty,
        history: selectedItem.history || [],
      };
      this.showConfirmModal = true;
    },

    executeSave() {
      const data = this.pendingData;
      const isoDate = new Date().toISOString();

      const newLog = {
        itemId: data.id, 
        itemName: data.itemName,
        qty: data.qty,
        unit: data.unit,
        reason: data.reason,
        cost: data.cost,
        date: isoDate,
        active: true 
      };

      const newHistory = {
        date: isoDate,
        type: "out",
        qty: data.qty,
        note: "Wastage: " + data.reason,
      };
      const updatedHistory = [newHistory, ...data.history];

      this.showConfirmModal = false;

      db.collection("wastage")
        .add(newLog)
        .then(() => {
          return db
            .collection("inventory")
            .doc(data.id)
            .update({
              qty: data.currentQty - data.qty,
              history: updatedHistory,
            });
        })
        .then(() => {
          this.logActivity('CREATE', `บันทึกของเสีย: ${data.itemName} จำนวน ${data.qty} ${data.unit}`);
          this.form = { itemId: "", qty: "", reason: "" };
          this.searchQuery = ""; 
          this.pendingData = null;
        })
        .catch((error) => {
          console.error("Error:", error);
          this.errorMessage = "เกิดข้อผิดพลาด: " + error.message;
          this.showErrorModal = true;
        });
    },

    removeLog(log) {
      this.itemToDelete = log;
      this.deleteReason = ""; 
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      if (!this.itemToDelete) return;
      
      if (!this.deleteReason.trim()) {
        this.errorMessage = "กรุณาระบุเหตุผลที่ต้องการยกเลิกรายการนี้";
        this.showErrorModal = true;
        return;
      }
      
      try {
        await db.collection("wastage").doc(this.itemToDelete.id).update({ 
          active: false,
          voidReason: this.deleteReason.trim()
        });

        let invRef = null;
        let invData = null;

        if (this.itemToDelete.itemId) {
            const doc = await db.collection("inventory").doc(this.itemToDelete.itemId).get();
            if (doc.exists) {
                invRef = doc.ref;
                invData = doc.data();
            }
        }

        if (!invRef) {
            const snapshot = await db.collection("inventory").where("name", "==", this.itemToDelete.itemName).get();
            if (!snapshot.empty) {
                invRef = snapshot.docs[0].ref;
                invData = snapshot.docs[0].data();
            }
        }

        if (invRef && invData) {
            const isoDate = new Date().toISOString();
            const refundHistory = {
                date: isoDate,
                type: "in",
                qty: this.itemToDelete.qty,
                note: "ยกเลิกบันทึกของเสีย: " + this.deleteReason.trim(),
            };
            
            const updatedHistory = [refundHistory, ...(invData.history || [])];

            await invRef.update({
                qty: Number(invData.qty) + Number(this.itemToDelete.qty),
                history: updatedHistory
            });
        }

        this.logActivity('DELETE', `ยกเลิกรายการของเสีย: ${this.itemToDelete.itemName} จำนวน ${this.itemToDelete.qty} ${this.itemToDelete.unit} | เหตุผล: ${this.deleteReason.trim()}`);
        
        this.showDeleteModal = false;
        this.itemToDelete = null;
        this.deleteReason = "";

      } catch (error) {
        console.error("Error hiding log: ", error);
        this.errorMessage = "เกิดข้อผิดพลาดในการยกเลิกและคืนสต๊อก";
        this.showErrorModal = true;
      }
    }
  },
};