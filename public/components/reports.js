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
                            <p class="text-4xl font-black text-slate-800 font-mono">฿ {{ Math.round(totalUsageCost).toLocaleString() }}</p>
                        </div>
                        <div class="bg-white p-6 rounded-3xl border-l-[12px] border-l-red-500 shadow-sm text-left">
                            <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">มูลค่าความเสียหาย (ของเสียสะสม)</p>
                            <p class="text-4xl font-black text-red-600 font-mono">฿ {{ Math.round(totalWasteCost).toLocaleString() }}</p>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                        <h3 class="text-xl font-bold text-slate-700 mb-6 border-b pb-4 text-left flex items-center gap-3">
                            <i class="fas fa-clipboard-list text-blue-500"></i> ตารางรายการสถานะวัตถุดิบคงเหลือ (แยกตามหมวดหมู่)
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
                            
                            <tbody v-for="group in groupedStock" :key="group.name">
                                <tr class="bg-slate-100">
                                    <td colspan="6" class="py-3 px-6 font-black text-slate-700 text-[13px] uppercase tracking-wide border-y border-slate-300">
                                         หมวดหมู่: {{ group.name }}
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
                                <tr class="bg-slate-50 border-b-2 border-slate-300">
                                    <td colspan="5" class="py-3 px-6 text-right font-bold text-slate-600 text-sm">รวมมูลค่าหมวด {{ group.name }} :</td>
                                    <td class="py-3 px-6 text-right font-black text-blue-700 font-mono text-lg">฿{{ Math.round(group.totalValue).toLocaleString() }}</td>
                                </tr>
                            </tbody>
                            <tfoot class="bg-slate-800 text-white">
                                <tr>
                                    <td colspan="5" class="py-5 px-6 text-right font-black text-lg">ยอดมูลค่าคงเหลือสุทธิ (Grand Total) :</td>
                                    <td class="py-5 px-6 text-right font-black text-orange-400 font-mono text-2xl">฿{{ Math.round(totalStockValue).toLocaleString() }}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div v-if="activeTab === 'purchase'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <h3 class="text-xl font-bold text-orange-600 mb-6 border-b pb-4 text-left flex items-center gap-3">
                        <i class="fas fa-shopping-cart text-2xl"></i> ตารางรายการสั่งซื้อประจำวัน (แยกตามหมวดหมู่)
                    </h3>
                    <div v-if="groupedPurchase.length > 0">
                        <table class="w-full bg-white">
                            <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase tracking-wide font-bold border-b border-slate-300">
                                <tr>
                                    <th class="p-5 text-center w-16">ลำดับ</th>
                                    <th class="p-5 text-left">รหัส / รายการวัตถุดิบ</th>
                                    <th class="p-5 text-center">จุดแจ้งเตือน</th>
                                    <th class="p-5 text-right">จำนวนที่ต้องซื้ออย่างน้อย</th>
                                </tr>
                            </thead>
                            <tbody v-for="group in groupedPurchase" :key="group.name">
                                <tr class="bg-slate-100">
                                    <td colspan="4" class="py-3 px-6 font-black text-slate-700 text-[13px] uppercase tracking-wide border-y border-slate-300">
                                         หมวดหมู่: {{ group.name }}
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
                    <div v-else class="py-24 text-center text-slate-200 font-bold text-xl">
                        สต๊อกปกติทุกรายการ ไม่ต้องซื้อเพิ่ม
                    </div>
                </div>

                <div v-if="activeTab === 'history'" class="bg-white p-8 rounded-[2.5rem] border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-4">
                        <h3 class="text-xl font-bold text-slate-700 flex items-center gap-3 text-left">
                            <i class="fas fa-history text-emerald-500 text-2xl"></i> ประวัติความเคลื่อนไหวและกิจกรรม (แยกตามหมวดหมู่)
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
                            
                            <tbody v-for="group in groupedHistory" :key="group.name">
                                <tr class="bg-slate-100">
                                    <td colspan="6" class="py-3 px-6 font-black text-slate-700 text-[13px] uppercase tracking-wide border-y border-slate-300">
                                         หมวดหมู่: {{ group.name }}
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
                                <tr class="bg-slate-50 border-b-2 border-slate-300">
                                    <td colspan="5" class="py-3 px-6 text-right font-bold text-slate-600 text-sm">สรุปยอดเคลื่อนไหวหมวด {{ group.name }} :</td>
                                    <td class="py-3 px-6 text-right font-mono font-black">
                                        <div v-if="group.totalIn > 0" class="text-blue-700">เข้า: ฿{{ Math.round(group.totalIn).toLocaleString() }}</div>
                                        <div v-if="group.totalOut > 0" class="text-orange-700">ออก: ฿{{ Math.round(group.totalOut).toLocaleString() }}</div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot v-if="groupedHistory.length > 0" class="bg-slate-800 text-white">
                                <tr>
                                    <td colspan="5" class="py-5 px-6 text-right font-black text-lg">ยอดรวมสุทธิทุกหมวดหมู่ (Grand Total) :</td>
                                    <td class="py-5 px-6 text-right font-black">
                                        <div class="text-blue-300 text-lg font-mono">รับเข้ารวม: ฿{{ Math.round(totalHistoryAmtIn).toLocaleString() }}</div>
                                        <div class="text-orange-300 text-lg font-mono">เบิกจ่ายรวม: ฿{{ Math.round(totalHistoryAmtOut).toLocaleString() }}</div>
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
                            <th class="text-center">หน่วยนับ</th>
                            <th class="text-right">ราคา/หน่วย</th>
                            <th class="text-right">ยอดคงเหลือ</th>
                            <th class="text-right">มูลค่ารวม</th>
                        </tr>
                    </thead>
                    <tbody v-for="group in groupedStock" :key="group.name">
                        <tr class="group-header">
                            <td colspan="7">หมวดหมู่: {{ group.name }}</td>
                        </tr>
                        <tr v-for="(item, index) in group.items" :key="item.id">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td>{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</td>
                            <td>{{ item.name }}</td>
                            <td class="text-center">{{ item.unit }}</td>
                            <td class="text-right">{{ Math.round(item.price || 0).toLocaleString() }}</td>
                            <td class="text-right">{{ Math.round(item.qty).toLocaleString() }}</td>
                            <td class="text-right">{{ Math.round((item.qty || 0) * (item.price || 0)).toLocaleString() }}</td>
                        </tr>
                        <tr class="subtotal-row">
                            <td colspan="6" class="text-right">รวมมูลค่าหมวด {{ group.name }} :</td>
                            <td class="text-right">{{ Math.round(group.totalValue).toLocaleString() }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="grand-total">
                        <tr>
                            <td colspan="6" class="text-right">ยอดมูลค่าคงเหลือรวมทั้งสิ้น (Grand Total) :</td>
                            <td class="text-right">{{ Math.round(totalStockValue).toLocaleString() }}</td>
                        </tr>
                    </tfoot>
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
                        <tbody v-for="group in groupedPurchase" :key="group.name">
                            <tr class="group-header">
                                <td colspan="7">หมวดหมู่: {{ group.name }}</td>
                            </tr>
                            <tr v-for="(item, index) in group.items" :key="item.id">
                                <td class="text-center">{{ index + 1 }}</td>
                                <td>{{ item.sku || item.id.substring(0, 8).toUpperCase() }}</td>
                                <td>{{ item.name }}</td>
                                <td class="text-center">{{ item.unit }}</td>
                                <td class="text-right">{{ Math.round(item.qty).toLocaleString() }}</td>
                                <td class="text-right">{{ Math.round(item.min).toLocaleString() }}</td>
                                <td class="text-right" style="font-weight: bold;">{{ Math.round((Number(item.min) - Number(item.qty)) + 1).toLocaleString() }}</td>
                            </tr>
                        </tbody>
                        <tbody v-if="groupedPurchase.length === 0">
                            <tr>
                                <td colspan="7" class="text-center">สต๊อกปกติทุกรายการ ไม่มีสินค้าที่ต้องสั่งซื้อเพิ่ม</td>
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
                        <tbody v-for="group in groupedHistory" :key="group.name">
                            <tr class="group-header">
                                <td colspan="8">หมวดหมู่: {{ group.name }}</td>
                            </tr>
                            <tr v-for="(log, idx) in group.logs" :key="idx">
                                <td class="text-center">{{ idx + 1 }}</td>
                                <td style="font-size: 9pt;">{{ log.displayDate }}</td>
                                <td>{{ log.itemSku || log.itemIdShort }}</td>
                                <td>{{ log.item }}</td>
                                <td class="text-right">{{ log.type === 'in' ? Math.round(log.qty).toLocaleString() : '-' }}</td>
                                <td class="text-right">{{ log.type === 'out' ? Math.round(log.qty).toLocaleString() : '-' }}</td>
                                <td class="text-right">{{ log.type === 'in' ? Math.round(log.totalPrice).toLocaleString() : '-' }}</td>
                                <td class="text-right">{{ log.type === 'out' ? Math.round(log.totalPrice).toLocaleString() : '-' }}</td>
                            </tr>
                            <tr class="subtotal-row">
                                <td colspan="6" class="text-right">รวมมูลค่าหมวด {{ group.name }} :</td>
                                <td class="text-right">{{ Math.round(group.totalIn).toLocaleString() }}</td>
                                <td class="text-right">{{ Math.round(group.totalOut).toLocaleString() }}</td>
                            </tr>
                        </tbody>
                        <tfoot v-if="groupedHistory.length > 0" class="grand-total">
                            <tr>
                                <td colspan="6" class="text-right">ยอดรวมมูลค่าเคลื่อนไหวสุทธิ (Grand Total) :</td>
                                <td class="text-right">{{ Math.round(totalHistoryAmtIn).toLocaleString() }}</td>
                                <td class="text-right">{{ Math.round(totalHistoryAmtOut).toLocaleString() }}</td>
                            </tr>
                        </tfoot>
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
                @page { margin: 0mm; size: A4 portrait; }
                
                body, html, #app { 
                    background-color: white !important; 
                    font-family: 'Sarabun', 'Tahoma', sans-serif !important;
                    color: black !important;
                    font-size: 11pt !important;
                    padding: 0 !important; 
                    margin: 0 !important;
                }

                .no-print { display: none !important; }
                nav, sidebar, header { display: none !important; }
                
                .print-only { display: block !important; width: 100%; }
                .print-container { 
                    padding: 15mm !important; 
                    box-sizing: border-box !important;
                }

                /* ตารางมาตรฐานเอกสารบัญชี */
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
                
                /* จัดการเส้นแบ่ง Subtotal และ Grand Total */
                .group-header td {
                    font-weight: bold;
                    background-color: #f8fafc !important; /* สีเทาอ่อนตอนพิมพ์ถ้าปรินท์สี */
                    border-top: 1px solid black;
                    border-bottom: 1px dashed #ccc;
                    -webkit-print-color-adjust: exact;
                }
                .subtotal-row td {
                    font-weight: bold;
                    border-top: 1px dashed black;
                    border-bottom: 1px solid black;
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
      if (this.activeTab === "stock") return "รายงานสถานะสินค้าคงเหลือ แยกตามหมวดหมู่";
      if (this.activeTab === "purchase") return "รายงานสินค้าที่ต้องสั่งซื้อ แยกตามหมวดหมู่";
      if (this.activeTab === "history") return "รายงานสรุปการเคลื่อนไหวสินค้า แยกตามหมวดหมู่";
      return "รายงานระบบคลังสินค้า";
    },
    
    // ดึงเฉพาะข้อมูลที่ยังไม่ถูกลบ
    activeStockData() {
      return this.stockData.filter((item) => item.active !== false);
    },

    // 1. จัดกลุ่มและหาผลรวม Tab 1 (สต๊อก)
    groupedStock() {
        const groups = {};
        this.activeStockData.forEach(item => {
            const cat = item.cat || item.type || 'ทั่วไป (ไม่ระบุหมวด)';
            if(!groups[cat]) {
                groups[cat] = { name: cat, items: [], totalValue: 0 };
            }
            groups[cat].items.push(item);
            groups[cat].totalValue += (Number(item.qty) || 0) * (Number(item.price) || 0);
        });
        
        // เรียงหมวดหมู่ (ก-ฮ)
        const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name, 'th'));
        // เรียงสินค้าในหมวดหมู่ (ก-ฮ)
        sorted.forEach(g => g.items.sort((a,b) => (a.name||'').localeCompare(b.name||'','th')));
        return sorted;
    },
    
    totalStockValue() {
        return this.groupedStock.reduce((sum, g) => sum + g.totalValue, 0);
    },

    // 2. จัดกลุ่ม Tab 2 (สั่งซื้อ)
    groupedPurchase() {
        const low = this.activeStockData.filter((i) => Number(i.qty) <= Number(i.min));
        const groups = {};
        low.forEach(item => {
            const cat = item.cat || item.type || 'ทั่วไป (ไม่ระบุหมวด)';
            if(!groups[cat]) groups[cat] = { name: cat, items: [] };
            groups[cat].items.push(item);
        });
        const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name, 'th'));
        sorted.forEach(g => g.items.sort((a,b) => (a.name||'').localeCompare(b.name||'','th')));
        return sorted;
    },

    // 3. กรองและจัดกลุ่ม Tab 3 (ประวัติการเคลื่อนไหว)
    groupedHistory() {
      let logs = [];
      // ลูปเฉพาะจาก activeStockData เพื่อ "กรองวัตถุดิบที่ไม่ใช้ออก" ตามที่ขอ
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
            timestamp: !isNaN(d) ? d.getTime() : 0 // เอาไว้ใช้เรียงเวลา
          });
        });
      });

      // กรองวันที่ก่อน
      if (this.startDate) {
        logs = logs.filter((log) => {
          if (!log.date) return false;
          const logDate = new Date(log.date).toISOString().split("T")[0];
          return logDate >= this.startDate && logDate <= this.endDate;
        });
      }

      // จัดกลุ่มตามหมวดหมู่
      const groups = {};
      logs.forEach(log => {
          if(!groups[log.itemCat]) {
              groups[log.itemCat] = { name: log.itemCat, logs: [], totalIn: 0, totalOut: 0 };
          }
          groups[log.itemCat].logs.push(log);
          if(log.type === 'in') groups[log.itemCat].totalIn += log.totalPrice;
          if(log.type === 'out') groups[log.itemCat].totalOut += log.totalPrice;
      });

      // เรียงหมวดหมู่ (ก-ฮ)
      const sorted = Object.values(groups).sort((a,b) => a.name.localeCompare(b.name, 'th'));
      // เรียง Log ในแต่ละหมวดหมู่ (เวลาใหม่สุด -> เก่าสุด)
      sorted.forEach(g => g.logs.sort((a,b) => b.timestamp - a.timestamp));
      
      return sorted;
    },

    totalHistoryAmtIn() {
        return this.groupedHistory.reduce((sum, g) => sum + g.totalIn, 0);
    },
    
    totalHistoryAmtOut() {
        return this.groupedHistory.reduce((sum, g) => sum + g.totalOut, 0);
    },

    totalUsageCost() {
      // ดึงจาก activeStockData แทน เพื่อไม่รวมของที่ลบแล้ว
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