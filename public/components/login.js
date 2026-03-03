const LoginView = {
    data() {
        return {
            email: '',
            password: '',
            isLoading: false, 
            alertModal: {
                show: false,
                title: '',
                message: ''
            }
        }
    },
    template: `
    <div class="min-h-screen flex items-center justify-center bg-[#cc3f38] animate-in fade-in duration-500 relative">
        <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md z-10">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-[#fcdd80] rounded-full mb-4 shadow-sm">
                    <i class="fas fa-user-shield text-4xl text-[#cc3f38]"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-800">เข้าสู่ระบบ</h2>
                <p class="text-slate-500">กรุณาเข้าสู่ระบบเพื่อจัดการร้าน</p>
            </div>
            <div class="space-y-5">
                
                <input v-model="email" @keyup.enter="handleLogin" type="email" placeholder="อีเมล (Email)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none transition-all font-medium text-slate-700">
                
                <input v-model="password" @keyup.enter="handleLogin" type="password" placeholder="รหัสผ่าน" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none transition-all font-medium text-slate-700">
                
                <button @click="handleLogin" :disabled="isLoading" class="w-full py-4 bg-[#cc3f38] text-white font-bold rounded-xl shadow-lg hover:brightness-90 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                    {{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
                </button>
                
            </div>
        </div>

        <div v-if="alertModal.show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in duration-200 border-2 border-white">
                <div class="bg-amber-500 p-6 text-white text-center">
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <i class="fas fa-exclamation-circle text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-black uppercase italic tracking-tighter">{{ alertModal.title }}</h3>
                </div>
                <div class="p-6 text-center text-slate-600 font-medium">
                    {{ alertModal.message }}
                </div>
                <div class="p-4 bg-slate-50 border-t border-slate-100">
                    <button @click="alertModal.show = false" class="w-full py-3 bg-slate-800 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition">เข้าใจแล้ว</button>
                </div>
            </div>
        </div>
    </div>
    `,
    methods: {
        // ฟังก์ชันเก็บ Log กิจกรรม
        logActivity(userEmail, action, details) {
            db.collection("activity_logs").add({
                userEmail: userEmail,
                module: 'ระบบล็อกอิน',
                action: action,
                details: details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(err => console.error("Log Error:", err));
        },

        // [เพิ่มใหม่] ฟังก์ชันเรียกเปิด Dialog แจ้งเตือน
        triggerAlert(title, message) {
            this.alertModal.title = title;
            this.alertModal.message = message;
            this.alertModal.show = true;
        },

        handleLogin() {
            // เปลี่ยนจาก alert() เป็น this.triggerAlert()
            if (!this.email || !this.password) {
                this.triggerAlert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วนก่อนเข้าสู่ระบบ");
                return;
            }

            this.isLoading = true;

            // เรียกใช้งาน Firebase Authentication
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then((userCredential) => {
                    this.isLoading = false;
                    const user = userCredential.user;
                    console.log("Logged in as:", user.email);

                    // บันทึก Log ว่ามีการเข้าสู่ระบบสำเร็จ (เม้นเก็บไว้ก่อน แปป)
                    //this.logActivity(user.email, 'LOGIN', 'เข้าสู่ระบบสำเร็จ');
                    
                    // ส่งสัญญาณให้ index.html เปลี่ยนหน้า
                    this.$emit('login-success'); 
                })
                .catch((error) => {
                    this.isLoading = false;
                    console.error("Login Error:", error.code);
                    
                    // บันทึก Log กรณีล็อกอินพลาด
                    this.logActivity(this.email, 'ERROR', `พยายามเข้าสู่ระบบแต่ล้มเหลว (${error.code})`);
                    
                    // แปลง Error Code เป็นการแสดงผลแบบ Dialog สวยๆ
                    if (error.code === 'auth/invalid-email') {
                        this.triggerAlert('อีเมลไม่ถูกต้อง', 'รูปแบบของอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
                    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        this.triggerAlert('เข้าสู่ระบบล้มเหลว', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                    } else if (error.code === 'auth/too-many-requests') {
                        this.triggerAlert('ระงับการเข้าสู่ระบบชั่วคราว', 'คุณพยายามเข้าสู่ระบบผิดพลาดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่');
                    } else {
                        this.triggerAlert('เกิดข้อผิดพลาด', 'ข้อผิดพลาดระบบ: ' + error.message);
                    }
                });
        }
    }
};