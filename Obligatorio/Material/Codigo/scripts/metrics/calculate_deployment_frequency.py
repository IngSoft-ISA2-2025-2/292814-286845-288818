import json
from datetime import datetime, timedelta
from dateutil import parser as date_parser

def load_json(filename):
    with open(f"data/{filename}", 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    with open(f"data/{filename}", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def calculate_for_branch(branch_name, pull_requests):
    deployments = []
    for pr in pull_requests:
        if pr["base_branch"] == branch_name and pr["merged_at"]:
            deployments.append({
                "number": pr["number"],
                "title": pr["title"],
                "merged_at": pr["merged_at"],
                "author": pr["author"],
                "head_branch": pr["head_branch"]
            })
    
    deployments.sort(key=lambda x: x["merged_at"])
    
    if not deployments:
        return None
    
    first_deploy = date_parser.parse(deployments[0]["merged_at"])
    last_deploy = date_parser.parse(deployments[-1]["merged_at"])
    period_days = (last_deploy - first_deploy).days + 1
    period_weeks = period_days / 7
    period_months = period_days / 30
    
    deploys_per_day = len(deployments) / period_days if period_days > 0 else 0
    deploys_per_week = len(deployments) / period_weeks if period_weeks > 0 else 0
    deploys_per_month = len(deployments) / period_months if period_months > 0 else 0
    
    deployments_by_week = {}
    for deploy in deployments:
        deploy_date = date_parser.parse(deploy["merged_at"])
        week_key = deploy_date.strftime("%Y-W%W")
        if week_key not in deployments_by_week:
            deployments_by_week[week_key] = []
        deployments_by_week[week_key].append(deploy)
    
    return {
        "branch": branch_name,
        "total_deployments": len(deployments),
        "period": {
            "start": deployments[0]["merged_at"],
            "end": deployments[-1]["merged_at"],
            "days": period_days,
            "weeks": round(period_weeks, 1),
            "months": round(period_months, 1)
        },
        "frequency": {
            "per_day": round(deploys_per_day, 2),
            "per_week": round(deploys_per_week, 2),
            "per_month": round(deploys_per_month, 2)
        },
        "deployments": deployments,
        "weekly_distribution": {
            week: len(deploys) for week, deploys in deployments_by_week.items()
        }
    }

def calculate_deployment_frequency():
    print("Deployment Frequency - Análisis")
    print("-" * 50)
    
    pull_requests = load_json("pull_requests.json")
    
    main_results = calculate_for_branch("main", pull_requests)
    develop_results = calculate_for_branch("develop", pull_requests)
    
    if main_results:
        print(f"\nBranch: main")
        print(f"  Deployments: {main_results['total_deployments']} en {main_results['period']['days']} días")
        print(f"  Frecuencia: {main_results['frequency']['per_week']:.1f} deploys/semana")
    
    if develop_results:
        print(f"\nBranch: develop")
        print(f"  Deployments: {develop_results['total_deployments']} en {develop_results['period']['days']} días")
        print(f"  Frecuencia: {develop_results['frequency']['per_week']:.1f} deploys/semana")
    
    print("\nJustificación:")
    print("Se analizan ambas branches por el flujo GitFlow del proyecto.")
    print("Main refleja releases a producción, mientras que develop muestra")
    print("la integración continua de features durante el desarrollo.")
    print()
    
    result = {
        "metric": "Deployment Frequency",
        "calculation_date": datetime.now().isoformat(),
        "workflow_justification": {
            "reason": "Flujo de trabajo GitFlow con develop y main",
            "develop": "Integración continua de features durante desarrollo",
            "main": "Releases a producción cada 2-3 semanas"
        },
        "results": {
            "main": main_results,
            "develop": develop_results
        }
    }
    
    save_json(result, "deployment_frequency.json")
    print("Guardado en: data/deployment_frequency.json")

if __name__ == "__main__":
    calculate_deployment_frequency()
