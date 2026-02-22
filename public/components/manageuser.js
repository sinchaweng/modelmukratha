const ManageUserView = {
    template: `
    <div class="flex flex-col h-full bg-slate-50">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h2>
            </div>
            <button @click="openModal()" class="bg-[#fcdd80] text-[#cc3f38] px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-100 hover:brightness-95 transition flex items-center gap-2">
                <i class="fas fa-plus"></i> เพิ่มผู้ใช้งาน
            </button>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                            <th class="p-5 font-semibold">ชื่อผู้ใช้งาน</th>
                            <th class="p-5 font-semibold">ตำแหน่ง</th>
                            <th class="p-5 font-semibold text-center">สถานะ</th>
                            <th class="p-5 font-semibold text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition duration-150">
                            <td class="p-5 font-medium text-slate-700">{{ user.username }}</td>
                            <td class="p-5 text-slate-500">{{ user.role }}</td>
                            <td class="p-5 text-center">
                                <span :class="user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-3 py-1 rounded-full text-xs font-bold">
                                    {{ user.active ? 'ปกติ' : 'ระงับ' }}
                                </span>
                            </td>
                            <td class="p-5 text-center space-x-2">
                                <button @click="openModal(user)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><i class="fas fa-edit text-xs"></i></button>
                                <button @click="deleteUser(user.id)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"><i class="fas fa-trash text-xs"></i></button>
                            </td>
                        </tr>
                        <tr v-if="users.length === 0">
                            <td colspan="4" class="p-10 text-center text-slate-400">กำลังโหลดข้อมูล หรือ ไม่พบผู้ใช้งาน...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-[#cc3f38] p-5 flex justify-between items-center text-white">
                    <h3 class="font-bold text-lg">{{ isEditing ? 'แก้ไขข้อมูล' : 'เพิ่มผู้ใช้งาน' }}</h3>
                    <button @click="closeModal" class="hover:text-orange-200"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input v-model="form.username" type="text" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none">
                    </div>
                    <div v-if="!isEditing"> <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input v-model="form.password" type="password" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select v-model="form.role" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                            <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
                            <option value="Staff">พนักงาน (Staff)</option>
                        </select>
                    </div>
                </div>
                <div class="p-5 bg-slate-50 flex justify-end gap-3">
                    <button @click="closeModal" class="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition">ยกเลิก</button>
                    <button @click="saveUser" class="px-5 py-2.5 bg-[#cc3f38] text-white font-bold rounded-xl shadow-lg hover:brightness-90 transition">บันทึก</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            users: [], // รอรับข้อมูลจาก PHP
            showModal: false,
            isEditing: false,
            form: { id: null, username: '', password: '', role: 'Staff', active: 1 }
        }
    },
    mounted() {
        this.fetchUsers(); // โหลดข้อมูลทันทีเมื่อเปิดหน้า
    },
    methods: {
        async fetchUsers() {
            // จำลองข้อมูล (Mock Data) 
            this.users = [
                { id: 1, username: 'admin', role: 'Admin', active: 1 },
                { id: 2, username: 'cashier', role: 'Staff', active: 1 },
            ];
        },
        openModal(user = null) {
            this.showModal = true;
            if (user) {
                this.isEditing = true;
                this.form = { ...user, password: '' }; // ไม่ดึงรหัสเก่ามาโชว์
            } else {
                this.isEditing = false;
                this.form = { id: null, username: '', password: '', role: 'Staff', active: 1 };
            }
        },
        closeModal() {
            this.showModal = false;
        },
        saveUser() {
            // รอเขียน api แปป
            if (this.isEditing) {
                // Logic อัปเดต
                alert('จำลองการแก้ไข: ' + this.form.username);
            } else {
                // Logic เพิ่มใหม่
                alert('จำลองการเพิ่ม: ' + this.form.username);
                this.users.push({...this.form, id: Date.now()});
            }
            this.closeModal();
        },
        deleteUser(id) {
            if(confirm('ลบผู้ใช้นี้?')) {
                this.users = this.users.filter(u => u.id !== id);
                // fetch('api/delete_user.php?id='+id)
            }
        }
    }
};