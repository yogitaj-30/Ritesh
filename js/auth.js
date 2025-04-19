import { auth, fs } from './firebaseConfig.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginForm');
    const signupBtn = document.getElementById('signupForm');
    const logoutBtn = document.getElementById('logout-btn');


    if (loginBtn) {
        loginBtn.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value
            const password = document.getElementById('loginPassword').value
            try {
                const userCredentials = await signInWithEmailAndPassword(auth, email, password)
                const user = userCredentials.user;
                const userDocRef = doc(fs, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
                    const firestoreCart = userData.cart || [];

                    const mergedCart = [...firestoreCart];
                    localCart.forEach(localItem => {
                        const exists = mergedCart.some(item => item.id == localItem.id);
                        if (!exists) mergedCart.push(localItem);
                    });

                    await updateDoc(userDocRef, { cart: mergedCart });

                    localStorage.setItem("cart", JSON.stringify(mergedCart));
                    localStorage.setItem("userName", userData.name);
                    localStorage.setItem("role", userData.role);
                    localStorage.setItem("userLoggedIn", true);
                    localStorage.setItem("userId", user.uid);
                    localStorage.setItem("userEmail", user.email);

                    document.getElementById('login-message').innerText = "Logged In Successfully";
                    alert('Logged In Successfully');
                    window.location.href = "index.html";
                } else {
                    document.getElementById('login-message').innerText = "User data not found!"
                    alert('User data not found!');
                }
            } catch (error) {
                document.getElementById('login-message').innerText = "Incorrect email or password!"
                alert('Incorrect email or password!');
                console.log(error.message);
            }
        })
    }

    if (signupBtn) {
        signupBtn.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value
            const email = document.getElementById('signupEmail').value
            const password = document.getElementById('signupPassword').value
            const role = document.getElementById('role').value

            try {
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
                const userObject = {
                    uid: userCredentials.user.uid,
                    email: email,
                    name: name,
                    role: role,
                    createdAt: new Date().toISOString(),
                    cart: [],
                    prescriptions: []
                }
                await setDoc(doc(fs, "users", userCredentials.user.uid), userObject)
                document.getElementById('signup-message').innerText = "Registered Successfully"
                alert("Registered Successfully");
                window.location.href = "login.html"
            } catch (error) {
                document.getElementById('signup-message').innerText = "Something went wrong!"
                alert("Something went wrong!");
                console.log(error.message);
            }
        })
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            alert("Logged Out Successfully")
            localStorage.clear();
            window.location.href = "login.html"
        })
    }
})