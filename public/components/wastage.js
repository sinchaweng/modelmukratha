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
                    <tr v-if="wastageLogs.length === 0">
                        <td colspan="5" class="p-10 text-center text-slate-400 font-bold">ยังไม่มีประวัติการบันทึกของเสีย</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
    `,
    data() {
        return {
            inventoryData: [], 
            wastageLogs: [],   
            form: { itemId: '', qty: '', reason: '' }
        }
    },
    computed: {
        formattedLogs() {
            return this.wastageLogs.map(log => {
                const dateObj = new Date(log.date);
                return {
                    ...log,
                    displayDate: dateObj.toLocaleString('th-TH', { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute:'2-digit' 
                    })
                };
            });
        }
    },
    mounted() {
        db.collection("inventory").onSnapshot(snapshot => {
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            this.inventoryData = items;
        });

        db.collection("wastage").orderBy("date", "desc").onSnapshot(snapshot => {
            const logs = [];
            snapshot.forEach(doc => {
                logs.push({ id: doc.id, ...doc.data() });
            });
            this.wastageLogs = logs;
        });
    },
    methods: {
        saveWastage() {
            if (!this.form.itemId || !this.form.qty || this.form.qty <= 0) {
                return alert('กรุณาเลือกวัตถุดิบและระบุจำนวนที่ถูกต้อง!');
            }
            
            // หาข้อมูลวัตถุดิบตัวที่เลือก
            const selectedItem = this.inventoryData.find(i => i.id === this.form.itemId);
            
            if (!selectedItem) return alert('ไม่พบข้อมูลวัตถุดิบในระบบ!');
            if (selectedItem.qty < this.form.qty) {
                return alert(`ไม่สามารถบันทึกได้! สต๊อกปัจจุบันมีเพียง ${selectedItem.qty} ${selectedItem.unit}`);
            }

            // ยืนยันก่อนบันทึก
            if (!confirm(`ยืนยันการบันทึกของเสีย: ${selectedItem.name} จำนวน ${this.form.qty} ${selectedItem.unit}?`)) {
                return;
            }

            const isoDate = new Date().toISOString();
            const damageCost = this.form.qty * (selectedItem.price || 0);

            // ข้อมูลที่จะบันทึกลงคอลเลกชัน Wastage
            const newLog = {
                itemName: selectedItem.name,
                qty: this.form.qty,
                unit: selectedItem.unit || '',
                reason: this.form.reason || 'ไม่ระบุสาเหตุ',
                cost: damageCost,
                date: isoDate
            };

            // ข้อมูลประวัติที่จะไปแทรกในหน้าคลังวัตถุดิบ (มองเป็นการเบิกออกประเภทหนึ่ง)
            const newHistory = {
                date: isoDate,
                type: 'out',
                qty: this.form.qty,
                note: 'Wastage: ' + (this.form.reason || 'ของเสีย')
            };
            const updatedHistory = [newHistory, ...(selectedItem.history || [])];

            // --- เริ่มบันทึกข้อมูล 2 ที่พร้อมกัน ---
            // 1. บันทึกลง Wastage
            db.collection("wastage").add(newLog)
            .then(() => {
                // 2. ไปตัดสต๊อกและอัปเดตประวัติใน Inventory
                return db.collection("inventory").doc(selectedItem.id).update({
                    qty: selectedItem.qty - this.form.qty,
                    history: updatedHistory
                });
            })
            .then(() => {
                alert('บันทึกของเสียและระบบทำการตัดสต๊อกเรียบร้อยแล้ว');
                this.form = { itemId: '', qty: '', reason: '' }; // ล้างฟอร์ม
            })
            .catch(error => {
                console.error("Error saving wastage:", error);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
            });
        }
    }
};