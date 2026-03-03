const ReportView = {
    data() {
        return {
            activeTab: 'stock',
            startDate: '',
            endDate: new Date().toISOString().split('T')[0],
            stockData: [],    
            wastageLogs: []   
        }
    },
    template: `
    <section class="w-full animate-in fade-in duration-500">
        
        <div class="flex justify-between items-end mb-8 no-print border-b border-slate-100 pb-6">
            <div class="text-left">
                <h2 class="text-3xl font-black text-slate-800 tracking-tighter">ศูนย์ข้อมูลและรายงานสารสนเทศ</h2>
            </div>
            <button @click="printReport" class="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95">
                <i class="fas fa-print text-lg"></i> พิมพ์รายงานชุดนี้
            </button>
        </div>

        <div class="flex gap-3 mb-8 no-print overflow-x-auto pb-2">
            <button @click="activeTab = 'stock'" 
                :class="activeTab === 'stock' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'"
                class="px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 whitespace-nowrap">
                <i class="fas fa-boxes"></i> 1. รายงานสต๊อกคงเหลือปัจจุบัน
            </button>
            <button @click="activeTab = 'purchase'" 
                :class="activeTab === 'purchase' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'"
                class="px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 whitespace-nowrap">
                <i class="fas fa-shopping-basket"></i> 3. รายงานสั่งซื้อประจำวัน
            </button>
            <button @click="activeTab = 'history'" 
                :class="activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'"
                class="px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 whitespace-nowrap">
                <i class="fas fa-history"></i> 2. ประวัติความเคลื่อนไหวย้อนหลัง
            </button>
        </div>

        <div class="w-full min-h-[400px]">
            
            <div v-if="activeTab === 'stock'" class="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-blue-500 shadow-sm text-left">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ต้นทุนวัตถุดิบที่เบิกจ่ายสะสม</p>
                        <p class="text-4xl font-black text-slate-800 font-mono">฿ {{ totalUsageCost.toLocaleString() }}</p>
                    </div>
                    <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-red-500 shadow-sm text-left">
                        <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">มูลค่าความเสียหาย (ของเสีย)</p>
                        <p class="text-4xl font-black text-red-600 font-mono">฿ {{ totalWasteCost.toLocaleString() }}</p>
                    </div>
                </div>

                <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                    <h3 class="text-xl font-bold text-slate-700 mb-6 border-b pb-4 text-left flex items-center gap-3">
                        <i class="fas fa-clipboard-list text-blue-500"></i> 1. รายงานสถานะวัตถุดิบคงเหลือ (ข้อมูลล่าสุด)
                    </h3>
                    <table class="w-full text-left">
                        <thead class="text-slate-400 border-b italic font-bold text-[11px] uppercase tracking-widest">
                            <tr>
                                <th class="py-4 px-4">ชื่อวัตถุดิบ / ประเภท</th>
                                <th class="py-4 px-4 text-center">ราคาต้นทุน</th>
                                <th class="py-4 px-4 text-right">คงเหลือในคลัง</th>
                            </tr>
                        </thead>
                        <tbody class="text-base font-medium">
                            <tr v-for="item in activeStockData" :key="item.id" class="border-b border-slate-50 hover:bg-slate-50 transition">
                                <td class="py-5 px-4">
                                    <div class="font-black text-slate-800">{{ item.name }}</div>
                                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ item.cat || item.type }}</div>
                                </td>
                                <td class="py-5 px-4 text-center font-mono text-slate-500">฿{{ (Number(item.price) || 0).toLocaleString() }}</td>
                                <td class="py-5 px-4 text-right">
                                    <span :class="Number(item.qty) <= Number(item.min) ? 'text-red-600 font-black' : 'text-slate-700 font-bold'" class="text-xl font-mono">
                                        {{ item.qty }}
                                    </span>
                                    <span class="text-slate-400 text-[10px] font-bold uppercase ml-1">{{ item.unit }}</span>
                                </td>
                            </tr>
                            <tr v-if="activeStockData.length === 0">
                                <td colspan="3" class="py-10 text-center text-slate-400 font-bold">กำลังโหลดข้อมูล...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="activeTab === 'purchase'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm border-t-[12px] border-t-orange-500 animate-in slide-in-from-bottom-4 duration-300">
                <h3 class="text-xl font-bold text-orange-600 mb-6 border-b pb-4 text-left flex items-center gap-3">
                    <i class="fas fa-shopping-cart text-2xl"></i> 3. รายงานรายการสั่งซื้อประจำวัน (ควรซื้อเพิ่ม)
                </h3>
                <div v-if="lowStock.length > 0">
                    <table class="w-full">
                        <thead class="text-slate-400 border-b italic font-bold text-[11px] uppercase tracking-widest">
                            <tr>
                                <th class="py-4 px-4 text-left">รายการวัตถุดิบ</th>
                                <th class="py-4 px-4 text-right">จำนวนที่ต้องซื้ออย่างน้อย</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in lowStock" :key="item.id" class="border-b border-orange-50 bg-orange-50/20">
                                <td class="py-6 px-4">
                                    <div class="font-black text-slate-800 text-lg">{{ item.name }}</div>
                                    <div class="text-[10px] text-orange-500 font-bold">จุดแจ้งเตือน: {{ item.min }} {{ item.unit }}</div>
                                </td>
                                <td class="py-6 px-4 text-right">
                                    <span class="text-red-600 font-black text-3xl font-mono">+ {{ (Number(item.min) - Number(item.qty)) + 1 }}</span>
                                    <span class="text-slate-400 text-xs font-bold uppercase ml-2">{{ item.unit }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="py-24 text-center text-slate-200 italic font-bold text-xl">
                    สต๊อกปกติทุกรายการ ไม่ต้องซื้อเพิ่ม
                </div>
            </div>

            <div v-if="activeTab === 'history'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-4">
                    <h3 class="text-xl font-bold text-slate-700 flex items-center gap-3 text-left">
                        <i class="fas fa-history text-emerald-500 text-2xl"></i> 2. รายงานความเคลื่อนไหวและประวัติกิจกรรม
                    </h3>
                    <div class="flex items-center gap-2 no-print bg-slate-50 p-2 rounded-2xl border">
                        <label class="text-[9px] font-black text-slate-400 uppercase ml-2">ช่วงวันที่</label>
                        <input type="date" v-model="startDate" class="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer">
                        <span class="text-slate-300 text-[9px] font-black uppercase">ถึง</span>
                        <input type="date" v-model="endDate" class="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer">
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="text-slate-400 border-b italic font-bold text-[10px] uppercase tracking-widest">
                            <tr>
                                <th class="py-4 px-2 text-center">วัน / เวลา</th>
                                <th class="py-4 px-2 text-center">รายการ</th>
                                <th class="py-4 px-2 text-center">ประเภทกิจกรรม</th>
                                <th class="py-4 px-2 text-right pr-8">จำนวน</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(log, idx) in filteredHistory" :key="idx" class="border-b border-slate-50 hover:bg-slate-50 transition">
                                <td class="py-5 px-2 text-slate-400 text-[11px] font-mono text-center">{{ log.displayDate }}</td>
                                <td class="py-5 px-2 font-black text-slate-800 text-center">{{ log.item }}</td>
                                <td class="py-5 px-2 text-center">
                                    <span :class="log.type === 'in' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-orange-600 bg-orange-50 border-orange-100'" 
                                          class="px-4 py-1 rounded-full text-[10px] font-black uppercase border">
                                        {{ log.type === 'in' ? 'รับเข้า' : 'เบิกจ่าย' }}
                                    </span>
                                </td>
                                <td class="py-5 px-2 text-right font-black text-2xl pr-8 font-mono" :class="log.type === 'in' ? 'text-blue-600' : 'text-orange-600'">
                                    {{ log.type === 'in' ? '+' : '-' }} {{ log.qty }}
                                </td>
                            </tr>
                            <tr v-if="filteredHistory.length === 0">
                                <td colspan="4" class="py-24 text-center text-slate-300 italic font-bold">ไม่พบประวัติในช่วงวันที่ระบุ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <component is="style">
            @media print {
                .no-print { display: none !important; }
                body { background: white !important; font-size: 12pt; }
                .report-container { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                .rounded-[2.5rem], .rounded-3xl { border-radius: 0 !important; border: 1px solid #f1f5f9 !important; box-shadow: none !important; }
                table { width: 100% !important; border-collapse: collapse; }
                thead tr { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                th, td { border-bottom: 1px solid #eee !important; }
                h2, h3 { color: black !important; text-align: left !important; }
            }
        </component>
    </section>
    `,
    mounted() {
        db.collection("inventory").onSnapshot(snapshot => {
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            this.stockData = items;
        });

        db.collection("wastage").onSnapshot(snapshot => {
            const logs = [];
            snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
            this.wastageLogs = logs;
        });
    },
    computed: {
        // 1. [เพิ่มใหม่] กรองข้อมูลเฉพาะวัตถุดิบที่ไม่ได้ถูกลบ
        activeStockData() {
            return this.stockData.filter(item => item.active !== false);
        },

        totalUsageCost() {
            let total = 0;
            // ใช้ stockData ตัวเต็ม เพื่อให้ประวัติต้นทุนเก่าๆ ยังคงถูกคำนวณ
            this.stockData.forEach(item => {
                const totalOut = (item.history || []).filter(h => h.type === 'out').reduce((sum, h) => sum + Number(h.qty), 0);
                total += (totalOut * (Number(item.price) || 0));
            });
            return total;
        },
        totalWasteCost() {
            return (this.wastageLogs || []).reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
        },
        lowStock() {
            // [แก้ไข] ดึงเฉพาะสินค้าที่ Active เพื่อนำมาสั่งซื้อ
            return this.activeStockData.filter(i => Number(i.qty) <= Number(i.min));
        },
        filteredHistory() {
            let logs = [];
            // ใช้ stockData ตัวเต็ม เพื่อโชว์ประวัติการรับเข้าเบิกออกของสินค้าที่ลบไปแล้วด้วย
            this.stockData.forEach(i => { 
                (i.history || []).forEach(h => {
                    const d = new Date(h.date);
                    const formattedDate = !isNaN(d) ? d.toLocaleString('th-TH', { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute:'2-digit' 
                    }) : h.date;

                    logs.push({ ...h, item: i.name, displayDate: formattedDate });
                }); 
            });
            
            let result = logs.sort((a,b) => new Date(b.date) - new Date(a.date));

            if (this.startDate) {
                result = result.filter(log => {
                    if (!log.date) return false;
                    const logDate = new Date(log.date).toISOString().split('T')[0];
                    return logDate >= this.startDate && logDate <= this.endDate;
                });
            }
            return result;
        }
    },
    methods: {
        printReport() {
            window.print();
        }
    }
};