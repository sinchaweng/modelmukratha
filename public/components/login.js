const LoginView = {
  data() {
    return {
      email: "",
      password: "",
      isLoading: false,
      alertModal: {
        show: false,
        title: "",
        message: "",
      },
    };
  },
  template: `
<div class="min-h-screen flex items-center justify-center md:justify-end relative overflow-hidden font-kanit">
    
    <div class="absolute inset-0 z-0">
        <img src="img/bg.jpg" 
             class="w-full h-full object-cover object-center" 
             alt="ลงหม้อสุกี้ Background">
        <div class="absolute inset-0 bg-gradient-to-l from-black/80 via-black/30 to-transparent"></div>
    </div>

    <div class="relative z-10 w-full max-w-md mx-4 md:mr-28 animate-in slide-in-from-right-10 duration-700">
        <div class="bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] border border-white/40 text-center">
            
            <div class="mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-[#cc3f38] rounded-[1.2rem] mb-4 shadow-lg shadow-red-900/20">
                <i class="fas fa-user-cog text-3xl text-white"></i>
                </div>
                <h2 class="text-3xl font-black text-slate-800 tracking-tight mb-1">ลงหม้อสุกี้</h2>
                <p class="text-slate-600 font-medium text-sm italic">ระบบจัดการร้าน (คลองหก)</p>
            </div>

            <div class="space-y-4">
                <div class="relative">
                    <i class="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input v-model="email" @keyup.enter="handleLogin" type="email" placeholder="อีเมลผู้ใช้งาน" 
                        class="w-full pl-12 pr-6 py-4 bg-black/5 border border-white/20 focus:bg-white/40 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-500">
                </div>
                
                <div class="relative">
                    <i class="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                    <input v-model="password" @keyup.enter="handleLogin" type="password" placeholder="รหัสผ่าน" 
                        class="w-full pl-12 pr-6 py-4 bg-black/5 border border-white/20 focus:bg-white/40 rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-500">
                </div>
                
                <button @click="handleLogin" :disabled="isLoading" 
                    class="w-full py-4 bg-[#cc3f38] hover:bg-[#b03630] text-white font-bold rounded-2xl shadow-xl shadow-red-900/40 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 mt-6">
                    <i v-if="isLoading" class="fas fa-circle-notch fa-spin text-lg"></i>
                    <span class="text-lg">{{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบหลังบ้าน' }}</span>
                </button>
            </div>

            <p class="mt-10 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                LongMor Suki Admin Panel
            </p>
        </div>
    </div>
    </div>
`,
  methods: {
    // ฟังก์ชันเก็บ Log กิจกรรม
    logActivity(userEmail, action, details) {
      db.collection("activity_logs")
        .add({
          userEmail: userEmail,
          module: "ระบบล็อกอิน",
          action: action,
          details: details,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch((err) => console.error("Log Error:", err));
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
        this.triggerAlert(
          "ข้อมูลไม่ครบถ้วน",
          "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วนก่อนเข้าสู่ระบบ",
        );
        return;
      }

      this.isLoading = true;

      // เรียกใช้งาน Firebase Authentication
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then((userCredential) => {
          this.isLoading = false;
          const user = userCredential.user;
          console.log("Logged in as:", user.email);

          // บันทึก Log ว่ามีการเข้าสู่ระบบสำเร็จ (เม้นเก็บไว้ก่อน แปป)
          //this.logActivity(user.email, 'LOGIN', 'เข้าสู่ระบบสำเร็จ');

          // ส่งสัญญาณให้ index.html เปลี่ยนหน้า
          this.$emit("login-success");
        })
        .catch((error) => {
          this.isLoading = false;
          console.error("Login Error:", error.code);

          // บันทึก Log กรณีล็อกอินพลาด
          this.logActivity(
            this.email,
            "ERROR",
            `พยายามเข้าสู่ระบบแต่ล้มเหลว (${error.code})`,
          );

          // แปลง Error Code เป็นการแสดงผลแบบ Dialog สวยๆ
          if (error.code === "auth/invalid-email") {
            this.triggerAlert(
              "อีเมลไม่ถูกต้อง",
              "รูปแบบของอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
            );
          } else if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
          ) {
            this.triggerAlert(
              "เข้าสู่ระบบล้มเหลว",
              "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            );
          } else if (error.code === "auth/too-many-requests") {
            this.triggerAlert(
              "ระงับการเข้าสู่ระบบชั่วคราว",
              "คุณพยายามเข้าสู่ระบบผิดพลาดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่",
            );
          } else {
            this.triggerAlert(
              "เกิดข้อผิดพลาด",
              "ข้อผิดพลาดระบบ: " + error.message,
            );
          }
        });
    },
  },
};
