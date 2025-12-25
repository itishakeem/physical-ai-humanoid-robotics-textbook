# Physical AI & Humanoid Robotics Textbook

[![Deploy to GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://itishakeem.github.io/physical-ai-humanoid-robotics-textbook/)
[![Built with Docusaurus](https://img.shields.io/badge/Built%20with-Docusaurus-green)](https://docusaurus.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive interactive textbook exploring **Physical Artificial Intelligence** and **Humanoid Robotics**, featuring an AI-powered chatbot for enhanced learning experiences.

## 🚀 Live Demo

**Visit the textbook:** [https://itishakeem.github.io/physical-ai-humanoid-robotics-textbook/](https://itishakeem.github.io/physical-ai-humanoid-robotics-textbook/)

## 📚 Overview

This project is an educational platform that bridges theoretical foundations and practical implementations in embodied intelligence systems. It combines a comprehensive Docusaurus-based textbook with an intelligent RAG (Retrieval-Augmented Generation) chatbot backend.

### Key Features

- **📖 Interactive Textbook** - 6 comprehensive chapters covering all aspects of physical AI and humanoid robotics
- **🤖 AI Chatbot Assistant** - RAG-powered chatbot using OpenAI and Qdrant vector database for intelligent Q&A
- **🎨 Rich Visualizations** - ASCII art, Mermaid diagrams, and interactive content
- **💡 Practical Examples** - Real-world implementations from Boston Dynamics, Tesla, and more
- **🔐 User Authentication** - Secure login/registration system with OTP verification
- **💬 Chat History** - Persistent conversation history for logged-in users
- **📱 Responsive Design** - Mobile-friendly interface with dark/light mode support

## 🏗️ Project Structure

```
physical-ai-humanoid-robotics-textbook/
├── my-book/                    # Frontend - Docusaurus application
│   ├── docs/                   # Textbook content (6 chapters)
│   ├── src/
│   │   ├── components/         # React components (ChatWidget, Auth forms)
│   │   ├── contexts/           # React contexts (AuthContext)
│   │   └── pages/              # Custom pages (About, Contact, Login)
│   ├── static/                 # Static assets
│   └── docusaurus.config.js    # Site configuration
│
├── backend/                    # Backend - FastAPI application
│   ├── main.py                 # FastAPI server with RAG implementation
│   ├── auth.py                 # JWT authentication logic
│   ├── auth_routes.py          # Authentication endpoints
│   ├── chat_history.py         # Chat persistence logic
│   ├── database.py             # PostgreSQL database setup
│   ├── embeddings.py           # Text embedding utilities
│   ├── email_service.py        # Email/OTP service
│   └── requirements.txt        # Python dependencies
│
└── README.md                   # This file
```

## 📖 Textbook Content

### Chapter Overview

1. **Fundamentals of Physical AI** - Embodied intelligence and perception-action loops
2. **Humanoid Design Principles** - Mechanical design and kinematics
3. **Sensors & Actuators** - Perception systems and actuation technologies
4. **Control Systems** - Control theory, dynamics, and whole-body control
5. **AI Integration** - Machine learning and autonomous decision-making
6. **Motion & Navigation** - Path planning, SLAM, and locomotion

Each chapter includes:
- Detailed summaries and key concepts
- Practical examples from industry leaders
- Mathematical formulations and algorithms
- Diagrams and visualizations

## 🛠️ Technology Stack

### Frontend
- **Docusaurus 3.9.2** - Modern static site generator
- **React 18** - UI component library
- **MDX** - Markdown with JSX support
- **Prism** - Syntax highlighting
- **Mermaid** - Diagram generation

### Backend
- **FastAPI** - Modern Python web framework
- **OpenAI API** - GPT-4 powered responses
- **Qdrant** - Vector database for semantic search
- **PostgreSQL** - User data and chat history storage
- **SQLAlchemy** - ORM for database operations
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0
- **Python** >= 3.8
- **PostgreSQL** database
- **Qdrant** vector database (cloud or local)
- **OpenAI API key**

### Frontend Setup

```bash
# Navigate to the frontend directory
cd my-book

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The site will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with the following variables:
# DATABASE_URL=postgresql://user:password@localhost/dbname
# QDRANT_URL=your_qdrant_url
# QDRANT_API_KEY=your_api_key
# OPENAI_API_KEY=your_openai_key
# JWT_SECRET=your_secret_key
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your_email
# SMTP_PASSWORD=your_password

# Set up database
python setup_db.py

# Upload documents to Qdrant (if needed)
python reupload.py

# Start the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
OPENAI_API_KEY=sk-your_openai_key
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

#### Frontend (src/config.js)
```javascript
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com'
  : 'http://localhost:8000';
```

## 🔑 Key Features Explained

### RAG Chatbot System

The chatbot uses a Retrieval-Augmented Generation (RAG) architecture:

1. **Document Embedding** - Textbook content is embedded using OpenAI embeddings
2. **Vector Storage** - Embeddings stored in Qdrant for fast semantic search
3. **Query Processing** - User questions are embedded and matched against the database
4. **Context Retrieval** - Relevant text chunks are retrieved based on similarity
5. **Response Generation** - GPT-4 generates answers using retrieved context

### Authentication System

- **Registration** - Email-based with OTP verification
- **Login** - JWT token-based authentication
- **Password Security** - Bcrypt hashing with salt
- **Session Management** - Secure token storage and refresh

### Chat History

- **Persistence** - All conversations saved to PostgreSQL
- **User Association** - Chat history linked to user accounts
- **Privacy** - Users can only access their own history

## 📝 API Endpoints

### Chat
- `POST /chat` - Send a message to the chatbot
- `GET /chat/history` - Get user's chat history (authenticated)

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

## 🎨 Customization

### Modify Textbook Content

Edit markdown files in `my-book/docs/` to update content.

### Customize Appearance

Edit `my-book/src/css/custom.css` to change colors, fonts, and layout.

### Configure Navigation

Edit `my-book/docusaurus.config.js` to modify navbar, footer, and site metadata.

## 🧪 Testing

### Test RAG System
```bash
cd backend
python test_rag.py
```

### Test Greeting Detection
```bash
cd backend
python test_greeting.py
```

### Test Chapter Queries
```bash
cd backend
python test_chapter_query.py
```

## 📦 Deployment

### Frontend (GitHub Pages)

```bash
cd my-book
npm run deploy
```

### Backend (Render/Railway/Heroku)

The backend is configured for deployment on cloud platforms:

1. Push code to GitHub
2. Connect repository to your hosting platform
3. Set environment variables
4. Deploy using `render.yaml` or platform-specific config

## 👨‍💻 Author

**Abdul Hakeem**
- Roboticist, AI Researcher, and Educator
- Specializing in humanoid robotics, control systems, and embodied AI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Docusaurus Team** - For the amazing documentation framework
- **OpenAI** - For GPT-4 API
- **Qdrant** - For vector database technology
- **Robotics Community** - For inspiring real-world examples

## 📞 Contact

For questions or feedback:
- **GitHub Issues**: [Report an issue](https://github.com/itishakeem/physical-ai-humanoid-robotics-textbook/issues)
- **Email**: Contact through the website's contact page

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ using Docusaurus and FastAPI**
