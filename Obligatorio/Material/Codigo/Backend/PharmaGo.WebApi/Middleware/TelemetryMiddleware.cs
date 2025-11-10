using InstrumentationInterface;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace PharmaGo.WebApi.Middleware
{
    [ExcludeFromCodeCoverage]
    public class TelemetryMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<TelemetryMiddleware> _logger;

        public TelemetryMiddleware(RequestDelegate next, ILogger<TelemetryMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ICustomMetrics metrics)
        {
            var stopwatch = Stopwatch.StartNew();
            var method = context.Request.Method;
            var path = context.Request.Path.Value ?? "/";

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                var statusCode = context.Response.StatusCode;
                var durationSeconds = stopwatch.Elapsed.TotalSeconds;

                // Registrar métrica de aplicación
                metrics.RecordHttpRequest(method, path, statusCode, durationSeconds);

                // Log estructurado
                _logger.LogInformation(
                    "HTTP {Method} {Path} responded {StatusCode} in {Duration}ms",
                    method, path, statusCode, stopwatch.ElapsedMilliseconds);
            }
        }
    }
}
