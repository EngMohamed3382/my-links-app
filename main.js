// main.js - الكود الكامل والمصحح للصفحة العامة
const SUPABASE_URL = 'https://mzhwuoyetkymfjmzrufp.supabase.co'; // ضع رابط Supabase الخاص بك هنا
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHd1b3lldGt5bWZqbXpydWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzk5NDksImV4cCI6MjA3NDk1NTk0OX0.8lXagi3kauUVkJag7S2I93t52-QaFTVs9k4SrImqiRE'; // ضع مفتاح ANON الخاص بك هنا

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- عناصر الصفحة ---
const profilePic = document.getElementById('profile-pic');
const usernameH1 = document.getElementById('username-h1');
const bioP = document.getElementById('bio-p');
const linksContainer = document.getElementById('links-container');
const welcomeView = document.getElementById('welcome-view');
const profileView = document.getElementById('profile-view');
const ownerControls = document.getElementById('owner-controls');
const publicLogoutBtn = document.getElementById('public-logout-btn');

async function checkSessionAndOwnership(pageOwnerUsername) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('user_id', session.user.id)
            .single();
        if (profile && profile.username === pageOwnerUsername) {
            ownerControls.classList.remove('hidden');
        }
    }
}

async function loadUserProfile(username) {
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('user_id, username, bio, avatar_url')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        console.error('User not found:', profileError);
        welcomeView.style.display = 'none';
        profileView.innerHTML = '<h1>المستخدم غير موجود</h1>';
        profileView.style.display = 'block';
        return; // هذا الـ return صحيح لأنه داخل دالة
    }

    checkSessionAndOwnership(profile.username);

    usernameH1.textContent = profile.username;
    bioP.textContent = profile.bio || '';
    document.title = profile.username;
    if (profile.avatar_url) {
        profilePic.src = profile.avatar_url + '?t=' + new Date().getTime();
    } else {
        profilePic.src = 'placeholder.png';
    }

    const { data: links, error: linksError } = await supabaseClient
        .from('links')
        .select('title, url')
        .eq('user_id', profile.user_id);

    if (linksError) { console.error('Error fetching links:', linksError); return; }

    linksContainer.innerHTML = '';
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

publicLogoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    ownerControls.classList.add('hidden');
    window.location.reload();
});

// --- تشغيل الكود ---
const queryString = window.location.search.toLowerCase();
const params = new URLSearchParams(queryString);
const urlUsername = params.get('user');

if (urlUsername) {
    welcomeView.style.display = 'none';
    profileView.style.display = 'block';
    loadUserProfile(urlUsername);
} else {
    welcomeView.style.display = 'block';
    profileView.style.display = 'none';
}
