// استبدل التالي بالمعلومات الخاصة بمشروعك في Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// تهيئة Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- عناصر واجهة المستخدم (HTML Elements) ---
const logoutBtn = document.getElementById('logout-btn');
const linksList = document.getElementById('links-list');
const addLinkForm = document.getElementById('add-link-form');
const profileForm = document.getElementById('profile-form');
let currentUser = null; // متغير لتخزين معلومات المستخدم الحالي بعد تسجيل الدخول

// =================================================================================
// الوظائف (Functions)
// =================================================================================

/**
 * دالة لجلب بيانات الملف الشخصي للمستخدم الحالي وعرضها في النموذج.
 */
async function fetchUserProfile() {
    if (!currentUser) return;
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('username, bio') // نختار فقط الأعمدة التي نحتاجها
        .eq('user_id', currentUser.id)
        .single(); // .single() لجلب نتيجة واحدة فقط

    if (error && error.code !== 'PGRST116') { // تجاهل خطأ عدم وجود نتيجة، فهو متوقع للمستخدم الجديد
        console.error('Error fetching profile:', error);
    } else if (profile) {
        // ملء حقول النموذج بالبيانات الموجودة
        document.getElementById('username').value = profile.username || '';
        document.getElementById('bio').value = profile.bio || '';
    }
}

/**
 * دالة لجلب روابط المستخدم الحالي وعرضها في الصفحة.
 */
/**
 * دالة لجلب روابط المستخدم الحالي وعرضها في الصفحة مع زر للحذف.
 */
async function fetchUserLinks() {
    if (!currentUser) return;

    // ملاحظة: قمنا بإضافة id إلى select لجلب المعرف الفريد لكل رابط
    const { data: links, error } = await supabaseClient
        .from('links')
        .select('id, title, url') // مهم: أضفنا id هنا
        .eq('user_id', currentUser.id);

    if (error) {
        console.error('Error fetching links:', error);
        return;
    }

    linksList.innerHTML = '';

    if (links.length === 0) {
        linksList.innerHTML = '<p>لا يوجد روابط بعد. قم بإضافة أول رابط لك!</p>';
    } else {
        links.forEach(link => {
            // 1. إنشاء حاوية (div) لكل رابط وزر الحذف
            const linkContainer = document.createElement('div');
            linkContainer.classList.add('link-item-container');

            // 2. إنشاء عنصر الرابط نفسه
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.title;
            linkElement.classList.add('link-box');
            linkElement.target = '_blank';

            // 3. إنشاء زر الحذف
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'حذف';
            deleteButton.classList.add('delete-btn');
            // سنستخدم data attribute لتخزين id الرابط في الزر نفسه
            deleteButton.dataset.linkId = link.id; 

            // 4. إضافة الرابط والزر إلى الحاوية
            linkContainer.appendChild(linkElement);
            linkContainer.appendChild(deleteButton);

            // 5. إضافة الحاوية الكاملة إلى القائمة في الصفحة
            linksList.appendChild(linkContainer);
        });
    }
}

/**
 * دالة لحذف رابط معين بعد تأكيد المستخدم.
 * @param {string} linkId - المعرف الفريد للرابط المراد حذفه.
 */
async function deleteLink(linkId) {
    // عرض رسالة تأكيد للمستخدم قبل الحذف
    const isConfirmed = confirm('هل أنت متأكد أنك تريد حذف هذا الرابط؟');

    if (isConfirmed) {
        const { error } = await supabaseClient
            .from('links')
            .delete()
            .eq('id', linkId);

        if (error) {
            console.error('Error deleting link:', error);
            alert('حدث خطأ أثناء الحذف.');
        } else {
            // إذا نجح الحذف، قم بإعادة تحميل قائمة الروابط لتحديث الواجهة
            fetchUserLinks();
        }
    }
}

/**
 * دالة رئيسية يتم تشغيلها عند تحميل الصفحة للتحقق من هوية المستخدم وجلب بياناته.
 */
async function checkAndLoadUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    
    // إذا لم يكن المستخدم مسجلاً دخوله، أعده إلى صفحة الدخول
    if (error || !data.user) {
        window.location.href = 'auth.html';
        return;
    }
    
    // إذا كان المستخدم مسجلاً، قم بتخزين بياناته وتشغيل دوال جلب البيانات
    currentUser = data.user;
    fetchUserProfile();
    fetchUserLinks();
}


// =================================================================================
// ربط الأحداث (Event Listeners)
// =================================================================================

// عند تقديم نموذج حفظ بيانات الملف الشخصي
profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;

    // upsert: يقوم بالتحديث إذا كان السجل موجوداً، أو بالإضافة إذا لم يكن موجوداً
    const { error } = await supabaseClient
        .from('profiles')
        .upsert({ user_id: currentUser.id, username: username, bio: bio });

    if (error) {
        alert('حدث خطأ أثناء حفظ الملف الشخصي: ' + error.message);
    } else {
        alert('تم حفظ التغييرات بنجاح!');
    }
});

// عند تقديم نموذج إضافة رابط جديد
addLinkForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('link-title').value;
    const url = document.getElementById('link-url').value;

    const { error } = await supabaseClient
        .from('links')
        .insert([{ title: title, url: url, user_id: currentUser.id }]);
    
    if (error) {
        alert('حدث خطأ أثناء إضافة الرابط: ' + error.message);
    } else {
        addLinkForm.reset(); // تفريغ حقول النموذج بعد الإضافة
        fetchUserLinks(); // إعادة تحميل قائمة الروابط لتظهر الإضافة الجديدة
    }
});

// عند الضغط على زر تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'auth.html'; // إعادة التوجيه لصفحة الدخول
});


// =================================================================================
// تشغيل التطبيق
// =================================================================================

// قم بتشغيل الدالة الرئيسية عند تحميل الصفحة
// ... كل الأكواد الأخرى ...

// إضافة مستمع واحد لحاوية الروابط للتعامل مع كل أزرار الحذف (Event Delegation)
linksList.addEventListener('click', (event) => {
    // تحقق مما إذا كان العنصر الذي تم الضغط عليه هو زر حذف
    if (event.target.classList.contains('delete-btn')) {
        const linkId = event.target.dataset.linkId;
        deleteLink(linkId);
    }
});

// قم بتشغيل الدالة الرئيسية عند تحميل الصفحة
checkAndLoadUser();