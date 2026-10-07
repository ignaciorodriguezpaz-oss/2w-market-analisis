# 2W Market Analysis — Alcance maestro

Este documento es el contrato funcional vigente de la aplicación greenfield `2w-market-analisis`.

## Principios de gobernanza

1. Patentamientos, ventas, producción, importaciones y stock son medidas separadas.
2. CAFAM gobierna el total del mercado.
3. Los actuals cerrados nunca se reemplazan por forecast.
4. Todo dato debe mostrar fuente, fecha y estado.
5. No se inventan stock, importaciones, precios, tasas ni precisión estadística.
6. Downside ≤ Base ≤ Upside.
7. Abril–marzo reconcilia con KI; enero–diciembre reconcilia con CY.
8. Segmentos reconcilian exactamente con el mercado total.
9. Targets comerciales se comparan contra el forecast; no lo modifican silenciosamente.
10. User Scenario permanece separado del forecast oficial.
11. Cada cambio de forecast genera versión y changelog.
12. Down + Base + Up = 100% de probabilidad. User Scenario muestra likelihood/compatibilidad y sólo entra al 100% si se define explícitamente como mutuamente excluyente.

## Estados de dato

`FACT` · `ESTIMATE` · `EARLY SIGNAL` · `ASSUMPTION` · `FORECAST` · `USER INPUT` · `PENDING` · `DEMO DATA`

## Fuentes

- CAFAM: total vigente.
- Pivot Table maestra: historia y estacionalidad.
- AUTOMATIC / Segmentation: marcas, modelos, grupos y taxonomías.
- SIOMAA: mes abierto, marcas y modelos cuando exista archivo cargado.
- INDEC / BCRA: macroeconomía.
- Aduana / archivos internos: importaciones y supply.
- Honda interno: únicamente `USER INPUT` o versión protegida.

## Orden definitivo de hojas

1. Argentina hoy
2. Resumen ejecutivo
3. Consumidor y affordability
4. Autos versus motos
5. Mercado actual y nowcast
6. Momentum y cambio de régimen
7. Historia
8. Estacionalidad
9. Segmentos
10. Marcas, grupos y modelos
11. Importaciones y supply
12. Producto y competencia
13. Nuevos modelos y amenazas
14. Radar de noticias
15. Diagnóstico del mercado
16. Tres escenarios
17. Probabilidad y posibilidad
18. User Scenario Lab
19. Forecast mensual
20. Forecast CY
21. Forecast KI actual
22. Próximos cinco KI
23. Comparador KI y escenarios
24. Metodología del forecast
25. Validación y backtesting
26. Commercial Planning
27. Product Planning
28. Geografía
29. Safety y regulación
30. Riesgos y acciones
31. Reportes
32. Data y metodología
33. Centro de actualización

## Criterio de implementación

Una hoja puede existir con estado `PENDING` cuando la fuente necesaria todavía no está conectada. En ese caso debe mostrar explícitamente qué dato falta y nunca completar el vacío con una estimación silenciosa. La arquitectura debe permanecer fija mientras se amplía la cobertura de datos y cálculos.
