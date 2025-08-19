// Firebase SDK via CDN should already be in HTML using <script type="module">
// All logic below goes into app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ======= Firebase Config =======
const firebaseConfig = {
    apiKey: "AIzaSyD-mdI3OlZDe9mtpKXyDjclrr1IE0LZJSc",
    authDomain: "view-49d26.firebaseapp.com",
    databaseURL: "https://view-49d26-default-rtdb.firebaseio.com",
    projectId: "view-49d26",
    storageBucket: "view-49d26.appspot.com",
    messagingSenderId: "462642880975",
    appId: "1:462642880975:web:d2b4b5f5f53a583986f2ba"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ======= Toast Notification =======
export function showToast(msg){
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "show";
    setTimeout(()=>{ toast.className = toast.className.replace("show",""); },3000);
}

// ======= Registration =======
export async function registerUser(event){
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    try{
        const userCredential = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;

        // Generate unique referral code
        function generateCode(){
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = 'REF';
            for(let i=0;i<6;i++) code += chars[Math.floor(Math.random()*chars.length)];
            return code;
        }
        let myCode;
        for(let i=0;i<5;i++){
            const code = generateCode();
            const snapshot = await get(ref(db,'usersByCode/'+code));
            if(!snapshot.exists()){ myCode = code; break; }
        }

        // Save user data
        await set(ref(db,'users/'+user.uid),{
            name: name,
            email: email,
            balance: 0,
            referralCount: 0,
            referralCode: myCode,
            referredBy: refCode || '',
            createdAt: new Date().toISOString()
        });

        // Map referral code → userId
        await set(ref(db,'usersByCode/'+myCode),user.uid);

        // Handle referral
        if(refCode){
            await set(ref(db,'referrals/'+refCode+'/'+user.uid),true);
            const refSnapshot = await get(ref(db,'usersByCode/'+refCode));
            if(refSnapshot.exists()){
                const refUserId = refSnapshot.val();
                const countSnapshot = await get(ref(db,'users/'+refUserId+'/referralCount'));
                let newCount = (countSnapshot.exists() ? countSnapshot.val() : 0)+1;
                await set(ref(db,'users/'+refUserId+'/referralCount'),newCount);
            }
        }

        showToast("✅ Registration Successful!");
        setTimeout(()=> window.location.href = "login.html",1500);

    }catch(e){
        showToast("❌ "+e.message);
    }
}

// ======= Login =======
export async function loginUser(event){
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try{
        await signInWithEmailAndPassword(auth,email,password);
        showToast("✅ Login Successful!");
        setTimeout(()=> window.location.href = "index.html",1000);
    }catch(e){
        showToast("❌ "+e.message);
    }
}

// ======= Logout =======
export function logoutUser(){
    signOut(auth).then(()=> window.location.href='login.html');
}

// ======= Dashboard / Referral / Popup =======
export function initDashboard(){
    // Show popup on load
    const popup = document.getElementById("popup");
    popup.style.display = "flex";

    document.getElementById("allowBtn").onclick = ()=>{ popup.style.display="none"; }

    // Listen user state
    onAuthStateChanged(auth, user=>{
        if(!user){ window.location.href='login.html'; return; }

        get(child(ref(db),'users/'+user.uid)).then(snapshot=>{
            if(snapshot.exists()){
                const data = snapshot.val();
                document.getElementById("welcome").innerText = "Hello, "+data.name;
                document.getElementById("balance").innerText = "Balance: $"+data.balance;
                document.getElementById("refCount").innerText = "Referrals: "+(data.referralCount||0);
                const base = window.location.origin;
                document.getElementById("refLink").value = base+"/register.html?ref="+(data.referralCode||'');
            }
        });
    });
}

// ======= Copy Referral =======
export function copyReferral(){
    const el = document.getElementById("refLink");
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand('copy');
    showToast("✅ Referral link copied!");
}
