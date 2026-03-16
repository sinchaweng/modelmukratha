const ReportView = {
  data() {
    return {
      activeTab: "stock",
      startDate: "",
      endDate: new Date().toISOString().split("T")[0],
      stockData: [],
      wastageLogs: [],
      printDateLong: "",
      printDateShort: "",
      printUser: "",
    };
  },
  template: `
    <section class="w-full animate-in fade-in duration-500">
        
        <div class="no-print">
            <div class="flex justify-between items-end mb-8 border-b pb-6">
                <div class="text-left">
                    <h2 class="text-3xl font-black text-slate-800 tracking-tighter">ระบบรายงาน</h2>
                </div>
                <button @click="printReport" class="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95">
                    <i class="fas fa-print text-lg"></i> พิมพ์เอกสาร
                </button>
            </div>

            <div class="flex gap-3 mb-8 overflow-x-auto pb-2">
                <button @click="activeTab = 'stock'" 
                    :class="activeTab === 'stock' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50'"
                    class="px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 whitespace-nowrap">
                    <i class="fas fa-boxes"></i> 1. รายงานสถานะสินค้าคงเหลือ
                </button>
                <button @click="activeTab = 'purchase'" 
                    :class="activeTab === 'purchase' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50'"
                    class="px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 whitespace-nowrap">
                    <i class="fas fa-shopping-basket"></i> 2. รายงานสินค้าที่ต้องสั่งซื้อ
                </button>
                <button @click="activeTab = 'history'" 
                    :class="activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50'"
                    class="px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 whitespace-nowrap">
                    <i class="fas fa-history"></i> 3. รายงานสรุปการเคลื่อนไหวสินค้า
                </button>
            </div>

            <div class="w-full min-h-[400px]">
                
                <div v-if="activeTab === 'stock'" class="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-blue-500 shadow-sm text-left">
                            <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">ต้นทุนวัตถุดิบที่เบิกจ่ายสะสม</p>
                            <p class="text-4xl font-black text-slate-800 font-mono">฿ {{ totalUsageCost.toLocaleString() }}</p>
                        </div>
                        <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-red-500 shadow-sm text-left">
                            <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">มูลค่าความเสียหาย (ของเสียสะสม)</p>
                            <p class="text-4xl font-black text-red-600 font-mono">฿ {{ totalWasteCost.toLocaleString() }}</p>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                        <h3 class="text-xl font-bold text-slate-700 mb-6 border-b pb-4 text-left flex items-center gap-3">
                            <i class="fas fa-clipboard-list text-blue-500"></i> ตารางรายการสถานะวัตถุดิบคงเหลือ
                        </h3>
                        <table class="w-full text-left bg-white">
                            <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase tracking-wide font-bold border-b border-slate-200">
                                <tr>
                                    <th class="p-5 text-center w-16 font-semibold text-slate-600">ลำดับ</th>
                                    <th class="p-5 text-left font-semibold text-slate-600">ชื่อวัตถุดิบ / ประเภท</th>
                                    <th class="p-5 text-right font-semibold text-slate-600">ราคาต้นทุน</th>
                                    <th class="p-5 text-right font-semibold text-slate-600">คงเหลือในคลัง</th>
                                </tr>
                            </thead>
                            <tbody class="text-base font-medium">
                                <tr v-for="(item, index) in activeStockData" :key="item.id" class="border-b border-slate-200 bg-white hover:bg-slate-50 transition">
                                    <td class="py-4 px-6 text-center text-slate-600">{{ index + 1 }}</td>
                                    <td class="py-4 px-6 text-left">
                                        <div class="font-black text-slate-800">{{ item.name }}</div>
                                        <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{{ item.cat || item.type }}</div>
                                    </td>
                                    <td class="py-4 px-6 text-right font-mono text-slate-700">฿{{ (Number(item.price) || 0).toLocaleString() }}</td>
                                    <td class="py-4 px-6 text-right">
                                        <span :class="Number(item.qty) <= Number(item.min) ? 'text-red-600 font-black' : 'text-slate-700 font-bold'" class="text-xl font-mono">
                                            {{ item.qty }}
                                        </span>
                                        <span class="text-slate-600 text-[10px] font-bold uppercase ml-1">{{ item.unit }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="activeTab === 'purchase'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <h3 class="text-xl font-bold text-orange-600 mb-6 border-b pb-4 text-left flex items-center gap-3">
                        <i class="fas fa-shopping-cart text-2xl"></i> ตารางรายการสั่งซื้อประจำวัน (ควรซื้อเพิ่ม)
                    </h3>
                    <div v-if="lowStock.length > 0">
                        <table class="w-full bg-white">
                            <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase tracking-wide font-bold border-b border-slate-200">
                                <tr>
                                    <th class="p-5 text-center w-16 font-semibold text-slate-600">ลำดับ</th>
                                    <th class="p-5 text-left font-semibold text-slate-600">รายการวัตถุดิบ</th>
                                    <th class="p-5 text-right font-semibold text-slate-600">จุดแจ้งเตือน</th>
                                    <th class="p-5 text-right font-semibold text-slate-600">จำนวนที่ต้องซื้ออย่างน้อย</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in lowStock" :key="item.id" class="border-b border-slate-200 bg-white hover:bg-slate-50 transition">
                                    <td class="py-4 px-6 text-center text-slate-600">{{ index + 1 }}</td>
                                    <td class="py-4 px-6 text-left">
                                        <div class="font-black text-slate-800 text-[16px]">{{ item.name }}</div>
                                    </td>
                                    <td class="py-4 px-6 text-right font-bold text-orange-600">{{ item.min }} {{ item.unit }}</td>
                                    <td class="py-4 px-6 text-right">
                                        <span class="text-red-600 font-black text-3xl font-mono">+ {{ (Number(item.min) - Number(item.qty)) + 1 }}</span>
                                        <span class="text-slate-600 text-xs font-bold uppercase ml-2">{{ item.unit }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="py-24 text-center text-slate-200 font-bold text-xl">
                        สต๊อกปกติทุกรายการ ไม่ต้องซื้อเพิ่ม
                    </div>
                </div>

                <div v-if="activeTab === 'history'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-4">
                        <h3 class="text-xl font-bold text-slate-700 flex items-center gap-3 text-left">
                            <i class="fas fa-history text-emerald-500 text-2xl"></i> ประวัติความเคลื่อนไหวและกิจกรรม
                        </h3>
                        <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border">
                            <label class="text-[9px] font-black text-slate-600 uppercase ml-2">ช่วงวันที่</label>
                            <input type="date" v-model="startDate" class="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer">
                            <span class="text-slate-600 text-[9px] font-black uppercase">ถึง</span>
                            <input type="date" v-model="endDate" class="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer">
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left bg-white">
    <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase tracking-wide font-bold border-b border-slate-300">
        <tr>
            <th class="p-5 text-center w-16">ลำดับ</th>
            <th class="p-5 text-left">วัน / เวลา</th>
            <th class="p-5 text-left">รายการ</th>
            <th class="p-5 text-center">ประเภท</th>
            <th class="p-5 text-right">จำนวนหน่วย</th>
            <th class="p-5 text-right">ราคา/หน่วย</th>
            <th class="p-5 text-right">รวมเป็นเงิน</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(log, idx) in filteredHistory" :key="idx" class="border-b border-slate-200 hover:bg-slate-50 transition">
            <td class="py-4 px-6 text-center text-slate-600">{{ idx + 1 }}</td>
            <td class="py-4 px-6 text-slate-700 text-[12px] font-mono">{{ log.displayDate }}</td>
            <td class="py-4 px-6 font-black text-slate-800 text-left">
                {{ log.item }}
                <div class="text-[9px] text-slate-400 font-normal">{{ log.itemSku }}</div>
            </td>
            <td class="py-4 px-6 text-center">
                <span :class="log.type === 'in' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-orange-600 bg-orange-50 border-orange-100'" 
                      class="px-3 py-1 rounded-full text-[10px] font-black uppercase border">
                    {{ log.type === 'in' ? 'รับเข้า' : 'เบิกจ่าย' }}
                </span>
            </td>
            <td class="py-4 px-6 text-right font-bold" :class="log.type === 'in' ? 'text-blue-600' : 'text-orange-600'">
                {{ log.type === 'in' ? '+' : '-' }} {{ log.qty }} <span class="text-[10px] text-slate-400 font-normal">{{ log.unitStr }}</span>
            </td>
            <td class="py-4 px-6 text-right font-mono text-slate-600 text-xs">฿{{ log.unitPrice.toLocaleString() }}</td>
            <td class="py-4 px-6 text-right font-black font-mono" :class="log.type === 'in' ? 'text-blue-700' : 'text-orange-700'">
                ฿{{ log.totalPrice.toLocaleString() }}
            </td>
        </tr>
    </tbody>
    <tfoot v-if="filteredHistory.length > 0" class="bg-slate-50 border-t-2 border-slate-300">
    <tr>
        <td colspan="6" class="p-5 text-right font-bold text-slate-700 text-lg">
            สรุปมูลค่าความเคลื่อนไหวรวม:
        </td>
        <td class="p-5 text-right font-black">
            <div class="text-blue-700 text-xl font-mono">รับเข้า: ฿{{ totalHistoryAmtIn.toLocaleString() }}</div>
            <div class="text-orange-700 text-xl font-mono">เบิกจ่าย: ฿{{ totalHistoryAmtOut.toLocaleString() }}</div>
        </td>
    </tr>
</tfoot>
</table>
                    </div>
                </div>
            </div>
        </div>

        <div class="print-only hidden print-container">
            
            <div style="position: relative; text-align: center; margin-bottom: 20px;">
                <div style="position: absolute; left: 0; top: 0;">
                    <img src="img/logo.jpg" alt="Logo" style="max-height: 50px; width: auto; object-fit: contain;">
                </div>
                <div style="padding-top: 5px;">
                    <div style="font-size: 16pt; font-weight: bold; margin-bottom: 5px;">บริษัท ลงหม้อสุกี้ จำกัด</div>
                    <div style="font-size: 14pt;">{{ getReportTitle }}</div>
                </div>
            </div>

            <div style="font-size: 10pt; margin-bottom: 10px; text-align: left;">
                <span v-if="activeTab === 'history' && startDate">วันที่เอกสารตั้งแต่ {{ startDate }} ถึง {{ endDate || printDateShort }}</span>
                <span v-else>วันที่เอกสาร ณ วันที่ {{ printDateShort }}</span>
            </div>

            <div class="table-container">
                <table v-if="activeTab === 'stock'" class="formal-table">
                    <thead>
                        <tr>
                            <th class="col-index">ลำดับ</th>
                            <th class="text-left">รหัสสินค้า</th>
                            <th class="text-left">ชื่อสินค้า</th>
                            <th class="text-left">หมวดหมู่</th>
                            <th class="text-center">หน่วยนับ</th>
                            <th class="text-right">ราคา/หน่วย</th>
                            <th class="text-right">ยอดคงเหลือ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in activeStockData" :key="item.id">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td>{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.cat || item.type }}</td>
                            <td class="text-center">{{ item.unit }}</td>
                            <td class="text-right">{{ (Number(item.price) || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</td>
                            <td class="text-right">{{ Number(item.qty).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</td>
                        </tr>
                        <tr v-if="activeStockData.length === 0">
                            <td colspan="7" class="text-center">ไม่มีข้อมูลสินค้า</td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="activeTab === 'purchase'">
                    <table class="formal-table">
                        <thead>
                            <tr>
                                <th class="col-index">ลำดับ</th>
                                <th class="text-left">รหัสสินค้า</th>
                                <th class="text-left">ชื่อสินค้า</th>
                                <th class="text-center">หน่วยนับ</th>
                                <th class="text-right">คงเหลือปัจจุบัน</th>
                                <th class="text-right">จุดสั่งซื้อ (Min)</th>
                                <th class="text-right">ต้องสั่งเพิ่ม</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in lowStock" :key="item.id">
                                <td class="text-center">{{ index + 1 }}</td>
                                <td>{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</td>
                                <td>{{ item.name }}</td>
                                <td class="text-center">{{ item.unit }}</td>
                                <td class="text-right">{{ item.qty }}</td>
                                <td class="text-right">{{ item.min }}</td>
                                <td class="text-right font-bold">{{ (Number(item.min) - Number(item.qty)) + 1 }}</td>
                            </tr>
                            <tr v-if="lowStock.length === 0">
                                <td colspan="7" class="text-center">สต๊อกปกติทุกรายการ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="activeTab === 'history'">
                    <table class="formal-table">
    <thead>
        <tr>
            <th rowspan="2" class="col-index">ลำดับ</th>
            <th rowspan="2" class="text-left">วัน/เวลา</th>
            <th rowspan="2" class="text-left">ชื่อสินค้า</th>
            <th colspan="2" class="text-center" style="border-bottom: 1px solid black;">จำนวนหน่วย</th>
            <th colspan="2" class="text-center" style="border-bottom: 1px solid black;">มูลค่า (บาท)</th>
        </tr>
        <tr>
            <th class="text-right">รับเข้า</th>
            <th class="text-right">เบิกออก</th>
            <th class="text-right">รับเข้า</th>
            <th class="text-right">เบิกออก</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(log, idx) in filteredHistory" :key="idx">
            <td class="text-center">{{ idx + 1 }}</td>
            <td style="font-size: 9pt;">{{ log.displayDate }}</td>
            <td>{{ log.item }}</td>
            <td class="text-right">{{ log.type === 'in' ? log.qty : '-' }}</td>
            <td class="text-right">{{ log.type === 'out' ? log.qty : '-' }}</td>
            <td class="text-right">{{ log.type === 'in' ? log.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-' }}</td>
            <td class="text-right">{{ log.type === 'out' ? log.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-' }}</td>
        </tr>
        <tr style="border-top: 2px solid black; font-weight: bold; background-color: #f8fafc;">
    <td colspan="5" class="text-right" style="padding: 12px; font-size: 11pt;">
        ยอดรวมมูลค่าสุทธิ (บาท)
    </td>
    <td class="text-right" style="padding: 12px; font-size: 11pt;">
        {{ totalHistoryAmtIn.toLocaleString(undefined, {minimumFractionDigits: 2}) }}
    </td>
    <td class="text-right" style="padding: 12px; font-size: 11pt;">
        {{ totalHistoryAmtOut.toLocaleString(undefined, {minimumFractionDigits: 2}) }}
    </td>
</tr>
    </tbody>
</table>
                </div>
            </div>

            <div class="footer-container">
                <div class="footer-left">พิมพ์โดย : {{ printUser }}</div>
                <div class="footer-right">พิมพ์วันที่ : {{ printDateShort }}</div>
            </div>

        </div>

        <component is="style">
            @media print {
                /* ตั้งค่า @page ให้ margin: 0 เพื่อตัด Browser Header/Footer ทิ้ง */
                @page { margin: 0mm; size: A4 portrait; }
                
                body, html, #app { 
                    background-color: white !important; 
                    font-family: 'Sarabun', 'Tahoma', sans-serif !important;
                    color: black !important;
                    font-size: 11pt !important;
                    padding: 0 !important; 
                    margin: 0 !important;
                }

                /* ซ่อนหน้าเว็บทั้งหมด */
                .no-print { display: none !important; }
                nav, sidebar, header { display: none !important; }
                
                /* บังคับแสดงส่วน Print Only พร้อมเซ็ต Padding เพื่อเป็นระยะขอบกระดาษแทน margin */
                .print-only { display: block !important; width: 100%; }
                .print-container { 
                    padding: 15mm !important; /* เว้นขอบกระดาษเข้ามา 1.5 cm */
                    box-sizing: border-box !important;
                }

                /* --- สไตล์ตาราง (Formal Table) --- */
                table.formal-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10pt;
                    margin-top: 10px;
                }
                
                table.formal-table thead {
                    border-top: 2px solid black;
                    border-bottom: 1px solid black;
                }
                table.formal-table th {
                    padding: 8px 4px;
                    font-weight: bold;
                    vertical-align: bottom;
                }
                
                table.formal-table td {
                    padding: 6px 4px;
                    border: none !important; 
                    vertical-align: top;
                }
                
                table.formal-table tbody {
                    border-bottom: 1px solid black;
                }

                .text-left { text-align: left !important; }
                .text-right { text-align: right !important; }
                .text-center { text-align: center !important; }
                .col-index { width: 40px; text-align: center; }

                /* --- สไตล์ท้ายกระดาษ (Footer) --- */
                .footer-container {
                    margin-top: 30px;
                    border-top: 1px solid black; 
                    padding-top: 5px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9pt;
                }

                tr { break-inside: avoid; page-break-inside: avoid; }
            }
        </component>
    </section>
    `,
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
  computed: {
    totalHistoryQtyIn() {
      return this.filteredHistory
        .filter((l) => l.type === "in")
        .reduce((sum, l) => sum + Number(l.qty), 0);
    },
    totalHistoryQtyOut() {
      return this.filteredHistory
        .filter((l) => l.type === "out")
        .reduce((sum, l) => sum + Number(l.qty), 0);
    },
    totalHistoryAmtIn() {
      return this.filteredHistory
        .filter((l) => l.type === "in")
        .reduce((sum, l) => sum + (l.totalPrice || 0), 0);
    },
    totalHistoryAmtOut() {
      return this.filteredHistory
        .filter((l) => l.type === "out")
        .reduce((sum, l) => sum + (l.totalPrice || 0), 0);
    },
    getReportTitle() {
      if (this.activeTab === "stock") return "รายงานสถานะสินค้าคงเหลือ";
      if (this.activeTab === "purchase") return "รายงานสินค้าที่ต้องสั่งซื้อ";
      if (this.activeTab === "history") return "รายงานสรุปการเคลื่อนไหวสินค้า";
      return "รายงานระบบคลังสินค้า";
    },
    activeStockData() {
      return this.stockData.filter((item) => item.active !== false);
    },
    totalUsageCost() {
      let total = 0;
      this.stockData.forEach((item) => {
        const totalOut = (item.history || [])
          .filter((h) => h.type === "out")
          .reduce((sum, h) => sum + Number(h.qty), 0);
        total += totalOut * (Number(item.price) || 0);
      });
      return total;
    },
    totalWasteCost() {
      return this.wastageLogs
        .filter((log) => log.active !== false)
        .reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    },
    lowStock() {
      return this.activeStockData.filter((i) => Number(i.qty) <= Number(i.min));
    },
    filteredHistory() {
      let logs = [];
      this.stockData.forEach((i) => {
        (i.history || []).forEach((h) => {
          const d = new Date(h.date);
          const formattedDate = !isNaN(d)
            ? d.toLocaleString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : h.date;

          logs.push({
            ...h,
            item: i.name,
            itemSku: i.sku,
            itemIdShort: i.id.substring(0, 8).toUpperCase(),
            unitStr: i.unit,
            unitPrice: Number(i.price) || 0, // ดึงราคาต่อหน่วยมาเก็บไว้
            totalPrice: Number(h.qty) * (Number(i.price) || 0), // คำนวณมูลค่ารวมของรายการนั้น
            displayDate: formattedDate,
          });
        });
      });

      let result = logs.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (this.startDate) {
        result = result.filter((log) => {
          if (!log.date) return false;
          const logDate = new Date(log.date).toISOString().split("T")[0];
          return logDate >= this.startDate && logDate <= this.endDate;
        });
      }
      return result;
    },
  },
  methods: {
    printReport() {
      const user = firebase.auth().currentUser;
      this.printUser = user ? user.email : "ผู้ดูแลระบบ";

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear() + 543;
      this.printDateShort = `${day}/${month}/${year}`;

      setTimeout(() => {
        window.print();
      }, 100);
    },
  },
};
