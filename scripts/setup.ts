import { execSync } from "child_process"
import fs from "fs"
import path from "path"

console.log("🚀 Configurando Trackademic...")

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.log("⚠️  Archivo .env.local no encontrado")
  console.log("📝 Creando archivo .env.local de ejemplo...")

  const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dtrtcwajkyhekeawdnnn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cnRjd2Fqa3loZWtlYXdkbm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MDc0MzEsImV4cCI6MjA2MzE4MzQzMX0.nQdq87kKN9z7usNrsQdiRuoZ71qlNY6OhanyvvcrcO8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cnRjd2Fqa3loZWtlYXdkbm5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzYwNzQzMSwiZXhwIjoyMDYzMTgzNDMxfQ.wyXm1vCZp15wUZ0WOjkuOEjnJjEo0jmDHokj3oGvLnY

# MongoDB
MONGODB_URI=mongodb+srv://traqueto:sp5pZhKPf9CtSiWI@trackademicc.qamp8w4.mongodb.net/?retryWrites=true&w=majority&appName=trackademicc

# NextAuth
NEXTAUTH_SECRET=tu-clave-secreta-muy-segura-para-desarrollo-local-123456789
NEXTAUTH_URL=http://localhost:3000

# Email (opcional)
EMAIL_FROM=noreply@trackademic.com`

  fs.writeFileSync(envPath, envExample)
  console.log("✅ Archivo .env.local creado")
}

console.log("📦 Instalando dependencias...")
try {
  execSync("npm install", { stdio: "inherit" })
  console.log("✅ Dependencias instaladas")
} catch (error) {
  console.error("❌ Error instalando dependencias:", error)
  process.exit(1)
}

console.log("\n🎉 ¡Configuración completada!")
console.log("\n📋 Próximos pasos:")
console.log("1. Ejecuta: npm run dev")
console.log("2. Abre: http://localhost:3000")
console.log("3. Ve a: http://localhost:3000/admin para poblar la BD")
console.log("4. Usa: juan.perez@estudiante.edu.co / 123456 para probar")
