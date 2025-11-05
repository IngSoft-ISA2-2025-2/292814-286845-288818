import json
from datetime import datetime, timedelta
from dateutil import parser as date_parser

def load_json(filename):
    with open(f"data/{filename}", 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    with open(f"data/{filename}", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def calculate_deployment_frequency():
    print("="*60)
    print("Cálculo de Deployment Frequency (DF)")
    print("="*60)
    print()
    
    pull_requests = load_json("pull_requests.json")
    
    deployments = []
    for pr in pull_requests:
        if pr["base_branch"] == "main" and pr["merged_at"]:
            deployments.append({
                "number": pr["number"],
                "title": pr["title"],
                "merged_at": pr["merged_at"],
                "author": pr["author"]
            })
    
    deployments.sort(key=lambda x: x["merged_at"])
    
    if not deployments:
        print("No se encontraron deployments (merges a main)")
        return
    
    print(f"Total de deployments encontrados: {len(deployments)}")
    print()
    
    first_deploy = date_parser.parse(deployments[0]["merged_at"])
    last_deploy = date_parser.parse(deployments[-1]["merged_at"])
    period_days = (last_deploy - first_deploy).days + 1
    period_weeks = period_days / 7
    period_months = period_days / 30
    
    print(f"Primer deployment: {first_deploy.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Último deployment: {last_deploy.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Período analizado: {period_days} días ({period_weeks:.1f} semanas)")
    print()
    
    deploys_per_day = len(deployments) / period_days if period_days > 0 else 0
    deploys_per_week = len(deployments) / period_weeks if period_weeks > 0 else 0
    deploys_per_month = len(deployments) / period_months if period_months > 0 else 0
    
    print(f"Frecuencia de deployments:")
    print(f"  - Por día:    {deploys_per_day:.2f} deploys/día")
    print(f"  - Por semana: {deploys_per_week:.2f} deploys/semana")
    print(f"  - Por mes:    {deploys_per_month:.2f} deploys/mes")
    print()
    
    if deploys_per_day >= 1:
        level = "Elite"
        description = "Múltiples deployments por día"
    elif deploys_per_week >= 1:
        level = "High"
        description = "Entre 1 deployment por día y 1 por semana"
    elif deploys_per_month >= 1:
        level = "Medium"
        description = "Entre 1 deployment por semana y 1 por mes"
    else:
        level = "Low"
        description = "Menos de 1 deployment por mes"
    
    print(f"Nivel DORA: {level}")
    print(f"Descripción: {description}")
    print()
    
    deployments_by_week = {}
    for deploy in deployments:
        deploy_date = date_parser.parse(deploy["merged_at"])
        week_key = deploy_date.strftime("%Y-W%W")
        if week_key not in deployments_by_week:
            deployments_by_week[week_key] = []
        deployments_by_week[week_key].append(deploy)
    
    print(f"Distribución por semana:")
    for week in sorted(deployments_by_week.keys())[-5:]:
        count = len(deployments_by_week[week])
        print(f"  {week}: {count} deployment(s)")
    print()
    
    result = {
        "metric": "Deployment Frequency",
        "calculation_date": datetime.now().isoformat(),
        "period": {
            "start": deployments[0]["merged_at"],
            "end": deployments[-1]["merged_at"],
            "days": period_days,
            "weeks": round(period_weeks, 1),
            "months": round(period_months, 1)
        },
        "total_deployments": len(deployments),
        "frequency": {
            "per_day": round(deploys_per_day, 2),
            "per_week": round(deploys_per_week, 2),
            "per_month": round(deploys_per_month, 2)
        },
        "dora_level": level,
        "dora_description": description,
        "benchmarks": {
            "Elite": "Múltiples deployments por día",
            "High": "Entre 1 por día y 1 por semana",
            "Medium": "Entre 1 por semana y 1 por mes",
            "Low": "Menos de 1 por mes"
        },
        "deployments": deployments,
        "weekly_distribution": {
            week: len(deploys) for week, deploys in deployments_by_week.items()
        }
    }
    
    save_json(result, "deployment_frequency.json")
    print("="*60)
    print("Resultados guardados en: data/deployment_frequency.json")
    print("="*60)

if __name__ == "__main__":
    calculate_deployment_frequency()
