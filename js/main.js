import { ref, get, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"
import { db } from "./firebaseConfig.js"


const searchInput = document.getElementById('searchMed');
const suggestionList = document.getElementById("suggestionList");

let debounceTimer;

searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim().toLowerCase();

    debounceTimer = setTimeout(() => {
        if (query) {
            searchMedicines(query);
        } else {
            suggestionList.innerHTML = ""
        }
    }, 300);
});


function searchMedicines(query) {
    const dbRef = ref(db);
    get(child(dbRef, "medicines")).then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val()
            const results = [];
            const seenNames = new Set();

            for (let key in data) {
                const med = data[key];
                const name = med.name.toLowerCase()
                if (name.includes(query) && !seenNames.has(name)) {
                    results.push({ id: key, name: med.name });
                    seenNames.add(name);
                }
            }
            displaySuggestions(results);
        } else {
            suggestionList.innerHTML = "<li>No results found</li>";
        }
    }).catch(err => {
        console.error(err);
    });
}

function displaySuggestions(results) {
    suggestionList.innerHTML = "";

    if (results.length == 0) {
        suggestionList.innerHTML = "<li>No matches found</li>"
        return;
    }
    results.forEach(result => {
        const li = document.createElement("li");
        li.textContent = result.name;
        li.classList.add("suggestion-item");
        li.style.cursor = "pointer";
        li.addEventListener("click", () => {
            window.location.href = `medicine.html?id=${result.id}`;
        });
        suggestionList.appendChild(li);
    });
}

