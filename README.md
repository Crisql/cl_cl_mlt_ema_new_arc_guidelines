# EMA Legacy Codebase - Migration Guidelines

Este repositorio contiene el código fuente legacy del sistema EMA como referencia para la migración a Rails 8.1.1.

## Estructura

```
cl_cl_mlt_ema_new_arc_guidelines/
├── legacy_api_dotnet/       # Backend .NET Framework 4.7.2
│   └── (103 controladores API)
├── legacy_web_angular/      # Frontend Angular 13
│   └── (~50,000 líneas de código)
├── legacy_mobile_ionic/     # Mobile Ionic 5
│   └── (62 servicios móviles)
└── docs/
    ├── INFORME_MIGRACION_EMA.md
    ├── OBJETIVOS_MIGRACION_RAILS.md
    ├── PLAN_MIGRACION_RAILS_V1.md
    └── RESUMEN_EJECUTIVO_MIGRACION.md
```

## Propósito

Este repositorio sirve como:
1. **Referencia** para entender la lógica de negocio actual
2. **Guía** para migrar endpoints y funcionalidades
3. **Documentación** del proceso de migración

## Repositorio de Nueva Arquitectura

El código de la nueva aplicación Rails está en:
- **GitHub:** [cl_cl_mlt_ema_new_arc](https://github.com/ClavisCo/cl_cl_mlt_ema_new_arc)

## Documentación de Migración

- [Informe Técnico Completo](docs/INFORME_MIGRACION_EMA.md)
- [Objetivos de Migración](docs/OBJETIVOS_MIGRACION_RAILS.md)
- [Plan de Migración V1](docs/PLAN_MIGRACION_RAILS_V1.md)
- [Resumen Ejecutivo](docs/RESUMEN_EJECUTIVO_MIGRACION.md)

## Stack Legacy

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend API | ASP.NET Web API | .NET Framework 4.7.2 |
| Frontend Web | Angular | 13 |
| Mobile | Ionic + Cordova/Capacitor | 5 |
| Base de datos | SQL Server + SAP HANA | - |

## Stack Nuevo (Rails)

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend + Frontend | Ruby on Rails | 8.1.1 |
| CSS | Tailwind CSS | 4.x |
| JavaScript | Hotwire (Turbo + Stimulus) | - |
| Mobile | Capacitor | 6.x |
| Base de datos | SQLite (dev) / SQL Server (prod) | - |

---

**IMPORTANTE:** Este código es solo para referencia. No modificar.
