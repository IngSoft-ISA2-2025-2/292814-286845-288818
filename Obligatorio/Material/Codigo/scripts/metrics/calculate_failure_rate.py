import json
from datetime import datetime
from dateutil import parser as date_parser

def load_json(filename):
    with open(f"data/{filename}", 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    with open(f"data/{filename}", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def calculate_failure_rate():
    print("Change Failure Rate - Análisis")
    print("-" * 50)
    
    issues = load_json("issues.json")
    pull_requests = load_json("pull_requests.json")
    
    hotfixes = []
    for pr in pull_requests:
        if pr["merged_at"] and pr["base_branch"] == "main":
            title_lower = pr["title"].lower()
            branch_lower = pr["head_branch"].lower()
            
            if "fix" in title_lower or "fix" in branch_lower:
                hotfixes.append(pr)
    
    deployments_main = [pr for pr in pull_requests 
                       if pr["base_branch"] == "main" and pr["merged_at"]]
    
    print(f"\nDeployments a main: {len(deployments_main)}")
    print(f"Deployments con fixes: {len(hotfixes)}")
    print(f"  (PRs/branches con 'fix' en título o nombre de branch)")
    
    if len(deployments_main) > 0:
        failure_rate_main = (len(hotfixes) / len(deployments_main)) * 100
    else:
        failure_rate_main = 0
    
    print(f"\nChange Failure Rate (main):")
    print(f"  Tasa de fallos: {failure_rate_main:.1f}%")
    
    if len(hotfixes) > 0:
        print(f"\nDeployments que fueron fixes:")
        for fix in hotfixes:
            print(f"  PR #{fix['number']}: {fix['title']}")
    
    result = {
        "metric": "Change Failure Rate",
        "calculation_date": datetime.now().isoformat(),
        "methodology": {
            "detection": "PRs a main con 'fix' en título o nombre de branch",
            "assumption": "PRs con fix indican corrección de fallos post-deploy anterior"
        },
        "results": {
            "main": {
                "total_deployments": len(deployments_main),
                "failed_deployments": len(hotfixes),
                "failure_rate_percentage": round(failure_rate_main, 2),
                "fixes": [{"number": pr["number"], "title": pr["title"], 
                          "branch": pr["head_branch"], "merged_at": pr["merged_at"]} 
                         for pr in hotfixes]
            }
        }
    }
    
    save_json(result, "change_failure_rate.json")
    print("\nGuardado en: data/change_failure_rate.json")

if __name__ == "__main__":
    calculate_failure_rate()
