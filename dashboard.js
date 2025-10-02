// =================================================================================
// dashboard.js - الكود الكامل بعد إضافة تنبيهات Toastify
// =================================================================================

const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE';
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
const shareableLinkInput = document.getElementById('shareable-link');
const copyLinkBtn = document.getElementById('copy-link-btn');

let currentUser = null;
let selectedFile = null;

// --- إعدادات Toastify ---
const toastStyles = {
    success: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
    error: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
};
const showToast = (message, type = 'success') => {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "bottom",
        position: "left",
        style: toastStyles[type]
    }).showToast();
};

// --- الدوال الرئيسية (Functions) ---
async function fetchUserLinks() { /* ... نفس الكود السابق ... */ }
async function fetchUserProfile() { /* ... نفس الكود السابق ... */ }

async function deleteLink(linkId) {
    const isConfirmed = confirm('هل أنت متأكد أنك تريد حذف هذا الرابط؟');
    if (isConfirmed) {
        const { error } = await supabaseClient.from('links').delete().eq('id', linkId);
        if (error) {
            showToast('حدث خطأ أثناء الحذف.', 'error');
        } else {
            showToast('تم حذف الرابط بنجاح.');
            fetchUserLinks();
        }
    }
}

function openEditModal(id, title, url) { /* ... نفس الكود السابق ... */ }
function closeEditModal() { /* ... نفس الكود السابق ... */ }
async function checkAndLoadUser() { /* ... نفس الكود السابق ... */ }

// --- ربط الأحداث (Event Listeners) ---

copyLinkBtn.addEventListener('click', () => { /* ... نفس الكود السابق ... */ });

addLinkForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('link-title').value;
    const url = document.getElementById('link-url').value;
    const { error } = await supabaseClient.from('links').insert([{ title: title, url: url, user_id: currentUser.id }]);
    if (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
    } else {
        showToast('تمت إضافة الرابط بنجاح.');
        addLinkForm.reset();
        fetchUserLinks();
    }
});

profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;
    const { error } = await supabaseClient.from('profiles').upsert({ user_id: currentUser.id, username: username, bio: bio });
    if (error) {
        showToast('حدث خطأ: ' + error.message, 'error');
    } else {
        showToast('تم حفظ التغييرات بنجاح!');
        fetchUserProfile();
    }
});

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = editLinkId.value;
    const title = editLinkTitle.value;
    const url = editLinkUrl.value;
    const { error } = await supabaseClient.from('links').update({ title: title, url: url }).eq('id', id);
    if (error) {
        showToast('حدث خطأ أثناء تحديث الرابط.', 'error');
    } else {
        showToast('تم تحديث الرابط بنجاح.');
        closeEditModal();
        fetchUserLinks();
    }
});

linksList.addEventListener('click', (event) => { /* ... نفس الكود السابق ... */ });
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (event) => { /* ... نفس الكود السابق ... */ });
avatarInput.addEventListener('change', () => { /* ... نفس الكود السابق ... */ });

uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    uploadStatus.textContent = 'جاري رفع الصورة...';
    const filePath = `${currentUser.id}/${Date.now()}`;
    const { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, selectedFile);
    if (uploadError) {
        uploadStatus.textContent = 'فشل الرفع.';
        showToast('فشل رفع الصورة.', 'error');
        return;
    }
    const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
    const { error: updateError } = await supabaseClient.from('profiles').update({ avatar_url: data.publicUrl }).eq('user_id', currentUser.id);
    if (updateError) {
        uploadStatus.textContent = 'فشل حفظ الرابط.';
        showToast('فشل حفظ رابط الصورة.', 'error');
    } else {
        uploadStatus.textContent = '';
        showToast('تم تحديث الصورة بنجاح!');
        uploadBtn.style.display = 'none';
        fetchUserProfile();
    }
});

logoutBtn.addEventListener('click', async () => { /* ... نفس الكود السابق ... */ });

// --- تشغيل التطبيق ---
checkAndLoadUser();

// --- لصق الأكواد الكاملة التي تم اختصارها للتأكيد ---
async function fetchUserLinks() {if (!currentUser) return;const { data: links, error } = await supabaseClient.from('links').select('id, title, url').eq('user_id', currentUser.id);if (error) { console.error('Error fetching links:', error); return; }linksList.innerHTML = '';if (links.length === 0) {linksList.innerHTML = '<p>لا يوجد روابط بعد. قم بإضافة أول رابط لك.</p>';} else {links.forEach(link => {const linkContainer = document.createElement('div');linkContainer.classList.add('link-item-container');const linkElement = document.createElement('a');linkElement.href = link.url;linkElement.textContent = link.title;linkElement.classList.add('link-box');linkElement.target = '_blank';const editButton = document.createElement('button');editButton.textContent = 'تعديل';editButton.classList.add('edit-btn');editButton.dataset.id = link.id;editButton.dataset.title = link.title;editButton.dataset.url = link.url;const deleteButton = document.createElement('button');deleteButton.textContent = 'حذف';deleteButton.classList.add('delete-btn');deleteButton.dataset.linkId = link.id;linkContainer.appendChild(linkElement);linkContainer.appendChild(editButton);linkContainer.appendChild(deleteButton);linksList.appendChild(linkContainer);});}}
async function fetchUserProfile() {if (!currentUser) return;const { data: profile, error } = await supabaseClient.from('profiles').select('username, bio, avatar_url').eq('user_id', currentUser.id).single();if (error && error.code !== 'PGRST116') { console.error('Error fetching profile:', error); } else if (profile) {document.getElementById('username').value = profile.username || '';document.getElementById('bio').value = profile.bio || '';if (profile.avatar_url) {avatarPreview.src = profile.avatar_url + '?t=' + new Date().getTime();} else {avatarPreview.src = 'placeholder.png';}if (profile.username) {const rootUrl = window.location.origin;const publicUrl = `${rootUrl}/?user=${profile.username}`;shareableLinkInput.value = publicUrl;} else {shareableLinkInput.value = 'الرجاء اختيار اسم مستخدم أولاً لحفظه.';}}}
function openEditModal(id, title, url) {editLinkId.value = id;editLinkTitle.value = title;editLinkUrl.value = url;editModal.classList.remove('hidden');}
function closeEditModal() {editModal.classList.add('hidden');}
async function checkAndLoadUser() {const { data, error } = await supabaseClient.auth.getUser();if (error || !data.user) {window.location.href = 'auth.html';return;}currentUser = data.user;fetchUserProfile();fetchUserLinks();}
copyLinkBtn.addEventListener('click', () => {shareableLinkInput.select();document.execCommand('copy');copyLinkBtn.textContent = 'تم النسخ!';setTimeout(() => { copyLinkBtn.textContent = 'نسخ'; }, 2000);});
linksList.addEventListener('click', (event) => {if (event.target.classList.contains('delete-btn')) { deleteLink(event.target.dataset.linkId); }if (event.target.classList.contains('edit-btn')) { const { id, title, url } = event.target.dataset; openEditModal(id, title, url); }});
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (event) => { if (event.target === editModal) { closeEditModal(); } });
avatarInput.addEventListener('change', () => {selectedFile = avatarInput.files[0];if (selectedFile) {avatarPreview.src = URL.createObjectURL(selectedFile);uploadBtn.style.display = 'inline-block';}});
logoutBtn.addEventListener('click', async () => {await supabaseClient.auth.signOut();window.location.href = 'auth.html';});
