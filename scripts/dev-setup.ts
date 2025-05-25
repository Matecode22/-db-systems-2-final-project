#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import path from "path"

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkEnvironment() {
  log("🔍 Verificando entorno de desarrollo...", colors.cyan)

  // Verificar Node.js
  try {
    const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim()
    log(`✅ Node.js: ${nodeVersion}`, colors.green)
  } catch {
    log("❌ Node.js no encontrado", colors.red)
    process.exit(1)
  }

  // Verificar npm
  try {
    const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim()
    log(`✅ npm: ${npmVersion}`, colors.green)
  } catch {
    log("❌ npm no encontrado", colors.red)
    process.exit(1)
  }
}

function checkEnvFile() {
  log("\n📋 Verificando variables de entorno...", colors.cyan)

  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) {
    log("❌ Archivo .env.local no encontrado", colors.red)
    log("💡 Creando archivo .env.local de ejemplo...", colors.yellow)

    const envContent = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dtrtcwajkyhekeawdnnn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cnRjd2Fqa3loZWtlYXdkbm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MDc0MzEsImV4cCI6MjA2MzE4MzQzMX0.nQdq87kKN9z7usNrsQdiRuoZ71qlNY6OhanyvvcrcO8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0cnRjd2Fqa3loZWtlYXdkbm5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzYwNzQzMSwiZXhwIjoyMDYzMTgzNDMxfQ.wyXm1vCZp15wUZ0WOjkuOEjnJjEo0jmDHokj3oGvLnY

# MongoDB
MONGODB_URI=mongodb+srv://traqueto:sp5pZhKPf9CtSiWI@trackademicc.qamp8w4.mongodb.net/?retryWrites=true&w=majority&appName=trackademicc

# NextAuth
NEXTAUTH_SECRET=trackademic-secret-key-for-development-2024
NEXTAUTH_URL=http://localhost:3000

# Email (opcional)
EMAIL_FROM=noreply@trackademic.com`

    fs.writeFileSync(envPath, envContent)
    log("✅ Archivo .env.local creado", colors.green)
  } else {
    log("✅ Archivo .env.local encontrado", colors.green)
  }
}

function installDependencies() {
  log("\n📦 Instalando dependencias...", colors.cyan)

  try {
    execSync("npm install", { stdio: "inherit" })
    log("✅ Dependencias instaladas correctamente", colors.green)
  } catch (error) {
    log("❌ Error instalando dependencias", colors.red)
    console.error(error)
    process.exit(1)
  }
}

function showInstructions() {
  log("\n🎉 ¡Configuración completada!", colors.green)
  log("\n📋 Próximos pasos:", colors.bright)
  log("1. Ejecuta: npm run dev", colors.cyan)
  log("2. Abre: http://localhost:3000", colors.cyan)
  log("3. Ve a: http://localhost:3000/admin para poblar la BD", colors.cyan)
  log("4. Inicia sesión con: juan.perez@estudiante.edu.co / 123456", colors.cyan)

  log("\n🔧 Comandos útiles:", colors.bright)
  log("• npm run dev     - Ejecutar en desarrollo", colors.yellow)
  log("• npm run build   - Construir para producción", colors.yellow)
  log("• npm run seed    - Poblar base de datos", colors.yellow)

  log("\n📚 Documentación:", colors.bright)
  log("• README.md - Guía completa del proyecto", colors.magenta)
  log("• /admin - Panel de administración", colors.magenta)
}

// Ejecutar configuración
async function main() {
  log("🚀 Configurando Trackademic para desarrollo local", colors.bright)

  checkEnvironment()
  checkEnvFile()
  installDependencies()
  showInstructions()
}

main().catch((error) => {
  log("❌ Error durante la configuración:", colors.red)
  console.error(error)
  process.exit(1)
})
