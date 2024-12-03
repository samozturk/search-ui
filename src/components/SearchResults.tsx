import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchResults {
    abstract: string[];
    relevance_score: number[];
}

const SearchInterface = () => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);

    const getRelevanceColor = (score: number): string => {
        const red = Math.floor(255 * (1 - score));
        const green = Math.floor(255 * score);
        return `rgb(${red}, ${green}, 0)`;
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex gap-2">
                <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keyword to search..."
                    className="flex-1"
                />
                <Button
                    onClick={handleSearch}
                    disabled={loading}
                >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </div>

            {results?.abstract.map((text, index) => (
                <Card key={index}>
                    <CardContent className="flex items-center gap-4 p-4">
                        <p className="flex-1 text-sm">{text}</p>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: getRelevanceColor(results.relevance_score[index]) }}
                        >
                            {(results.relevance_score[index] * 100).toFixed(0)}%
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default SearchInterface;