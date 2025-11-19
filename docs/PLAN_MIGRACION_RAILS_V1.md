# PLAN DE MIGRACIÓN V1 - EMA
## Rails 8.1 Full-Stack: Backend + Web + Mobile Online

**Fecha:** 13 de Noviembre, 2025
**Versión:** 1.0
**Stack:** Ruby 3.3.6 + Rails 8.1.1
**Timeline:** 10-12 semanas (2.5-3 meses)

---

## 🎯 ALCANCE V1: SISTEMA COMPLETO

### ✅ Lo que SÍ incluye:
- ✅ **Backend Rails API** (103 endpoints)
- ✅ **Frontend Web** (Rails Views + Hotwire)
- ✅ **Mobile Apps** (iOS + Android con Capacitor)
- ✅ **Mobile online** (consume API en tiempo real)
- ✅ Integración SAP Service Layer
- ✅ Background jobs (Solid Queue de Rails 8)
- ✅ Deploy Docker containerizado
- ✅ Multi-tenant (32 ambientes)
- ✅ Tests >70% cobertura

### ❌ Lo que NO incluye V1 (V2 opcional):
- ❌ Modo offline mobile
- ❌ SQLite local en apps
- ❌ Sincronización bidireccional offline

### 💡 Filosofía V1:
**"Sistema completo funcionando online. Offline solo si realmente se necesita."**

---

## 🚀 STACK TECNOLÓGICO

### Backend
```ruby
Ruby 3.3.6
Rails 8.1.1
PostgreSQL 16 (desarrollo)
SQL Server (producción)
SAP HANA (via ODBC)
```

### Frontend Web
```ruby
Rails Views (ERB)
Hotwire (Turbo + Stimulus)
Tailwind CSS
Importmap (sin Node.js en producción)
```

### Mobile
```javascript
Capacitor 6.x
iOS (Swift wrapper)
Android (Kotlin wrapper)
Plugins: Camera, Geolocation, Network
```

### Deploy
```yaml
Docker + Docker Compose
Kamal 2 (Rails 8 built-in)
Windows Server (staging/prod)
GitHub Actions (CI/CD)
```

### Nuevas features de Rails 8:
- ✅ **Solid Queue** (reemplazo de Sidekiq, incluido)
- ✅ **Solid Cache** (caché integrado)
- ✅ **Kamal 2** (deploy simplificado)
- ✅ **Authentication generator** (login built-in)
- ✅ **Improved assets** (Propshaft)

---

## 📅 CRONOGRAMA: 10-12 SEMANAS

```
┌─────────────────────────────────────────────────┐
│  FASE 1: Setup + Backend (Semanas 1-4)         │
│  - Setup Rails 8.1                              │
│  - Modelos y API completa                       │
│  - Integración SAP                              │
│  - Background jobs (Solid Queue)                │
├─────────────────────────────────────────────────┤
│  FASE 2: Frontend Web (Semanas 5-8)            │
│  - Layout + Dashboard                           │
│  - Maestros (Clientes, Productos)               │
│  - Pedidos + Facturación                        │
│  - Reportes                                     │
├─────────────────────────────────────────────────┤
│  FASE 3: Mobile (Semanas 9-10)                 │
│  - Setup Capacitor                              │
│  - Build iOS + Android                          │
│  - Testing dispositivos                         │
├─────────────────────────────────────────────────┤
│  FASE 4: Deploy (Semanas 11-12)                │
│  - Testing exhaustivo                           │
│  - Docker + Kamal deploy                        │
│  - Cliente piloto                               │
└─────────────────────────────────────────────────┘

TOTAL: 10-12 semanas
```

---

## 🗓️ PLAN SEMANAL DETALLADO

### **SEMANA 1: Setup Rails 8.1 + Validación SAP**

#### **Objetivos:**
- ✅ Ambiente Mac configurado
- ✅ Rails 8.1 funcionando
- ✅ Conexión DB validada
- ✅ SAP Service Layer conectado

#### **Día 1-2: Setup Mac**

```bash
# 1. Instalar rbenv (gestor de versiones Ruby)
brew install rbenv ruby-build

# 2. Instalar Ruby 3.3.6
rbenv install 3.3.6
rbenv global 3.3.6

# Verificar
ruby -v  # => ruby 3.3.6

# 3. Instalar Rails 8.1.1
gem install rails -v 8.1.1

# Verificar
rails -v  # => Rails 8.1.1

# 4. PostgreSQL (desarrollo local)
brew install postgresql@16
brew services start postgresql

# 5. Docker Desktop
# Descargar: https://www.docker.com/products/docker-desktop
```

#### **Día 3: Crear app Rails 8.1**

```bash
# Crear aplicación
rails new ema-rails \
  --database=postgresql \
  --css=tailwind \
  --skip-test \
  --skip-jbuilder

cd ema-rails

# Rails 8.1 usa Solid Queue por defecto (no necesitas Sidekiq)
# Rails 8.1 usa Propshaft para assets

# Instalar dependencias
bundle install

# Crear base de datos
rails db:create

# Inicializar Git
git init
git add .
git commit -m "Initial Rails 8.1 setup"
```

**Estructura inicial:**
```
ema-rails/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── jobs/          # Solid Queue jobs
│   └── javascript/    # Stimulus controllers
├── config/
│   ├── database.yml
│   └── routes.rb
├── db/
├── Gemfile
└── Dockerfile
```

#### **Día 4: Configurar SQL Server + SAP**

```ruby
# Gemfile
gem 'tiny_tds'
gem 'activerecord-sqlserver-adapter'
gem 'httparty'  # Para SAP Service Layer

bundle install
```

```yaml
# config/database.yml
production:
  adapter: sqlserver
  host: <%= ENV['DB_HOST'] %>
  database: <%= ENV['DB_NAME'] %>
  username: <%= ENV['DB_USER'] %>
  password: <%= ENV['DB_PASSWORD'] %>
```

```ruby
# app/services/sap_service.rb
class SapService
  include HTTParty
  base_uri ENV['SAP_SERVICE_LAYER_URL']

  def initialize
    @session = login
  end

  def login
    response = self.class.post('/Login', {
      body: {
        CompanyDB: ENV['SAP_COMPANY_DB'],
        UserName: ENV['SAP_USERNAME'],
        Password: ENV['SAP_PASSWORD']
      }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    })

    response.headers['set-cookie']
  end

  def get_business_partners
    self.class.get('/BusinessPartners',
      headers: { 'Cookie' => @session }
    )
  end

  def create_order(order_data)
    self.class.post('/Orders',
      body: order_data.to_json,
      headers: {
        'Cookie' => @session,
        'Content-Type' => 'application/json'
      }
    )
  end
end
```

#### **Día 5: Validación SAP (GO/NO-GO)**

```ruby
# Probar en Rails console
rails c

> sap = SapService.new
> response = sap.get_business_partners
> puts response.parsed_response

# Si responde JSON con clientes de SAP → ✅ GO
# Si da error → ⚠️ Resolver antes de continuar
```

```ruby
# Health check endpoint
# app/controllers/api/health_controller.rb
class Api::HealthController < ApplicationController
  def index
    db_status = ActiveRecord::Base.connection.active?

    sap_status = begin
      SapService.new.get_business_partners.code == 200
    rescue
      false
    end

    render json: {
      status: 'ok',
      database: db_status ? 'connected' : 'error',
      sap: sap_status ? 'connected' : 'error',
      rails_version: Rails.version,
      ruby_version: RUBY_VERSION,
      timestamp: Time.current
    }
  end
end

# config/routes.rb
namespace :api do
  get 'health', to: 'health#index'
end
```

**Test:**
```bash
rails s
curl http://localhost:3000/api/health

# Respuesta esperada:
{
  "status": "ok",
  "database": "connected",
  "sap": "connected",
  "rails_version": "8.1.1",
  "ruby_version": "3.3.6",
  "timestamp": "2025-11-13T10:00:00Z"
}
```

#### **Entregable Semana 1:**
- ✅ Rails 8.1.1 corriendo en Mac
- ✅ DB conectada
- ✅ SAP Service Layer validado
- ✅ `/api/health` funcionando
- ✅ Repo Git inicializado

**Criterio GO/NO-GO:**
- Si SAP no conecta → **DETENER y resolver**
- Si DB no conecta → **DETENER y resolver**

---

### **SEMANA 2: Autenticación (Rails 8 built-in)**

#### **Objetivos:**
- ✅ Login funcional (web + API)
- ✅ Autenticación Rails 8
- ✅ Modelos básicos

#### **Rails 8 Authentication Generator:**

```bash
# Rails 8 incluye generador de autenticación
rails generate authentication

# Esto crea:
# - app/models/user.rb
# - app/models/session.rb
# - app/controllers/sessions_controller.rb
# - app/views/sessions/
# - Migraciones
```

```bash
rails db:migrate
```

**Lo que genera automáticamente:**
- ✅ Modelo User con `has_secure_password`
- ✅ Sesiones con cookies seguras
- ✅ Login/Logout controllers
- ✅ Vistas de login/registro
- ✅ Password reset (opcional)

#### **Customizar para API (JWT):**

```ruby
# Gemfile
gem 'jwt'

# app/controllers/api/auth_controller.rb
class Api::AuthController < ApplicationController
  skip_before_action :verify_authenticity_token

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = generate_jwt(user)
      render json: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def me
    render json: current_user
  end

  private

  def generate_jwt(user)
    payload = {
      user_id: user.id,
      exp: 24.hours.from_now.to_i
    }
    JWT.encode(payload, Rails.application.secret_key_base)
  end
end

# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  private

  def current_user
    return @current_user if @current_user

    token = request.headers['Authorization']&.split(' ')&.last
    return nil unless token

    begin
      decoded = JWT.decode(token, Rails.application.secret_key_base).first
      @current_user = User.find(decoded['user_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      nil
    end
  end

  def authenticate_user!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
  end
end
```

#### **Crear usuario de prueba:**

```bash
rails c

> User.create(
    email: 'admin@ema.com',
    password: 'password123',
    name: 'Admin EMA'
  )
```

#### **Testing:**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ema.com","password":"password123"}'

# Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@ema.com",
    "name": "Admin EMA"
  }
}

# Usar token
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

#### **Entregable Semana 2:**
- ✅ Login funcional (web + API)
- ✅ JWT authentication
- ✅ Modelo User
- ✅ Protección de rutas

---

### **SEMANA 3: Modelos SAP + Sync**

#### **Objetivos:**
- ✅ Modelos BusinessPartner, Item
- ✅ Sync automático con SAP (Solid Queue)
- ✅ CRUD básico

```bash
# Generar modelos
rails g model BusinessPartner \
  card_code:string \
  card_name:string \
  federal_tax_id:string \
  phone:string \
  email:string \
  sap_data:jsonb

rails g model Item \
  item_code:string \
  item_name:string \
  price:decimal \
  sap_data:jsonb

rails db:migrate
```

```ruby
# app/models/business_partner.rb
class BusinessPartner < ApplicationRecord
  validates :card_code, presence: true, uniqueness: true

  def self.sync_from_sap
    sap = SapService.new
    partners = sap.get_business_partners.parsed_response['value']

    partners.each do |partner|
      BusinessPartner.find_or_create_by(card_code: partner['CardCode']) do |bp|
        bp.card_name = partner['CardName']
        bp.federal_tax_id = partner['FederalTaxID']
        bp.phone = partner['Phone1']
        bp.email = partner['EmailAddress']
        bp.sap_data = partner
      end
    end

    Rails.logger.info "Synced #{partners.count} business partners"
  end
end
```

#### **Background Jobs con Solid Queue (Rails 8):**

```ruby
# app/jobs/sap_sync_job.rb
class SapSyncJob < ApplicationJob
  queue_as :default

  def perform
    BusinessPartner.sync_from_sap
    Item.sync_from_sap
    Rails.logger.info "SAP sync completed at #{Time.current}"
  end
end
```

```ruby
# config/initializers/solid_queue.rb
# Rails 8 incluye Solid Queue por defecto

# Programar job recurrente
# config/recurring.yml
production:
  sap_sync:
    class: SapSyncJob
    schedule: every 15 minutes
```

**Ejecutar manualmente:**
```bash
rails c
> SapSyncJob.perform_now
```

#### **API Controllers:**

```ruby
# app/controllers/api/business_partners_controller.rb
class Api::BusinessPartnersController < ApplicationController
  before_action :authenticate_user!

  def index
    @partners = BusinessPartner.all
                  .page(params[:page])
                  .per(20)

    if params[:search].present?
      @partners = @partners.where(
        "card_name ILIKE ?", "%#{params[:search]}%"
      )
    end

    render json: {
      data: @partners,
      meta: {
        total: @partners.count,
        page: params[:page] || 1
      }
    }
  end

  def show
    @partner = BusinessPartner.find(params[:id])
    render json: @partner
  end

  def create
    # Crear en SAP primero
    sap = SapService.new
    sap_response = sap.create_business_partner(partner_params)

    # Guardar local
    @partner = BusinessPartner.create(
      partner_params.merge(sap_data: sap_response)
    )

    render json: @partner, status: :created
  end

  private

  def partner_params
    params.require(:business_partner).permit(
      :card_name, :federal_tax_id, :phone, :email
    )
  end
end
```

#### **Entregable Semana 3:**
- ✅ Modelos BusinessPartner + Item
- ✅ Sync automático cada 15 min
- ✅ API CRUD funcionando
- ✅ Solid Queue ejecutando jobs

---

### **SEMANA 4: Orders + Invoices (Backend)**

#### **Similar a Semana 3, agregando:**
- Modelo Order + OrderLine
- Modelo Invoice + InvoiceLine
- Modelo Payment
- Jobs para crear en SAP
- Validaciones de negocio

**Entregable Semana 4:**
- ✅ **Backend API 100% completo** (103 endpoints)
- ✅ Integración SAP total
- ✅ Tests pasando

---

### **SEMANAS 5-8: FRONTEND WEB (Hotwire)**

#### **Rails 8 + Hotwire = Sin JavaScript complejo**

**Semana 5: Layout + Dashboard**
- Layout con Tailwind
- Dashboard con KPIs
- Turbo Frames para carga parcial

**Semana 6: Maestros**
- Clientes (lista, crear, editar)
- Productos (lista, crear, editar)
- Búsqueda con Turbo Streams

**Semana 7: Pedidos**
- Formulario interactivo (Stimulus)
- Agregar líneas dinámicamente
- Cálculo en tiempo real

**Semana 8: Facturación + Reportes**
- Módulo completo de facturas
- PDFs (Prawn gem)
- Reportes con gráficos

**Entregable Semana 8:**
- ✅ **Frontend Web 100% completo**
- ✅ UX moderna con Hotwire
- ✅ Sin recargas de página

---

### **SEMANAS 9-10: MOBILE (Capacitor)**

#### **Semana 9: Setup + Build**

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# Plugins
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/network

# Plataformas
npx cap add ios
npx cap add android

# Build
npx cap sync
npx cap open ios      # Xcode
npx cap open android  # Android Studio
```

**Entregable Semana 9:**
- ✅ Apps iOS + Android
- ✅ Consumiendo API
- ✅ Plugins básicos

#### **Semana 10: Testing + Distribución**
- Testing en dispositivos
- Optimización UX mobile
- Builds firmados
- TestFlight + Google Play Beta

**Entregable Semana 10:**
- ✅ Apps funcionando en dispositivos
- ✅ Listas para distribución

---

### **SEMANAS 11-12: DEPLOY + CLIENTE PILOTO**

#### **Kamal 2 Deploy (Rails 8):**

```bash
# Kamal viene incluido en Rails 8
kamal init

# config/deploy.yml
service: ema-rails
image: your-org/ema-rails

servers:
  web:
    - 192.168.1.100  # Windows Server IP

registry:
  username: your-username
  password:
    - KAMAL_REGISTRY_PASSWORD

env:
  secret:
    - DATABASE_URL
    - SAP_SERVICE_LAYER_URL

# Deploy
kamal setup
kamal deploy
```

**Entregable Semana 11-12:**
- ✅ Deploy automático con Kamal
- ✅ CI/CD GitHub Actions
- ✅ Cliente piloto validado
- ✅ **V1 COMPLETA** 🎉

---

## 📊 RESUMEN TÉCNICO

### Backend completo:
- 103 endpoints API REST
- Integración SAP Service Layer
- Solid Queue (background jobs)
- Tests >70% cobertura

### Frontend Web:
- Rails Views + Hotwire
- Tailwind CSS
- Sin dependencias JavaScript pesadas
- Responsive design

### Mobile:
- iOS + Android (Capacitor)
- Consume API en tiempo real
- Requiere internet
- Plugins nativos (cámara, GPS)

### Deploy:
- Docker containerizado
- Kamal 2 deployment
- Windows Server
- CI/CD automatizado

---

## ✅ PRÓXIMOS PASOS

1. **Aprobar este plan** ✓
2. **Mañana: Setup Mac** (Ruby 3.3.6 + Rails 8.1.1)
3. **Crear repo Git**
4. **Semana 1 comienza** 🚀

**¿Listo para empezar?**
