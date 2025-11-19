# OBJETIVOS DE MIGRACIÓN - PROYECTO EMA
## Migración a Ruby on Rails Full-Stack

**Fecha:** 13 de Noviembre, 2025
**Versión:** 1.0
**Decisión Tecnológica:** Ruby on Rails (Full-Stack)

---

## 🎯 DECISIONES ESTRATÉGICAS

### 1. Stack Tecnológico: Rails Full-Stack
**Decisión:** Usar Ruby on Rails para API, Web UI y Mobile (con wrapper)

**Descripción:**
- Backend API: Ruby on Rails 7.1+ (API mode)
- Frontend Web: Rails Views con Hotwire (Turbo + Stimulus)
- Mobile: Wrapper nativo (Turbo Native iOS/Android o alternativa)
- **Justificación:** Unificar todo bajo un solo framework y aprovechar la simplicidad de Rails

**Consideraciones:**
- ✅ Sintaxis simple y productiva
- ✅ Convención sobre configuración
- ⚠️ Requiere reescribir frontend Angular existente (~50,000 líneas)
- ⚠️ Equipo debe aprender Ruby (actualmente TypeScript)
- ⚠️ Wrapper mobile puede tener limitaciones vs Ionic nativo

**Alternativas evaluadas:**
- NestJS (recomendado en informe previo): TypeScript full-stack
- .NET 8: Mantener stack actual modernizado

---

### 2. Mobile: Wrapper para APK/IPA
**Decisión:** Generar apps móviles usando wrapper sobre Rails web

**Descripción:**
- Desarrollar UI web con Rails + Hotwire
- Wrapper nativo empaqueta la web en APK (Android) e IPA (iOS)
- Misma experiencia que app web pero como aplicación nativa

**Opciones de Wrapper:**
1. **Turbo Native** (recomendado por Rails)
   - Oficial de Basecamp (37signals)
   - Integración nativa con Hotwire
   - Swift (iOS) + Kotlin (Android)

2. **Capacitor** (alternativa)
   - Similar a Ionic pero solo como wrapper
   - Plugins nativos (cámara, GPS, etc.)

3. **Cordova** (legacy, no recomendado)

**Consideraciones:**
- ✅ Mantiene una sola codebase de UI
- ✅ Deploy simultáneo web + mobile
- ⚠️ **CRÍTICO:** Verificar funcionalidades offline actuales de Ionic
  - SQLite local
  - Sincronización bidireccional
  - GPS, Cámara, Bluetooth, QR Scanner
- ⚠️ Performance puede ser inferior a Ionic nativo
- ⚠️ Requiere código Swift/Kotlin adicional para Turbo Native

**Pendiente definir:**
- [ ] ¿Qué wrapper específico usar?
- [ ] ¿Cómo manejar modo offline actual de Ionic?
- [ ] ¿Plugins nativos necesarios están disponibles?

---

### 3. Consolidación: 3 Repos → 1 Monorepo
**Decisión:** Unificar todo en un solo repositorio

**Descripción:**
- **Antes:** 3 repos independientes
  - cl_cl_mlt_ema_api (.NET)
  - cl_cl_mlt_ema (Angular)
  - cl_cl_mlt_ema_mbl (Ionic)
- **Después:** 1 repo con estructura clara
  - /app/controllers → API + Web controllers
  - /app/views → Vistas Rails (web + mobile)
  - /mobile → Código wrapper (Turbo Native iOS/Android)

**Estructura propuesta:**
```
ema-rails/
├── app/
│   ├── controllers/      # API + Web controllers
│   ├── models/           # ActiveRecord models
│   ├── views/            # Rails views (Hotwire)
│   ├── javascript/       # Stimulus controllers
│   └── jobs/             # Background jobs (Sidekiq)
├── mobile/
│   ├── ios/              # Turbo Native iOS
│   └── android/          # Turbo Native Android
├── config/
│   ├── database.yml      # SQL Server + SAP HANA (ODBC)
│   └── environments/     # 32 configuraciones multi-tenant
├── spec/                 # Tests RSpec
├── Dockerfile
└── docker-compose.yml
```

**Beneficios:**
- ✅ 1 pipeline CI/CD vs 3
- ✅ Deploy coordinado automático
- ✅ Versionamiento unificado
- ✅ Código compartido entre componentes
- ✅ Búsqueda global de código

---

### 4. Deploy: Contenedor Único (Backend + Frontend)
**Decisión:** Un contenedor sirve API + UI web

**Descripción:**
- Rails sirve tanto API REST (`/api/*`) como HTML (`/`)
- Frontend web: Vistas Rails compiladas (Assets Pipeline)
- Mobile: Consume `/api/*` desde apps nativas (APK/IPA)

**Arquitectura de Deploy:**
```
┌─────────────────────────────────────┐
│   Docker Container (Puerto 3000)    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Rails Application           │ │
│  │                               │ │
│  │  Routes:                      │ │
│  │  - GET /           → Web UI   │ │
│  │  - GET /login      → Web UI   │ │
│  │  - POST /api/auth  → API JSON │ │
│  │  - GET /api/orders → API JSON │ │
│  └───────────────────────────────┘ │
│                                     │
│  Puma Server (App Server)          │
└─────────────────────────────────────┘
         ↓
    ┌─────────┐
    │ Clients │
    ├─────────┤
    │ Browser │ → GET /login
    │ iOS App │ → POST /api/auth
    │ Android │ → GET /api/orders
    └─────────┘
```

**Consideraciones:**
- ✅ Simplifica deployment (1 contenedor)
- ✅ Reduce costos de infraestructura
- ✅ Facilita configuración de red/CORS
- ⚠️ Si falla el contenedor, cae todo (web + API)
  - **Mitigación:** Múltiples réplicas con load balancer

---

### 5. API Única: Un Solo Backend
**Decisión:** Una sola API REST consumida por Web y Mobile

**Descripción:**
- API RESTful con Rails
- Mismo backend para:
  - Rails Views (server-side)
  - Mobile apps (JSON responses)
  - Posibles integraciones externas

**Formato de respuestas:**
```ruby
# Mismo controller sirve HTML y JSON
class OrdersController < ApplicationController
  def index
    @orders = Order.all

    respond_to do |format|
      format.html # Renderiza view para web
      format.json { render json: @orders } # JSON para mobile
    end
  end
end
```

**Beneficios:**
- ✅ Lógica de negocio centralizada
- ✅ Mantenimiento simplificado
- ✅ Versionamiento único
- ✅ Autenticación/autorización compartida

---

### 6. Infraestructura: IIS → Docker Containers
**Decisión:** Migrar de Windows Server + IIS a contenedores Docker

**Descripción:**
- **Antes:**
  - Windows Server
  - IIS hosting .NET Framework
  - Deploy manual o con scripts

- **Después:**
  - Linux containers (Docker)
  - Deploy automatizado (CI/CD)
  - Portable a cualquier cloud/on-premise

**Beneficios:**
- ✅ Portabilidad (funciona en cualquier lado)
- ✅ Escalabilidad horizontal (más réplicas fácilmente)
- ✅ Versionamiento de infraestructura (Dockerfile)
- ✅ Rollback rápido (versión anterior del contenedor)
- ✅ Costos reducidos (Linux vs Windows Server)

**Pendiente:**
- [ ] Definir orchestrator: Docker Compose (simple) vs Kubernetes (complejo)
- [ ] Plan de migración gradual (IIS paralelo durante transición)

---

### 7. Servicios Windows: Última Prioridad
**Decisión:** Migrar los servicios Windows al final

**Descripción:**
- **Servicios actuales:** Windows Services para sincronización con SAP
- **Migración posterior:** Sidekiq jobs en Rails
- **Razón:** No bloqueante para funcionalidad core

**Plan:**
1. **Fase 1-8:** Migrar API + Web + Mobile (funcionalidad completa)
2. **Fase 9:** Migrar Windows Services a Sidekiq
   - Sincronización con SAP
   - Tareas programadas
   - Procesamiento batch

**Consideraciones:**
- ✅ Permite avanzar rápido en funcionalidad visible
- ⚠️ Mientras tanto, mantener servicios Windows corriendo
- ⚠️ Definir cómo coordinar ambos sistemas durante transición

---

### 8. Estrategia: Migración Incremental por Funcionalidad
**Decisión:** Migrar funcionalidad por funcionalidad, validando cada una end-to-end

**Descripción:**
- **NO** migrar todo de golpe
- **SÍ** migrar por módulos funcionales completos
- Cada funcionalidad debe ser 100% funcional antes de continuar

**Ejemplo de iteración:**
```
Funcionalidad: Login/Autenticación
├── Backend (Rails)
│   ├── POST /api/auth/login
│   ├── POST /api/auth/logout
│   └── GET /api/auth/me
├── Frontend Web (Rails Views + Hotwire)
│   ├── GET /login (formulario)
│   └── Redirect a /dashboard
├── Mobile (Wrapper)
│   └── Pantalla login consumiendo /api/auth
└── Testing
    ├── Unit tests (RSpec)
    ├── Integration tests
    └── E2E tests (Capybara + mobile manual)

✅ TODO funcionando → Commit → Siguiente funcionalidad
```

**Orden propuesto de migración:**
1. **Login/Autenticación** (crítico, base de todo)
2. **Dashboard** (pantalla principal)
3. **BusinessPartners** (maestros básicos)
4. **Items** (productos)
5. **Orders** (pedidos)
6. **Invoices** (facturación - módulo complejo)
7. **Payments** (pagos)
8. **Routes** (rutas de vendedores)
9. **Offline Sync** (sincronización mobile)
10. **Background Jobs** (servicios Windows)

**Beneficios:**
- ✅ Validación continua (menos bugs acumulados)
- ✅ Progreso visible (demos frecuentes)
- ✅ Rollback granular (si algo falla, se revierte solo esa funcionalidad)
- ✅ Aprendizaje incremental de Rails

---

### 9. Documentación: Simple y Práctica
**Decisión:** Generar documentación fácil de leer y actualizar

**Descripción:**
- **Objetivo:** Que cualquier desarrollador se ponga al día en < 1 día
- **Formato:** Markdown en el repositorio
- **Actualización:** Al completar cada funcionalidad

**Documentos a crear:**
```
/docs
├── README.md                    # Overview del proyecto
├── SETUP.md                     # Instalación local en < 30 min
├── ARCHITECTURE.md              # Arquitectura general
├── API.md                       # Endpoints documentados
├── DEPLOYMENT.md                # Cómo hacer deploy
├── TESTING.md                   # Cómo correr tests
├── MOBILE.md                    # Setup del wrapper mobile
├── SAP_INTEGRATION.md           # Integración con SAP B1
├── MULTI_TENANT.md              # Configuración de ambientes
└── funcionalidades/
    ├── 01-login.md              # Cómo funciona login
    ├── 02-dashboard.md
    ├── 03-business-partners.md
    └── ...
```

**Características:**
- ✅ Ejemplos prácticos de código
- ✅ Diagramas simples (ASCII o Mermaid)
- ✅ Copy-paste ready (comandos ejecutables)
- ✅ Actualizada en cada PR
- ✅ Sin jerga innecesaria

---

### 10. Ambiente de Desarrollo: Mac + Claude + Windows Deploy
**Decisión:** Desarrollo en Mac, deploy en Windows Server

**Descripción:**
- **Mac (desarrollo):**
  - Ruby 3.3+ (rbenv o asdf)
  - Rails 7.1+
  - PostgreSQL local (desarrollo)
  - VS Code + Claude Code
  - Docker Desktop

- **Windows Server (staging/test):**
  - Docker instalado
  - Simula ambiente productivo
  - Deploy automático desde Git

**Workflow propuesto:**
```
Mac (Desarrollo)
  ├── Escribir código Rails
  ├── Tests locales (RSpec)
  ├── Commit → Git
  └── Push → GitHub

     ↓ CI/CD Pipeline

Windows Server (Staging)
  ├── Pull código
  ├── Build Docker image
  ├── Deploy contenedor
  └── Tests E2E

     ↓ Validación manual

Windows Server (Producción)
  └── Deploy contenedor aprobado
```

**Consideraciones:**
- ✅ Mac es excelente para desarrollo Rails
- ✅ Claude Code funciona perfecto en Mac
- ✅ Windows server simula ambiente real
- ⚠️ Docker en Windows puede ser más lento (WSL2)

---

### 11. SAP Testing: Instancia Local con Service Layer
**Decisión:** Provisionar SAP B1 trial en Windows para testing

**Descripción:**
- **Problema:** No se puede desarrollar/testear sin SAP
- **Solución:** Instalar SAP Business One trial + Service Layer en Windows

**Setup propuesto en Windows:**
```
Windows Server
├── SAP Business One Trial
│   ├── SAP HANA Database
│   └── Service Layer (REST API)
│       └── http://localhost:50000/b1s/v1/
├── SQL Server (base local app)
└── Docker (app Rails)
```

**Pasos:**
1. Instalar SAP B1 Trial (versión 10.0)
2. Configurar Service Layer
3. Crear datos de prueba (empresa demo)
4. Configurar ODBC connection desde Rails
5. Validar conectividad

**Consideraciones:**
- ✅ Permite desarrollo/testing sin depender de SAP productivo
- ✅ Service Layer es REST API (más fácil que DI API)
- ⚠️ SAP B1 solo corre en Windows
- ⚠️ Trial tiene limitaciones (datos, tiempo)
- ⚠️ Requiere licencia o versión de desarrollo

**Alternativa si no se consigue trial:**
- Mockear Service Layer con servidor JSON local
- Desarrollar contra SAP productivo en horarios específicos

---

## 🔍 PUNTOS ADICIONALES A CONSIDERAR

### 12. Testing Strategy
**Faltante:** Estrategia clara de testing

**Propuesta:**
- **Unit Tests:** RSpec para modelos y servicios
  - Cobertura mínima: 70%
  - Tests rápidos (< 5 min suite completa)

- **Integration Tests:** Request specs
  - Validar endpoints API
  - Autenticación/autorización

- **E2E Tests:** Capybara para web
  - Flujos críticos (login, crear pedido, etc.)
  - Solo casos happy path + errores críticos

- **Mobile Tests:** Manual inicialmente
  - Automatizar después con Appium (opcional)

**Herramientas:**
```ruby
# Gemfile
group :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'  # Fixtures
  gem 'faker'              # Datos fake
  gem 'capybara'           # E2E tests
  gem 'webmock'            # Mock HTTP requests
  gem 'database_cleaner'   # Limpiar DB entre tests
end
```

---

### 13. CI/CD Pipeline
**Faltante:** Pipeline de integración continua

**Propuesta:**
- **Trigger:** Push a `main` o `develop`
- **GitHub Actions** (gratis para repos privados):
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - Checkout código
        - Setup Ruby
        - Bundle install
        - Run RSpec tests
        - Run Rubocop (linter)

    deploy-staging:
      if: branch == 'develop'
      steps:
        - Build Docker image
        - Push to registry
        - Deploy to Windows staging
  ```

**Stages:**
1. **Build:** Instalar deps, compilar assets
2. **Test:** Correr test suite
3. **Lint:** RuboCop (estilo de código)
4. **Build Image:** Crear Docker image
5. **Deploy:** Push a staging/prod

---

### 14. Configuración Multi-Tenant
**Faltante:** Cómo manejar 32 ambientes/clientes

**Propuesta:**
- **Variables de entorno por cliente:**
  ```yaml
  # config/database.yml
  production:
    <<: *default
    host: <%= ENV['DB_HOST'] %>
    database: <%= ENV['DB_NAME'] %>
    username: <%= ENV['DB_USER'] %>
    password: <%= ENV['DB_PASSWORD'] %>

  # SAP Connection
  sap:
    service_layer_url: <%= ENV['SAP_SERVICE_LAYER_URL'] %>
    company_db: <%= ENV['SAP_COMPANY_DB'] %>
  ```

- **Despliegues separados por cliente:**
  ```
  cliente1.ema.com → Container 1 (ENV=cliente1)
  cliente2.ema.com → Container 2 (ENV=cliente2)
  ...
  ```

- **Alternativa:** Multi-tenancy por subdomain
  ```ruby
  # app/models/concerns/tenant_scoped.rb
  Apartment::Tenant.switch!(request.subdomain)
  ```

---

### 15. Migraciones de Base de Datos
**Faltante:** Estrategia de migraciones

**Propuesta:**
- **Rails migrations** para cambios de schema
- **Datos:** Migrar con scripts Ruby

**Proceso:**
```ruby
# db/migrate/20251113_create_users.rb
class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest
      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end

# Ejecutar: rails db:migrate
```

**Consideraciones:**
- ⚠️ SQL Server tiene particularidades
- ⚠️ SAP HANA es read-only (no migraciones)
- ✅ Migrations versionadas en Git

---

### 16. Secrets y Variables de Entorno
**Faltante:** Manejo seguro de credenciales

**Propuesta:**
- **Desarrollo:** `.env` local (git-ignored)
  ```bash
  # .env.development
  DATABASE_URL=sqlserver://localhost/ema_dev
  SAP_SERVICE_LAYER_URL=http://localhost:50000/b1s/v1/
  SAP_USERNAME=manager
  SAP_PASSWORD=xxxxx
  ```

- **Producción:** Encrypted credentials de Rails
  ```bash
  # Editar credenciales encriptadas
  EDITOR="code --wait" rails credentials:edit

  # config/credentials.yml.enc (encriptado)
  production:
    sap:
      username: manager
      password: secret123

  # Acceso en código:
  Rails.application.credentials.production[:sap][:username]
  ```

- **Alternativa:** Variables de entorno en Docker
  ```bash
  docker run -e SAP_PASSWORD=xxx ema-rails
  ```

---

### 17. Logs y Monitoreo
**Faltante:** Observabilidad del sistema

**Propuesta:**
- **Logs estructurados:**
  ```ruby
  # config/environments/production.rb
  config.log_formatter = ::Logger::Formatter.new
  config.lograge.enabled = true  # Logs en una línea
  ```

- **Niveles de log:**
  - INFO: Requests normales
  - WARN: Errores recuperables
  - ERROR: Errores críticos

- **Monitoreo (opcional pero recomendado):**
  - Sentry (errores)
  - New Relic (performance)
  - Datadog (infraestructura)

---

### 18. Plan de Rollback
**Faltante:** Qué hacer si algo sale mal

**Propuesta:**
- **Durante migración:** Mantener .NET API funcionando en paralelo
  ```
  Semanas 1-8: Desarrollo Rails (no afecta prod)
  Semana 9: Deploy Rails a staging (prod sigue en .NET)
  Semana 10: Cliente piloto usa Rails (prod mayormente en .NET)
  Semana 11: 50% de clientes a Rails
  Semana 12: 100% a Rails → Apagar .NET
  ```

- **Rollback rápido:**
  ```bash
  # Volver a versión anterior del contenedor
  docker-compose down
  docker-compose up -d --scale app=3 app:v1.2.3
  ```

- **Plan B:**
  - Si Rails falla críticamente → Volver a .NET temporalmente
  - Requiere mantener .NET funcionando 1-2 meses post-migración

---

### 19. Capacitación del Equipo en Rails
**Faltante:** Plan de aprendizaje

**Propuesta:**
- **Semana -2 (pre-proyecto):**
  - [ ] Curso Ruby básico (8 horas) → Ruby Koans, Codecademy
  - [ ] Rails tutorial (8 horas) → Rails Guides, Michael Hartl Tutorial
  - [ ] Hotwire/Turbo (4 horas) → Hotwire.dev docs

- **Durante proyecto:**
  - Pair programming (senior + junior)
  - Code reviews obligatorios
  - Sesiones de Q&A semanales

- **Recursos:**
  - Ruby on Rails Guides: https://guides.rubyonrails.org/
  - Hotwire: https://hotwire.dev/
  - RSpec: https://rspec.info/

---

### 20. Dependencias SAP Críticas
**Faltante:** Mapeo de integraciones SAP actuales

**Propuesta:**
- **Inventariar:**
  - [ ] Listar todas las operaciones SAP usadas
  - [ ] Endpoints Service Layer necesarios
  - [ ] Campos específicos de SAP requeridos
  - [ ] Sincronización: ¿cada cuánto? ¿qué datos?

- **Ejemplo de mapeo:**
  ```markdown
  # Integración SAP - BusinessPartners

  .NET actual:
  - DI API: Company.GetBusinessObject(oBusinessPartners)

  Rails (Service Layer):
  - GET /b1s/v1/BusinessPartners
  - POST /b1s/v1/BusinessPartners
  - PATCH /b1s/v1/BusinessPartners('C00001')

  Campos críticos:
  - CardCode (ID cliente)
  - CardName (Nombre)
  - FederalTaxID (RUT)
  - ...
  ```

---

## 📋 CHECKLIST DE PREPARACIÓN

### Antes de Comenzar Desarrollo

#### Ambiente Mac (Desarrollo)
- [ ] Instalar Ruby 3.3+ (rbenv o asdf)
- [ ] Instalar Rails 7.1+
- [ ] Instalar PostgreSQL (desarrollo local)
- [ ] Instalar Docker Desktop
- [ ] Configurar VS Code + extensiones Rails
- [ ] Clonar repositorio inicial (vacío)
- [ ] Generar app Rails: `rails new ema-rails`

#### Ambiente Windows (Deploy/Testing)
- [ ] Instalar Docker Desktop o Docker en WSL2
- [ ] Instalar SAP B1 Trial (si se consigue)
- [ ] Configurar SAP Service Layer
- [ ] Instalar SQL Server (o usar SQL Express)
- [ ] Crear base de datos de prueba
- [ ] Validar conectividad SAP desde Windows
- [ ] Configurar acceso Git (clone repo)

#### Análisis de Código Actual
- [ ] Leer y entender código .NET API (controladores)
- [ ] Identificar modelos de Entity Framework
- [ ] Mapear 103 endpoints API
- [ ] Analizar lógica de negocio compleja
- [ ] Identificar servicios Windows (qué hacen)
- [ ] Revisar Angular: ¿qué componentes son más críticos?
- [ ] Revisar Ionic: ¿qué funcionalidades offline?

#### Definiciones Pendientes
- [ ] **Wrapper mobile:** ¿Turbo Native o Capacitor?
- [ ] **Orchestration:** ¿Docker Compose o Kubernetes?
- [ ] **CI/CD:** ¿GitHub Actions, GitLab CI, Jenkins?
- [ ] **Monitoreo:** ¿Sentry? ¿New Relic? ¿Self-hosted?
- [ ] **Multi-tenant:** ¿Contenedores separados o Apartment gem?

---

## 🚦 PRÓXIMOS PASOS INMEDIATOS

### Semana 1: Setup y Validación Técnica

**Día 1-2: Ambiente de desarrollo**
1. Configurar Mac con Ruby/Rails
2. Crear repositorio Git
3. Generar Rails app inicial
4. Primer commit: "Initial Rails setup"

**Día 3-4: Conexión a bases de datos**
1. Configurar SQL Server (local o remoto)
2. Crear modelos básicos (User, Company)
3. Validar migraciones
4. Seeds con datos de prueba

**Día 5-7: Validación SAP**
1. Configurar SAP Service Layer (Windows)
2. Crear servicio Ruby para conectar Service Layer
3. Hacer 1 request de prueba (GET BusinessPartners)
4. Validar conectividad y respuesta
5. **GO/NO-GO:** Si no funciona, replantear estrategia

**Entregable Semana 1:**
- ✅ Rails app corriendo en Mac
- ✅ Conectado a SQL Server
- ✅ Conectado a SAP Service Layer
- ✅ 1 endpoint funcional: `GET /api/health` (health check)

---

### Semana 2: Primera Funcionalidad (Login)

**Backend:**
- [ ] Modelo User + Authentication (Devise o custom)
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me
- [ ] Tests RSpec

**Frontend Web:**
- [ ] Vista login (Rails view)
- [ ] Formulario con Hotwire/Turbo
- [ ] Redirect a dashboard
- [ ] Manejo de errores

**Mobile:**
- [ ] Setup wrapper básico (Turbo Native o Capacitor)
- [ ] Pantalla login consumiendo API
- [ ] Validación funcional en iOS o Android

**Entregable Semana 2:**
- ✅ Login funcional en web
- ✅ Login funcional en mobile
- ✅ Tests pasando
- ✅ Documentación de login en /docs

---

## 🎯 RESUMEN DE DECISIONES CLAVE

| # | Decisión | Impacto | Riesgo |
|---|----------|---------|--------|
| 1 | Rails Full-Stack | Alto - Reescribir frontend | Medio |
| 2 | Wrapper mobile | Alto - Validar funcionalidades offline | Alto |
| 3 | Monorepo | Alto - Simplifica mucho | Bajo |
| 4 | Contenedor único | Medio - Simplifica deploy | Bajo |
| 5 | API única | Medio - Centraliza lógica | Bajo |
| 6 | Docker vs IIS | Alto - Moderniza infra | Medio |
| 7 | Servicios Windows última prioridad | Bajo - No bloquea | Bajo |
| 8 | Migración incremental | Crítico - Reduce riesgo | Bajo |
| 9 | Documentación continua | Alto - Facilita onboarding | Bajo |
| 10 | Mac + Windows | Bajo - Setup estándar | Bajo |
| 11 | SAP local | Alto - Necesario para desarrollo | Alto |

---

## ⚠️ RIESGOS PRINCIPALES

### 🔴 Riesgo ALTO

**1. Wrapper mobile no soporta funcionalidades offline actuales**
- **Impacto:** Ionic actual tiene SQLite + sync complejo
- **Mitigación:**
  - Validar Turbo Native + CoreData (iOS) / Room (Android)
  - Si no funciona, mantener Ionic consumiendo Rails API

**2. SAP B1 Trial no se consigue o no tiene Service Layer**
- **Impacto:** No se puede desarrollar sin conexión SAP
- **Mitigación:**
  - Negociar licencia de desarrollo con SAP partner
  - Mockear Service Layer con JSON server temporal
  - Usar SAP productivo en horarios controlados

**3. Equipo no se adapta a Ruby en tiempos estimados**
- **Impacto:** Proyecto se extiende significativamente
- **Mitigación:**
  - Capacitación intensiva previa
  - Pair programming constante
  - Claude Code asistiendo 100% del tiempo

### 🟡 Riesgo MEDIO

**4. Reescribir frontend Angular introduce bugs**
- **Impacto:** 50,000 líneas a reescribir, bugs inevitables
- **Mitigación:**
  - Testing exhaustivo de cada funcionalidad
  - Cliente piloto antes de producción
  - Rollback plan preparado

**5. Performance de Rails no es suficiente**
- **Impacto:** Lentitud en operaciones SAP pesadas
- **Mitigación:**
  - Caching agresivo (Redis)
  - Background jobs (Sidekiq)
  - Optimización de queries N+1

---

## 🤔 PREGUNTAS ABIERTAS

### Técnicas
1. **Wrapper mobile:** ¿Turbo Native o Capacitor? → Definir Semana 1
2. **Multi-tenant:** ¿Contenedores separados o Apartment gem? → Definir Semana 2
3. **Autenticación:** ¿Devise, Rodauth, o custom JWT? → Definir Semana 1
4. **Frontend framework:** ¿Hotwire puro o permitir Vue/React en componentes? → Definir Semana 2

### Operacionales
5. **CI/CD:** ¿Qué herramienta usar? → Propongo GitHub Actions
6. **Hosting producción:** ¿Cloud (AWS/Azure) u on-premise? → Definir con cliente
7. **Base de datos:** ¿SQL Server obligatorio o podemos usar PostgreSQL? → Validar con SAP

### Negocio
8. **Timeline:** ¿23 semanas es aceptable? → Confirmar con stakeholders
9. **Cliente piloto:** ¿Cuál cliente usamos para validación? → Definir
10. **Budget:** ¿Hay presupuesto para licencias (SAP dev, herramientas)? → Confirmar

---

## 📝 NOTAS FINALES

### Decisión Rails vs NestJS
El informe técnico previo recomendaba **NestJS** por:
- 1 solo lenguaje (TypeScript) vs 2 con Rails (Ruby + TS mobile)
- Equipo ya conoce TypeScript
- Tiempo de migración: 8 sem (NestJS) vs 23 sem (Rails Full-Stack)

**Ustedes decidieron Rails por:**
- Simplicidad de Ruby
- Convención sobre configuración
- ¿Otros factores?

**Recomendación:** Validar en Semana 1 si Turbo Native puede reemplazar Ionic. Si NO:
- **Plan B:** Rails API + mantener Ionic mobile (2 lenguajes pero menos riesgo)

### Working con Claude Code
- Iré generando el código Rails paso a paso
- Testing exhaustivo de cada funcionalidad
- Documentación actualizada en cada commit
- Revisión de código para asegurar buenas prácticas Rails

---

**¿Listos para comenzar?** 🚀

**Siguiente paso:**
1. Revisar este documento y aprobar/ajustar
2. Setup ambiente Mac (Ruby/Rails)
3. Crear repositorio Git
4. Generar Rails app inicial
5. Primera funcionalidad: Health Check endpoint
