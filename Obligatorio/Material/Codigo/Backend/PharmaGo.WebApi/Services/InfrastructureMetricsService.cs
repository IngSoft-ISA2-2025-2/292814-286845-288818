using InstrumentationInterface;
using Microsoft.Data.SqlClient;
using System.Diagnostics.CodeAnalysis;

namespace PharmaGo.WebApi.Services
{
    [ExcludeFromCodeCoverage]
    public class InfrastructureMetricsService : BackgroundService
    {
        private readonly ICustomMetrics _metrics;
        private readonly ILogger<InfrastructureMetricsService> _logger;
        private readonly IConfiguration _configuration;

        public InfrastructureMetricsService(
            ICustomMetrics metrics, 
            ILogger<InfrastructureMetricsService> logger,
            IConfiguration configuration)
        {
            _metrics = metrics;
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Infrastructure Metrics Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Actualizar métricas de memoria
                    UpdateMemoryMetrics();

                    // Actualizar métricas de base de datos
                    await UpdateDatabaseMetricsAsync();

                    // Esperar 15 segundos antes de la próxima actualización
                    await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating infrastructure metrics");
                }
            }

            _logger.LogInformation("Infrastructure Metrics Service stopped");
        }

        private void UpdateMemoryMetrics()
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();
            var workingSet = process.WorkingSet64;
            var privateBytes = process.PrivateMemorySize64;

            _metrics.UpdateMemoryUsage(workingSet, privateBytes);

            // Log si el uso de memoria es alto (> 1GB)
            if (workingSet > 1_073_741_824) // 1GB
            {
                _logger.LogWarning(
                    "High memory usage detected: {MemoryMB} MB", 
                    workingSet / 1024 / 1024);
            }
        }

        private async Task UpdateDatabaseMetricsAsync()
        {
            try
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(connectionString))
                    return;

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                // Consultar número de conexiones activas
                using var command = new SqlCommand(
                    "SELECT COUNT(*) FROM sys.dm_exec_sessions WHERE is_user_process = 1", 
                    connection);
                
                var activeConnections = (int)await command.ExecuteScalarAsync();
                _metrics.UpdateDatabaseConnections(activeConnections);

                // Log si las conexiones están por encima del 80% del pool (default 100)
                if (activeConnections > 80)
                {
                    _logger.LogWarning(
                        "High database connection count: {ConnectionCount}", 
                        activeConnections);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying database connection metrics");
            }
        }
    }
}
