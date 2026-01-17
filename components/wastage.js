const WastageView = {
    props: ['stockData', 'wastageLogs'],
    template: `
    <section>
        <h2 class="text-3xl font-bold text-slate-800 mb-8">จัดการของเสีย/ความเสียหาย</h2>
        
        <div class="bg-white p-8 rounded-3xl shadow-sm border mb-8">
            <h3 class="font-bold text-slate-700 mb-6 italic">บันทึกของเสียใหม่</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select v-model="form.itemName" class="p-3 border rounded-xl outline-none">
                    <option value="">เลือกวัตถุดิบ</option>
                    <option v-for="item in stockData" :value="item.name">{{ item.name }}</option>
                </select>
                <input v-model.number="form.qty" type="number" placeholder="จำนวน" class="p-3 border rounded-xl outline-none">
                <input v-model="form.reason" type="text" placeholder="สาเหตุ (เช่น เน่าเสีย)" class="p-3 border rounded-xl outline-none">
                <button @click="saveWastage" class="bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">บันทึกความเสียหาย</button>
            </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                        <th class="p-4">วันที่</th>
                        <th class="p-4">รายการ</th>
                        <th class="p-4">จำนวน</th>
                        <th class="p-4">สาเหตุ</th>
                        <th class="p-4 text-right">มูลค่าเสียหาย</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in wastageLogs" :key="log.id" class="border-b">
                        <td class="p-4 text-sm">{{ log.date }}</td>
                        <td class="p-4 font-bold">{{ log.itemName }}</td>
                        <td class="p-4">{{ log.qty }} {{ log.unit }}</td>
                        <td class="p-4"><span class="text-red-500 text-sm">● {{ log.reason }}</span></td>
                        <td class="p-4 text-right font-bold text-red-600">฿ {{ log.cost }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
    `,
    data() {
        return {
            form: { itemName: '', qty: 0, reason: '' }
        }
    },
    methods: {
        saveWastage() {
            if (!this.form.itemName || this.form.qty <= 0) return alert('กรุณาระบุข้อมูล!');
            
            // จำลองการบันทึก
            const newLog = {
                id: Date.now(),
                itemName: this.form.itemName,
                qty: this.form.qty,
                unit: 'กก.',
                reason: this.form.reason,
                cost: this.form.qty * 150, // สมมติราคาเฉลี่ย
                date: new Date().toISOString().split('T')[0]
            };
            this.wastageLogs.unshift(newLog);
            
            // ตัดสต็อกจริง
            const item = this.stockData.find(i => i.name === this.form.itemName);
            if(item) item.qty -= this.form.qty;

            this.form = { itemName: '', qty: 0, reason: '' };
            alert('บันทึกของเสียเรียบร้อย (ระบบตัดสต็อกอัตโนมัติ)');
        }
    }
};