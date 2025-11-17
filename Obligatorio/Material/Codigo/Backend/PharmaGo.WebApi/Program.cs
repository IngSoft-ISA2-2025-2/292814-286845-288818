using System.Diagnostics.CodeAnalysis;
using PharmaGo.Factory;
using PharmaGo.WebApi.Filters;
using PharmaGo.WebApi.Middleware;
using PharmaGo.WebApi.Services;
using Instrumentation;
using InstrumentationInterface;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using Serilog;

// Configurar Serilog para logging estructurado
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File(
        path: "logs/pharmago-.log",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting PharmaGo API");

    var builder = WebApplication.CreateBuilder(args);

    // Configurar Serilog como provider de logging
    builder.Host.UseSerilog();

    // Add services to the container.
    builder.Services.RegisterBusinessLogicServices(builder.Configuration);
    builder.Services.RegisterDataAccessServices(builder.Configuration);
    builder.Services.AddControllers(options => options.Filters.Add(typeof(ExceptionFilter)));

    builder.Services.AddControllers();

    // Registrar CustomMetrics como singleton
    builder.Services.AddSingleton<ICustomMetrics, CustomMetrics>();

    // Registrar servicio de background para métricas de infraestructura
    builder.Services.AddHostedService<InfrastructureMetricsService>();

    // Configurar OpenTelemetry con exportación a OTLP
    builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource => resource
            .AddService("PharmaGo.API", serviceVersion: "1.0.0")
            .AddAttributes(new Dictionary<string, object>
            {
                ["environment"] = builder.Environment.EnvironmentName,
                ["host.name"] = Environment.MachineName
            }))
        .WithMetrics(metrics => metrics
            .AddMeter("PharmaGo.Metrics")
            .AddAspNetCoreInstrumentation()
            .AddRuntimeInstrumentation()
            .AddOtlpExporter(options =>
            {
                options.Endpoint = new Uri("http://otlp-collector:4317");
            }));

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("MyAllowedOrigins",
            policy =>
            {
                policy.WithOrigins("*") // note the port is included 
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });

    var app = builder.Build();

    app.MigrateDatabase();

    // Usar middleware de telemetría
    app.UseMiddleware<TelemetryMiddleware>();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors("MyAllowedOrigins");

    app.UseAuthorization();

    app.MapControllers();

    Log.Information("PharmaGo API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

[ExcludeFromCodeCoverage]
public partial class Program { }
