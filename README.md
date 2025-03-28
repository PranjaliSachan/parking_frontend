# 🚗 Parking Reservation System - Frontend

This is the **frontend** of the **Parking Reservation System**, built using **React (Vite), TypeScript, Tailwind CSS, Material UI**, and **Leaflet.js** for interactive map visualization. It allows users to **search for parking spots, view availability, reserve spots, and manage reservations**.

---

## 📌 Features
- 🌍 **Interactive Map (OpenStreetMap + Leaflet.js)**: Displays available and reserved parking spots.
- 🔎 **Search & Autocomplete**: Users can search parking spots by location.
- 🟢 **Real-time Spot Availability**: Shows available and reserved spots (Blue = Available, Red = Reserved).
- 💳 **Reservation System**: Users can reserve parking spots.
- 🛠 **Admin Dashboard**: Monitors reservations and parking spot data.
- 🔄 **REST API Integration**: Connects to the Django backend for real-time updates. (Repo)[https://github.com/PranjaliSachan/parking_backend]

---

## ⚡ Quick Start

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/PranjaliSachan/parking-frontend.git
cd parking-frontend
```

### **2️⃣ Install Dependencies**
```bash
npm install  # OR yarn install
```

### **3️⃣ Set Up Environment Variables**
Create a **.env** file in the project root and configure the API base URL:
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

### **4️⃣ Run the Development Server**
```bash
npm run dev  # OR yarn dev
```
Frontend will be available at **http://localhost:5173** 🚀

---

## 🔥 API Endpoints (Used in Frontend)
| Method | Endpoint         | Description |
|--------|----------------|-------------|
| GET    | `/api/spots/`  | Get all parking spots |
| POST   | `/api/reserve/` | Reserve a parking spot |

---

## 🛠 Technologies Used
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Material UI
- **Maps**: Leaflet.js, OpenStreetMap
- **State Management**: React Hooks
- **API**: Axios for REST API calls
- **Deployment**: Netlify

---

## 🤝 Contributing
Feel free to contribute! Fork the repository and submit a pull request.

---

## 📜 License
MIT License. Free to use and modify!

