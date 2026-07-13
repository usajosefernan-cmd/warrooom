# AI War Room

**Laboratorio de ideas, debate IA y conclusiones vivas.**

AI War Room es una plataforma interactiva de debate estratégico. Su objetivo es evitar que las ideas, decisiones y roadmaps se diluyan en el historial de un chat de IA tradicional, consolidando las conclusiones en documentos Markdown estructurados, decisiones lógicas de arquitectura (ADRs), hipótesis con evidencias de mercado y un backlog de tareas técnicas para el desarrollo.

---

## 🚀 Características Principales

1. **Rondas de Debate Multidisciplinario**: Al ingresar una idea o dilema estratégico, un comité de 10 agentes especializados entra en debate:
   - **Orquestador**: Sintetiza y modera las conclusiones de forma ejecutiva.
   - **Defensor**: Identifica por qué la idea sí puede funcionar y su valor percibido.
   - **Crítico**: Busca costes ocultos, fallos lógicos y cuellos de botella de adopción.
   - **Investigador**: Clasifica hechos vs opiniones y busca evidencias empíricas.
   - **Arquitecto Técnico**: Diseña el stack de tecnología, integraciones y bases de datos.
   - **Product Manager**: Delimita el MVP y propone fases lógicas.
   - **Growth Hacker**: Planea canales de distribución, monetización y viralidad.
   - **Legal & Ético**: Evalúa privacidad (RGPD), sesgos de IA y compliance.
   - **Redactor**: Estructura los documentos Markdown y los mantiene legibles.
   - **Implementador**: Genera prompts listos para Codex, Claude Code, Antigravity o Hermes.
2. **Documentación Viva**: Con cada debate, el orquestador actualiza de forma incremental los documentos del proyecto (`conclusiones_vivas.md`, `hipotesis.md`, `decisiones.md`, `riesgos.md`, `tareas_tecnicas.md`, `changelog.md`).
3. **Quality Gate Integrado**: Audita la consistencia del debate (evalúa contradicciones, ausencia de evidencias y mezcla de opiniones).
4. **Router de IA Inteligente**: Prioriza el uso de modelos gratuitos o de bajo coste mediante OpenRouter, con fallbacks automáticos a Anthropic y un Mock Provider funcional inteligente en desarrollo local.
5. **Auditoría de Transacciones**: Panel de administración para vigilar latencias, consumos de tokens y costes estimados.
6. **Exportación Completa**: Permite descargar un ZIP estructurado con todos los documentos en Markdown, debates históricos y estado JSON consolidado.

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v3.
- **Backend**: API Routes y Server Actions en Node.js.
- **Base de Datos**: Storage local transaccional basado en archivos JSON (`src/storage/db.json`), preparado para migración a Supabase/PostgreSQL.
- **Styling**: Estilo premium oscuro tipo Linear/Notion con efectos de glassmorphism y micro-animaciones fluidas.

---

## 📦 Instalación y Configuración Local

1. **Clonar e instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Copia el archivo de ejemplo y rellena las claves necesarias:
   ```bash
   cp .env.local.example .env.local
   ```
   *Nota: Las claves se cargan en el servidor backend de Next.js, por lo que nunca se exponen al navegador.*

3. **Ejecutar Tests Unitarios**:
   ```bash
   npm run test
   ```

4. **Ejecutar Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛡️ Seguridad de las Claves de API

- **Sin Variables Públicas**: Nunca uses el prefijo `NEXT_PUBLIC_` para variables que contengan claves de APIs privadas.
- **Procesamiento Server-Side**: Todas las llamadas a las APIs de OpenRouter, Anthropic o Gemini se resuelven en las rutas del servidor (backend) en `src/app/api/ai/debate/route.ts` y `src/lib/ai-router.ts`.
- **Exclusión en Git**: Los archivos `.env` y `.env.local` están declarados en `.gitignore` para evitar cualquier subida accidental de secretos al control de código.

---

## 📤 Exportación y Formato del ZIP

La descarga en formato ZIP genera la siguiente estructura de archivos:

```text
/nombre-del-proyecto
  /docs
    vision.md
    hipotesis.md
    decisiones.md
    conclusiones_vivas.md
    fuentes.md
    riesgos.md
    roadmap.md
    tareas_tecnicas.md
    prompts_para_codex.md
    changelog.md
  /debates
    debate-001.md
    debate-002.md
  project.json
```

---

## ☁️ Despliegue en Vercel y Firebase

### Despliegue en Vercel (Recomendado)
Vercel soporta nativamente las API Routes y Serverless Functions de Next.js.
1. Instala el CLI de Vercel o vincula tu repositorio de GitHub en el panel de Vercel.
2. Añade las variables de entorno necesarias (`OPENROUTER_API_KEY`, etc.) en la configuración del proyecto en Vercel.
3. Ejecuta `vercel deploy` o haz push a tu rama principal.

### Despliegue en Firebase
*Nota: Dado que Firebase Hosting solo sirve archivos estáticos por defecto, para ejecutar AI War Room con su servidor backend Next.js en Firebase, debes configurar Firebase Functions para procesar las peticiones dinámicas.*
1. Inicializa Firebase en tu proyecto:
   ```bash
   firebase init
   ```
2. Selecciona **Hosting** y **Functions** (con soporte para Node.js).
3. Configura el re-direccionamiento en tu `firebase.json` para que todas las peticiones apunten a la Cloud Function que envuelve la app de Next.js.
