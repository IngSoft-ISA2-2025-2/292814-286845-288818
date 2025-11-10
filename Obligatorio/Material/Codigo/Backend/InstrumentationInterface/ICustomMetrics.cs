using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InstrumentationInterface
{
    public interface ICustomMetrics
    {
        // Métricas originales (ya existentes)
        void LoginInvocations(long value = 1);
        void SetActiveUserCount(int count);
        void RequestDuration(double milliseconds);
        
        // Métricas de negocio (nuevas - Punto 3)
        void IncrementPurchasesCompleted();
        void RecordDrugRequest(bool success);
        
        // Métricas de aplicación (nuevas - Punto 3)
        void RecordHttpRequest(string method, string endpoint, int statusCode, double durationSeconds);
        
        // Métricas de infraestructura (nuevas - Punto 3)
        void UpdateMemoryUsage(long workingSetBytes, long privateBytes);
        void UpdateDatabaseConnections(int activeConnections);
    }
}
