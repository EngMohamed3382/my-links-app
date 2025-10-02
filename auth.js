// استبدل التالي بالمعلومات الخاصة بمشروعك في Supabase
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co'; // ضع رابط Supabase الخاص بك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE'; // ضع مفتاح ANON الخاص بك هنا

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- عناصر واجهة المستخدم ---
const authForm = document.getElementById('auth-form');
const authBtn = document.getElementById('auth-btn');
const messageEl = document.getElementById('message');
const toggleAuthLink = document.getElementById('toggle-auth');
const confirmPasswordGroup = document.getElementById('confirm-password-group');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

let isLoginMode = true; // متغير لتحديد الوضع الحالي (تسجيل دخول أو إنشاء حساب)

// --- دالة لتبديل الواجهة بين الوضعين ---
function toggleMode() {
    isLoginMode = !isLoginMode; // عكس الوضع الحالي
    messageEl.textContent = ''; // مسح أي رسائل خطأ قديمة

    if (isLoginMode) {
        authTitle.textContent = 'تسجيل الدخول';
        authSubtitle.textContent = 'أهلاً بعودتك! أدخل بياناتك للمتابعة.';
        authBtn.textContent = 'تسجيل الدخول';
        confirmPasswordGroup.classList.add('hidden');
        toggleAuthLink.innerHTML = 'ليس لديك حساب؟ <a href="#">إنشاء حساب جديد</a>';
    } else {
        authTitle.textContent = 'إنشاء حساب جديد';
        authSubtitle.textContent = 'خطوة واحدة تفصلك عن صفحتك الخاصة.';
        authBtn.textContent = 'إنشاء حساب';
        confirmPasswordGroup.classList.remove('hidden');
        toggleAuthLink.innerHTML = 'لديك حساب بالفعل؟ <a href="#">تسجيل الدخول</a>';
    }
}

// ربط دالة التبديل بالضغط على الرابط
toggleAuthLink.addEventListener('click', (event) => {
    event.preventDefault();
    toggleMode();
});

// --- التعامل مع تقديم النموذج ---
authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageEl.textContent = ''; // مسح رسائل الخطأ

    const email = emailInput.value;
    const password = passwordInput.value;

    if (isLoginMode) {
        // --- منطق تسجيل الدخول ---
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            messageEl.textContent = 'خطأ في تسجيل الدخول: البريد أو كلمة المرور غير صحيحة.';
        } else {
            window.location.href = 'dashboard.html';
        }
    } else {
        // --- منطق إنشاء حساب جديد ---
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            messageEl.textContent = 'كلمتا المرور غير متطابقتين.';
            return;
        }
        
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            messageEl.textContent = 'حدث خطأ أثناء إنشاء الحساب: ' + error.message;
        } else {
            messageEl.style.color = 'green'; // تغيير لون الرسالة للنجاح
            messageEl.textContent = 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. الرجاء التحقق منه.';
            setTimeout(toggleMode, 3000); // العودة لوضع تسجيل الدخول بعد 3 ثوانٍ
        }
    }
});
