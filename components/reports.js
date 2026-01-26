const ReportView = {
    props: ['stockData', 'wastageLogs'],
    template: `
    <section class="report-container">
        <div class="flex justify-between items-center mb-8 no-print">
            <h2 class="text-3xl font-bold text-slate-800">ศูนย์ออกรายงานระบบ MuKratha</h2>
            <button @click="printReport" class="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition flex items-center gap-2 shadow-lg">
                <i class="fas fa-print"></i> พิมพ์รายงาน/ส่งออก PDF
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                <p class="text-xs font-bold text-slate-400 uppercase mb-2">มูลค่าต้นทุนที่ใช้ไป (เบิกจ่าย)</p>
                <p class="text-4xl font-bold text-slate-900 font-mono">฿ {{ totalUsageCost.toLocaleString() }}</p>
                <p class="text-[10px] text-slate-400 mt-2">* คำนวณจากประวัติการเบิกออก x ราคาทุนที่บันทึกไว้</p>
            </div>
            <div class="bg-white p-6 rounded-3xl border-2 border-red-100 shadow-sm">
                <p class="text-xs font-bold text-red-400 uppercase mb-2">มูลค่าความเสียหาย (ของเสีย)</p>
                <p class="text-4xl font-bold text-red-600 font-mono">฿ {{ totalWasteCost.toLocaleString() }}</p>
                <p class="text-[10px] text-red-400 mt-2">* ข้อมูลจากหน้าบันทึกของเสีย</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 class="font-bold border-b pb-4 mb-4 text-slate-700 flex items-center gap-2">
                    <i class="fas fa-clipboard-list text-blue-500"></i> 1. รายงานวัตถุดิบคงเหลือปัจจุบัน
                </h3>
                <div class="overflow-hidden">
                    <table class="w-full text-sm">
                        <thead class="bg-slate-50 text-slate-500 uppercase text-[10px]">
                            <tr><th class="p-2 text-left">รายการ</th><th class="p-2 text-right">คงเหลือ</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in stockData" :key="item.id" class="border-b border-slate-50">
                                <td class="p-2">{{ item.name }}</td>
                                <td class="p-2 text-right font-bold">{{ item.qty }} {{ item.unit }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bg-white p-6 rounded-3xl border shadow-sm border-t-4 border-t-orange-500">
                <h3 class="font-bold border-b pb-4 mb-4 text-orange-600 flex items-center gap-2">
                    <i class="fas fa-shopping-cart"></i> 3. รายงานสั่งซื้อประจำวัน (ควรซื้อเพิ่ม)
                </h3>
                <div v-if="lowStock.length > 0" class="space-y-3">
                    <div v-for="item in lowStock" :key="item.id" class="flex justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <span class="font-bold">{{ item.name }}</span>
                        <span class="text-red-600 font-bold">ต้องซื้ออย่างน้อย {{ item.min - item.qty + 1 }} {{ item.unit }}</span>
                    </div>
                </div>
                <div v-else class="text-center py-10 text-slate-400 italic text-sm">คลังสินค้าปกติ ไม่ต้องสั่งซื้อเพิ่ม</div>
            </div>
        </div>

      <div class="mt-6 bg-white p-6 rounded-3xl border shadow-sm">
    <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2 mb-6 border-b pb-4 text-left w-full">
        <i class="fas fa-history text-green-500"></i> 
        2. รายงานความเคลื่อนไหวและประวัติ รับเข้า-เบิกออก
    </h3>
    
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="text-slate-400 border-b italic font-bold text-[10px] uppercase tracking-wider">
                    <th class="py-3 px-2 text-center w-1/4">วันที่</th>
                    <th class="py-3 px-2 text-center w-1/4">รายการ</th>
                    <th class="py-3 px-2 text-center w-1/4">ประเภท</th>
                    <th class="py-3 px-2 text-right w-1/4 pr-8">จำนวน</th>
                </tr>
            </thead>
            <tbody class="text-sm">
                <tr v-for="(log, idx) in recentHistory" :key="idx" class="border-b last:border-0 border-slate-50 hover:bg-slate-50 transition">
                    <td class="py-4 px-2 text-slate-400 text-[11px] font-mono text-center">
                        {{ log.date }}
                    </td>
                    <td class="py-4 px-2 font-bold text-slate-700 text-center">
                        {{ log.item }}
                    </td>
                    <td class="py-4 px-2 text-center">
                        <span :class="log.type === 'in' ? 'text-blue-600' : 'text-orange-600'" class="font-bold">
                            {{ log.type === 'in' ? 'รับเข้า' : 'เบิกออก' }}
                        </span>
                    </td>
                    <td class="py-4 px-2 text-right font-black text-xl pr-8" :class="log.type === 'in' ? 'text-blue-600' : 'text-orange-600'">
                        {{ log.type === 'in' ? '+' : '-' }} {{ log.qty }}
                    </td>
                </tr>
                <tr v-if="recentHistory.length === 0">
                    <td colspan="4" class="py-12 text-center text-slate-300 italic text-sm">
                        ยังไม่มีประวัติความเคลื่อนไหว
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

        <component is="style">
            @media print {
                .no-print { display: none !important; }
                body { background: white !important; }
                .report-container { padding: 0 !important; }
                .rounded-3xl { border-radius: 0 !important; border: 1px solid #eee !important; }
                .shadow-sm, .shadow-lg { shadow: none !important; }
            }
        </component>
    </section>
    `,
    computed: {
        totalWasteCost() { return this.wastageLogs.reduce((sum, item) => sum + (Number(item.cost) || 0), 0); },
        totalUsageCost() {
            let total = 0;
            this.stockData.forEach(item => {
                const totalOut = item.history.filter(h => h.type === 'out').reduce((sum, h) => sum + Number(h.qty), 0);
                total += (totalOut * (Number(item.price) || 0));
            });
            return total;
        },
        lowStock() { return this.stockData.filter(i => i.qty <= i.min); },
        recentHistory() {
            let logs = [];
            this.stockData.forEach(i => { i.history.forEach(h => logs.push({ ...h, item: i.name })); });
            return logs.sort((a,b) => new Date(b.date) - new Date(a.date));
        }
    },
    methods: {
        printReport() {
            window.print();
        }
    }
};