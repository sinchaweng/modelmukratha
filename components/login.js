const LoginView = {
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
        <div class="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-orange-100 rounded-full mb-4">
                    <i class="fas fa-user-shield text-4xl text-orange-600"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-800">ผู้ดูแลระบบ</h2>
                <p class="text-slate-500">กรุณาเข้าสู่ระบบเพื่อจัดการร้าน</p>
            </div>
            <div class="space-y-5">
                <input type="text" placeholder="ชื่อผู้ใช้งาน" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                <input type="password" placeholder="รหัสผ่าน" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                <button @click="$emit('login-success')" class="w-full py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition transform active:scale-95">
                    เข้าสู่ระบบ
                </button>
            </div>
        </div>
    </div>
    `
};