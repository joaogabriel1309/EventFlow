namespace EventFlow.Application.Eventos.Services;

public interface IMidiaUrlResolver
{
    string Resolve(string storedValue);
}
