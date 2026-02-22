const DashboardView = {
    // เพิ่ม categories เข้ามาใน props เพื่อรับค่าจากตัวแม่
    props: ['stockData', 'wastageLogs', 'categories'], 
    template: `
    <section>
        <h2 class="text-3xl font-bold text-slate-800 mb-8 text-left">วิเคราะห์ภาพรวมร้าน</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-orange-500 text-left">
                <p class="text-slate-400 text-xs font-bold uppercase mb-1">วัตถุดิบทั้งหมด</p>
                <p class="text-4xl font-black text-slate-800 font-mono">{{ stockData.length }} <span class="text-sm font-normal text-slate-400">รายการ</span></p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-red-500 text-left">
                <p class="text-slate-400 text-xs font-bold uppercase mb-1">มูลค่าของเสียสะสม</p>
                <p class="text-4xl font-black text-red-600 font-mono">฿ {{ totalWasteCost.toLocaleString() }}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-green-500 text-left">
                <p class="text-slate-400 text-xs font-bold uppercase mb-1">รายการที่ต้องสั่งเพิ่ม</p>
                <p class="text-4xl font-black text-green-600 font-mono">{{ lowStockCount }} <span class="text-sm font-normal text-slate-400">รายการ</span></p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-start">
                <h3 class="font-bold text-slate-700 mb-6 text-left w-full border-b pb-4 italic text-lg">สัดส่วนสต็อกตามหมวดหมู่ (%)</h3>
                <div class="space-y-5 w-full">
                    <div v-for="cat in catStats" :key="cat.name">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="font-bold text-slate-600 text-base">{{ cat.name }}</span>
                            <span class="font-black text-slate-800 font-mono">{{ cat.percent }}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3.5 shadow-inner">
                            <div class="bg-orange-500 h-3.5 rounded-full transition-all duration-1000 ease-out" :style="{ width: cat.percent + '%' }"></div>
                        </div>
                    </div>
                    <div v-if="stockData.length === 0" class="text-center py-10 text-slate-300 italic text-sm">
                        รอเพิ่มข้อมูลวัตถุดิบเพื่อคำนวณสถิติ
                    </div>
                </div>
            </div>

            <div class="bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-start">
                <h3 class="font-bold text-slate-700 mb-6 text-left w-full border-b pb-4 italic text-lg">มูลค่าของเสียรายวัน (เปรียบเทียบ)</h3>
                <div class="flex items-end justify-between h-48 w-full gap-3 px-2">
                    <div v-for="day in [400, 1200, 300, 900, 1850]" class="flex-1 flex flex-col items-center">
                        <div class="bg-red-400 w-full rounded-t-xl transition-all hover:bg-red-500 cursor-pointer shadow-sm" :style="{ height: (day/2000)*100 + '%' }"></div>
                        <span class="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-tighter">1{{day/100}} Jan</span>
                    </div>
                </div>
                <p class="text-center text-[10px] text-slate-300 mt-6 w-full italic font-medium uppercase">* ข้อมูลจำลองเพื่อแสดงแนวโน้มสถิติประจำสัปดาห์</p>
            </div>
        </div>
    </section>
    `,
    computed: {
        totalWasteCost() {
            return this.wastageLogs.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
        },
        lowStockCount() {
            return this.stockData.filter(i => i.qty <= i.min).length;
        },
        catStats() {
            const totalItems = this.stockData.length;
            // เปลี่ยนจากรายชื่อคงที่ เป็นการใช้ categories จากตัวแม่
            return this.categories.map(c => {
                const count = this.stockData.filter(i => i.cat === c).length;
                // ป้องกันค่า NaN กรณีไม่มีสินค้าในคลัง
                const percent = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                return { name: c, percent };
            });
        }
    }
};