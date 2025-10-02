// استبدل التالي بالمعلومات الخاصة بمشروعك في Supabase
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE';


// تهيئة Supabase
// تم تغيير اسم المتغير إلى supabaseClient لتجنب التضارب
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// الحصول على عناصر النموذج من ملف HTML
const authForm = document.getElementById('auth-form');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const messageEl = document.getElementById('message');

// --- دالة إنشاء حساب جديد ---
signupBtn.addEventListener('click', async (event) => {
    event.preventDefault(); // منع التحديث التلقائي للصفحة
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // تم التعديل هنا
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        messageEl.textContent = 'حدث خطأ: ' + error.message;
    } else {
        messageEl.textContent = 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. الرجاء التحقق منه.';
        authForm.reset(); // تفريغ حقول النموذج
    }
});

// --- دالة تسجيل الدخول ---
loginBtn.addEventListener('click', async (event) => {
    event.preventDefault(); // منع التحديث التلقائي للصفحة
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // تم التعديل هنا
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        messageEl.textContent = 'خطأ في تسجيل الدخول: ' + error.message;
    } else {
        // إذا نجح تسجيل الدخول، قم بتوجيه المستخدم إلى لوحة التحكم
        window.location.href = 'dashboard.html';
    }
});