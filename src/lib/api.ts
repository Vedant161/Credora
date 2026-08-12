export async function apiFetch<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`/api${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        let message = "API request failed";
        try {
            const data = await response.json();
            message = data.detail || message;
        } catch {
            // Ignore invalid JSON responses
        }
        throw new Error(message);
    }
    return response.json();
}
