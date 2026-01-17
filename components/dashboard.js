const DashboardView = {
    props: ['stockData', 'wastageLogs'],
    template: `
    <section>
        <h2 class="text-3xl font-bold text-slate-800 mb-8">วิเคราะห์ภาพรวมร้าน</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-orange-500">
                <p class="text-slate-400 text-sm font-bold uppercase">วัตถุดิบทั้งหมด</p>
                <p class="text-4xl font-bold text-slate-800">{{ stockData.length }} <span class="text-lg font-normal">รายการ</span></p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-red-500">
                <p class="text-slate-400 text-sm font-bold uppercase">มูลค่าของเสียสะสม</p>
                <p class="text-4xl font-bold text-red-600">฿ {{ totalWasteCost }}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-green-500">
                <p class="text-slate-400 text-sm font-bold uppercase">รายการที่ต้องสั่งเพิ่ม</p>
                <p class="text-4xl font-bold text-green-600">{{ lowStockCount }} <span class="text-lg font-normal text-slate-400">รายการ</span></p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-8 rounded-3xl shadow-sm border">
                <h3 class="font-bold text-slate-700 mb-6">สัดส่วนสต็อกตามหมวดหมู่ (%)</h3>
                <div class="space-y-4">
                    <div v-for="cat in catStats" :key="cat.name">
                        <div class="flex justify-between text-sm mb-1">
                            <span>{{ cat.name }}</span>
                            <span class="font-bold">{{ cat.percent }}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-4">
                            <div class="bg-orange-500 h-4 rounded-full transition-all duration-1000" :style="{ width: cat.percent + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-8 rounded-3xl shadow-sm border">
                <h3 class="font-bold text-slate-700 mb-6">มูลค่าของเสียรายวัน (เปรียบเทียบ)</h3>
                <div class="flex items-end justify-between h-48 gap-2">
                    <div v-for="day in [400, 1200, 300, 900, 1850]" class="flex-1 flex flex-col items-center">
                        <div class="bg-red-400 w-full rounded-t-lg transition-all" :style="{ height: (day/2000)*100 + '%' }"></div>
                        <span class="text-[10px] text-slate-400 mt-2 italic">1{{day/100}} Jan</span>
                    </div>
                </div>
                <p class="text-center text-xs text-slate-400 mt-4 italic">* ข้อมูลจำลองเพื่อแสดงแนวโน้มสถิติ</p>
            </div>
        </div>
    </section>
    `,
    computed: {
        totalWasteCost() {
            return this.wastageLogs.reduce((sum, item) => sum + item.cost, 0);
        },
        lowStockCount() {
            return this.stockData.filter(i => i.qty <= i.min).length;
        },
        catStats() {
            const categories = ['เนื้อสัตว์', 'ผัก', 'เครื่องปรุง', 'เครื่องดื่ม'];
            return categories.map(c => {
                const count = this.stockData.filter(i => i.cat === c).length;
                const percent = Math.round((count / this.stockData.length) * 100);
                return { name: c, percent };
            });
        }
    }
};