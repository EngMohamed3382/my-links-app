// استبدل التالي بالمعلومات الخاصة بمشروعك في Supabase
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co'; // ضع رابط Supabase الخاص بك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE'; // ضع مفتاح ANON الخاص بك هنا

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- عناصر الصفحة ---
const profilePic = document.getElementById('profile-pic');
const usernameH1 = document.getElementById('username-h1'); // سنعطي id جديد لاسم المستخدم
const bioP = document.getElementById('bio-p'); // سنعطي id جديد للنبذة
const linksContainer = document.getElementById('links-container'); // سنعطي id جديد لحاوية الروابط

/**
 * دالة رئيسية لجلب وعرض بيانات ملف المستخدم
 * @param {string} username - اسم المستخدم المراد عرض صفحته
 */
async function loadUserProfile(username) {
    // الخطوة 1: جلب بيانات الملف الشخصي (profile) بناءً على اسم المستخدم
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('user_id, username, bio')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        console.error('User not found:', profileError);
        document.body.innerHTML = '<h1>المستخدم غير موجود</h1>';
        return;
    }

    // الخطوة 2: تحديث معلومات الملف الشخصي في الصفحة
    usernameH1.textContent = profile.username;
    bioP.textContent = profile.bio || 'لا توجد نبذة شخصية.';
    document.title = profile.username; // تغيير عنوان تبويب الصفحة

    // الخطوة 3: جلب روابط المستخدم (links) باستخدام user_id الذي حصلنا عليه
    const { data: links, error: linksError } = await supabaseClient
        .from('links')
        .select('title, url')
        .eq('user_id', profile.user_id);

    if (linksError) {
        console.error('Error fetching links:', linksError);
        return;
    }

    // الخطوة 4: عرض الروابط في الصفحة
    linksContainer.innerHTML = ''; // تفريغ الحاوية
    if (links.length > 0) {
        links.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.title;
            linkElement.classList.add('link-box');
            linkElement.target = '_blank';
            linksContainer.appendChild(linkElement);
        });
    } else {
        linksContainer.innerHTML = '<p>لا توجد روابط لعرضها.</p>';
    }
}

// --- تشغيل الكود ---

// قراءة اسم المستخدم من رابط الصفحة (URL)
const params = new URLSearchParams(window.location.search);
const urlUsername = params.get('user');

if (urlUsername) {
    loadUserProfile(urlUsername);
} else {
    document.body.innerHTML = '<h1>خطأ: لم يتم تحديد اسم المستخدم في الرابط.</h1><p>مثال على رابط صحيح: index.html?user=username</p>';
}