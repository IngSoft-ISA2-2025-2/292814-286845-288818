import json
from datetime import datetime, timedelta
from dateutil import parser as date_parser
import statistics

def load_json(filename):
    with open(f"data/{filename}", 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    with open(f"data/{filename}", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def find_deployment_incidents(pull_requests, period_days=28):
    """
    Encuentra incidentes de deployment a main que requirieron hotfixes.
    
    Un incidente es:
    1. Un deployment a main (PR mergeado)
    2. Seguido de un hotfix (PR con 'fix' en título/branch) también a main
    
    MTTR = tiempo entre el deployment y el hotfix que lo arregla
    """
    now = datetime.now(datetime.now().astimezone().tzinfo)
    start_date = now - timedelta(days=period_days)
    
    # Filtrar PRs a main mergeados en el período
    main_prs = [
        pr for pr in pull_requests 
        if pr['base_branch'] == 'main' 
        and pr['merged_at']
        and date_parser.parse(pr['merged_at']) >= start_date
    ]
    
    # Ordenar por fecha de merge
    main_prs.sort(key=lambda x: date_parser.parse(x['merged_at']))
    
    incidents = []
    
    # Buscar pares: deployment normal -> hotfix
    for i in range(len(main_prs) - 1):
        current_pr = main_prs[i]
        next_pr = main_prs[i + 1]
        
        # Verificar si el siguiente PR es un fix
        next_title = next_pr['title'].lower()
        next_branch = next_pr['head_branch'].lower()
        
        is_fix = any(keyword in next_title or keyword in next_branch 
                     for keyword in ['fix', 'hotfix', 'bugfix'])
        
        if is_fix:
            # Calcular tiempo desde el deployment hasta el fix
            deployment_time = date_parser.parse(current_pr['merged_at'])
            fix_time = date_parser.parse(next_pr['merged_at'])
            
            recovery_hours = (fix_time - deployment_time).total_seconds() / 3600
            recovery_minutes = recovery_hours * 60
            
            incidents.append({
                'deployment_pr': current_pr['number'],
                'deployment_title': current_pr['title'],
                'deployment_time': current_pr['merged_at'],
                'fix_pr': next_pr['number'],
                'fix_title': next_pr['title'],
                'fix_time': next_pr['merged_at'],
                'mttr_hours': round(recovery_hours, 2),
                'mttr_minutes': round(recovery_minutes, 1)
            })
    
    return incidents

def calculate_mttr():
    print("Mean Time To Recovery - Análisis de Incidentes en Deployments")
    print("-" * 60)
    
    pull_requests = load_json("pull_requests.json")
    
    # Encontrar incidentes usando deployments a main seguidos de hotfixes
    incidents = find_deployment_incidents(pull_requests)
    
    print(f"\nIncidentes detectados (deployment -> hotfix a main): {len(incidents)}")
    
    if len(incidents) > 0:
        recovery_times_hours = [inc['mttr_hours'] for inc in incidents]
        recovery_times_minutes = [inc['mttr_minutes'] for inc in incidents]
        
        mean_hours = statistics.mean(recovery_times_hours)
        median_hours = statistics.median(recovery_times_hours)
        min_hours = min(recovery_times_hours)
        max_hours = max(recovery_times_hours)
        
        print(f"\nEstadísticas de recuperación:")
        print(f"  Promedio: {mean_hours:.2f}h ({mean_hours * 60:.1f} minutos)")
        print(f"  Mediana: {median_hours:.2f}h ({median_hours * 60:.1f} minutos)")
        print(f"  Mínimo: {min_hours:.2f}h ({min_hours * 60:.1f} minutos)")
        print(f"  Máximo: {max_hours:.2f}h ({max_hours * 60:.1f} minutos)")
        
        print(f"\nDetalles de incidentes:")
        for inc in incidents:
            print(f"  Incidente:")
            print(f"    Deployment: PR #{inc['deployment_pr']} - {inc['deployment_title']}")
            print(f"    Fix: PR #{inc['fix_pr']} - {inc['fix_title']}")
            print(f"    MTTR: {inc['mttr_minutes']:.1f} minutos ({inc['mttr_hours']:.2f}h)")
            print()
        
        result = {
            "metric": "Mean Time To Recovery",
            "calculation_date": datetime.now().isoformat(),
            "methodology": {
                "detection": "Deployments a main seguidos de hotfixes",
                "calculation": "Tiempo entre el merge del deployment problemático y el merge del hotfix que lo resuelve",
                "scope": "Solo incidentes en la rama main (producción/release)",
                "rationale": "Mide el tiempo real de recuperación de incidentes en deployments, excluyendo fallas normales durante desarrollo"
            },
            "statistics": {
                "mean_hours": round(mean_hours, 2),
                "mean_minutes": round(mean_hours * 60, 1),
                "median_hours": round(median_hours, 2),
                "median_minutes": round(median_hours * 60, 1),
                "min_hours": round(min_hours, 2),
                "max_hours": round(max_hours, 2)
            },
            "total_incidents": len(incidents),
            "incidents": incidents
        }
    else:
        print("\nNo se detectaron incidentes en el período analizado.")
        print("Esto indica que no hubo deployments a main que requirieran")
        print("hotfixes inmediatos en los últimos 28 días.")
        
        result = {
            "metric": "Mean Time To Recovery",
            "calculation_date": datetime.now().isoformat(),
            "methodology": {
                "detection": "Deployments a main seguidos de hotfixes",
                "calculation": "Tiempo entre el merge del deployment problemático y el merge del hotfix",
                "scope": "Solo incidentes en la rama main (producción/release)"
            },
            "statistics": None,
            "total_incidents": 0,
            "incidents": []
        }
    
    save_json(result, "mttr.json")
    print("Guardado en: data/mttr.json")

if __name__ == "__main__":
    calculate_mttr()

