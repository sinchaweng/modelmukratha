const LoginView = {
    data() {
        return {
            email: '',
            password: '',
            isLoading: false // ไว้เปลี่ยนข้อความปุ่มตอนกำลังโหลด
        }
    },
    template: `
    <div class="min-h-screen flex items-center justify-center bg-[#cc3f38]">
        <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-[#fcdd80] rounded-full mb-4 shadow-sm">
                    <i class="fas fa-user-shield text-4xl text-[#cc3f38]"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-800">เข้าสู่ระบบ</h2>
                <p class="text-slate-500">กรุณาเข้าสู่ระบบเพื่อจัดการร้าน</p>
            </div>
            <div class="space-y-5">
                
                <input v-model="email" type="email" placeholder="อีเมล (Email)" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none transition-all">
                
                <input v-model="password" type="password" placeholder="รหัสผ่าน" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none transition-all">
                
                <button @click="handleLogin" :disabled="isLoading" class="w-full py-4 bg-[#cc3f38] text-white font-bold rounded-xl shadow-lg hover:brightness-90 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                    {{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
                </button>
                
            </div>
        </div>
    </div>
    `,
    methods: {
        handleLogin() {
            // ตรวจสอบว่ากรอกข้อมูลครบไหม
            if (!this.email || !this.password) {
                alert("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
                return;
            }

            this.isLoading = true;

            // 3. เรียกใช้งาน Firebase Authentication
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then((userCredential) => {
                    // ล็อกอินสำเร็จ!
                    this.isLoading = false;
                    const user = userCredential.user;
                    console.log("Logged in as:", user.email);
                    
                    // ส่งสัญญาณให้ index.html เปลี่ยนหน้า
                    this.$emit('login-success'); 
                })
                .catch((error) => {
                    // ล็อกอินไม่สำเร็จ จัดการ Error
                    this.isLoading = false;
                    console.error("Login Error:", error.code);
                    
                    // แปลง Error Code ของ Firebase เป็นภาษาไทย
                    if (error.code === 'auth/invalid-email') {
                        alert('รูปแบบอีเมลไม่ถูกต้อง');
                    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                    } else if (error.code === 'auth/too-many-requests') {
                        alert('คุณพยายามเข้าสู่ระบบผิดพลาดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่');
                    } else {
                        alert('เกิดข้อผิดพลาด: ' + error.message);
                    }
                });
        }
    }
};