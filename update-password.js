// update-password.js
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co'; // ضع رابط Supabase الخاص بك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE'; // ضع مفتاح ANON الخاص بك هنا

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const updatePasswordForm = document.getElementById('update-password-form');
const messageEl = document.getElementById('message');

updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const newPassword = document.getElementById('new-password').value;

    const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) {
        messageEl.textContent = 'حدث خطأ أثناء تحديث كلمة المرور: ' + error.message;
    } else {
        messageEl.style.color = 'green';
        messageEl.textContent = 'تم تحديث كلمة المرور بنجاح! سيتم توجيهك الآن لصفحة تسجيل الدخول.';
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 3000);
    }
});