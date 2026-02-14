# Santiago Accessible Dashoard ♿️🇨🇱

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73C9D?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

> **Urban accessibility data visualization for Santiago, Chile.** > This interactive dashboard empowers urban planners and citizens to identify sidewalk obstacles and evaluate route conditions, leveraging civic data to improve mobility for people with disabilities. 
The data use [Project Sidewalk](https://sidewalk-santiago.cs.washington.edu/) data from Santiago

---

## 📖 Project Context

Accessibility in Latin American cities presents unique infrastructure challenges. This project aims to **democratize access to sidewalk condition data**, providing a clear visualization layer for complex geospatial information.

Built with a focus on modern frontend standards, this dashboard prioritizes:
* **High Performance:** Efficient rendering of large geospatial datasets.
* **Inclusive UX/UI:** Clean interface built with *shadcn/ui*, adhering to web accessibility principles (a11y).
* **Scalable Architecture:** Modular design ready for future integrations (e.g., Machine Learning models for automated obstacle detection).

## 🚀 Tech Stack

* **Core:** React 18, TypeScript, Vite.
* **Styling:** Tailwind CSS.
* **UI Components:** shadcn/ui.
* **Deployment:** Vercel / Netlify (Configurable).

## 🛠️ Local Setup

Follow these steps to get the project running in your local environment:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/linax/santiago-accessible-dash.git](https://github.com/linax/santiago-accessible-dash.git)
    cd santiago-accessible-dash
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or if using bun (detected in repo)
    bun install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```
    The dashboard will be available at `http://localhost:8080`.

## 📂 Project Structure

```text
src/
├── components/   # Reusable UI components & Map logic
├── hooks/        # Custom hooks for state management
├── pages/        # Main application views
├── lib/          # Utilities & shadcn configuration
└── main.tsx      # Entry point