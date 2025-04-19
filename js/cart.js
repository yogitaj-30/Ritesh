import { fs } from './firebaseConfig.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const cartContainer = document.getElementById("cartContainer");
const cartSummary = document.getElementById("cartSummary");

const userId = localStorage.getItem("userId");
const isLoggedIn = localStorage.getItem("userLoggedIn");

async function loadCart() {
    let cart = [];

    if (isLoggedIn && userId) {
        try {
            const userDoc = await getDoc(doc(fs, "users", userId));
            if (userDoc.exists()) {
                cart = userDoc.data().cart || [];
                localStorage.setItem("cart", JSON.stringify(cart));
            }
        } catch (error) {
            console.error("Error fetching firestore cart", error.message);
        }
    } else {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    }

    if (cart.length == 0) {
        cartContainer.innerHTML = "<p>Your cart is empty. </p>";
        return;
    }
    let total = 0;
    const cartHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
            <h3>${item.name}</h3>
            <p>Price: ₹${item.price}</p>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
        </div>`;
    }).join("");

    cartContainer.innerHTML = cartHTML;
    cartSummary.innerHTML = `<h3>Total: ₹${total}</h3>
        <button id="checkoutBtn">Proceed to Checkout</button>`;

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener("click", async() => {
            const id = parseInt(btn.dataset.id);
            const updatedCart = cart.filter(item => item.id !== id);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            if (isLoggedIn && userId) {
                await updateCartInFirestore(updatedCart);
            }
            window.location.reload();
        });
    });

    document.getElementById("checkoutBtn").addEventListener("click", () => {
        if (!isLoggedIn) {
            alert("Please log in to proceed to checkout.");
            window.location.href = "login.html"
        } else {
            alert("Proceeding to order summary...")
        }
    });
}

async function updateCartInFirestore(updatedCart) {
    try {
        await updateDoc(doc(fs, "users", userId), {
            cart: updatedCart
        });
    } catch (error) {
        console.error("Failed to update Firestore cart:", error.message);
    }
}

loadCart();




