const ActivityLogView = {
    template: `
    <div class="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-bold text-slate-800">ประวัติการใช้งานระบบ</h2>
                <p class="text-sm text-slate-500 mt-1">ตรวจสอบการกระทำต่างๆ ของผู้ใช้ในระบบย้อนหลัง</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
            <div class="relative">
                <i class="fas fa-search absolute left-4 top-3.5 text-slate-400"></i>
                <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อผู้ใช้ หรือ รายละเอียด..." class="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition text-sm font-medium">
            </div>
            <select v-model="filterModule" class="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-600 cursor-pointer">
                <option value="">ทุกระบบ (Modules)</option>
                <option value="สต๊อกสินค้า">สต๊อกสินค้า (Inventory)</option>
                <option value="คู่ค้า">คู่ค้า (Suppliers)</option>
                <option value="ของเสีย">ของเสีย (Wastage)</option>
                <option value="ผู้ใช้งาน">ผู้ใช้งาน (Users)</option>
                <option value="ระบบล็อกอิน">ระบบล็อกอิน (Auth)</option>
            </select>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div class="overflow-x-auto h-[600px] overflow-y-auto custom-scrollbar">
                <table class="w-full text-left border-collapse relative">
                    <thead class="sticky top-0 bg-slate-100 z-10 shadow-sm">
                        <tr class="text-slate-500 text-xs uppercase tracking-widest">
                            <th class="p-5 font-black">วัน-เวลา</th>
                            <th class="p-5 font-black">ผู้ใช้งาน</th>
                            <th class="p-5 font-black">ระบบ</th>
                            <th class="p-5 font-black">การกระทำ (Action)</th>
                            <th class="p-5 font-black">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50 transition duration-150">
                            <td class="p-5 text-sm text-slate-500 font-mono">{{ formatDateTime(log.timestamp) }}</td>
                            <td class="p-5 font-bold text-slate-700">
                                <i class="fas fa-user-circle text-slate-300 mr-1"></i> {{ log.userEmail || 'Unknown' }}
                            </td>
                            <td class="p-5 text-xs font-bold text-slate-500 uppercase">{{ log.module }}</td>
                            <td class="p-5">
                                <span :class="getActionColor(log.action)" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center inline-flex gap-1.5 w-max">
                                    <i :class="getActionIcon(log.action)"></i> {{ log.action }}
                                </span>
                            </td>
                            <td class="p-5 text-sm text-slate-600 font-medium">{{ log.details }}</td>
                        </tr>
                        <tr v-if="filteredLogs.length === 0">
                            <td colspan="5" class="p-10 text-center text-slate-400 font-bold">ไม่พบประวัติการใช้งานตามเงื่อนไขที่ค้นหา</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            logs: [],
            searchQuery: '',
            filterModule: ''
        }
    },
    computed: {
        filteredLogs() {
            return this.logs.filter(log => {
                const matchSearch = (log.userEmail || '').toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                                    (log.details || '').toLowerCase().includes(this.searchQuery.toLowerCase());
                const matchModule = this.filterModule === '' || log.module === this.filterModule;
                return matchSearch && matchModule;
            });
        }
    },
    mounted() {
        // ดึงข้อมูลประวัติย้อนหลัง (จำกัดแค่ 200 รายการล่าสุดเพื่อไม่ให้ดึงข้อมูลหนักเกินไป)
        db.collection("activity_logs")
          .orderBy("timestamp", "desc")
          .limit(200)
          .onSnapshot((snapshot) => {
            const tempLogs = [];
            snapshot.forEach((doc) => {
                tempLogs.push({ id: doc.id, ...doc.data() });
            });
            this.logs = tempLogs;
        });
    },
    methods: {
        formatDateTime(timestamp) {
            if (!timestamp) return '-';
            // รองรับทั้ง Firestore Timestamp และ ISO String
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString('th-TH', { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute:'2-digit', second:'2-digit'
            });
        },
        getActionColor(action) {
            switch(action) {
                case 'CREATE': return 'bg-green-100 text-green-700';
                case 'UPDATE': return 'bg-blue-100 text-blue-700';
                case 'DELETE': return 'bg-red-100 text-red-700';
                case 'LOGIN': return 'bg-purple-100 text-purple-700';
                default: return 'bg-slate-100 text-slate-700';
            }
        },
        getActionIcon(action) {
            switch(action) {
                case 'CREATE': return 'fas fa-plus-circle';
                case 'UPDATE': return 'fas fa-edit';
                case 'DELETE': return 'fas fa-trash-alt';
                case 'LOGIN': return 'fas fa-sign-in-alt';
                default: return 'fas fa-info-circle';
            }
        }
    }
};