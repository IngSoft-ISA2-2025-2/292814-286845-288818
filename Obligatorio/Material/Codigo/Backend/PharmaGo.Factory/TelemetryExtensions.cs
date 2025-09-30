using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Exporter;
using OpenTelemetry.Extensions.Hosting;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;



namespace PharmaGo.Factory
{
    public static class OpenTelemetryExtensions
    {
        public static IServiceCollection AddPharmaGoOpenTelemetryMetrics(this IServiceCollection services, string serviceName = "PharmaGo.WebApi")
        {
            services.AddOpenTelemetry()
                    .WithMetrics(metricsBuilder =>
                    {
                        metricsBuilder
                    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("PharmaGo.WebApi"))
                    .AddAspNetCoreInstrumentation()
                    .AddMeter("PharmaGo.CustomMetrics")
                    .AddOtlpExporter(options =>
                        {
                            options.Endpoint = new Uri("http://otlp-collector:4317");
                            options.Protocol = OtlpExportProtocol.Grpc;
                        });
                    });

            return services;
        }
    }
}
