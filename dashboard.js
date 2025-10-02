// استبدل التالي بالمعلومات الخاصة بمشروعك في Supabase
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co'; // ضع رابط Supabase الخاص بك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE'; // ضع مفتاح ANON الخاص بك هنا

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const logoutBtn = document.getElementById('logout-btn');
const linksList = document.getElementById('links-list');
const addLinkForm = document.getElementById('add-link-form');
const profileForm = document.getElementById('profile-form');
const avatarPreview = document.getElementById('avatar-preview');
const avatarInput = document.getElementById('avatar-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadStatus = document.getElementById('upload-status');
let currentUser = null;
let selectedFile = null;

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

profileForm.addEventListener('submit', async (event) => { /* ... نفس الكود السابق ... */ });
addLinkForm.addEventListener('submit', async (event) => { /* ... نفس الكود السابق ... */ });
async function fetchUserLinks() { /* ... نفس الكود السابق ... */ }
linksList.addEventListener('click', (event) => { /* ... نفس الكود السابق ... */ });
async function deleteLink(linkId) { /* ... نفس الكود السابق ... */ }
logoutBtn.addEventListener('click', async () => { /* ... نفس الكود السابق ... */ });

// --- كود رفع الصورة الجديد ---
avatarInput.addEventListener('change', () => {
    selectedFile = avatarInput.files[0];
    if (selectedFile) {
        avatarPreview.src = URL.createObjectURL(selectedFile);
        uploadBtn.style.display = 'inline-block';
    }
});

uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    uploadStatus.textContent = 'جاري رفع الصورة...';
    const filePath = `${currentUser.id}/${Date.now()}`;
    const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, selectedFile);
    if (uploadError) {
        console.error('Upload Error:', uploadError);
        uploadStatus.textContent = 'فشل الرفع.';
        return;
    }
    const { data } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', currentUser.id);
    if (updateError) {
        console.error('Update Error:', updateError);
        uploadStatus.textContent = 'فشل حفظ الرابط.';
    } else {
        uploadStatus.textContent = 'تم تحديث الصورة بنجاح!';
        uploadBtn.style.display = 'none';
    }
});

async function checkAndLoadUser() { /* ... نفس الكود السابق ... */ }
checkAndLoadUser();
