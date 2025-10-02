// استبدل التالي بالمعلومات الخاصة بمشروعك في Supabase
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co'; // ضع رابط Supabase الخاص بك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE'; // ضع مفتاح ANON الخاص بك هنا
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- عناصر واجهة المستخدم ---
const logoutBtn = document.getElementById('logout-btn');
const linksList = document.getElementById('links-list');
const addLinkForm = document.getElementById('add-link-form');
const profileForm = document.getElementById('profile-form');
const avatarPreview = document.getElementById('avatar-preview');
const avatarInput = document.getElementById('avatar-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadStatus = document.getElementById('upload-status');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-link-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editLinkId = document.getElementById('edit-link-id');
const editLinkTitle = document.getElementById('edit-link-title');
const editLinkUrl = document.getElementById('edit-link-url');

let currentUser = null;
let selectedFile = null;

// =================================================================================
// الدوال الرئيسية (Functions)
// =================================================================================

/**
 * دالة لجلب وعرض روابط المستخدم (مع أزرار التعديل والحذف).
 */
async function fetchUserLinks() {
    if (!currentUser) return;
    const { data: links, error } = await supabaseClient
        .from('links')
        .select('id, title, url')
        .eq('user_id', currentUser.id);

    if (error) { console.error('Error fetching links:', error); return; }

    linksList.innerHTML = '';
    if (links.length === 0) {
        linksList.innerHTML = '<p>لا يوجد روابط بعد. قم بإضافة أول رابط لك.</p>';
    } else {
        links.forEach(link => {
            const linkContainer = document.createElement('div');
            linkContainer.classList.add('link-item-container');

            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.textContent = link.title;
            linkElement.classList.add('link-box');
            linkElement.target = '_blank';

            const editButton = document.createElement('button');
            editButton.textContent = 'تعديل';
            editButton.classList.add('edit-btn');
            editButton.dataset.id = link.id;
            editButton.dataset.title = link.title;
            editButton.dataset.url = link.url;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'حذف';
            deleteButton.classList.add('delete-btn');
            deleteButton.dataset.linkId = link.id;

            linkContainer.appendChild(linkElement);
            linkContainer.appendChild(editButton);
            linkContainer.appendChild(deleteButton);
            linksList.appendChild(linkContainer);
        });
    }
}

/**
 * دالة لجلب وعرض بيانات الملف الشخصي.
 */
async function fetchUserProfile() {
    if (!currentUser) return;
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('user_id', currentUser.id)
        .single();
    if (error && error.code !== 'PGRST116') { console.error('Error:', error); }
    else if (profile) {
        document.getElementById('username').value = profile.username || '';
        document.getElementById('bio').value = profile.bio || '';
        if (profile.avatar_url) {
            avatarPreview.src = profile.avatar_url;
        }
    }
}

/**
 * دالة لحذف رابط معين بعد تأكيد المستخدم.
 */
async function deleteLink(linkId) {
    const isConfirmed = confirm('هل أنت متأكد أنك تريد حذف هذا الرابط؟');
    if (isConfirmed) {
        const { error } = await supabaseClient.from('links').delete().eq('id', linkId);
        if (error) {
            alert('حدث خطأ أثناء الحذف.');
        } else {
            fetchUserLinks();
        }
    }
}

/**
 * دوال فتح وإغلاق نافذة التعديل.
 */
function openEditModal(id, title, url) {
    editLinkId.value = id;
    editLinkTitle.value = title;
    editLinkUrl.value = url;
    editModal.classList.remove('hidden');
}
function closeEditModal() {
    editModal.classList.add('hidden');
}

/**
 * دالة رئيسية للتحقق من هوية المستخدم وجلب كل بياناته عند تحميل الصفحة.
 */
async function checkAndLoadUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data.user) {
        window.location.href = 'auth.html';
        return;
    }
    currentUser = data.user;
    fetchUserProfile();
    fetchUserLinks();
}

// =================================================================================
// ربط الأحداث (Event Listeners)
// =================================================================================

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
        addLinkForm.reset();
        fetchUserLinks(); // إعادة تحميل قائمة الروابط لتظهر الإضافة الجديدة
    }
});

// عند تقديم نموذج حفظ بيانات الملف الشخصي
profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;
    const { error } = await supabaseClient
        .from('profiles')
        .upsert({ user_id: currentUser.id, username: username, bio: bio });
    if (error) {
        alert('حدث خطأ: ' + error.message);
    } else {
        alert('تم حفظ التغييرات بنجاح!');
    }
});

// عند تقديم نموذج تعديل الرابط
editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = editLinkId.value;
    const title = editLinkTitle.value;
    const url = editLinkUrl.value;
    const { error } = await supabaseClient
        .from('links')
        .update({ title: title, url: url })
        .eq('id', id);
    if (error) {
        alert('حدث خطأ أثناء تحديث الرابط.');
    } else {
        closeEditModal();
        fetchUserLinks();
    }
});

// مستمع واحد للتعامل مع أزرار الحذف والتعديل
linksList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        deleteLink(event.target.dataset.linkId);
    }
    if (event.target.classList.contains('edit-btn')) {
        const { id, title, url } = event.target.dataset;
        openEditModal(id, title, url);
    }
});

// لإغلاق نافذة التعديل
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// عند اختيار صورة جديدة
avatarInput.addEventListener('change', () => {
    selectedFile = avatarInput.files[0];
    if (selectedFile) {
        avatarPreview.src = URL.createObjectURL(selectedFile);
        uploadBtn.style.display = 'inline-block';
    }
});

// عند الضغط على زر رفع الصورة
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    uploadStatus.textContent = 'جاري رفع الصورة...';
    const filePath = `${currentUser.id}/${Date.now()}`;
    const { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, selectedFile);
    if (uploadError) {
        uploadStatus.textContent = 'فشل الرفع.';
        return;
    }
    const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
    const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', currentUser.id);
    if (updateError) {
        uploadStatus.textContent = 'فشل حفظ الرابط.';
    } else {
        uploadStatus.textContent = 'تم تحديث الصورة بنجاح!';
        uploadBtn.style.display = 'none';
    }
});

// عند الضغط على زر تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'auth.html';
});

// =================================================================================
// تشغيل التطبيق
// =================================================================================
checkAndLoadUser();
