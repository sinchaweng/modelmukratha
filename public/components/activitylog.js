const ActivityLogView = {
    template: `
    <div class="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-bold text-slate-800">ประวัติการใช้งานระบบ</h2>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-3 text-slate-600 text-sm"></i>
                <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อผู้ใช้ หรือ รายละเอียด..." 
                       class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition text-sm font-medium">
            </div>

            <select v-model="filterModule" 
                    class="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-600 cursor-pointer">
                <option value="">ทุกระบบ (Modules)</option>
                <option value="สต๊อกสินค้า">สต๊อกสินค้า (Inventory)</option>
                <option value="คู่ค้า">คู่ค้า (Suppliers)</option>
                <option value="ของเสีย">ของเสีย (Wastage)</option>
                <option value="ผู้ใช้งาน">ผู้ใช้งาน (Users)</option>
                <option value="ระบบล็อกอิน">ระบบล็อกอิน (Auth)</option>
            </select>

        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div class="overflow-x-auto h-full overflow-y-auto custom-scrollbar">
                <table class="w-full min-w-full text-left border-collapse relative">
                <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase font-bold border-b border-slate-200">
                        <tr>
                            <th class="p-5 font-semibold text-slate-600 text-left">วัน-เวลา</th>
                            <th class="p-5 font-semibold text-slate-600 text-left">ผู้ใช้งาน</th>
                            <th class="p-5 font-semibold text-slate-600 text-left">ระบบ</th>
                            <th class="p-5 font-semibold text-slate-600 text-left">การกระทำ (Action)</th>
                            <th class="p-5 font-semibold text-slate-600 text-left">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50 transition duration-150">
                            <td class="p-4 text-sm text-slate-700">{{ formatDateTime(log.timestamp) }}</td>
                            <td class="p-4 text-sm text-slate-800 font-semibold">
                                <i class="fas fa-user-circle text-slate-500 mr-2"></i> {{ log.userEmail || 'Unknown' }}
                            </td>
                            <td class="p-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">{{ log.module }}</td>
                            <td class="p-4">
                                <span :class="[getActionColor(log.action), 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide']">
                                    <i :class="getActionIcon(log.action)"></i> {{ log.action }}
                                </span>
                            </td>
                            <td class="p-4 text-sm text-slate-700 font-medium max-w-none break-words">{{ log.details }}</td>
                        </tr>
                        <tr v-if="filteredLogs.length === 0">
                            <td colspan="5" class="p-10 text-center text-slate-600 font-bold">ไม่พบประวัติการใช้งานตามเงื่อนไขที่ค้นหา</td>
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
        // ดึงข้อมูลประวัติย้อนหลัง (จำกัดแค่ 100 รายการล่าสุด)
        db.collection("activity_logs")
          .orderBy("timestamp", "desc")
          .limit(100)
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
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString('th-TH', { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute:'2-digit' 
            });
        },
        getActionColor(action) {
            switch(action) {
                case 'CREATE': return 'bg-green-100 text-green-700';
                case 'UPDATE': return 'bg-blue-100 text-blue-700';
                case 'DELETE': return 'bg-red-100 text-red-700';
                case 'LOGIN': return 'bg-purple-100 text-purple-700';
                case 'LOGOUT': return 'bg-slate-200 text-slate-600'; 
                case 'ERROR': return 'bg-red-100 text-red-700'; 
                default: return 'bg-slate-100 text-slate-700';
            }
        },
        getActionIcon(action) {
            switch(action) {
                case 'CREATE': return 'fas fa-plus-circle';
                case 'UPDATE': return 'fas fa-edit';
                case 'DELETE': return 'fas fa-trash-alt';
                case 'LOGIN': return 'fas fa-sign-in-alt';
                case 'LOGOUT': return 'fas fa-sign-out-alt'; 
                case 'ERROR': return 'fas fa-exclamation-circle'; 
                default: return 'fas fa-info-circle';
            }
        }
    }
};