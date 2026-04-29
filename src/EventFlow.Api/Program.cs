using EventFlow.Application;
using EventFlow.Api.Endpoints;
using EventFlow.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

builder.Services.AddHealthChecks();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/", () => Results.Ok(new
{
    name = "EventFlow API",
    status = "running",
    timestampUtc = DateTime.UtcNow
}));

app.MapHealthChecks("/health");
app.MapEventoEndpoints();

app.Run();
