# AJUSTES AL PLAN DE MIGRACIÓN
## Decisiones tomadas el 13 de Noviembre, 2025

---

## ✅ AJUSTES CONFIRMADOS:

### 1. **Stack Tecnológico**
```
Ruby:  3.3.6
Rails: 8.1.1
Git:   Bitbucket (no GitHub)
CI/CD: Bitbucket Pipelines
```

### 2. **Arquitectura de Datos: SAP-Céntrica** ⚡ CRÍTICO

**Filosofía:** "SAP es la fuente de verdad única"

```
┌──────────────────────────────────────────┐
│   SAP B1 Database (HANA/SQL Server)      │
│                                          │
│   ├── Tablas estándar SAP                │
│   │   ├── OCRD (BusinessPartners)        │
│   │   ├── OITM (Items)                   │
│   │   ├── ORDR (Orders)                  │
│   │   └── OINV (Invoices)                │
│   │                                      │
│   └── UDTs/UDOs Custom                   │
│       ├── U_EMA_ROUTES                   │
│       ├── U_EMA_CONFIG                   │
│       ├── U_EMA_AUDIT_LOG                │
│       └── ... (otros)                    │
│                                          │
│   ↕️ Service Layer REST API              │
└──────────────────────────────────────────┘
              ↕️
┌──────────────────────────────────────────┐
│   Rails App Database (PostgreSQL)        │
│                                          │
│   Solo 4-5 tablas:                       │
│   ├── users (autenticación)              │
│   ├── sessions                           │
│   ├── app_settings                       │
│   └── cache_entries (opcional)           │
└──────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Un solo lugar para datos de negocio
- ✅ Backup SAP = backup completo
- ✅ Reportes todo en SAP
- ✅ No sincronización Rails ↔ SAP
- ✅ Migraciones más simples

### 3. **Implementación Rails**

**NO usar ActiveRecord para datos de negocio:**
```ruby
# app/models/business_partner.rb
class BusinessPartner
  include ActiveModel::Model
  # NO hereda de ApplicationRecord
  # Solo wrapper del Service Layer SAP

  def self.all
    SapService.new.get_business_partners
  end

  def save
    SapService.new.create_business_partner(attributes)
  end
end
```

**Solo ActiveRecord para datos de app:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  # Esto SÍ usa Rails DB
  has_secure_password
end
```

### 4. **Repositorio y CI/CD**

**Git:** Bitbucket
**CI/CD:** Bitbucket Pipelines

```yaml
# bitbucket-pipelines.yml
image: ruby:3.3.6

pipelines:
  default:
    - step:
        name: Test
        script:
          - bundle install
          - bundle exec rspec

  branches:
    develop:
      - step:
          name: Deploy Staging
          deployment: staging
          script:
            - kamal deploy -d staging

    main:
      - step:
          name: Deploy Production
          deployment: production
          trigger: manual
          script:
            - kamal deploy -d production
```

### 5. **Cronograma Ajustado: 10-12 semanas**

#### **Semana 1: Setup + Análisis de datos**
- Setup Mac (Ruby 3.3.6 + Rails 8.1.1)
- Conexión SAP Service Layer
- **Inventariar DB actual (.NET)**
- **Diseñar UDTs/UDOs necesarios**
- Clasificar datos: SAP vs Rails

#### **Semana 2: UDTs/UDOs + Auth**
- **Crear UDTs en SAP**
- **Crear UDOs (exponer via Service Layer)**
- **Validar acceso a UDOs**
- Auth Rails 8 (users table)
- Primer wrapper model

#### **Semanas 3-4: Backend API**
- Wrappers SAP (BusinessPartner, Item, Order, Invoice)
- Wrappers UDOs custom
- API Controllers
- Cache layer (Redis)
- NO sync jobs (todo en tiempo real)

#### **Semanas 5-8: Frontend Web**
- Rails Views + Hotwire
- Tailwind CSS
- Todas las vistas

#### **Semanas 9-10: Mobile**
- Capacitor wrapper
- iOS + Android
- Online only (sin offline)

#### **Semanas 11-12: Deploy**
- Bitbucket Pipelines
- Kamal deploy
- Cliente piloto

---

## 🎯 CAMBIOS CLAVE vs Plan Original:

### LO QUE CAMBIA:

1. **Arquitectura de datos:**
   - ANTES: Rails DB replica datos SAP + sync jobs
   - AHORA: SAP es fuente única + Rails solo lee/escribe via API

2. **Modelos Rails:**
   - ANTES: ActiveRecord models con sync
   - AHORA: Wrappers plain Ruby (no ActiveRecord para negocio)

3. **Base de datos Rails:**
   - ANTES: ~60 tablas (modelos de negocio)
   - AHORA: ~5 tablas (solo app: users, sessions, config)

4. **Background jobs:**
   - ANTES: Solid Queue para sync SAP
   - AHORA: No sync (opcional: cache refresh)

5. **UDTs/UDOs:**
   - ANTES: No considerado
   - AHORA: Parte integral del proyecto (Semanas 1-2)

6. **Git/CI/CD:**
   - ANTES: GitHub + GitHub Actions
   - AHORA: Bitbucket + Bitbucket Pipelines

### LO QUE NO CAMBIA:

- ✅ Stack: Ruby 3.3.6 + Rails 8.1.1
- ✅ Frontend: Rails Views + Hotwire
- ✅ Mobile: Capacitor (online only)
- ✅ Timeline: 10-12 semanas
- ✅ Deploy: Docker + Kamal 2

---

## 📋 PENDIENTE DEFINIR:

### Antes de comenzar:

1. **UDTs necesarios:**
   - [ ] Listar todos los UDTs a crear
   - [ ] Diseñar estructura de cada uno
   - [ ] Validar con stakeholders

2. **Clasificación de datos:**
   - [ ] Inventariar tablas actuales (.NET DB)
   - [ ] Decidir qué va a SAP vs Rails
   - [ ] Documentar decisiones

3. **Timeline específico:**
   - [ ] ¿Fecha de inicio?
   - [ ] ¿Fecha límite?
   - [ ] ¿Trabajas tiempo completo o part-time?

4. **Equipo:**
   - [ ] ¿Quién más trabaja en el proyecto?
   - [ ] ¿Quién crea los UDTs en SAP?
   - [ ] ¿Quién hace testing?

5. **Infraestructura:**
   - [ ] ¿Windows Server listo?
   - [ ] ¿SAP B1 disponible para desarrollo?
   - [ ] ¿SQL Server configurado?

---

## 📞 PRÓXIMA SESIÓN:

### Temas a discutir:

1. Definir UDTs específicos necesarios
2. Timeline detallado (fechas)
3. Recursos/equipo disponible
4. Cualquier otro ajuste

---

## 📄 DOCUMENTOS ACTUALES:

1. ✅ **PLAN_MIGRACION_RAILS_V1.md** - Plan base (necesita actualización)
2. ✅ **AJUSTES_PLAN.md** - Este documento (ajustes confirmados)
3. ✅ **OBJETIVOS_MIGRACION_RAILS.md** - Objetivos generales
4. ✅ **INFORME_MIGRACION_EMA.md** - Análisis técnico original
5. ✅ **RESUMEN_EJECUTIVO_MIGRACION.md** - Para gerencia

---

**Estado:** Ajustes capturados, listos para continuar cuando retomes. 🚀
