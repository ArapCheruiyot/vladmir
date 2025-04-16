// dashboard.js

// 🔥 Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDlaiCiuvrn5gKzdnP9oei22r4SRZHjuG0",
  authDomain: "starry-compiler-443015-t5.firebaseapp.com",
  databaseURL: "https://starry-compiler-443015-t5-default-rtdb.firebaseio.com",
  projectId: "starry-compiler-443015-t5",
  storageBucket: "starry-compiler-443015-t5.firebasestorage.app",
  messagingSenderId: "990024267481",
  appId: "1:990024267481:web:79aacd7ae7e84ebf5c70c8",
  measurementId: "G-XRMKTBJ8XV"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔒 Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("user-name").textContent = `Welcome, ${user.displayName}`;
    document.getElementById("user-pic").src = user.photoURL || "default.jpg";
    loadFunddrives(user.uid);
  } else {
    window.location.href = "index.html"; // Redirect to login if not signed in
  }
});

// 🚪 Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut();
});

// 📂 Load funddrives from Firestore
function loadFunddrives(uid) {
  const container = document.getElementById("cards-container");
  container.innerHTML = ""; // Clear any previous data

  db.collection("funddrives").where("owner", "==", uid).get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.innerHTML = "<p>No funddrives yet. Create one!</p>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const card = document.createElement("div");
        card.className = "funddrive-card";
       card.innerHTML = `
  <img src="${data.imageUrl || 'default.jpg'}" class="fund-image" />
  <span class="category-tag">${data.category?.toUpperCase() || "OTHER"}</span>
  <h3>${data.title}</h3>
  <p>${data.description}</p>
  <p><strong>Target:</strong> KES ${data.target}</p>
  <p><strong>Method:</strong> ${data.method.toUpperCase()} - ${data.number}</p>
  <button onclick="triggerSTKPush('${data.method}', '${data.number}', '${data.title}')">Donate via M-Pesa</button>
`;

        container.appendChild(card);
      });
    });
}

// ➕ Show form
document.getElementById("create-btn").addEventListener("click", () => {
  document.getElementById("form-section").style.display = "block";
});

document.getElementById("funddrive-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const target = parseFloat(document.getElementById("target").value);
  const method = document.getElementById("method").value;
  const number = document.getElementById("number").value;
  const category = document.getElementById("category").value;
  const imageFile = document.getElementById("image").files[0];

  let imageUrl = "";

  if (imageFile) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(`funddrive_images/${Date.now()}_${imageFile.name}`);
    await imageRef.put(imageFile);
    imageUrl = await imageRef.getDownloadURL();
  }

  const fundData = {
    title,
    description,
    target,
    method,
    number,
    category,
    imageUrl,
    owner: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("funddrives").add(fundData)
    .then(() => {
      alert("Funddrive created successfully!");
      document.getElementById("funddrive-form").reset();
      document.getElementById("form-section").style.display = "none";
      loadFunddrives(user.uid); // refresh funddrives
    })
    .catch(err => {
      console.error("Error creating funddrive:", err);
      alert("Failed to create funddrive.");
    });
});

// 📲 Dummy STK Push (replace with real Daraja API logic)
function triggerSTKPush(method, number, title) {
  alert(`Simulating STK Push to ${method.toUpperCase()} number: ${number} for ${title}`);
}
