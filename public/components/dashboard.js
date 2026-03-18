const DashboardView = {
  props: ["categories"],
  template: `
    <section class="animate-in fade-in duration-500">
        <h2 class="text-3xl font-bold text-slate-800 mb-8 text-left">แดชบอร์ดสรุปผล</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-orange-500 text-left hover:shadow-md transition">
                <p class="text-slate-600 text-xs font-bold uppercase mb-1">วัตถุดิบในคลังทั้งหมด</p>
                <p class="text-4xl font-black text-slate-800 font-mono">{{ activeStockData.length }} <span class="text-sm font-normal text-slate-600">รายการ</span></p>
            </div>
            
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-red-500 text-left hover:shadow-md transition">
                <p class="text-slate-600 text-xs font-bold uppercase mb-1">มูลค่าของเสียสะสม (ทั้งหมด)</p>
                <p class="text-4xl font-black text-red-600 font-mono">฿ {{ totalWasteCost.toLocaleString() }}</p>
            </div>
            
            <div class="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-blue-500 text-left hover:shadow-md transition">
                <p class="text-slate-600 text-xs font-bold uppercase mb-1">มูลค่าวัตถุดิบคงเหลือรวม</p>
                <p class="text-4xl font-black text-blue-600 font-mono">฿ {{ totalInventoryValue.toLocaleString() }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-start">
                <h3 class="font-bold text-slate-700 mb-6 text-left w-full border-b pb-4 text-lg"><i class="fas fa-chart-pie text-orange-400 mr-2"></i> สัดส่วนสต๊อกตามหมวดหมู่ (%)</h3>
                <div class="space-y-5 w-full">
                    <div v-for="cat in catStats" :key="cat.name">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="font-bold text-slate-600 text-base">{{ cat.name }} <span class="text-xs text-slate-600 font-normal">({{ cat.count }} รายการ)</span></span>
                            <span class="font-black text-slate-800 font-mono">{{ cat.percent }}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-3.5 shadow-inner">
                            <div class="bg-orange-500 h-3.5 rounded-full transition-all duration-1000 ease-out" :style="{ width: cat.percent + '%' }"></div>
                        </div>
                    </div>
                    <div v-if="activeStockData.length === 0" class="text-center py-10 text-slate-600 text-sm font-bold">
                        กำลังโหลด หรือ ยังไม่มีข้อมูลวัตถุดิบในคลัง
                    </div>
                </div>
            </div>

          <div class="bg-white p-8 rounded-[3rem] shadow-sm border flex flex-col items-start min-h-[450px]">
    <h3 class="font-bold text-slate-700 mb-6 text-left w-full border-b pb-4 text-lg">
        <i class="fas fa-chart-bar text-red-500 mr-2"></i> มูลค่าของเสียย้อนหลัง 5 วัน
    </h3>
    
    <div class="relative w-full h-64 mt-12 mb-10 flex items-end justify-between px-4 gap-4 border-l-2 border-b-2 border-slate-100">
        
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div class="border-t border-slate-100 w-full"></div>
            <div class="border-t border-slate-100 w-full"></div>
            <div class="border-t border-slate-100 w-full"></div>
        </div>

        <div v-for="day in recentWastageChart" :key="day.date" 
             class="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
            
            <span v-if="day.cost > 0" 
                  class="absolute text-[11px] font-black text-red-600 mb-2 transition-transform group-hover:scale-125 bg-white/90 px-1 rounded shadow-sm"
                  :style="{ bottom: day.percent + '%' }">
                ฿{{ day.cost.toLocaleString() }}
            </span>

            <div class="w-full max-w-[40px] bg-gradient-to-t from-red-600 to-red-400 rounded-t-xl transition-all duration-1000 ease-out group-hover:from-red-700 group-hover:to-red-500 shadow-sm"
                 :style="{ height: day.percent + '%' }">
            </div>

            <span class="absolute -bottom-10 text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                {{ day.label }}
            </span>
        </div>
    </div>
</div>
    </section>
    `,
  data() {
    return {
      stockData: [],
      wastageLogs: [],
    };
  },
  computed: {
    activeStockData() {
      return this.stockData.filter((item) => item.active !== false);
    },

    totalWasteCost() {
      return this.wastageLogs
        .filter((log) => log.active !== false)
        .reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    },

    // [เพิ่มใหม่] คำนวณมูลค่าคงเหลือในคลัง (จำนวนที่เหลือ * ราคาต้นทุน)
    totalInventoryValue() {
      return this.activeStockData.reduce((sum, item) => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.price) || 0;
        return sum + qty * price;
      }, 0);
    },

    catStats() {
    const totalItems = this.activeStockData.length;
    if (totalItems === 0) {
        // ถ้ายังไม่มีสินค้าเลย ให้ทุกหมวดเป็น 0%
        return this.categories.map(c => ({ name: c, count: 0, percent: 0 }));
    }

    let currentSum = 0;
    const stats = this.categories.map((c, index) => {
        const count = this.activeStockData.filter(i => (i.cat === c || i.type === c)).length;
        
        // คำนวณ % ปกติก่อน
        let percent = Math.round((count / totalItems) * 100);
        
        // เช็คว่าเป็นหมวดสุดท้าย "ที่มีสินค้า" หรือไม่
        const isLastCategory = index === this.categories.length - 1;

        if (isLastCategory) {
            percent = 100 - currentSum;
            // ป้องกันค่าติดลบ ถ้าผลรวมเกินให้เป็น 0
            if (percent < 0) percent = 0; 
        } else {
            currentSum += percent;
        }

        return { name: c, count: count, percent: percent };
    });

    return stats;
},

    recentWastageChart() {
      const daysToShow = 5;
      const chartData = [];
      const today = new Date();

      // 1. สร้างโครงข้อมูล 5 วันย้อนหลัง
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        chartData.push({
          date: d.toISOString().split("T")[0],
          label: d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          }),
          cost: 0,
          percent: 0,
        });
      }

      // 2. เติมข้อมูลจาก Firebase
      this.wastageLogs
        .filter((log) => log.active !== false)
        .forEach((log) => {
          if (!log.date) return;
          const logDate = log.date.split("T")[0];
          const targetDay = chartData.find((d) => d.date === logDate);
          if (targetDay) {
            targetDay.cost += Number(log.cost) || 0;
          }
        });

      // 3. คำนวณ % โดยหาค่าสูงสุดเพื่อทำเป็น 100%
      const maxCost = Math.max(...chartData.map((d) => d.cost));

      chartData.forEach((d) => {
        if (maxCost > 0 && d.cost > 0) {
          // คำนวณ % จริง
          let calculated = (d.cost / maxCost) * 100;
          // ดักไว้ว่าถ้ามีราคา อย่างน้อยต้องขึ้นมา 15% จะได้ไม่เตี้ยเกินไป
          d.percent = calculated < 15 ? 15 : calculated;
        } else {
          d.percent = 0;
        }
      });

      return chartData;
    },
  },
  mounted() {
    db.collection("inventory").onSnapshot((snapshot) => {
      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      this.stockData = items;
    });

    db.collection("wastage").onSnapshot((snapshot) => {
      const logs = [];
      snapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() }));
      this.wastageLogs = logs;
    });
  },
};
