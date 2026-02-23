# DocuSign - Digital Document Signing Platform

A full-stack web application for securely uploading, signing, and sharing PDF documents digitally. Built with React, TypeScript, Express, and Supabase.

## 🎯 Project Overview

DocuSign is an intuitive platform that allows users to:
- **Upload** PDF documents securely to the cloud
- **Sign** documents with digital signatures
- **Share** signed documents with others via secure share links
- **Manage** all their documents in a centralized dashboard
- **Track** document signing status

The application uses Supabase for authentication and cloud storage, pdf-lib for PDF manipulation, and a modern React frontend with TypeScript for a smooth user experience.

---

## 📊 ER Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Database Schema                         │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────────┐
         │       users          │
         │  (Supabase Auth)     │
         ├──────────────────────┤
         │ id (UUID) [PK]       │
         │ email                │
         │ created_at           │
         │ updated_at           │
         └──────────────────────┘
                  │
                  │ (owns)
                  │
         ┌────────▼──────────────────────────┐
         │       documents                    │
         ├────────────────────────────────────┤
         │ id (UUID) [PK]                     │
         │ owner_id (UUID) [FK → users.id]   │
         │ file_url (TEXT)                    │
         │ status (TEXT)                      │
         │   - 'pending' (unsigned)           │
         │   - 'signed' (signed)              │
         │ original_hash (TEXT)               │
         │ created_at (TIMESTAMP)             │
         │ updated_at (TIMESTAMP)             │
         └────────────────────────────────────┘
```

---

## 🚀 Installation & Running Locally

### Prerequisites
- **Node.js** (v18+)
- **npm** or **yarn**
- **.env files** configured (See setup below)

### Step 1: Clone or Open the Project
```bash
cd c:\Users\K\Desktop\DocuSign
```

### Step 2: Set Up Environment Variables

#### Backend (`backend/.env`)
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 4: Running the Application Locally

**⚠️ IMPORTANT: Start Backend FIRST, then Frontend**

#### Terminal 1 - Start Backend Server:
```bash
cd backend
npm run dev
```
The backend server will run on `http://localhost:5000`

#### Terminal 2 - Start Frontend Development Server:
```bash
cd frontend
npm run dev
```
The frontend will typically run on `http://localhost:5173`

### Step 5: Access the Application
Open your browser and navigate to: `http://localhost:5173`

---

## 🌐 Live Deployment

The application is deployed on **Vercel** for the frontend:

- **Frontend URL:** https://docu-sign-ajuf.vercel.app
- **Backend:** Hosted separately (configure your backend server URL in environment variables)

### Deployment Steps:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Frontend will auto-deploy on push to main branch
5. Deploy backend separately (e.g., Heroku, Railway, AWS, etc.)

---

## 📡 API Endpoints

All endpoints (except public ones) require authentication via Bearer token in the `Authorization` header.

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Document Signer API is running"
}
```

### Document Endpoints

#### 1. Upload Document
```
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: file (PDF)
```
**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "uuid",
    "owner_id": "uuid",
    "file_url": "https://...",
    "status": "pending",
    "original_hash": "filename.pdf",
    "created_at": "2024-02-23T12:00:00Z"
  }
}
```

#### 2. Get User's Documents
```
GET /api/documents
Authorization: Bearer <token>
```
**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "file_url": "https://...",
      "status": "pending|signed",
      "original_hash": "filename.pdf",
      "created_at": "2024-02-23T12:00:00Z"
    }
  ]
}
```

#### 3. Sign Document
```
POST /api/documents/:id/sign
Authorization: Bearer <token>
Content-Type: application/json

Body: {
  "signatureUrl": "https://signature-image-url",
  "pageNumber": 0,
  "x": 100,
  "y": 200
}
```
**Response:**
```json
{
  "success": true,
  "message": "Document signed successfully!",
  "url": "https://signed-pdf-url"
}
```

#### 4. Delete Document
```
DELETE /api/documents/:id
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

#### 5. Share Document
```
POST /api/documents/:id/share
Authorization: Bearer <token>
```
**Response:**
```json
{
  "share_token": "document_id"
}
```
Share link format: `/documents/public/:token`

#### 6. Get Public Document (No Auth Required)
```
GET /api/documents/public/:token
```
**Response:**
```json
{
  "document": {
    "file_url": "https://...",
    "original_hash": "filename.pdf",
    "status": "pending|signed",
    "created_at": "2024-02-23T12:00:00Z"
  }
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **React PDF** - PDF viewing
- **Supabase JS** - Auth & Database
- **Sonner** - Notifications
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **pdf-lib** - PDF manipulation
- **Multer** - File upload handling
- **Axios** - HTTP client
- **CORS** - Cross-origin support
- **Nodemon** - Development server

---

## 📁 Project Structure

```
DocuSign/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express app setup
│   │   ├── config/
│   │   │   └── supabase.ts        # Supabase client
│   │   ├── controllers/
│   │   │   └── documentController.ts   # Document logic
│   │   ├── routes/
│   │   │   └── documentRoutes.ts  # API routes
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   └── upload.ts          # File upload config
│   │   └── utils/
│   │       └── pdfSigner.ts       # PDF signing utility
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main app component
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── context/               # React context (Auth)
│   │   └── api/                   # Axios client
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## 🔐 Authentication Flow

1. User signs up/logs in via Supabase Auth (email/password)
2. Supabase returns a JWT token
4. Frontend stores token and includes it in API requests
5. Backend validates token using Supabase
6. User can access protected routes

---

## 📝 Environment Variables Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | backend/.env | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | backend/.env | Backend service key (admin) |
| `VITE_SUPABASE_URL` | frontend/.env | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend/.env | Frontend anonymous key |
| `PORT` | backend/.env | Backend server port (default: 5000) |

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify Supabase credentials in `.env`
- Run `npm install` to ensure dependencies are installed

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:5000`
- Check CORS configuration in `src/server.ts`
- Verify API URLs in frontend environment

### PDF signing fails
- Check if signature image URL is accessible
- Verify the PDF is a valid PDF file
- Ensure page number is correct (0-indexed)

---

## 📄 License

ISC

---

## 👨‍💻 Development Notes

- Always start the **backend first** before the frontend
- Use `npm run dev` for development with hot reload
- Use `npm run build` to create production builds
- Check backend logs for detailed error messages

---

**Happy Signing! 📝✍️**
