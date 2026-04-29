namespace EventFlow.Application.Auth;

public sealed class AdminBootstrapOptions
{
    public const string SectionName = "AdminBootstrap";

    public bool Enabled { get; init; }
    public string Nome { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Senha { get; init; } = string.Empty;
    public bool PromoteExistingUser { get; init; } = true;
    public bool UpdatePasswordOnStartup { get; init; } = true;
}
