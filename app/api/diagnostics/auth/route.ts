import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar que las opciones de auth estén configuradas
    if (!authOptions.secret) {
      throw new Error("NEXTAUTH_SECRET no configurado")
    }

    if (!authOptions.providers || authOptions.providers.length === 0) {
      throw new Error("No hay proveedores de autenticación configurados")
    }

    return NextResponse.json({
      success: true,
      message: "Sistema de autenticación configurado correctamente",
    })
  } catch (error) {
    console.error("Auth diagnostic error:", error)

    return NextResponse.json({
      success: false,
      message: "Error en configuración de autenticación",
      details: error.message,
    })
  }
}
