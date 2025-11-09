import json
from datetime import datetime
from dateutil import parser as date_parser
import statistics

def load_json(filename):
    with open(f"data/{filename}", 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    with open(f"data/{filename}", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def calculate_for_branch(branch_name, pull_requests):
    merged_prs = [pr for pr in pull_requests 
                  if pr["base_branch"] == branch_name and pr["merged_at"]]
    
    if not merged_prs:
        return None
    
    lead_times = []
    pr_details = []
    
    for pr in merged_prs:
        created_at = date_parser.parse(pr["created_at"])
        merged_at = date_parser.parse(pr["merged_at"])
        
        lead_time_delta = merged_at - created_at
        lead_time_hours = lead_time_delta.total_seconds() / 3600
        lead_time_days = lead_time_hours / 24
        
        lead_times.append(lead_time_hours)
        
        pr_details.append({
            "number": pr["number"],
            "title": pr["title"],
            "author": pr["author"],
            "created_at": pr["created_at"],
            "merged_at": pr["merged_at"],
            "lead_time_hours": round(lead_time_hours, 2),
            "lead_time_days": round(lead_time_days, 2),
            "head_branch": pr["head_branch"]
        })
    
    lead_times.sort()
    
    mean_hours = statistics.mean(lead_times)
    median_hours = statistics.median(lead_times)
    
    p50 = statistics.median(lead_times)
    p75 = statistics.quantiles(lead_times, n=4)[2] if len(lead_times) > 1 else lead_times[0]
    p95 = lead_times[int(len(lead_times) * 0.95)] if len(lead_times) > 1 else lead_times[0]
    
    min_hours = min(lead_times)
    max_hours = max(lead_times)
    
    mean_days = mean_hours / 24
    
    return {
        "branch": branch_name,
        "total_prs_analyzed": len(merged_prs),
        "statistics": {
            "mean_hours": round(mean_hours, 2),
            "mean_days": round(mean_days, 2),
            "median_hours": round(median_hours, 2),
            "median_days": round(median_hours/24, 2),
            "min_hours": round(min_hours, 2),
            "max_hours": round(max_hours, 2)
        },
        "percentiles": {
            "p50_hours": round(p50, 2),
            "p50_days": round(p50/24, 2),
            "p75_hours": round(p75, 2),
            "p75_days": round(p75/24, 2),
            "p95_hours": round(p95, 2),
            "p95_days": round(p95/24, 2)
        },
        "pull_requests": pr_details
    }

def calculate_lead_time():
    print("Lead Time for Changes - Análisis")
    print("-" * 50)
    
    pull_requests = load_json("pull_requests.json")
    
    main_results = calculate_for_branch("main", pull_requests)
    develop_results = calculate_for_branch("develop", pull_requests)
    
    if main_results:
        print(f"\nBranch: main")
        print(f"  PRs analizados: {main_results['total_prs_analyzed']}")
        print(f"  Promedio: {main_results['statistics']['mean_hours']:.1f}h ({main_results['statistics']['mean_days']:.2f}d)")
        print(f"  Mediana: {main_results['statistics']['median_hours']:.1f}h")
    
    if develop_results:
        print(f"\nBranch: develop")
        print(f"  PRs analizados: {develop_results['total_prs_analyzed']}")
        print(f"  Promedio: {develop_results['statistics']['mean_hours']:.1f}h ({develop_results['statistics']['mean_days']:.2f}d)")
        print(f"  Mediana: {develop_results['statistics']['median_hours']:.1f}h")
    
    print("\nNota: Lead Time medido desde creación del PR hasta merge.")
    print("El tiempo real de desarrollo de features es mayor, ya que incluye")
    print("el trabajo en la branch antes de crear el PR.")
    print()
    
    result = {
        "metric": "Lead Time for Changes",
        "calculation_date": datetime.now().isoformat(),
        "measurement_note": "Medido desde creación del PR hasta merge. No incluye tiempo de desarrollo en la branch antes del PR.",
        "workflow_justification": {
            "reason": "Flujo de trabajo GitFlow con develop y main",
            "develop": "Tiempo de integración de features",
            "main": "Tiempo de preparación de releases"
        },
        "results": {
            "main": main_results,
            "develop": develop_results
        }
    }
    
    save_json(result, "lead_time.json")
    print("Guardado en: data/lead_time.json")

if __name__ == "__main__":
    calculate_lead_time()
