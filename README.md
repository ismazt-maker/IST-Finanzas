# I$T V2.0

Aplicación PWA de finanzas personales, sin datos iniciales de usuario.

## V2.0 — Informes rediseñados
- Constructor de informes con filtros de tipo, fecha, cuenta, categoría, subcategoría y concepto.
- Histórico completo o filtros por meses/fechas.
- Agrupación por concepto/comercio, categoría, subcategoría, cuenta o mes.
- Número de operaciones, total, media y último movimiento.
- Vista de detalle por grupo.
- Comparación de cualquier mes contra cualquier otro por categoría, subcategoría, concepto o cuenta.
- Comparación de importes, diferencias, porcentajes y número de operaciones.
- Exportación CSV de informes y comparativas.
- Frecuencia de conceptos para detectar cuántas veces se ha realizado un gasto con el mismo concepto.

Los datos se guardan localmente en el dispositivo.


## I$T V2.2
Migración automática desde V2.1/V2.0, resumen financiero ampliado, presupuestos, objetivos, patrimonio, disponible, tasa de ahorro e insights.


## I$T V2.2.8
Mobile-first visual redesign for iPhone: touch-friendly controls, compact cards, responsive reports, bottom navigation, light/dark premium theme. Data model remains compatible with V2.2.

- Resumen mobile-first corregido: todas las tarjetas se apilan correctamente en iPhone.
- Categorías movidas a una pantalla propia y compacta.
- Buscador por concepto/comercio en Movimientos.


## I$T V2.3
Resumen optimizado: sin últimos movimientos, evolución limitada a 6 meses y módulo de gastos recurrentes comprometidos.


## I$T V2.4
Transferencias internas separadas de ingresos/gastos y base para presupuestos persistentes con rollover.


## I$T V2.5
Presupuestos como pestaña propia, presupuestos permanentes con rollover/previsión, cabecera móvil fija y perfil con bienvenida personalizada.


## I$T V2.5.1
Correcciones: pestaña Presupuestos real, navegación móvil, CTA del Resumen y guardado del nombre; se elimina el bloque antiguo de presupuestos de Configuración.


## I$T V2.6
Presupuestos integrados con Resumen, navegación real y acceso directo a creación.


## I$T V2.6.1
Corrección de navegación desde Resumen hacia Presupuestos; elimina el handler V2.6 defectuoso y fuerza nueva caché.


## I$T V2.7
Navegación Resumen → Presupuestos mediante el sistema de navegación real; formulario de presupuesto integrado en el mismo modal que Nuevo movimiento; ajustes de modo oscuro y alineación del campo fecha en iPhone.


## I$T V2.8
Scroll corregido al entrar en Presupuestos desde Resumen y botón Eliminar presupuesto con confirmación, sin eliminar movimientos.


## I$T V2.9
Sistema de apariencia: Automático/Claro/Oscuro y cinco temas visuales (Graphite, Navy, Forest, Burgundy, Slate), persistentes y optimizados para iPhone.


## I$T V2.9.1
Controles de apariencia funcionales, modos claro/oscuro/automático con persistencia y iconos iOS/PWA rediseñados con el logotipo ampliado.


## I$T V2.10
Identidad visual definitiva, sistema único de apariencia (Claro/Oscuro/Automático), cinco temas coherentes, controles persistentes y activos, y assets iOS/PWA del nuevo monograma.


## I$T V2.10.2
Corrección del error de inicialización que dejaba el contenido en blanco: el refresco de controles de apariencia queda definido antes del render inicial y se elimina la llamada global prematura.


## I$T V2.10.3
Corrección del handler de apariencia y del diseño de subcategorías en Dark Mode.


## I$T V2.10.4
Apariencia corregida por alcance JavaScript y ajuste Dark Mode de categorías/subcategorías.


## I$T V2.11 — Quality & Polish
- Apariencia unificada y Dark Mode sin reglas heredadas.
- Movimientos con tarjetas optimizadas para iPhone.
- Informes con tipo de informe y tipo de movimiento separados.
- Importación segura con backup automático.
- Protección de integridad al eliminar cuentas/categorías.
- PWA y theme-color actualizados.
