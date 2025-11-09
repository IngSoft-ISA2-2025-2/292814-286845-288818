import requests
import json
import sys
from datetime import datetime, timedelta
from dateutil import parser as date_parser

GITHUB_API_BASE = "https://api.github.com"
REPO_OWNER = "IngSoft-ISA2-2025-2"
REPO_NAME = "292814-286845-288818"

def get_headers():
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    return headers

def extract_commits(since_date=None):
    print(f"Extrayendo commits desde {since_date if since_date else 'el inicio'}...")
    
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/commits"
    params = {"per_page": 100}
    
    if since_date:
        params["since"] = since_date
    
    all_commits = []
    page = 1
    
    while True:
        params["page"] = page
        response = requests.get(url, headers=get_headers(), params=params)
        
        if response.status_code != 200:
            print(f"Error al obtener commits: {response.status_code}")
            print(f"Mensaje: {response.text}")
            break
        
        commits = response.json()
        
        if not commits:
            break
        
        for commit in commits:
            commit_data = {
                "sha": commit["sha"],
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"],
                "url": commit["html_url"]
            }
            all_commits.append(commit_data)
        
        print(f"  Página {page}: {len(commits)} commits")
        page += 1
        
        if len(commits) < 100:
            break
    
    print(f"Total de commits extraídos: {len(all_commits)}")
    return all_commits

def extract_pull_requests(state="all"):
    print(f"Extrayendo pull requests (state={state})...")
    
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/pulls"
    params = {"state": state, "per_page": 100}
    
    all_prs = []
    page = 1
    
    while True:
        params["page"] = page
        response = requests.get(url, headers=get_headers(), params=params)
        
        if response.status_code != 200:
            print(f"Error al obtener PRs: {response.status_code}")
            break
        
        prs = response.json()
        
        if not prs:
            break
        
        for pr in prs:
            pr_data = {
                "number": pr["number"],
                "title": pr["title"],
                "state": pr["state"],
                "created_at": pr["created_at"],
                "updated_at": pr["updated_at"],
                "closed_at": pr["closed_at"],
                "merged_at": pr["merged_at"],
                "author": pr["user"]["login"],
                "base_branch": pr["base"]["ref"],
                "head_branch": pr["head"]["ref"],
                "url": pr["html_url"]
            }
            all_prs.append(pr_data)
        
        print(f"  Página {page}: {len(prs)} PRs")
        page += 1
        
        if len(prs) < 100:
            break
    
    print(f"Total de PRs extraídos: {len(all_prs)}")
    return all_prs

def extract_issues(state="all", labels=None):
    print(f"Extrayendo issues (state={state}, labels={labels})...")
    
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    params = {"state": state, "per_page": 100}
    
    if labels:
        params["labels"] = labels
    
    all_issues = []
    page = 1
    
    while True:
        params["page"] = page
        response = requests.get(url, headers=get_headers(), params=params)
        
        if response.status_code != 200:
            print(f"Error al obtener issues: {response.status_code}")
            break
        
        issues = response.json()
        
        if not issues:
            break
        
        for issue in issues:
            if "pull_request" in issue:
                continue
            
            issue_data = {
                "number": issue["number"],
                "title": issue["title"],
                "state": issue["state"],
                "created_at": issue["created_at"],
                "updated_at": issue["updated_at"],
                "closed_at": issue["closed_at"],
                "author": issue["user"]["login"],
                "labels": [label["name"] for label in issue["labels"]],
                "url": issue["html_url"]
            }
            all_issues.append(issue_data)
        
        print(f"  Página {page}: {len([i for i in issues if 'pull_request' not in i])} issues")
        page += 1
        
        if len(issues) < 100:
            break
    
    print(f"Total de issues extraídos: {len(all_issues)}")
    return all_issues

def extract_workflow_runs(workflow_file=None):
    print(f"Extrayendo workflow runs...")
    
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs"
    params = {"per_page": 100}
    
    if workflow_file:
        params["workflow_id"] = workflow_file
    
    all_runs = []
    page = 1
    
    while True:
        params["page"] = page
        response = requests.get(url, headers=get_headers(), params=params)
        
        if response.status_code != 200:
            print(f"Error al obtener workflow runs: {response.status_code}")
            break
        
        data = response.json()
        runs = data.get("workflow_runs", [])
        
        if not runs:
            break
        
        for run in runs:
            run_data = {
                "id": run["id"],
                "name": run["name"],
                "status": run["status"],
                "conclusion": run["conclusion"],
                "created_at": run["created_at"],
                "updated_at": run["updated_at"],
                "head_branch": run["head_branch"],
                "head_sha": run["head_sha"],
                "event": run["event"],
                "url": run["html_url"]
            }
            all_runs.append(run_data)
        
        print(f"  Página {page}: {len(runs)} runs")
        page += 1
        
        if len(runs) < 100:
            break
    
    print(f"Total de workflow runs extraídos: {len(all_runs)}")
    return all_runs

def save_to_json(data, filename):
    filepath = f"data/{filename}"
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Datos guardados en: {filepath}")

def main():
    print("="*60)
    print("Extracción de Datos de GitHub para Métricas DORA")
    print(f"Repositorio: {REPO_OWNER}/{REPO_NAME}")
    print("="*60)
    print()
    
    three_months_ago = (datetime.now() - timedelta(days=90)).isoformat()
    
    commits = []
    pull_requests = []
    issues = []
    workflow_runs = []
    
    try:
        commits = extract_commits(since_date=three_months_ago)
        save_to_json(commits, "commits.json")
        print()
    except Exception as e:
        print(f"Error extrayendo commits: {e}")
        print()
    
    try:
        pull_requests = extract_pull_requests(state="all")
        save_to_json(pull_requests, "pull_requests.json")
        print()
    except Exception as e:
        print(f"Error extrayendo pull requests: {e}")
        print()
    
    try:
        issues = extract_issues(state="all")
        save_to_json(issues, "issues.json")
        print()
    except Exception as e:
        print(f"Error extrayendo issues: {e}")
        print()
    
    try:
        workflow_runs = extract_workflow_runs()
        save_to_json(workflow_runs, "workflow_runs.json")
        print()
    except Exception as e:
        print(f"Error extrayendo workflow runs: {e}")
        print()
    
    summary = {
        "extraction_date": datetime.now().isoformat(),
        "repository": f"{REPO_OWNER}/{REPO_NAME}",
        "period": {
            "since": three_months_ago,
            "until": datetime.now().isoformat()
        },
        "totals": {
            "commits": len(commits),
            "pull_requests": len(pull_requests),
            "issues": len(issues),
            "workflow_runs": len(workflow_runs)
        }
    }
    save_to_json(summary, "extraction_summary.json")
    
    print("="*60)
    print("Extracción completada")
    print(f"Total de archivos generados: 5")
    print("="*60)

if __name__ == "__main__":
    main()
