// API Base URL Configuration
// Development me localhost use hoga
// Production me Vercel backend URL use hoga

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
// ```

// **Save karo** ✅

// ---

// ## 📝 **File 2: `frontend/.env.local`**

// Frontend folder ke **root level** me (jahan `package.json` hai), ye file banao:

// **Location:** `frontend/.env.local`

// Is file me ye code paste karo:
// ```
// REACT_APP_API_URL=http://localhost:5000
// ```

// **Save karo** ✅

// ---

// ## 🔍 **Ab Next Step:**

// Ab tumhe **API calls update** karni hain. Mujhe ye batao:

// ### **Option 1: Search Karo (Recommended)**

// // VS Code me:
// // 1. **`Ctrl + Shift + F`** press karo (Search in all files)
// // 2. Search karo: **`fetch(`** 
// // 3. Phir search karo: **`axios.get(`** ya **`axios.post(`**
// // 4. Screenshot bhejo results ka

// // ---

// ### **Option 2: Files Manually Check Karo**

// Ye folders check karo aur files open karke dikhao:

// **Check these folders:**
// // ```
// // 📁 frontend/src/services/     (API calls yahan hongi)
// // 📁 frontend/src/pages/        (HomePage, ProjectsPage, etc.)
// // 📁 frontend/src/components/   (Components with API calls)