const ManageUserView = {
  template: `
  <section class="w-full text-left animate-in fade-in duration-500">
        <div class="flex justify-between items-center mb-8 border-b pb-6">
            <div class="text-left">
                <h2 class="text-3xl font-bold text-slate-800">จัดการผู้ใช้งานระบบ</h2>
            </div>
            <button @click="openModal()" class="bg-[#fcdd80] text-[#cc3f38] px-5 py-2 rounded-xl font-bold shadow-lg shadow-orange-100 hover:brightness-95 transition flex items-center gap-2">
                 <i class="fas fa-plus-circle"></i> เพิ่มผู้ใช้งาน
            </button>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                <thead class="bg-slate-200 text-slate-700 text-[14px] uppercase font-bold border-b">
                            <th class="p-5 font-semibold text-slate-600">อีเมล (Email) / บัญชี</th>
                            <th class="p-5 font-semibold text-slate-600">ชื่อ-นามสกุล</th>
                            <th class="p-5 font-semibold text-slate-600">ตำแหน่งสิทธิ์</th>
                            <th class="p-5 font-semibold text-slate-600 text-center">สถานะ</th>
                            <th class="p-5 font-semibold text-slate-600 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="user in activeUsers" :key="user.id" class="hover:bg-slate-50 transition duration-150">
                            <td class="p-5 font-medium text-slate-700">{{ user.email }}</td>
                            <td class="p-5 text-slate-600">{{ user.name || '-' }}</td>
                            <td class="p-5">
                                <span :class="user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {{ user.role }}
                                </span>
                            </td>
                            <td class="p-5 text-center">
                                <button @click="toggleUserStatus(user)" :class="user.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'" class="px-3 py-1 rounded-full text-xs font-bold transition">
                                    {{ user.active ? 'ปกติ' : 'ระงับ' }}
                                </button>
                            </td>
                            <td class="p-5 text-center space-x-2">
                                <button @click="openModal(user)" class="text-slate-600 hover:text-blue-600 p-1.5 transition"><i class="fas fa-edit text-xs"></i></button>
                                <button @click="deleteUser(user)" class="text-slate-600 hover:text-red-500 p-1.5 transition"><i class="fas fa-trash-alt text-xs"></i></button>
                            </td>
                        </tr>
                        <tr v-if="activeUsers.length === 0">
                            <td colspan="5" class="p-10 text-center text-slate-600 font-bold">กำลังโหลดข้อมูล หรือ ไม่พบผู้ใช้งาน...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-2 border-white">
                <div class="bg-[#cc3f38] p-5 flex justify-between items-center text-white">
                    <h3 class="font-bold text-lg"><i class="fas" :class="isEditing ? 'fa-user-edit' : 'fa-user-plus'"></i> {{ isEditing ? 'แก้ไขสิทธิ์ผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่' }}</h3>
                    <button @click="closeModal"  class="text-white hover:rotate-90 transition text-2xl font-bold px-2">&times;</button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">ชื่อ-นามสกุล พนักงาน</label>
                        <input v-model="form.name" type="text" placeholder="ระบุชื่อพนักงาน" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none font-bold text-slate-700">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">อีเมล (ใช้สำหรับ Log in)</label>
                        <input v-model="form.email" type="email" :disabled="isEditing" placeholder="example@email.com" :class="isEditing ? 'opacity-50 cursor-not-allowed' : ''" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none">
                    </div>
                    <div v-if="!isEditing"> 
                        <label class="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">ตั้งรหัสผ่านชั่วคราว (ขั้นต่ำ 6 ตัว)</label>
                        <input v-model="form.password" type="password" placeholder="******" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">กำหนดสิทธิ์ (Role)</label>
                        <select v-model="form.role" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700">
                            <option value="Admin">ผู้ดูแลระบบ (Admin) - จัดการได้ทุกหน้า</option>
                            <option value="Staff">พนักงาน (Staff) - สต๊อก/ของเสีย</option>
                        </select>
                    </div>
                </div>
                <div class="p-5 bg-slate-50 flex justify-center gap-3 border-t">
                    <button @click="closeModal" class="flex-1 max-w-[160px] py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="saveUser" :disabled="isLoading" class="flex-1 max-w-[160px] py-3 bg-[#cc3f38] text-white font-bold rounded-2xl shadow-lg hover:bg-red-800 transition text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                        {{ isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="confirmationModal.show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200" :class="confirmationModal.type === 'danger' ? 'border-2 border-red-50' : ''">
                <div :class="confirmationModal.type === 'danger' ? 'bg-red-600' : 'bg-slate-900'" class="p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i v-if="confirmationModal.type === 'danger'" class="fas fa-exclamation-triangle text-2xl"></i>
                        <i v-else class="fas fa-exclamation-circle text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-black uppercase tracking-tighter">{{ confirmationModal.title }}</h3>
                </div>
                <div class="p-8 text-center">
                    <p class="text-slate-600 font-medium">{{ confirmationModal.message }}</p>
                </div>
                <div class="p-6 bg-slate-50 flex gap-3 border-t">
                    <button @click="confirmationModal.show = false" class="flex-1 py-3 bg-slate-300 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-400 transition">ยกเลิก</button>
                    <button @click="confirmationModal.confirmAction" :class="confirmationModal.type === 'danger' ? 'bg-red-600 shadow-lg shadow-red-200 hover:bg-red-700' : 'bg-slate-900 hover:opacity-90'" class="flex-1 py-3 text-white font-bold rounded-2xl shadow-lg transition text-sm uppercase tracking-widest">ยืนยัน</button>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showErrorModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]">
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in duration-200">
            <div class="bg-amber-500 p-6 text-white text-center">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-exclamation-circle text-2xl"></i>
                </div>
                <h3 class="text-lg font-black uppercase">ข้อมูลไม่ครบถ้วน</h3>
            </div>
            <div class="p-6 text-center text-slate-600 font-medium">
                {{ errorMessage }}
            </div>
            <div class="p-4 bg-slate-50">
                <button @click="showErrorModal = false" class="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl">เข้าใจแล้ว</button>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      users: [],
      showModal: false,
      showErrorModal: false, 
      errorMessage: "",
      isEditing: false,
      isLoading: false,
      form: {
        id: null,
        email: "",
        password: "",
        name: "",
        role: "Staff",
        active: true,
      },
      confirmationModal: {
        show: false,
        type: "danger",
        title: "",
        message: "",
        confirmAction: null,
      },
    };
  },
  // 1. กรองข้อมูลเฉพาะผู้ใช้ที่ไม่ได้ถูก Delete
  computed: {
      activeUsers() {
          return this.users.filter(user => user.deleted !== true);
      }
  },
  mounted() {
    db.collection("users").onSnapshot((snapshot) => {
      const tempUsers = [];
      snapshot.forEach((doc) => {
        tempUsers.push({ id: doc.id, ...doc.data() });
      });
      this.users = tempUsers;
    });
  },
  methods: {
    // ฟังก์ชันสำหรับบันทึก Log กิจกรรม
    logActivity(action, details) {
        const userEmail = firebase.auth().currentUser?.email || 'System';
        db.collection("activity_logs").add({
            userEmail: userEmail,
            module: 'ผู้ใช้งาน',
            action: action,
            details: details,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error("Log Error:", err));
    },

    openModal(user = null) {
      this.showModal = true;
      if (user) {
        this.isEditing = true;
        this.form = { ...user, password: "" };
      } else {
        this.isEditing = false;
        this.form = {
          id: null,
          email: "",
          password: "",
          name: "",
          role: "Staff",
          active: true,
        };
      }
    },
    closeModal() {
      this.showModal = false;
    },
    async saveUser() {
        if (!this.form.email || !this.form.name) {
            this.errorMessage = "กรุณาระบุข้อมูลให้ครบถ้วน"; 
            this.showErrorModal = true;
            return;
        }

        if (!this.isEditing) {
            if (!this.form.password) {
                this.errorMessage = "กรุณาระบุข้อมูลให้ครบถ้วน";
                this.showErrorModal = true;
                return;
            }
            if (this.form.password.length < 6) {
                this.errorMessage = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
                this.showErrorModal = true;
                return;
            }
        }

        this.isLoading = true;

        try {
            if (this.isEditing) {
            await db.collection("users").doc(this.form.id).update({
                name: this.form.name,
                role: this.form.role,
            });
            // บันทึก Log การแก้ไข
            this.logActivity('UPDATE', `แก้ไขข้อมูลผู้ใช้: ${this.form.email}`);
            
            this.closeModal();
            } else {
            await db.collection("users").add({
                email: this.form.email,
                name: this.form.name,
                role: this.form.role,
                active: true,
                deleted: false, // เพิ่ม field deleted เป็น false ตอนสร้าง
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            try {
                await firebase.auth().createUserWithEmailAndPassword(this.form.email, this.form.password);
                
                // บันทึก Log สร้างใหม่
                this.logActivity('CREATE', `เพิ่มผู้ใช้งานใหม่: ${this.form.email} (${this.form.role})`);
                
                alert("สร้างบัญชีผู้ใช้สำเร็จ! (ระบบอาจพากลับไปหน้า Login ใหม่)");
            } catch (authErr) {
                console.error("Auth Error:", authErr);
                alert("บันทึกข้อมูลแล้ว แต่ไม่สามารถสร้างระบบล็อกอินได้ (อีเมลอาจซ้ำ)");
            }

            this.closeModal();
            }
        } catch (error) {
            console.error("Error saving user:", error);
            alert("เกิดข้อผิดพลาด: " + error.message);
        } finally {
            this.isLoading = false;
        }
    },

    toggleUserStatus(user) {
      this.confirmationModal = {
        show: true,
        type: "danger",
        title: user.active ? "ระงับบัญชี" : "เปิดใช้บัญชี",
        message: `ต้องการ ${user.active ? "ระงับ" : "เปิดใช้"} บัญชี ${user.email} ใช่หรือไม่?`,
        confirmAction: async () => {
          await db.collection("users").doc(user.id).update({
            active: !user.active,
          });
          // บันทึก Log เปลี่ยนสถานะ
          const statusText = !user.active ? "เปิดใช้งาน" : "ระงับการใช้งาน";
          this.logActivity('UPDATE', `${statusText} บัญชี: ${user.email}`);

          this.confirmationModal.show = false;
        },
      };
    },

    // 2. เปลี่ยนจาก delete เป็น update(deleted: true)
    deleteUser(user) {
      this.confirmationModal = {
        show: true,
        type: "danger",
        title: "ยืนยันการนำออก?",
        message: `คุณต้องการนำผู้ใช้ ${user.email} ออกจากระบบใช่หรือไม่?`,
        confirmAction: async () => {
          // ใช้การ update deleted แทนการลบข้อมูลจริง
          await db.collection("users").doc(user.id).update({
              deleted: true,
              active: false // ระงับการใช้งานไปด้วยเลย
          });
          
          // บันทึก Log การนำออก
          this.logActivity('DELETE', `นำบัญชีผู้ใช้งานออก (ซ่อน): ${user.email}`);

          this.confirmationModal.show = false;
        },
      };
    },
  },
};