import json
from datetime import datetime

def load_json(filename):
    """Carga un archivo JSON desde el directorio data/"""
    try:
        with open(f"data/{filename}", 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"  Advertencia: {filename} no encontrado")
        return None
    except json.JSONDecodeError:
        print(f"  Error: {filename} tiene formato JSON invalido")
        return None

def classify_maturity_level(df_per_week, ltc_hours, cfr_percent, mttr_hours):
    """
    Clasifica el nivel de madurez DevOps segun benchmarks DORA.
    Retorna una tupla (nivel, puntuacion) donde puntuacion es de 0-16.
    """
    score = 0
    
    # Deployment Frequency - basado en deploys por semana
    # Elite: >1/dia (>7/semana), High: 1/semana - 1/dia, Medium: 1/mes - 1/semana, Low: <1/mes
    if df_per_week >= 7:
        score += 4
    elif df_per_week >= 1:
        score += 3
    elif df_per_week >= 0.25:  # ~1 por mes
        score += 2
    else:
        score += 1
    
    # Lead Time for Changes
    # Elite: <1h, High: <1dia, Medium: <1semana, Low: >1semana
    if ltc_hours < 1:
        score += 4
    elif ltc_hours < 24:
        score += 3
    elif ltc_hours < 168:  # 1 semana
        score += 2
    else:
        score += 1
    
    # Change Failure Rate
    # Elite: <5%, High: 5-10%, Medium: 10-15%, Low: >15%
    if cfr_percent < 5:
        score += 4
    elif cfr_percent <= 10:
        score += 3
    elif cfr_percent <= 15:
        score += 2
    else:
        score += 1
    
    # Mean Time To Recovery
    # Elite: <1h, High: <24h, Medium: <1semana, Low: >1semana
    if mttr_hours < 1:
        score += 4
    elif mttr_hours < 24:
        score += 3
    elif mttr_hours < 168:  # 1 semana
        score += 2
    else:
        score += 1
    
    # Clasificacion basada en puntuacion promedio
    avg = score / 4.0
    
    if avg >= 3.5:
        return ("Elite", score)
    elif avg >= 2.5:
        return ("High", score)
    elif avg >= 1.5:
        return ("Medium", score)
    else:
        return ("Low", score)

def generate_recommendations(df_per_week, ltc_hours, cfr_percent, mttr_hours):
    """Genera recomendaciones especificas basadas en las metricas"""
    recommendations = []
    
    # Deployment Frequency
    if df_per_week < 1:
        priority = "Alta" if df_per_week < 0.25 else "Media"
        recommendations.append({
            'priority': priority,
            'area': 'Deployment Frequency',
            'finding': f"Frecuencia de deployment baja: {df_per_week:.2f} deploys por semana",
            'recommendation': " El equipo debe automatizar el pipeline de CI/CD para permitir deploys mas frecuentes."
        })
    
    # Lead Time
    if ltc_hours > 24:
        priority = "Alta" if ltc_hours > 168 else "Media"
        recommendations.append({
            'priority': priority,
            'area': 'Lead Time for Changes',
            'finding': f"Lead time elevado: {ltc_hours:.1f} horas promedio",
            'recommendation': "El equipo debe reducir el tamaño de los PRs para facilitar reviews mas rapidas y optimizar el tiempo de ejecucion del pipeline de CI/CD. Tambien se podrian establecer SLAs para code review."
        })
    
    # Change Failure Rate
    if cfr_percent > 10:
        priority = "Critica" if cfr_percent > 15 else "Alta"
        recommendations.append({
            'priority': priority,
            'area': 'Change Failure Rate',
            'finding': f"Tasa de fallos elevada: {cfr_percent:.1f}%",
            'recommendation': "El equipo debe incrementar la cobertura de tests automatizados, implementar pruebas de integracion y end-to-end, y reforzar code reviews enfocadas en calidad."
        })
    
    # MTTR
    if mttr_hours > 1:
        priority = "Alta" if mttr_hours > 24 else "Media"
        recommendations.append({
            'priority': priority,
            'area': 'Mean Time To Recovery',
            'finding': f"Tiempo de recuperacion elevado: {mttr_hours:.2f} horas",
            'recommendation': "El equipo debe realizar un monitoreo mas proactivo e implementar alertas tempranas como tambien automatizar procesos de rollback."
        })
    
    return recommendations

def format_benchmark_comparison(value, elite_threshold, high_threshold, is_lower_better=True):
    """Formatea la comparacion con benchmarks"""
    if is_lower_better:
        if value <= elite_threshold:
            return "Nivel Elite"
        elif value <= high_threshold:
            return "Nivel High"
        else:
            return "Por debajo de High"
    else:
        if value >= elite_threshold:
            return "Nivel Elite"
        elif value >= high_threshold:
            return "Nivel High"
        else:
            return "Por debajo de High"

def generate_markdown_report():
    """Genera el reporte completo en formato Markdown"""
    
    print("Cargando metricas calculadas...")
    
    # Cargar datos de las metricas
    df_data = load_json("deployment_frequency.json")
    ltc_data = load_json("lead_time.json")
    cfr_data = load_json("change_failure_rate.json")
    mttr_data = load_json("mttr.json")
    
    print(f"  Deployment Frequency: {'OK' if df_data else 'FALTA'}")
    print(f"  Lead Time: {'OK' if ltc_data else 'FALTA'}")
    print(f"  Change Failure Rate: {'OK' if cfr_data else 'FALTA'}")
    print(f"  MTTR: {'OK' if mttr_data else 'FALTA'}")
    print()
    
    # Extraer valores para main branch
    if df_data and df_data['results']['main']:
        df_main = df_data['results']['main']
        df_total = df_main['total_deployments']
        df_period_days = df_main['period']['days']
        df_per_week = df_main['frequency']['per_week']
    else:
        df_total = df_period_days = df_per_week = 0
    
    if ltc_data and ltc_data['results']['main']:
        ltc_main = ltc_data['results']['main']
        ltc_mean_hours = ltc_main['statistics']['mean_hours']
        ltc_mean_days = ltc_main['statistics']['mean_days']
        ltc_median_hours = ltc_main['statistics']['median_hours']
        ltc_p95_hours = ltc_main['percentiles']['p95_hours']
        ltc_total_prs = ltc_main['total_prs_analyzed']
    else:
        ltc_mean_hours = ltc_mean_days = ltc_median_hours = ltc_p95_hours = ltc_total_prs = 0
    
    if cfr_data and cfr_data['results']['main']:
        cfr_main = cfr_data['results']['main']
        cfr_percent = cfr_main['failure_rate_percentage']
        cfr_total_deployments = cfr_main['total_deployments']
        cfr_failed = cfr_main['failed_deployments']
    else:
        cfr_percent = cfr_total_deployments = cfr_failed = 0
    
    if mttr_data and mttr_data.get('statistics'):
        mttr_stats = mttr_data['statistics']
        mttr_mean_hours = mttr_stats['mean_hours']
        mttr_mean_minutes = mttr_stats['mean_minutes']
        mttr_total_incidents = mttr_data['total_incidents']
    else:
        mttr_mean_hours = mttr_mean_minutes = mttr_total_incidents = 0
    
    # Clasificar madurez
    maturity_level, maturity_score = classify_maturity_level(
        df_per_week, ltc_mean_hours, cfr_percent, mttr_mean_hours
    )
    
    # Generar recomendaciones
    recommendations = generate_recommendations(
        df_per_week, ltc_mean_hours, cfr_percent, mttr_mean_hours
    )
    
    # Construir el reporte
    report = f"""# Reporte de Metricas DevOps DORA

**Proyecto:** PharmaGo  
**Periodo analizado:** {df_period_days} dias (ultimos deployments a main)  
**Nivel de madurez:** {maturity_level} (puntuacion: {maturity_score}/16)

---

## 1. Resumen Ejecutivo

Este reporte presenta las metricas DORA (DevOps Research and Assessment) calculadas para el proyecto PharmaGo, analizando el desempeño del equipo en terminos de velocidad de entrega y estabilidad del sistema.

### Tabla Comparativa

| Metrica | Valor Actual | Nivel Elite | Nivel Alto | Clasificacion |
|---------|--------------|-----------------|----------------|---------------|
| **Deployment Frequency** | {df_per_week:.2f} deploys/semana | >7/semana | 1-7/semana | {format_benchmark_comparison(df_per_week, 7, 1, False)} |
| **Lead Time for Changes** | {ltc_mean_hours:.2f} horas | <1 hora | <24 horas | {format_benchmark_comparison(ltc_mean_hours, 1, 24, True)} |
| **Change Failure Rate** | {cfr_percent:.1f}% | <5% | 5-10% | {format_benchmark_comparison(cfr_percent, 5, 10, True)} |
| **Mean Time To Recovery** | {mttr_mean_hours:.2f} horas | <1 hora | <24 horas | {format_benchmark_comparison(mttr_mean_hours, 1, 24, True)} |

---

## 2. Deployment Frequency (DF)

**Definicion:** Frecuencia con la que el equipo realiza deployments exitosos a produccion (rama main).

### Resultados

- **Total de deployments:** {df_total} deployments a main
- **Periodo analizado:** {df_period_days} dias
- **Frecuencia semanal:** {df_per_week:.2f} deployments por semana
- **Frecuencia diaria:** {df_per_week/7:.2f} deployments por dia

### Analisis

"""
    
    if df_per_week >= 7:
        report += f"""El equipo esta realizando mas de 1 deployment diario ({df_per_week:.1f}/semana), lo que indica una capacidad de entrega continua muy alta. Esto permite entregar valor al usuario final de forma rapida y con ciclos de feedback cortos.
"""
    elif df_per_week >= 1:
        report += f"""El equipo esta realizando aproximadamente 1 deployment por semana, lo que es un buen ritmo de entrega. Hay oportunidad de incrementar la frecuencia mediante mayor automatizacion del pipeline.
"""
    elif df_per_week >= 0.25:
        report += f"""El equipo esta realizando aproximadamente 1 deployment por mes. Esta frecuencia limitada puede indicar releases grandes y procesos manuales que ralentizan la entrega.
"""
    else:
        report += f"""La frecuencia de deployment es muy baja (menos de 1 por mes). Esto sugiere la necesidad de automatizar procesos y reducir el tamaño de los releases.
"""
    
    report += f"""
**Contexto del proyecto:** El proyecto utiliza GitFlow con ramas develop y main. Los merges a main representan releases a produccion, mientras que develop muestra la integracion continua de features.

---

## 3. Lead Time for Changes (LTC)

**Definicion:** Tiempo promedio desde que se crea un Pull Request hasta que se mergea a produccion (main).

### Resultados

- **Tiempo promedio:** {ltc_mean_hours:.2f} horas ({ltc_mean_days:.2f} dias)
- **Tiempo mediano:** {ltc_median_hours:.2f} horas
- **Percentil 95:** {ltc_p95_hours:.2f} horas
- **PRs analizados:** {ltc_total_prs} pull requests

### Analisis

"""
    
    if ltc_mean_hours < 1:
        report += f"""El lead time es excepcionalmente bajo (<1 hora), indicando un proceso muy eficiente de code review y merge. Esto sugiere PRs pequenos, reviews rapidas y alta confianza en el proceso de CI/CD.
"""
    elif ltc_mean_hours < 24:
        report += f"""El lead time de {ltc_mean_hours:.1f} horas es muy bueno, permitiendonos que los cambios lleguen a produccion en menos de un dia. Esto facilita ciclos rapidos de feedback y reduce el riesgo de cambios grandes.
"""
    elif ltc_mean_hours < 168:
        report += f"""El lead time de {ltc_mean_hours:.1f} horas ({ltc_mean_days:.1f} dias) es moderado. Hay oportunidad de optimizar el proceso de review y reducir el tiempo de espera en el pipeline.
"""
    else:
        report += f"""El lead time de {ltc_mean_hours:.1f} horas ({ltc_mean_days:.1f} dias) es elevado. Esto puede indicar PRs grandes, reviews lentas o cuellos de botella en el proceso de integracion.
"""
    
    report += f"""
**A tener en cuenta:** Esta metrica mide el tiempo desde la creacion del PR hasta el merge. No incluye el tiempo de desarrollo en la branch /feature antes de crear el PR, por lo que el tiempo total de desarrollo de una feature es mayor.
---

## 4. Change Failure Rate (CFR)

**Definicion:** Porcentaje de deployments a produccion que requieren un hotfix inmediato debido a fallos.

### Resultados

- **Tasa de fallos:** {cfr_percent:.1f}%
- **Total de deployments:** {cfr_total_deployments}
- **Deployments fallidos:** {cfr_failed}

### Analisis

"""
    
    if cfr_percent < 5:
        report += f"""La tasa de fallos de {cfr_percent:.1f}% es excelente y se encuentra en el nivel Elite. Esto indica procesos de testing solidos y alta calidad del codigo entregado.
"""
    elif cfr_percent <= 10:
        report += f"""La tasa de fallos de {cfr_percent:.1f}% es buena y se encuentra dentro del benchmark High. El equipo mantiene una buena estabilidad con espacio para mejora continua.
"""
    elif cfr_percent <= 15:
        report += f"""La tasa de fallos de {cfr_percent:.1f}% es moderada. Se debe reforzar la cobertura de tests y los procesos de QA antes del deployment.
"""
    else:
        report += f"""La tasa de fallos de {cfr_percent:.1f}% es elevada y requiere atencion. Esto indica que los procesos de testing actuales no estan detectando problemas antes del deployment a produccion.
"""
    
    report += f"""
**Como lo medimos:** Se consideran como deployments fallidos aquellos PRs a main que tienen 'fix' en el titulo o nombre de branch, asumiendo que corrigen problemas de deployments anteriores.

---

## 5. Mean Time To Recovery (MTTR)

**Definicion:** Tiempo promedio para resolver un incidente en produccion mediante un hotfix.

### Resultados

- **MTTR promedio:** {mttr_mean_hours:.2f} horas ({mttr_mean_minutes:.1f} minutos)
- **Total de incidentes:** {mttr_total_incidents}

### Analisis

"""
    
    if mttr_total_incidents == 0:
        report += f"""No se detectaron incidentes en el periodo analizado, lo que es positivo. Esto puede indicar alta estabilidad del sistema o que los problemas se detectaron y corrigieron antes de llegar a produccion.
"""
    elif mttr_mean_hours < 1:
        report += f"""El MTTR de {mttr_mean_minutes:.1f} minutos es excelente. El equipo demuestra capacidad de respuesta rapida ante incidentes, lo que minimiza el impacto en usuarios.
"""
    elif mttr_mean_hours < 24:
        report += f"""El MTTR de {mttr_mean_hours:.2f} horas es bueno. El equipo logra resolver incidentes en menos de un dia, aunque hay oportunidad de mejorar los tiempos de respuesta mediante mayor automatizacion.
"""
    else:
        report += f"""El MTTR de {mttr_mean_hours:.2f} horas es elevado. Se recomienda implementar monitoreo proactivo y automatizar los procesos de rollback para reducir el tiempo de recuperacion.
"""
    
    report += f"""
**Como lo medimos:** Se mide el tiempo entre un deployment a main y el hotfix subsecuente que corrige el problema detectado.

---

## 6. Aspectos a mejorar

"""
    
    if recommendations:
        # Ordenar por prioridad
        priority_order = {"Critica": 1, "Alta": 2, "Media": 3, "Baja": 4}
        sorted_recs = sorted(recommendations, key=lambda x: priority_order.get(x['priority'], 5))
        
        for i, rec in enumerate(sorted_recs, 1):
            report += f"""### {i}. {rec['area']} (Prioridad: {rec['priority']})

**Lo encontrado por el equipo:** {rec['finding']}

**Lo que debemos aplicar para mejorar:** {rec['recommendation']}

"""
    else:
        report += """No se identificaron areas criticas que requieran atencion inmediata. El equipo mantiene un buen nivel de desempeño en todas las metricas DORA.

"""
    
    report += f"""---

## 7. Conclusiones

### Nivel de Madurez: {maturity_level}

"""
    
    if maturity_level == "Elite":
        report += """El equipo demuestra un nivel de madurez excepcional en practicas DevOps. Las metricas indican:

- Alta velocidad de entrega con deployments frecuentes
- Procesos eficientes que minimizan el lead time
- Excelente estabilidad con baja tasa de fallos
- Capacidad de respuesta rapida ante incidentes

Para mantener este nivel, el equipo debe continuar con las practicas actuales y fomentar la mejora continua.
"""
    elif maturity_level == "High":
        report += """El equipo mantiene un buen nivel de madurez en practicas DevOps. Las metricas muestran:

- Buena velocidad de entrega
- Procesos eficientes de integracion
- Estabilidad aceptable del sistema
- Capacidad de recuperacion ante incidentes

Para alcanzar el nivel Elite, se recomienda enfocarse en las areas identificadas en la seccion de aspectos a mejorar, especialmente en incrementar la automatizacion y reducir los tiempos de ciclo.
"""
    elif maturity_level == "Medium":
        report += """El equipo se encuentra en un nivel medio de madurez DevOps. Tenemos una buena base pero hay grandes oportunidades de mejora:

- La velocidad de entrega puede incrementarse mediante mayor automatizacion
- Los procesos de integracion tienen espacio para optimizacion
- La estabilidad puede mejorarse con mas testing automatizado
- Los tiempos de recuperacion pueden reducirse con mejor monitoreo

El equipo debe priorizar las acciones de la seccion de aspectos a mejorar, enfocandose primero en las de mayor prioridad. La implementacion de mejores practicas de CI/CD y testing automatizado tendra el mayor impacto.
"""
    else:
        report += """El equipo tiene oportunidades muy grandes de mejora en sus practicas DevOps. Las metricas indican:

- Procesos manuales que ralentizan la entrega
- Falta de automatizacion en el pipeline
- Necesidad de reforzar testing y QA
- Procesos de recuperacion que requieren optimizacion

El equipo debe enfocarse en:
1. Automatizar el pipeline de CI/CD
2. Implementar testing automatizado comprehensivo
3. Reducir el tamaño de los cambios (PRs mas pequeños)
4. Establecer procesos claros de code review y deployment

La mejora en estas areas tendra un impacto significativo en la capacidad del equipo para entregar valor de forma rapida y confiable.
"""
    
    report += f"""
### Relacion con la Segunda Via de DevOps

Las metricas DORA implementadas se alinean directamente con la **Segunda Via de DevOps: Amplificar los Ciclos de Retroalimentacion**. Esta via destaca el feedback rapido en todas las etapas del proceso de desarrollo:

- **Deployment Frequency** y **Lead Time** miden la velocidad del feedback desde el desarrollo hasta produccion
- **Change Failure Rate** proporciona feedback sobre la calidad del codigo y efectividad de los tests
- **MTTR** mide la velocidad de feedback y correccion cuando ocurren problemas

Al medir y mejorar estas metricas, demostramos la capacidad de detectar y corregir problemas de forma rapida, reduciendo el riesgo y aumentando la confianza para realizar cambios frecuentes.

---

"""
    return report

def main():
    print("=" * 70)
    print("Generador de Reporte de Metricas DORA - PharmaGo")
    print("=" * 70)
    print()
    
    try:
        # Generar el reporte
        report_content = generate_markdown_report()
        
        import os
        # Verificar si existe la carpeta docs en el repo
        docs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../docs'))
        if os.path.isdir(docs_path):
            report_dir = docs_path
        else:
            # Si no existe docs, crear scripts/reports y guardar ahí
            report_dir = os.path.join(os.path.dirname(__file__), 'reports')
            os.makedirs(report_dir, exist_ok=True)
        report_filename = f"metricas-dora-{datetime.now().strftime('%Y-%m')}.md"
        report_path = os.path.join(report_dir, report_filename)
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        print(f"Reporte generado exitosamente:")
        print(f"  {os.path.abspath(report_path)}")
        print()
        print("=" * 70)
        
    except Exception as e:
        print(f"Error al generar el reporte: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
