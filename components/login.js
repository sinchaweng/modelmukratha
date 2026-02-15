const LoginView = {
    template: `
    <div class="min-h-screen flex items-center justify-center bg-[#cc3f38]">
        <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-[#fcdd80] rounded-full mb-4 shadow-sm">
                    <i class="fas fa-user-shield text-4xl text-[#cc3f38]"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-800">เข้าสู่ระบบ</h2>
                <p class="text-slate-500">กรุณาเข้าสู่ระบบ</p>
            </div>
            <div class="space-y-5">
                <input type="text" placeholder="ชื่อผู้ใช้งาน" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none transition-all">
                <input type="password" placeholder="รหัสผ่าน" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#cc3f38] outline-none transition-all">
                
                <button @click="$emit('login-success')" class="w-full py-4 bg-[#cc3f38] text-white font-bold rounded-xl shadow-lg hover:brightness-90 transition transform active:scale-95">
                    เข้าสู่ระบบ
                </button>
            </div>
        </div>
    </div>
    `
};