# Pastelion - Professional Code Sharing Platform 🛡️

Pastelion is a high-performance, premium-designed web application for sharing encrypted code and text. Built with a focus on security, aesthetics, and user experience, it demonstrates a robust implementation of modern web technologies and advanced cryptographic patterns.

---

## 🎨 Premium Features
- **Modern UI/UX**: Crafted with a sleek, dark-themed interface using Tailwind CSS and Framer Motion for smooth transitions.
- **Dynamic Theming**: Support for both Dark and Light modes with seamless synchronization with system preferences.
- **Monaco Editor Integration**: Provides a native IDE experience with syntax highlighting for dozens of languages.
- **Custom URL System**: Generates short, efficient 7-character URLs (Base58) with a random, scalable collision-retry mechanism.
- **Live Editing**: Securely edit and save changes to existing pastes if you have the correct password.

---

## 🔐 Advanced Security & Cryptography

Pastelion implements a multi-layered security model to ensure that even if the database is compromised, the content remains unreadable.

### 1. Envelope Encryption Logic
We use a pattern called **Envelope Encryption**. Instead of encrypting content with a single global key, we follow this process:

1. **Symmetric Data Key**: For every paste created, a unique 256-bit symmetric key is generated using cryptographic entropy.
2. **Content Encryption**: The actual text content is encrypted using `AES-256-GCM` with this unique symmetric key.
3. **Key Wrapping**: The symmetric key itself is then encrypted using a **`MASTER_KEY`**.
4. **Storage**: We store the encrypted content and the *encrypted* symmetric key in the database.

### 2. What is the `MASTER_KEY`?
The `MASTER_KEY` is a critical piece of infrastructure. It is a 32-byte secret stored exclusively in the server's environment variables (`.env`). 
- **Security**: The database *never* sees the `MASTER_KEY`.
- **Isolation**: Even if an attacker gains full access to your PostgreSQL database, they cannot decrypt any pastes because they lack the `MASTER_KEY` required to "unwrap" the symmetric keys.

### 3. Password Protection
When a paste is protected by a password:
- The password is never stored. We store a high-entropy hash generated using **scrypt**.
- Decryption is only attempted if the provided password matches the stored hash.

### 4. Zero Persistence (Burn After Reading)
Records are permanently erased from the database the moment they are successfully decrypted and viewed once, leaving no digital footprint.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **Cryptographic Engine**: Node.js `crypto` module (AES-256-GCM)
- **Storage Scheduling**: `pg_cron` for automatic expiration of data.
- **Animations**: Framer Motion

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/datevid/pastelion.git
   cd pastelion/code
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the `code/` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   MASTER_KEY=your_32_byte_secret_hex
   # Optional: Service role key for server-side management
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Hire me / Contrátame

Este proyecto ha sido implementado con mucho cariño por **David León Vilca**, Ingeniero de Sistemas y Desarrollador Web.

### 🤝 Asesoría y Consultoría Profesional
Si necesitas ayuda para:
- Instalar y configurar este proyecto en producción.
- Revisar el código o la arquitectura de tus propios proyectos.
- Implementar sistemas de seguridad y cifrado en Next.js.
- Mentoría técnica de 1 hora (Asistencia en vivo y grabada).

Puedes contactarme directamente en **LinkedIn** para agendar una sesión privada:
👉 [LinkedIn: David León Vilca](https://www.linkedin.com/in/datevid/)

---

## 📄 License
This project is licensed under the MIT License - feel free to use it for your own learning and development!
