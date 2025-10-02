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
const passwordGroup = document.querySelector('.input-group:has(#password)'); // طريقة جديدة لاختيار حقل كلمة المرور
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const forgotPasswordLink = document.getElementById('forgot-password-link');

// متغير لتحديد الوضع الحالي (login, signup, reset)
let currentMode = 'login'; 

// --- دالة لتحديث الواجهة بناءً على الوضع الحالي ---
function updateUI() {
    messageEl.textContent = '';
    messageEl.style.color = '#d93025'; // اللون الافتراضي للخطأ

    if (currentMode === 'login') {
        authTitle.textContent = 'تسجيل الدخول';
        authSubtitle.textContent = 'أهلاً بعودتك! أدخل بياناتك للمتابعة.';
        authBtn.textContent = 'تسجيل الدخول';
        passwordGroup.classList.remove('hidden');
        confirmPasswordGroup.classList.add('hidden');
        toggleAuthLink.innerHTML = 'ليس لديك حساب؟ <a href="#">إنشاء حساب جديد</a>';
        forgotPasswordLink.style.display = 'block';
    } else if (currentMode === 'signup') {
        authTitle.textContent = 'إنشاء حساب جديد';
        authSubtitle.textContent = 'خطوة واحدة تفصلك عن صفحتك الخاصة.';
        authBtn.textContent = 'إنشاء حساب';
        passwordGroup.classList.remove('hidden');
        confirmPasswordGroup.classList.remove('hidden');
        toggleAuthLink.innerHTML = 'لديك حساب بالفعل؟ <a href="#">تسجيل الدخول</a>';
        forgotPasswordLink.style.display = 'none';
    } else if (currentMode === 'reset') {
        authTitle.textContent = 'إعادة تعيين كلمة المرور';
        authSubtitle.textContent = 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين.';
        authBtn.textContent = 'إرسال الرابط';
        passwordGroup.classList.add('hidden');

        confirmPasswordGroup.classList.add('hidden');
        toggleAuthLink.innerHTML = 'تذكرت كلمة المرور؟ <a href="#">تسجيل الدخول</a>';
        forgotPasswordLink.style.display = 'none';
    }
}

// --- ربط الأحداث ---
toggleAuthLink.addEventListener('click', (event) => {
    event.preventDefault();
    currentMode = (currentMode === 'login' || currentMode === 'reset') ? 'signup' : 'login';
    updateUI();
});

forgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();
    currentMode = 'reset';
    updateUI();
});

authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (currentMode === 'login') {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) { messageEl.textContent = 'خطأ: البريد أو كلمة المرور غير صحيحة.'; } else { window.location.href = 'dashboard.html'; }
    } else if (currentMode === 'signup') {
        const confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) { messageEl.textContent = 'كلمتا المرور غير متطابقتين.'; return; }
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) { messageEl.textContent = 'حدث خطأ: ' + error.message; }
        else {
            messageEl.style.color = 'green';
            messageEl.textContent = 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني.';
            setTimeout(() => { currentMode = 'login'; updateUI(); }, 3000);
        }
    } else if (currentMode === 'reset') {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password.html`, // الرابط الذي سيتم إرساله في الإيميل
        });
        if (error) { messageEl.textContent = 'حدث خطأ: ' + error.message; }
        else {
            messageEl.style.color = 'green';
            messageEl.textContent = 'إذا كان البريد موجوداً، فسيصلك رابط إعادة التعيين قريباً.';
        }
    }
});

// قم بتشغيل الواجهة لأول مرة
updateUI();

