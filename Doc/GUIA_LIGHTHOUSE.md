# 🚦 GUÍA: LIGHTHOUSE TESTING EN PRODUCCIÓN
## Ejecutar auditoría de performance, accessibility, best practices y SEO

**Ejecutado por:** DevOps / QA  
**Requisitos:** App en producción (Ready en Vercel), Chrome DevTools  
**Duración:** ~5 min por auditoría  
**Criticidad:** 🟡 IMPORTANTE — valida calidad y compatibilidad

---

## 📊 PASOS

### PASO 1: Preparar Chrome DevTools

1. **Abrir la URL de producción en Chrome**
   ```
   https://classsport.vercel.app (o tu dominio)
   ```

2. **Abrir DevTools**
   - Atajo: `F12` (Windows/Linux) o `Cmd+Option+I` (Mac)
   - O: Click derecho en página → "Inspect" → Pestaña "DevTools"

3. **Navegar a pestaña "Lighthouse"**
   - Si no ves la pestaña, click ⪧ (tres puntos) en DevTools → "More tools" → "Lighthouse"
   - Debería aparecer "Lighthouse" en las tabs principales

### PASO 2: Configurar Lighthouse

1. **En el panel Lighthouse:**
   - Device: "Mobile" primero (mayoría de usuarios)
   - Category: "Performance", "Accessibility", "Best Practices", "SEO"
   - Throttling: "Slow 4G" (simula usuarios con conexión débil)
   - Storage: "Clear site data" (para freshtest) ✅
   - Uncheck "Simulate throttling" si quieres resultados "reales" sin simulación

2. **Settings recomendados para producción:**
   ```
   ✅ Performance        — medida CRÍTICA
   ✅ Accessibility      — medida IMPORTANTE
   ✅ Best Practices     — medida IMPORTANTE
   ✅ SEO                — medida IMPORTANTE
   Device: Mobile        — simula usuarios en celular
   Throttling: Slow 4G   — simula red lenta (realista)
   ```

### PASO 3: Ejecutar Auditoría

1. **Click "Analyze page load"** (o botón similar)
   - Lighthouse comenzará scan
   - Barra de progreso muestra estado

2. **Esperar resultado** (~1-2 minutos)
   - No navegar, no hacer click en la página
   - Dejar que Lighthouse capture metrics

3. **Resultado aparecerá en el panel**
   - Scores por categoría en colores:
     - 🟢 Green: 90+ (Excellent)
     - 🟡 Yellow: 50-89 (Average)
     - 🔴 Red: < 50 (Poor)

### PASO 4: Interpretar Scores

**Performance (Target: ≥ 85)**
- Mide: Load time, interactivity, visual stability
- Componentes clave:
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Time to Interactive (TTI): < 3.8s
- Si bajo: Optimizar Next.js bundle, images, caching

**Accessibility (Target: ≥ 90)**
- Mide: Compatibilidad con screen readers, keyboard navigation, color contrast
- Si bajo: Revisar labels de inputs, alt-text en imágenes, color contrast ratios

**Best Practices (Target: ≥ 90)**
- Mide: Security headers, HTTPS, no console errors, outdated libraries
- Si bajo: Revisar console errors, actualizar dependencias

**SEO (Target: ≥ 85)**
- Mide: Meta tags, mobile-friendly, page title, readable font sizes
- Si bajo: Revisar next/head, metadata, robots.txt

### PASO 5: Documentar Resultados

```javascript
// Captura pantalla o anota scores:

LIGHTHOUSE RESULTS — Production
==============================

Device: Mobile
Throttling: Slow 4G
URL: https://classsport.vercel.app
Date: [FECHA/HORA]
Auditor: [TU NOMBRE]

Scores:
├─ Performance:     92/100 🟢
├─ Accessibility:   95/100 🟢
├─ Best Practices:  94/100 🟢
└─ SEO:             92/100 🟢

Key Metrics:
├─ FCP: 1.2s
├─ LCP: 2.1s
├─ CLS: 0.05
└─ TTI: 3.2s

Passed Audits:    [count] ✅
Failed Audits:    [count] (revisar si alguno es crítico)

Issues (if any):
- [Descripción corta de issue + recomendación]
- [...]
```

### PASO 6: Ejecutar Auditoría Desktop (Opcional)

1. **Repetir PASO 2-5 con:**
   - Device: "Desktop"
   - Throttling: "No throttling" (máquina rápida simulada)

2. **Comparar scores:**
   - Desktop scores típicamente más altos que mobile
   - Si Desktop < Mobile: problemas de network, no device-specific

### PASO 7: Revisar Oportunidades de Mejora

1. **En el panel Lighthouse:**
   - Sección "Opportunities" lista optimizaciones posibles
   - Cada oportunidad muestra:
     - Impacto: cuántos ms podría ahorrar
     - Descripción y cómo remediar

2. **Priorizar por impacto:**
   - Foco primero en oportunidades > 100ms

3. **Para producción go-live:**
   - Target scores: 85+, 90+, 90+, 85+
   - Si alguno < target: considerar hotfix o aceptar con risk

### PASO 8: Exportar Reporte (HTML)

1. **Click ⪧ (tres puntos) en panel Lighthouse**
   - Select "Save as HTML"

2. **Guardar archivo**
   - Nombre: `lighthouse-report-[DATE].html`
   - Ubicación: `Doc/`

3. **Compartir con equipo**
   - Abrir HTML en navegador
   - Visualización detallada de auditoría

---

## 📏 CRITERIOS DE SALIDA

### Para Production Go-Live: ✅

- [ ] Performance: ≥ 85
- [ ] Accessibility: ≥ 90
- [ ] Best Practices: ≥ 90
- [ ] SEO: ≥ 85
- [ ] No Critical errors (rojo) en Console
- [ ] Reporte HTML generado y documentado

### Si Alguno NO Cumple:

1. **Análisis de impacto:**
   - ¿Es bloqueante? (ej: 500 errors = bloqueante)
   - ¿Es optimización? (ej: imagen no optimizada = mejorable)

2. **Decisiones:**
   - Bloqueante + fácil fix: Hotfix + re-deploy
   - Bloqueante + complejo: Rollback, fix, re-deploy
   - Optimización: Documentar como "Post-launch improvement", continuar

---

## 🎯 LIGHTHOUSE CHECKLIST

- [ ] Chrome DevTools abierto
- [ ] Lighthouse tab visible
- [ ] Mobile audit ejecutado (Slow 4G)
- [ ] Scores capturados:
  - [ ] Performance: XX/100
  - [ ] Accessibility: XX/100
  - [ ] Best Practices: XX/100
  - [ ] SEO: XX/100
- [ ] Todos los scores ≥ targets
- [ ] Desktop audit ejecutado (sin throttling)
- [ ] Reporte HTML guardado
- [ ] Results documentados en fase_8_resumen.md

---

**Lighthouse Testing completado:** ☐
**Ejecutado por:** _________________ (nombre)
**Fecha/Hora:** _________________
**Result Status:** 🟢 APPROVED FOR PRODUCTION (scores ≥ targets)

