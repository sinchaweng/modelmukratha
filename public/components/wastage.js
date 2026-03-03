const WastageView = {
  template: `
    <section class="animate-in fade-in duration-500">
        <h2 class="text-3xl font-bold text-slate-800 mb-8">จัดการของเสีย / ความเสียหาย</h2>
        
        <div class="bg-white p-8 rounded-3xl shadow-sm border mb-8">
            <h3 class="font-bold text-slate-700 mb-6 italic"><i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>บันทึกของเสียใหม่</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <select v-model="form.itemId" class="p-3 border rounded-xl outline-none focus:border-red-500 font-bold text-slate-700 bg-white">
                    <option value="" disabled>เลือกวัตถุดิบที่เสียหาย</option>
                    <option v-for="item in inventoryData" :key="item.id" :value="item.id">
                        {{ item.name }} (เหลือ {{ item.qty }} {{ item.unit }})
                    </option>
                </select>

                <input v-model.number="form.qty" type="number" placeholder="จำนวนที่เสีย" class="p-3 border rounded-xl outline-none focus:border-red-500">
                
                <input v-model="form.reason" type="text" placeholder="สาเหตุ (เช่น หมดอายุ, เน่าเสีย)" class="p-3 border rounded-xl outline-none focus:border-red-500">
                
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
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in formattedLogs" :key="log.id" class="border-b hover:bg-red-50/50 transition">
                        <td class="p-5 text-sm text-slate-500 font-mono">{{ log.displayDate }}</td>
                        <td class="p-5 font-bold text-slate-800">{{ log.itemName }}</td>
                        <td class="p-5 font-bold text-red-600">{{ log.qty }} <span class="text-xs font-normal text-slate-400">{{ log.unit }}</span></td>
                        <td class="p-5"><span class="text-slate-600 text-sm"><i class="fas fa-info-circle text-red-400 mr-1"></i>{{ log.reason }}</span></td>
                        <td class="p-5 text-right font-black text-red-600">฿ {{ (log.cost || 0).toLocaleString() }}</td>
                    </tr>
                    <tr v-if="formattedLogs.length === 0">
                        <td colspan="5" class="p-10 text-center text-slate-400 font-bold">ยังไม่มีประวัติการบันทึกของเสีย</td>
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
                    <h3 class="text-xl font-black uppercase italic tracking-tighter">ยืนยันการตัดสต็อกเสีย</h3>
                </div>
                
                <div class="p-8 text-center" v-if="pendingData">
                    <p class="text-slate-500 text-sm mb-1">วัตถุดิบที่เสียหาย:</p>
                    <div class="text-2xl font-bold text-slate-800 mb-2">{{ pendingData.itemName }}</div>
                    <div class="bg-red-50 text-red-600 text-[10px] font-bold py-2 px-4 rounded-xl inline-block uppercase tracking-widest">
                        ⚠️ จำนวน {{ pendingData.qty }} {{ pendingData.unit }} มูลค่า ฿{{ pendingData.cost.toLocaleString() }}
                    </div>
                </div>

                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="showConfirmModal = false" class="flex-1 py-3 font-bold text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition">ยกเลิก</button>
                    <button @click="executeSave" class="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition text-xs uppercase tracking-widest">ยืนยัน</button>
                </div>
            </div>
        </div>

        <div v-if="showErrorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in duration-200">
                <div class="bg-amber-500 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-exclamation-circle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-black uppercase italic">ข้อมูลไม่ครบถ้วน</h3>
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
    };
  },
  computed: {
    formattedLogs() {
      return this.wastageLogs.map((log) => {
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
      this.inventoryData = items;
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
      if (!this.form.itemId || !this.form.qty || this.form.qty <= 0) {
        this.errorMessage = "กรุณาระบุข้อมูลให้ครบถ้วน";
        this.showErrorModal = true;
        return;
      }

      const selectedItem = this.inventoryData.find(i => i.id === this.form.itemId);
      if (!selectedItem) return;

      if (selectedItem.qty < this.form.qty) {
        this.errorMessage = "สต๊อกมีไม่เพียงพอ"; 
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
        itemName: data.itemName,
        qty: data.qty,
        unit: data.unit,
        reason: data.reason,
        cost: data.cost,
        date: isoDate
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
          // บันทึก Log การกระทำลงในประวัติผู้ใช้งาน
          this.logActivity('CREATE', `บันทึกของเสีย: ${data.itemName} จำนวน ${data.qty} ${data.unit}`);
          
          this.form = { itemId: "", qty: "", reason: "" };
          this.pendingData = null;
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("เกิดข้อผิดพลาด: " + error.message);
        });
    }
  },
};