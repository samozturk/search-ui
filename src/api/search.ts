export async function searchAPI(keyword: string) {
    try {
        // Replace with actual API call
        const response = await fetch(`YOUR_SEARCH_API_ENDPOINT?q=${encodeURIComponent(keyword)}`);
        return await response.json();
    } catch (error) {
        console.error('Search API error:', error);
        throw error;
    }
}