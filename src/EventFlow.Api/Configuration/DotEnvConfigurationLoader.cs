namespace EventFlow.Api.Configuration;

public static class DotEnvConfigurationLoader
{
    public static IDictionary<string, string?> LoadFrom(params string[] filePaths)
    {
        var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

        foreach (var filePath in filePaths)
        {
            if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
            {
                continue;
            }

            foreach (var rawLine in File.ReadAllLines(filePath))
            {
                var line = rawLine.Trim();

                if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
                {
                    continue;
                }

                var separatorIndex = line.IndexOf('=');

                if (separatorIndex <= 0)
                {
                    continue;
                }

                var key = line[..separatorIndex].Trim();
                var value = line[(separatorIndex + 1)..].Trim().Trim('"');

                if (!string.IsNullOrWhiteSpace(key))
                {
                    values[key] = value;
                }
            }
        }

        return values;
    }
}
