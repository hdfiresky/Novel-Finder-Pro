
# Novel Finder Pro 📖✨

An advanced web application for discovering, filtering, and managing your favorite web novels, powered by React and a sophisticated recommendation engine.

![Novel Finder Pro Demo](https://storage.googleapis.com/proud-booth-333014-public/novel-finder-pro-demo.gif)

---

## 🚀 Live Demo

[**Explore the live application here!**](https://your-live-demo-link.com) *(This is a placeholder link)*

---

## 🌟 Key Features

Novel Finder Pro is packed with features designed for avid readers:

*   **⚡️ Blazing Fast Search:** Instantly search through thousands of novels by title, author, or description with debounced input for a smooth experience.
*   **🔬 Advanced Filtering:**
    *   **Include/Exclude Logic:** Pinpoint exactly what you're looking for by including and excluding multiple genres and tags.
    *   **Range Sliders:** Filter novels by rating and chapter count with intuitive sliders.
    *   **Status Filter:** Find ongoing, completed, or hiatus novels with a simple dropdown.
*   **📚 Multi-Level Sorting:** Sort your results by multiple criteria (e.g., sort by rating count, then by rating) in ascending or descending order.
*   **🧠 Smart Recommendations:** Discover similar novels based on a tunable recommendation engine that considers genres, tags, description, and author.
*   **👤 User Authentication & Personalization:**
    *   Create an account and log in to unlock personalized features.
    *   **Personal Library:** Keep track of your reading list with dedicated sections for **Favorites**, **Wishlist**, and your **Reviews**.
    *   **Customizable UI:** Toggle the visibility of 'Favorite' and 'Wishlist' buttons to tailor the interface to your preference.
*   **💾 Session Persistence:** All your filters, sorting preferences, and current page are saved to your session, so you can pick up right where you left off.
*   **📱 Fully Responsive:** Enjoy a seamless experience on any device, from desktop to mobile.
*   **🔌 Optional Backend Mode:** Can run entirely frontend-only or connect to a MySQL backend for persistent storage.

---

## 🛠️ Tech Stack

*   **Frontend:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Module Loading:** [ESM.sh](https://esm.sh/) (No build step needed!)
*   **Backend (Optional):** Express.js & MySQL

---

## ⚙️ Getting Started

This project is set up to run directly in the browser without a build step, thanks to import maps and ESM.

### Prerequisites

You just need a modern web browser and a way to serve the files locally.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/novel-finder-pro.git
    cd novel-finder-pro
    ```

2.  **Serve the files:**
    You can use any simple static file server. A great option is the `serve` package.

    ```bash
    # Install serve globally (if you haven't already)
    npm install -g serve

    # Run the server from the project's root directory
    serve
    ```
    Or, if you have Python installed:
    ```bash
    # Python 3
    python -m http.server
    ```

3.  **Open in browser:**
    Navigate to the local address provided by your server (e.g., `http://localhost:3000`).

---

## 📂 Project Structure

The codebase is organized into a clean and maintainable structure:

```
/
├── components/         # Reusable React components
│   ├── ui/             # Generic UI elements (Button, Badge, etc.)
│   └── ...             # Feature-specific components
├── contexts/           # React Context for global state (Auth, UserData)
├── services/           # API Abstraction layer
├── data/               # Static data and data loading logic
├── hooks/              # Custom React hooks
├── public/             # Static assets
├── backend/            # Express.js Server
├── App.tsx             # Main application component
├── index.html          # Entry point with import maps
├── index.tsx           # React root renderer
├── types.ts            # TypeScript type definitions
├── config.ts           # Global configuration (Backend mode toggle)
├── README.md           # You are here!
└── BACKEND_GUIDE.md    # Guide for setting up MySQL backend
```

---

## ☁️ Backend Mode (MySQL)

By default, the application runs in **Frontend Only** mode using `localStorage` to simulate a database.

To enable the real backend:
1.  Set up the MySQL database and Express server by following [**`BACKEND_GUIDE.md`**](./BACKEND_GUIDE.md).
2.  Open `config.ts` and set `USE_BACKEND: true`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page of this project's repository.

---

## 📄 License

This project is licensed under the MIT License.
