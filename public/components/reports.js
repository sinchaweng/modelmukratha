const ReportView = {
  props: ["categories"], 
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
      
      filterCategory: "", 
      
      currentPage: 1,
      itemsPerPage: 20 
    };
  },
  watch: {
    activeTab() { this.currentPage = 1; },
    filterCategory() { this.currentPage = 1; }
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

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div class="flex gap-3 overflow-x-auto pb-2 flex-1">
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

                <div class="min-w-[250px]">
                    <select v-model="filterCategory" class="w-full p-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 text-sm bg-white cursor-pointer shadow-sm">
                        <option value="">ดูข้อมูลทุกหมวดหมู่ (ทั้งหมด)</option>
                        <option v-for="cat in categories" :key="cat" :value="cat">เฉพาะหมวด: {{ cat }}</option>
                        <option value="ทั่วไป (ไม่ระบุหมวด)">เฉพาะหมวด: ทั่วไป (ไม่ระบุหมวด)</option>
                    </select>
                </div>
            </div>

            <div class="w-full min-h-[400px]">
                
                <div v-if="activeTab === 'stock'" class="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-blue-500 shadow-sm text-left">
                            <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">ต้นทุนวัตถุดิบที่เบิกจ่ายสะสม</p>
                            <p class="text-4xl font-black text-slate-800 font-mono">฿ {{ Math.round(totalUsageCost).toLocaleString() }}</p>
                        </div>
                        <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-red-500 shadow-sm text-left">
                            <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">มูลค่าความเสียหาย (ของเสียสะสม)</p>
                            <p class="text-4xl font-black text-red-600 font-mono">฿ {{ Math.round(totalWasteCost).toLocaleString() }}</p>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                        <h3 class="text-xl font-bold text-slate-700 mb-6 border-b pb-4 text-left flex items-center gap-3">
                            <i class="fas fa-clipboard-list text-blue-500"></i> รายการวัตถุดิบคงเหลือ <span v-if="filterCategory" class="text-blue-500 text-sm">({{ filterCategory }})</span>
                        </h3>
                        <table class="w-full text-left bg-white">
                            <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase tracking-wide font-bold border-b border-slate-300">
                                <tr>
                                    <th class="p-5 text-center w-16">ลำดับ</th>
                                    <th class="p-5 text-left">รหัส / ชื่อวัตถุดิบ</th>
                                    <th class="p-5 text-center">หน่วยนับ</th>
                                    <th class="p-5 text-right">ราคา/หน่วย</th>
                                    <th class="p-5 text-right">คงเหลือในคลัง</th>
                                    <th class="p-5 text-right">มูลค่ารวม</th>
                                </tr>
                            </thead>
                            
                            <tbody v-for="group in paginatedGroupedStock" :key="group.name">
                                <tr class="bg-slate-100">
                                    <td colspan="6" class="py-3 px-6 font-black text-slate-700 text-[13px] uppercase tracking-wide border-y border-slate-300">
                                         📁 หมวดหมู่: {{ group.name }}
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in group.items" :key="item.id" class="border-b border-slate-200 hover:bg-slate-50 transition">
                                    <td class="py-4 px-6 text-center text-slate-500">{{ index + 1 }}</td>
                                    <td class="py-4 px-6 text-left">
                                        <div class="text-[10px] text-orange-500 font-black mb-0.5 tracking-wider">{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</div>
                                        <div class="font-black text-slate-800">{{ item.name }}</div>
                                    </td>
                                    <td class="py-4 px-6 text-center text-slate-600 text-xs font-bold">{{ item.unit }}</td>
                                    <td class="py-4 px-6 text-right font-mono text-slate-600">฿{{ Math.round(item.price || 0).toLocaleString() }}</td>
                                    <td class="py-4 px-6 text-right">
                                        <span :class="Number(item.qty) <= Number(item.min) ? 'text-red-600 font-black' : 'text-slate-700 font-bold'" class="text-xl font-mono">
                                            {{ Math.round(item.qty).toLocaleString() }}
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-right font-mono font-black text-slate-700">
                                        ฿{{ Math.round((item.qty || 0) * (item.price || 0)).toLocaleString() }}
                                    </td>
                                </tr>
                                <tr v-if="group.showSubtotal" class="bg-slate-50 border-b-2 border-slate-300">
                                    <td colspan="5" class="py-3 px-6 text-right font-bold text-slate-600 text-sm">รวมมูลค่าหมวด {{ group.name }} (ทั้งหมด):</td>
                                    <td class="py-3 px-6 text-right font-black text-blue-700 font-mono text-lg">฿{{ Math.round(group.totalValue).toLocaleString() }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-if="totalStockItems === 0" class="py-16 text-center text-slate-400 font-bold text-lg border-b">
                            ไม่พบข้อมูลในหมวดหมู่นี้
                        </div>
                    </div>
                </div>

                <div v-if="activeTab === 'purchase'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <h3 class="text-xl font-bold text-orange-600 mb-6 border-b pb-4 text-left flex items-center gap-3">
                        <i class="fas fa-shopping-cart text-2xl"></i> ตารางรายการสั่งซื้อประจำวัน <span v-if="filterCategory" class="text-orange-400 text-sm">({{ filterCategory }})</span>
                    </h3>
                    <div v-if="paginatedGroupedPurchase.length > 0">
                        <table class="w-full bg-white">
                            <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase tracking-wide font-bold border-b border-slate-300">
                                <tr>
                                    <th class="p-5 text-center w-16">ลำดับ</th>
                                    <th class="p-5 text-left">รหัส / รายการวัตถุดิบ</th>
                                    <th class="p-5 text-center">จุดแจ้งเตือน</th>
                                    <th class="p-5 text-right">จำนวนที่ต้องซื้ออย่างน้อย</th>
                                </tr>
                            </thead>
                            <tbody v-for="group in paginatedGroupedPurchase" :key="group.name">
                                <tr class="bg-slate-100">
                                    <td colspan="4" class="py-3 px-6 font-black text-slate-700 text-[13px] uppercase tracking-wide border-y border-slate-300">
                                         📁 หมวดหมู่: {{ group.name }}
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in group.items" :key="item.id" class="border-b border-orange-50 bg-orange-50/30 hover:bg-orange-100 transition">
                                    <td class="py-4 px-6 text-center text-slate-600">{{ index + 1 }}</td>
                                    <td class="py-4 px-6 text-left">
                                        <div class="text-[10px] text-orange-500 font-black mb-0.5 tracking-wider">{{ item.sku || item.id.substring(0,8).toUpperCase() }}</div>
                                        <div class="font-black text-slate-800 text-[16px]">{{ item.name }}</div>
                                    </td>
                                    <td class="py-4 px-6 text-center font-bold text-orange-600">{{ Math.round(item.min).toLocaleString() }} {{ item.unit }}</td>
                                    <td class="py-4 px-6 text-right">
                                        <span class="text-red-600 font-black text-3xl font-mono">+ {{ Math.round((Number(item.min) - Number(item.qty)) + 1).toLocaleString() }}</span>
                                        <span class="text-slate-600 text-xs font-bold uppercase ml-2">{{ item.unit }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="py-24 text-center text-slate-400 font-bold text-xl">
                        {{ filterCategory ? 'ไม่มีสินค้าที่ต้องซื้อเพิ่มในหมวดหมู่นี้' : 'สต๊อกปกติทุกรายการ ไม่ต้องซื้อเพิ่ม' }}
                    </div>
                </div>

                <div v-if="activeTab === 'history'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-4">
                        <h3 class="text-xl font-bold text-slate-700 flex items-center gap-3 text-left">
                            <i class="fas fa-history text-emerald-500 text-2xl"></i> ประวัติความเคลื่อนไหว <span v-if="filterCategory" class="text-emerald-500 text-sm">({{ filterCategory }})</span>
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
                                    <th class="p-5 text-left">รหัส / รายการ</th>
                                    <th class="p-5 text-center">ประเภท</th>
                                    <th class="p-5 text-right">จำนวน</th>
                                    <th class="p-5 text-right">รวมเป็นเงิน</th>
                                </tr>
                            </thead>
                            
                            <tbody v-for="group in paginatedGroupedHistory" :key="group.name">
                                <tr class="bg-slate-100">
                                    <td colspan="6" class="py-3 px-6 font-black text-slate-700 text-[13px] uppercase tracking-wide border-y border-slate-300">
                                         📁 หมวดหมู่: {{ group.name }}
                                    </td>
                                </tr>
                                <tr v-for="(log, idx) in group.logs" :key="idx" class="border-b border-slate-200 hover:bg-slate-50 transition">
                                    <td class="py-4 px-6 text-center text-slate-600">{{ idx + 1 }}</td>
                                    <td class="py-4 px-6 text-slate-700 text-[12px] font-mono">{{ log.displayDate }}</td>
                                    <td class="py-4 px-6 text-left">
                                        <div class="text-[10px] text-slate-400 font-bold">{{ log.itemSku }}</div>
                                        <div class="font-black text-slate-800">{{ log.item }}</div>
                                    </td>
                                    <td class="py-4 px-6 text-center">
                                        <span :class="log.type === 'in' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-orange-600 bg-orange-50 border-orange-100'" 
                                              class="px-3 py-1 rounded-full text-[10px] font-black uppercase border">
                                            {{ log.type === 'in' ? 'รับเข้า' : 'เบิกจ่าย' }}
                                        </span>
                                    </td>
                                    <td class="py-4 px-6 text-right font-bold" :class="log.type === 'in' ? 'text-blue-600' : 'text-orange-600'">
                                        {{ log.type === 'in' ? '+' : '-' }} {{ Math.round(log.qty).toLocaleString() }} <span class="text-[10px] text-slate-400 font-normal">{{ log.unitStr }}</span>
                                    </td>
                                    <td class="py-4 px-6 text-right font-black font-mono" :class="log.type === 'in' ? 'text-blue-700' : 'text-orange-700'">
                                        ฿{{ Math.round(log.totalPrice).toLocaleString() }}
                                    </td>
                                </tr>
                                <tr v-if="group.showSubtotal" class="bg-slate-50 border-b-2 border-slate-300">
                                    <td colspan="5" class="py-3 px-6 text-right font-bold text-slate-600 text-sm">สรุปยอดหมวด {{ group.name }} (ทั้งหมด):</td>
                                    <td class="py-3 px-6 text-right font-mono font-black">
                                        <div v-if="group.totalIn > 0" class="text-blue-700">เข้า: ฿{{ Math.round(group.totalIn).toLocaleString() }}</div>
                                        <div v-if="group.totalOut > 0" class="text-orange-700">ออก: ฿{{ Math.round(group.totalOut).toLocaleString() }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-if="totalHistoryItems === 0" class="py-16 text-center text-slate-400 font-bold text-lg border-b">
                            ไม่พบประวัติการทำรายการในช่วงเวลาที่ระบุ
                        </div>
                    </div>
                </div>

                <div v-if="currentTotalPages > 1" class="flex flex-col sm:flex-row justify-between items-center mt-6 pt-2 pb-6 px-4">
                    <div class="text-sm font-bold text-slate-500 mb-4 sm:mb-0">
                        แสดงรายการที่ {{ ((currentPage - 1) * itemsPerPage) + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, currentTotalItems) }} จากทั้งหมด {{ currentTotalItems }} รายการ
                    </div>
                    <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button @click="currentPage--" :disabled="currentPage === 1" class="px-5 py-2 bg-white hover:bg-slate-50 disabled:bg-transparent disabled:opacity-40 text-slate-700 font-bold rounded-xl transition shadow-sm disabled:shadow-none">
                            <i class="fas fa-chevron-left mr-1 text-xs"></i> ก่อนหน้า
                        </button>
                        <div class="flex items-center px-4 font-black text-slate-800 text-sm">
                            หน้า {{ currentPage }} / {{ currentTotalPages }}
                        </div>
                        <button @click="currentPage++" :disabled="currentPage === currentTotalPages" class="px-5 py-2 bg-white hover:bg-slate-50 disabled:bg-transparent disabled:opacity-40 text-slate-700 font-bold rounded-xl transition shadow-sm disabled:shadow-none">
                            ถัดไป <i class="fas fa-chevron-right ml-1 text-xs"></i>
                        </button>
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

            <div style="font-size: 10pt; margin-bottom: 10px; text-align: left; display: flex; justify-content: space-between;">
                <span v-if="activeTab === 'history' && startDate">วันที่เอกสารตั้งแต่ {{ startDate }} ถึง {{ endDate || printDateShort }}</span>
                <span v-else>วันที่เอกสาร ณ วันที่ {{ printDateShort }}</span>
                <span v-if="filterCategory" style="font-weight: bold; font-style: italic;">กรองเฉพาะหมวดหมู่: {{ filterCategory }}</span>
            </div>

            <div class="table-container">
                <table v-if="activeTab === 'stock'" class="formal-table">
                    <thead>
                        <tr>
                            <th class="col-index">ลำดับ</th>
                            <th class="text-left">รหัสสินค้า</th>
                            <th class="text-left">ชื่อสินค้า</th>
                            <th class="text-center">หน่วยนับ</th>
                            <th class="text-right">ราคา/หน่วย</th>
                            <th class="text-right">ยอดคงเหลือ</th>
                            <th class="text-right">มูลค่ารวม</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in printStockData" :key="item.id">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td>{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</td>
                            <td>{{ item.name }}</td>
                            <td class="text-center">{{ item.unit }}</td>
                            <td class="text-right">{{ Math.round(item.price || 0).toLocaleString() }}</td>
                            <td class="text-right">{{ Math.round(item.qty).toLocaleString() }}</td>
                            <td class="text-right">{{ Math.round((item.qty || 0) * (item.price || 0)).toLocaleString() }}</td>
                        </tr>
                    </tbody>
                    <tbody class="grand-total">
                        <tr>
                            <td colspan="6" class="text-right">ยอดมูลค่าคงเหลือรวมทั้งสิ้น (Grand Total) :</td>
                            <td class="text-right">{{ Math.round(totalStockValue).toLocaleString() }}</td>
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
                            <tr v-for="(item, index) in printPurchaseData" :key="item.id">
                                <td class="text-center">{{ index + 1 }}</td>
                                <td>{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</td>
                                <td>{{ item.name }}</td>
                                <td class="text-center">{{ item.unit }}</td>
                                <td class="text-right">{{ Math.round(item.qty).toLocaleString() }}</td>
                                <td class="text-right">{{ Math.round(item.min).toLocaleString() }}</td>
                                <td class="text-right" style="font-weight: bold;">{{ Math.round((Number(item.min) - Number(item.qty)) + 1).toLocaleString() }}</td>
                            </tr>
                        </tbody>
                        <tbody v-if="printPurchaseData.length === 0">
                            <tr>
                                <td colspan="7" class="text-center">สต๊อกปกติ หรือ ไม่มีสินค้าในหมวดหมู่นี้ที่ต้องสั่งซื้อเพิ่ม</td>
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
                                <th rowspan="2" class="text-left">รหัสสินค้า</th>
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
                            <tr v-for="(log, idx) in printHistoryData" :key="idx">
                                <td class="text-center">{{ idx + 1 }}</td>
                                <td style="font-size: 9pt;">{{ log.displayDate }}</td>
                                <td>{{ log.itemSku || log.itemIdShort }}</td>
                                <td>{{ log.item }}</td>
                                <td class="text-right">{{ log.type === 'in' ? Math.round(log.qty).toLocaleString() : '-' }}</td>
                                <td class="text-right">{{ log.type === 'out' ? Math.round(log.qty).toLocaleString() : '-' }}</td>
                                <td class="text-right">{{ log.type === 'in' ? Math.round(log.totalPrice).toLocaleString() : '-' }}</td>
                                <td class="text-right">{{ log.type === 'out' ? Math.round(log.totalPrice).toLocaleString() : '-' }}</td>
                            </tr>
                        </tbody>
                        <tbody v-if="printHistoryData.length > 0" class="grand-total">
                            <tr>
                                <td colspan="6" class="text-right">ยอดรวมมูลค่าเคลื่อนไหวสุทธิ (Grand Total) :</td>
                                <td class="text-right">{{ Math.round(totalHistoryAmtIn).toLocaleString() }}</td>
                                <td class="text-right">{{ Math.round(totalHistoryAmtOut).toLocaleString() }}</td>
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
                @page { 
                    margin: 8mm; 
                    size: A4 portrait; 
                }
                
                body, html, #app { 
                    background-color: white !important; 
                    font-family: 'Sarabun', 'Tahoma', sans-serif !important;
                    color: black !important;
                    font-size: 11pt !important;
                    padding: 0 !important; 
                    margin: 0 !important;
                }

                .no-print { display: none !important; }
                nav, sidebar, header, .mobile-header { display: none !important; }
                
                .print-only { display: block !important; width: 100%; }
                .print-container { 
                    padding: 0 !important; 
                    box-sizing: border-box !important;
                }

                table.formal-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10pt;
                    margin-top: 10px;
                }
                
                table.formal-table thead {
                    display: table-header-group; 
                    border-top: 2px solid black;
                    border-bottom: 1px solid black;
                }
                table.formal-table th {
                    padding: 10px 4px;
                    font-weight: bold;
                    vertical-align: middle !important;
                }
                table.formal-table td {
                    padding: 6px 4px;
                    border: none !important; 
                    vertical-align: top;
                }
                
                .grand-total td {
                    font-weight: bold;
                    font-size: 12pt;
                    border-top: 2px solid black;
                    border-bottom: 3px double black;
                    padding: 10px 4px;
                }

                .text-left { text-align: left !important; }
                .text-right { text-align: right !important; }
                .text-center { text-align: center !important; }
                .col-index { width: 40px; text-align: center; }

                .footer-container {
                    margin-top: 30px;
                    border-top: 1px solid black; 
                    padding-top: 5px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9pt;
                    page-break-inside: avoid;
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
    getReportTitle() {
      if (this.activeTab === "stock") return "รายงานสถานะสินค้าคงเหลือ";
      if (this.activeTab === "purchase") return "รายงานสินค้าที่ต้องสั่งซื้อ";
      if (this.activeTab === "history") return "รายงานสรุปการเคลื่อนไหวสินค้า";
      return "รายงานระบบคลังสินค้า";
    },
    
    activeStockData() {
      return this.stockData.filter((item) => {
        if(item.active === false) return false;
        const cat = item.cat || item.type || 'ทั่วไป (ไม่ระบุหมวด)';
        if(this.filterCategory !== "" && cat !== this.filterCategory) return false;
        return true;
      });
    },

    // ----------------------------------------------------
    // สำหรับหน้า Print: ดึงข้อมูลเป็น List ยาว (Flat Array)
    // ----------------------------------------------------
    printStockData() {
        return this.activeStockData.slice().sort((a, b) => {
            const catA = a.cat || a.type || 'ทั่วไป';
            const catB = b.cat || b.type || 'ทั่วไป';
            if (catA === catB) return (a.name || '').localeCompare(b.name || '', 'th');
            return catA.localeCompare(catB, 'th');
        });
    },
    printPurchaseData() {
        return this.purchaseItemsFlat.slice().sort((a, b) => {
            const catA = a.cat || a.type || 'ทั่วไป';
            const catB = b.cat || b.type || 'ทั่วไป';
            if (catA === catB) return (a.name || '').localeCompare(b.name || '', 'th');
            return catA.localeCompare(catB, 'th');
        });
    },
    printHistoryData() {
        return this.filteredHistoryLogs.slice().sort((a, b) => b.timestamp - a.timestamp);
    },

    // ----------------------------------------------------
    // TAB 1: สต๊อก (สำหรับ Web UI)
    // ----------------------------------------------------
    totalStockItems() { return this.activeStockData.length; },
    totalStockPages() { return Math.ceil(this.totalStockItems / this.itemsPerPage) || 1; },
    groupedStock() {
        const groups = {};
        this.activeStockData.forEach(item => {
            const cat = item.cat || item.type || 'ทั่วไป (ไม่ระบุหมวด)';
            if(!groups[cat]) groups[cat] = { name: cat, items: [], totalValue: 0 };
            groups[cat].items.push(item);
            groups[cat].totalValue += (Number(item.qty) || 0) * (Number(item.price) || 0);
        });
        const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name, 'th'));
        sorted.forEach(g => g.items.sort((a,b) => (a.name||'').localeCompare(b.name||'','th')));
        return sorted;
    },
    paginatedGroupedStock() {
        let startIndex = (this.currentPage - 1) * this.itemsPerPage;
        let endIndex = startIndex + this.itemsPerPage;
        let currentIndex = 0;
        let result = [];

        this.groupedStock.forEach(group => {
            let itemsInPage = [];
            group.items.forEach(item => {
                if (currentIndex >= startIndex && currentIndex < endIndex) {
                    itemsInPage.push(item);
                }
                currentIndex++;
            });

            if (itemsInPage.length > 0) {
                const lastItemOfGroup = group.items[group.items.length - 1];
                const showSubtotal = itemsInPage.includes(lastItemOfGroup);

                result.push({
                    ...group,
                    items: itemsInPage,
                    showSubtotal: showSubtotal
                });
            }
        });
        return result;
    },
    totalStockValue() {
        return this.groupedStock.reduce((sum, g) => sum + g.totalValue, 0);
    },

    // ----------------------------------------------------
    // TAB 2: สั่งซื้อ (สำหรับ Web UI)
    // ----------------------------------------------------
    purchaseItemsFlat() { return this.activeStockData.filter((i) => Number(i.qty) <= Number(i.min)); },
    totalPurchaseItems() { return this.purchaseItemsFlat.length; },
    totalPurchasePages() { return Math.ceil(this.totalPurchaseItems / this.itemsPerPage) || 1; },
    groupedPurchase() {
        const groups = {};
        this.purchaseItemsFlat.forEach(item => {
            const cat = item.cat || item.type || 'ทั่วไป (ไม่ระบุหมวด)';
            if(!groups[cat]) groups[cat] = { name: cat, items: [] };
            groups[cat].items.push(item);
        });
        const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name, 'th'));
        sorted.forEach(g => g.items.sort((a,b) => (a.name||'').localeCompare(b.name||'','th')));
        return sorted;
    },
    paginatedGroupedPurchase() {
        let startIndex = (this.currentPage - 1) * this.itemsPerPage;
        let endIndex = startIndex + this.itemsPerPage;
        let currentIndex = 0;
        let result = [];

        this.groupedPurchase.forEach(group => {
            let itemsInPage = [];
            group.items.forEach(item => {
                if (currentIndex >= startIndex && currentIndex < endIndex) {
                    itemsInPage.push(item);
                }
                currentIndex++;
            });
            if (itemsInPage.length > 0) {
                result.push({ ...group, items: itemsInPage });
            }
        });
        return result;
    },

    // ----------------------------------------------------
    // TAB 3: ประวัติ (สำหรับ Web UI)
    // ----------------------------------------------------
    filteredHistoryLogs() {
        let logs = [];
        this.activeStockData.forEach((i) => {
            (i.history || []).forEach((h) => {
                const d = new Date(h.date);
                const formattedDate = !isNaN(d)
                    ? d.toLocaleString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    : h.date;

                logs.push({
                    ...h,
                    item: i.name,
                    itemCat: i.cat || i.type || 'ทั่วไป (ไม่ระบุหมวด)',
                    itemSku: i.sku,
                    itemIdShort: i.id.substring(0, 8).toUpperCase(),
                    unitStr: i.unit,
                    unitPrice: Number(i.price) || 0, 
                    totalPrice: Number(h.qty) * (Number(i.price) || 0), 
                    displayDate: formattedDate,
                    timestamp: !isNaN(d) ? d.getTime() : 0 
                });
            });
        });

        if (this.startDate) {
            logs = logs.filter((log) => {
                if (!log.date) return false;
                const logDate = new Date(log.date).toISOString().split("T")[0];
                return logDate >= this.startDate && logDate <= this.endDate;
            });
        }
        return logs;
    },
    totalHistoryItems() { return this.filteredHistoryLogs.length; },
    totalHistoryPages() { return Math.ceil(this.totalHistoryItems / this.itemsPerPage) || 1; },
    groupedHistory() {
      const groups = {};
      this.filteredHistoryLogs.forEach(log => {
          if(!groups[log.itemCat]) {
              groups[log.itemCat] = { name: log.itemCat, logs: [], totalIn: 0, totalOut: 0 };
          }
          groups[log.itemCat].logs.push(log);
          if(log.type === 'in') groups[log.itemCat].totalIn += log.totalPrice;
          if(log.type === 'out') groups[log.itemCat].totalOut += log.totalPrice;
      });

      const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name, 'th'));
      sorted.forEach(g => g.logs.sort((a,b) => b.timestamp - a.timestamp));
      
      return sorted;
    },
    paginatedGroupedHistory() {
        let startIndex = (this.currentPage - 1) * this.itemsPerPage;
        let endIndex = startIndex + this.itemsPerPage;
        let currentIndex = 0;
        let result = [];

        this.groupedHistory.forEach(group => {
            let logsInPage = [];
            group.logs.forEach(log => {
                if (currentIndex >= startIndex && currentIndex < endIndex) {
                    logsInPage.push(log);
                }
                currentIndex++;
            });

            if (logsInPage.length > 0) {
                const lastLogOfGroup = group.logs[group.logs.length - 1];
                const showSubtotal = logsInPage.includes(lastLogOfGroup);
                result.push({ ...group, logs: logsInPage, showSubtotal: showSubtotal });
            }
        });
        return result;
    },
    totalHistoryAmtIn() {
        return this.groupedHistory.reduce((sum, g) => sum + g.totalIn, 0);
    },
    totalHistoryAmtOut() {
        return this.groupedHistory.reduce((sum, g) => sum + g.totalOut, 0);
    },

    totalUsageCost() {
      let total = 0;
      this.activeStockData.forEach((item) => {
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

    currentTotalItems() {
        if (this.activeTab === 'stock') return this.totalStockItems;
        if (this.activeTab === 'purchase') return this.totalPurchaseItems;
        if (this.activeTab === 'history') return this.totalHistoryItems;
        return 0;
    },
    currentTotalPages() {
        if (this.activeTab === 'stock') return this.totalStockPages;
        if (this.activeTab === 'purchase') return this.totalPurchasePages;
        if (this.activeTab === 'history') return this.totalHistoryPages;
        return 1;
    }
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