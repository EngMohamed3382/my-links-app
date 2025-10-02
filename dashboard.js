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

// --- عناصر نافذة التعديل ---
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-link-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editLinkId = document.getElementById('edit-link-id');
const editLinkTitle = document.getElementById('edit-link-title');
const editLinkUrl = document.getElementById('edit-link-url');

let currentUser = null;
let selectedFile = null;

// --- دالة لجلب وعرض روابط المستخدم ---
async function fetchUserLinks() {
    if (!currentUser) return;
    const { data: links, error } = await supabaseClient
        .from('links')
        .select('id, title, url')
        .eq('user_id', currentUser.id);

    if (error) { console.error('Error fetching links:', error); return; }

    linksList.innerHTML = '';
    if (links.length === 0) {
        linksList.innerHTML = '<p>لا يوجد روابط بعد.</p>';
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

// --- دوال فتح وإغلاق نافذة التعديل ---
function openEditModal(id, title, url) {
    editLinkId.value = id;
    editLinkTitle.value = title;
    editLinkUrl.value = url;
    editModal.classList.remove('hidden');
}
function closeEditModal() {
    editModal.classList.add('hidden');
}

// --- ربط الأحداث ---
// مستمع واحد للتعامل مع أزرار الحذف والتعديل
linksList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const linkId = event.target.dataset.linkId;
        deleteLink(linkId);
    }
    if (event.target.classList.contains('edit-btn')) {
        const { id, title, url } = event.target.dataset;
        openEditModal(id, title, url);
    }
});

// لإغلاق النافذة عند الضغط على زر إلغاء أو الخلفية
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (event) => {
    if (event.target === editModal) { // إذا تم الضغط على الخلفية نفسها
        closeEditModal();
    }
});

// لحفظ التغييرات عند تقديم نموذج التعديل
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
        console.error('Update error:', error);
    } else {
        closeEditModal();
        fetchUserLinks(); // إعادة تحميل الروابط لتظهر التغييرات
    }
});


// باقي الدوال تبقى كما هي بدون تغيير
async function fetchUserProfile() { /* ... نفس الكود السابق ... */ }
profileForm.addEventListener('submit', async (event) => { /* ... نفس الكود السابق ... */ });
addLinkForm.addEventListener('submit', async (event) => { /* ... نفس الكود السابق ... */ });
async function deleteLink(linkId) { /* ... نفس الكود السابق ... */ }
logoutBtn.addEventListener('click', async () => { /* ... نفس الكود السابق ... */ });
avatarInput.addEventListener('change', () => { /* ... نفس الكود السابق ... */ });
uploadBtn.addEventListener('click', async () => { /* ... نفس الكود السابق ... */ });
async function checkAndLoadUser() { /* ... نفس الكود السابق ... */ }
checkAndLoadUser();

