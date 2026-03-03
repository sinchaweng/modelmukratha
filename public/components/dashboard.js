const DashboardView = {
    props: ['categories'], 
    template: `
    <section class="animate-in fade-in duration-500">
        <h2 class="text-3xl font-bold text-slate-800 mb-8 text-left">วิเคราะห์ภาพรวมร้าน</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-orange-500 text-left hover:shadow-md transition">
                <p class="text-slate-400 text-xs font-bold uppercase mb-1">วัตถุดิบในคลังทั้งหมด</p>
                <p class="text-4xl font-black text-slate-800 font-mono">{{ activeStockData.length }} <span class="text-sm font-normal text-slate-400">รายการ</span></p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-red-500 text-left hover:shadow-md transition">
                <p class="text-slate-400 text-xs font-bold uppercase mb-1">มูลค่าของเสียสะสม (ทั้งหมด)</p>
                <p class="text-4xl font-black text-red-600 font-mono">฿ {{ totalWasteCost.toLocaleString() }}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-green-500 text-left hover:shadow-md transition">
                <p class="text-slate-400 text-xs font-bold uppercase mb-1">รายการวัตถุดิบที่ต้องสั่งเพิ่ม ⚠️</p>
                <p class="text-4xl font-black text-green-600 font-mono">{{ lowStockCount }} <span class="text-sm font-normal text-slate-400">รายการ</span></p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-start">
                <h3 class="font-bold text-slate-700 mb-6 text-left w-full border-b pb-4 italic text-lg"><i class="fas fa-chart-pie text-orange-400 mr-2"></i> สัดส่วนสต๊อกตามหมวดหมู่ (%)</h3>
                <div class="space-y-5 w-full">
                    <div v-for="cat in catStats" :key="cat.name">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="font-bold text-slate-600 text-base">{{ cat.name }} <span class="text-xs text-slate-400 font-normal">({{ cat.count }} รายการ)</span></span>
                            <span class="font-black text-slate-800 font-mono">{{ cat.percent }}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3.5 shadow-inner">
                            <div class="bg-orange-500 h-3.5 rounded-full transition-all duration-1000 ease-out" :style="{ width: cat.percent + '%' }"></div>
                        </div>
                    </div>
                    <div v-if="activeStockData.length === 0" class="text-center py-10 text-slate-300 italic text-sm font-bold">
                        กำลังโหลด หรือ ยังไม่มีข้อมูลวัตถุดิบในคลัง
                    </div>
                </div>
            </div>

            <div class="bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-start">
                <h3 class="font-bold text-slate-700 mb-6 text-left w-full border-b pb-4 italic text-lg"><i class="fas fa-chart-bar text-red-400 mr-2"></i> มูลค่าของเสียย้อนหลัง 5 วัน</h3>
                <div class="flex items-end justify-between h-48 w-full gap-3 px-2">
                    <div v-for="day in recentWastageChart" :key="day.date" class="flex-1 flex flex-col items-center group relative">
                        <div class="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            ฿ {{ day.cost.toLocaleString() }}
                        </div>
                        
                        <div class="bg-red-400 w-full rounded-t-xl transition-all duration-1000 group-hover:bg-red-500 cursor-pointer shadow-sm relative" :style="{ height: day.percent + '%' }">
                            <span v-if="day.cost > 0" class="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-red-600">
                                {{ day.cost >= 1000 ? (day.cost/1000).toFixed(1) + 'k' : day.cost }}
                            </span>
                        </div>
                        <span class="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-tighter">{{ day.label }}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `,
    data() {
        return {
            stockData: [],
            wastageLogs: []
        }
    },
    computed: {
        // [เพิ่มใหม่] กรองเฉพาะวัตถุดิบที่ Active (ไม่ถูกซ่อน) มาใช้คำนวณทั้งหมด
        activeStockData() {
            return this.stockData.filter(item => item.active !== false);
        },
        
        totalWasteCost() {
            return this.wastageLogs.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
        },
        
        lowStockCount() {
            // นับของใกล้หมด จากเฉพาะไอเทมที่ Active เท่านั้น
            return this.activeStockData.filter(i => (Number(i.qty) || 0) <= (Number(i.min) || 0)).length;
        },
        
        catStats() {
            const totalItems = this.activeStockData.length; // ใช้ความยาวของ activeStockData
            return this.categories.map(c => {
                // นับหมวดหมู่ เฉพาะจากไอเทมที่ Active
                const count = this.activeStockData.filter(i => (i.cat === c || i.type === c)).length;
                const percent = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                return { name: c, count: count, percent: percent };
            });
        },
        
        recentWastageChart() {
            const daysToShow = 5;
            const chartData = [];
            const today = new Date();
            
            for (let i = daysToShow - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                
                const dateString = d.toISOString().split('T')[0]; 
                const label = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }); 
                
                chartData.push({ date: dateString, label: label, cost: 0, percent: 0 });
            }

            this.wastageLogs.forEach(log => {
                if (!log.date) return;
                const logDate = log.date.split('T')[0];
                const targetDay = chartData.find(d => d.date === logDate);
                if (targetDay) {
                    targetDay.cost += (Number(log.cost) || 0);
                }
            });

            const maxCost = Math.max(...chartData.map(d => d.cost));
            const baseMax = maxCost > 0 ? maxCost : 1; 

            chartData.forEach(d => {
                d.percent = maxCost > 0 ? (d.cost / baseMax) * 100 : 0; 
                if (d.percent > 0 && d.percent < 10) d.percent = 10; 
            });

            return chartData;
        }
    },
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
    }
};