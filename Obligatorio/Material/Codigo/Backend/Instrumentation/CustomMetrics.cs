using System.Diagnostics.Metrics;
using InstrumentationInterface;

namespace Instrumentation
{
    public class CustomMetrics : ICustomMetrics, IDisposable
    {
        private readonly Meter _meter;
        
        // Métricas originales (ya existentes)
        private readonly Counter<long> _loginInvocationsCounter;
        private readonly Histogram<double> _requestDurationHistogram;
        private int _activeUserCount;
        
        // Métricas de negocio (nuevas - Punto 3)
        private readonly Counter<long> _purchasesCompletedCounter;
        private readonly Counter<long> _drugRequestsCounter;
        
        // Métricas de aplicación (nuevas - Punto 3)
        private readonly Counter<long> _httpRequestsCounter;
        private readonly Histogram<double> _httpRequestDurationHistogram;
        
        // Métricas de infraestructura (nuevas - Punto 3)
        private long _workingSetBytes;
        private long _privateBytes;
        private int _activeDbConnections;

        public CustomMetrics()
        {
            _meter = new Meter("PharmaGo.Metrics", "1.0.0");

            // ===== MÉTRICAS ORIGINALES (YA EXISTENTES) =====
            _loginInvocationsCounter = _meter.CreateCounter<long>(
                "login_invocations",
                unit: "1",
                description: "Counts the number of login invocations"
            );

            _requestDurationHistogram = _meter.CreateHistogram<double>(
                "request_duration",
                unit: "ms",
                description: "Records the duration of requests in milliseconds"
            );

            _meter.CreateObservableGauge(
                "active_user_count",
                () => new Measurement<int>[] { new Measurement<int>(_activeUserCount) },
                unit: "1",
                description: "The current number of active users"
            );

            // ===== MÉTRICAS NUEVAS (PUNTO 3) =====/

            // Métricas de negocio
            _purchasesCompletedCounter = _meter.CreateCounter<long>(
                "pharmago_purchases_completed_total",
                unit: "1",
                description: "Total de compras completadas exitosamente"
            );

            _drugRequestsCounter = _meter.CreateCounter<long>(
                "pharmago_drug_requests_total",
                unit: "1",
                description: "Total de solicitudes de medicamentos (etiquetadas por status)"
            );

            // Métricas de aplicación
            _httpRequestsCounter = _meter.CreateCounter<long>(
                "pharmago_http_requests_total",
                unit: "1",
                description: "Total de requests HTTP procesados"
            );

            _httpRequestDurationHistogram = _meter.CreateHistogram<double>(
                "pharmago_http_request_duration_seconds",
                unit: "s",
                description: "Duración de requests HTTP en segundos"
            );

            // Métricas de infraestructura
            _meter.CreateObservableGauge(
                "pharmago_process_memory_bytes",
                () => new[]
                {
                    new Measurement<long>(_workingSetBytes, new KeyValuePair<string, object?>("type", "working_set")),
                    new Measurement<long>(_privateBytes, new KeyValuePair<string, object?>("type", "private"))
                },
                unit: "bytes",
                description: "Memoria utilizada por el proceso"
            );

            _meter.CreateObservableGauge(
                "pharmago_db_connections_active",
                () => _activeDbConnections,
                unit: "1",
                description: "Número de conexiones activas a la base de datos"
            );
        }

        // ===== IMPLEMENTACIÓN MÉTRICAS ORIGINALES =====
        public void LoginInvocations(long value = 1)
        {
            _loginInvocationsCounter.Add(value);
        }

        public void SetActiveUserCount(int count)
        {
            _activeUserCount = count;
        }

        public void RequestDuration(double milliseconds)
        {
            _requestDurationHistogram.Record(milliseconds);
        }

        // ===== IMPLEMENTACIÓN MÉTRICAS NUEVAS (PUNTO 3) =====
        
        // Métricas de negocio
        public void IncrementPurchasesCompleted()
        {
            _purchasesCompletedCounter.Add(1);
        }

        public void RecordDrugRequest(bool success)
        {
            _drugRequestsCounter.Add(1, 
                new KeyValuePair<string, object?>("status", success ? "success" : "failed"));
        }

        // Métricas de aplicación
        public void RecordHttpRequest(string method, string endpoint, int statusCode, double durationSeconds)
        {
            var tags = new[]
            {
                new KeyValuePair<string, object?>("method", method),
                new KeyValuePair<string, object?>("endpoint", endpoint),
                new KeyValuePair<string, object?>("status_code", statusCode.ToString())
            };

            _httpRequestsCounter.Add(1, tags);
            _httpRequestDurationHistogram.Record(durationSeconds, tags);
        }

        // Métricas de infraestructura
        public void UpdateMemoryUsage(long workingSetBytes, long privateBytes)
        {
            _workingSetBytes = workingSetBytes;
            _privateBytes = privateBytes;
        }

        public void UpdateDatabaseConnections(int activeConnections)
        {
            _activeDbConnections = activeConnections;
        }

        public void Dispose()
        {
            _meter?.Dispose();
        }
    }
}
