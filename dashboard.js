import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-mdI3OlZDe9mtpKXyDjclrr1IE0LZJSc",
  authDomain: "view-49d26.firebaseapp.com",
  databaseURL: "https://view-49d26-default-rtdb.firebaseio.com",
  projectId: "view-49d26",
  storageBucket: "view-49d26.firebasestorage.app",
  messagingSenderId: "462642880975",
  appId: "1:462642880975:web:d2b4b5f5f53a583986f2ba",
  measurementId: "G-F1H6F6V8MG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const matchesContainer = document.getElementById('matches-container');
const profileForm = document.getElementById('profile-form');
const logoutBtn = document.getElementById('logout-btn');
const chatModal = document.getElementById('chat-modal');
const chatBody = document.getElementById('chat-body');
const chatWith = document.getElementById('chat-with');
const chatMessage = document.getElementById('chat-message');
const sendMessageBtn = document.getElementById('send-message');
const closeChat = document.getElementById('close-chat');

let currentUserId = '';
let chatWithId = '';

// Auth state
onAuthStateChanged(auth, user => {
    if(user){
        currentUserId = user.uid;
        loadProfile(user.uid);
        loadMatches();
    } else {
        window.location.href = "index.html";
    }
});

// Logout
logoutBtn.addEventListener('click', () => signOut(auth));

// Save profile
profileForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const age = document.getElementById('profile-age').value;
    const interests = document.getElementById('profile-interests').value.split(',').map(i=>i.trim());
    await set(ref(db,'users/'+currentUserId),{name, age, interests});
    alert('Profile saved!');
    loadMatches();
});

// Load profile
async function loadProfile(uid){
    const snapshot = await get(ref(db,'users/'+uid));
    if(snapshot.exists()){
        const data = snapshot.val();
        document.getElementById('profile-name').value = data.name || '';
        document.getElementById('profile-age').value = data.age || '';
        document.getElementById('profile-interests').value = (data.interests || []).join(', ');
    }
}

// Load matches (demo + Firebase)
async function loadMatches(){
    matchesContainer.innerHTML = '';
    const snapshot = await get(ref(db,'users'));
    if(snapshot.exists()){
        const users = snapshot.val();
        for(const uid in users){
            if(uid !== currentUserId){
                const user = users[uid];
                const interestsText = (user.interests || []).join(', ');
                const genderImg = user.gender==='male'
                    ? "https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                    : "https://images.unsplash.com/photo-1595152772835-219674b2a8a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

                const card = document.createElement('div');
                card.classList.add('match-card');
                card.innerHTML = `
                    <img src="${genderImg}" alt="Profile">
                    <div class="info">
                        <h3>${user.name}, ${user.age || ''}</h3>
                        <p>Interests: ${interestsText}</p>
                    </div>
                `;
                card.addEventListener('click', ()=>openChat(uid,user.name));
                matchesContainer.appendChild(card);
            }
        }
    }
}

// Chat
function openChat(uid,name){
    chatModal.style.display = 'flex';
    chatWith.textContent = name;
    chatWithId = uid;
    chatBody.innerHTML = '';

    const messagesRef = ref(db,'messages/'+[currentUserId,chatWithId].sort().join('_'));
    onChildAdded(messagesRef,snapshot=>{
        const msg = snapshot.val();
        const div = document.createElement('div');
        div.textContent = (msg.sender===currentUserId?'You: ':msg.senderName+': ')+msg.text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    });
}

sendMessageBtn.addEventListener('click', async ()=>{
    if(chatMessage.value.trim()==='') return;
    const messagesRef = ref(db,'messages/'+[currentUserId,chatWithId].sort().join('_'));
    await push(messagesRef,{
        sender: currentUserId,
        senderName: document.getElementById('profile-name').value,
        text: chatMessage.value.trim(),
        time: new Date().toISOString()
    });
    chatMessage.value='';
});

closeChat.addEventListener('click', ()=>chatModal.style.display='none');
